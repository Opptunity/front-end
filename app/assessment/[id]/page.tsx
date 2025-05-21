"use client"

import { AssessmentResults } from "@/components/assessment-results"
import { PersonalizedTest } from "@/components/personalized-test"
import { CourseLibrary } from "@/components/course-library"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Brain, BookOpen, AlertCircle, ArrowLeft } from "lucide-react"
import { AnimatedContainer } from "@/components/animated-container"
import { motion } from "framer-motion"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { updateEmailForAssessment } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { AssessmentData } from "@/lib/types"
import { useEmailCollection } from "@/contexts/email-collection-context"
import type { Industry } from "@/lib/industry-detection"
import { generateCourseRecommendations, generateFallbackCourseRecommendations } from "@/lib/course-recommendations"
import { buildUserProfile } from "@/lib/ai-agent"
import type { RecommendedCourse } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

// Loading state component
function LoadingAssessment() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading assessment data...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this helper function
function safeJsonParse(jsonStr: any, defaultValue = []) {
  try {
    return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : defaultValue;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return defaultValue;
  }
}

// Client component that uses useSearchParams
async function fetchAssessment(id: string) {
  try {
    // Directly fetch from the local API that we know exists
    console.log("Fetching assessment data from /api/assess endpoint");
    const response = await fetch(`/api/assess/${id}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Assessment data received:", data);
      
      // Return the response directly since our /api/assess endpoint now returns the correct format
      return data;
    }
    
    console.error("Failed to fetch assessment, status:", response.status);
    return null;
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return null;
  }
}

function AssessmentPageContent({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [emailReceived, setEmailReceived] = useState<string | null>(null)
  const [customRecommendedCourses, setCustomRecommendedCourses] = useState<RecommendedCourse[] | null>(null)
  const [isGeneratingCourses, setIsGeneratingCourses] = useState(false)
  const searchParams = useSearchParams()
  const { collectEmail } = useEmailCollection()

  // Listen for custom tab switch events
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const { tab } = event.detail;
      console.log(`Custom event received to switch to tab: ${tab}`);
      
      // Find and activate the corresponding tab
      const tabElement = document.querySelector(`[value="${tab}"]`) as HTMLElement;
      if (tabElement) {
        console.log("Found tab element, clicking it:", tabElement);
        tabElement.click();
      } else {
        console.error(`Could not find tab element with value="${tab}"`);
      }
    };

    // Add event listener
    window.addEventListener('switchTab', handleSwitchTab as EventListener);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab as EventListener);
    };
  }, []);

  // Debug: Log search params on component mount
  useEffect(() => {
    console.log("URL SearchParams:", Object.fromEntries(searchParams ? [...searchParams.entries()] : []))
    
    // Try to get email from localStorage
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem("assessmentEmail")
      if (storedEmail) {
        console.log("Email found in localStorage:", storedEmail)
        setEmailReceived(storedEmail)
        
        // Save to context as well
        collectEmail(storedEmail)
      }
    }
  }, [searchParams, collectEmail])

  // Fetch assessment data to pass to CourseLibrary
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const data = await fetchAssessment(params.id)
        console.log("Assessment data fetched:", data);

        if (data && data.success && data.assessment) {
          console.log("Valid assessment data found, setting state");
          setAssessment(data.assessment)
        } else {
          console.error("Invalid assessment data format:", data);
        }
      } catch (err) {
        console.error("Error fetching assessment:", err)
      }
    }

    fetchAssessmentData()
  }, [params.id])
  
  // Save email to Supabase if provided in URL or localStorage
  useEffect(() => {
    const finalEmail = emailReceived
    
    if (finalEmail) {
      const saveEmail = async () => {
        try {
          await updateEmailForAssessment(params.id, finalEmail)
          console.log('Email saved to Supabase:', finalEmail)
        } catch (err) {
          console.error('Error saving email to Supabase:', err)
        }
      }
      
      saveEmail()
    } else {
      console.log('No email provided in URL or localStorage')
    }
  }, [params.id, emailReceived])

  // Check for tab parameter in URL and switch to that tab if present
  useEffect(() => {
    if (searchParams) {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'test' || tabParam === 'courses' || tabParam === 'assessment') {
        console.log(`Tab parameter found in URL: ${tabParam}. Activating tab...`);
        
        // Find and activate the corresponding tab
        const tabElement = document.querySelector(`[value="${tabParam}"]`) as HTMLElement;
        if (tabElement) {
          console.log("Found tab element, clicking it:", tabElement);
          tabElement.click();
          
          // Clean up URL after handling
          const url = new URL(window.location.href);
          url.searchParams.delete('tab');
          window.history.replaceState({}, document.title, url.toString());
        } else {
          console.error(`Could not find tab element with value="${tabParam}"`);
        }
      }
    }
  }, [searchParams]);

  const handleCoursesTabClick = async () => {
    console.log("Course tab clicked, current state:", {
      hasCustomRecommendations: !!customRecommendedCourses,
      hasAssessment: !!assessment,
      isGenerating: isGeneratingCourses
    });

    // Only generate recommendations if we haven't already and have assessment data
    if (!customRecommendedCourses && assessment && !isGeneratingCourses) {
      console.log("Starting course recommendations generation");
      setIsGeneratingCourses(true)
      
      try {
        // Build user profile from assessment data
        const userProfile = buildUserProfile(assessment, assessment.industryAnalysis.industry as Industry)
        console.log("Built user profile:", userProfile);
        
        // Generate course recommendations
        console.log("Calling generateCourseRecommendations...");
        const recommendations = await generateCourseRecommendations(userProfile)
        
        // Store the generated recommendations
        console.log("Received recommendations:", recommendations);
        setCustomRecommendedCourses(recommendations)
      } catch (error) {
        console.error("Error generating course recommendations:", error)
        // Use fallback recommendations if AI generation fails
        if (assessment) {
          console.log("Using fallback recommendations");
          const userProfile = buildUserProfile(assessment, assessment.industryAnalysis.industry as Industry)
          const fallbackRecommendations = generateFallbackCourseRecommendations(userProfile)
          setCustomRecommendedCourses(fallbackRecommendations)
        }
      } finally {
        setIsGeneratingCourses(false)
        console.log("Course generation completed");
      }
    } else {
      console.log("Skipping course generation because:", {
        hasCustomRecommendations: !!customRecommendedCourses,
        hasAssessment: !!assessment,
        isGenerating: isGeneratingCourses
      });
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <AnimatedContainer>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-4 transition-colors duration-150 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
          </motion.div>
          
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Skills Assessment Results
          </motion.h1>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            AI-powered analysis of your professional profile
          </motion.p>

          <Tabs defaultValue="assessment" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assessment" className="flex items-center relative group">
                <FileText className="mr-2 h-4 w-4" />
                Assessment Report
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
              <TabsTrigger value="test" id="test-tab-trigger" className="flex items-center relative group">
                <Brain className="mr-2 h-4 w-4" />
                Skills Test
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
              <TabsTrigger 
                value="courses" 
                id="courses-tab-trigger" 
                className="flex items-center relative group"
                onClick={handleCoursesTabClick}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Course Library
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="assessment" className="mt-4">
              <AssessmentResults 
                id={params.id} 
                onRoleSelect={(role) => setSelectedRole(role)}
              />

              {/* Debug Panel */}
              <Card className="mt-6 border-dashed border-red-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                    Debug Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs overflow-auto max-h-96">
                  <div>
                    <h3 className="font-bold mb-1">Raw Skill Gaps:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(assessment?.skillGapAnalysis.criticalGaps, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-1">All Assessment Data:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(assessment, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="test" className="mt-4">
              <div className="space-y-6">
                <PersonalizedTest id={params.id} />
              </div>
            </TabsContent>
            <TabsContent value="courses" className="mt-4">
              <div className="space-y-6">
                <CoursesTab assessmentId={params.id} selectedRole={selectedRole} />
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedContainer>
      </div>
    </div>
  )
}

// Add this new component for the Courses tab content
function CoursesTab({ assessmentId, selectedRole }: { assessmentId: string, selectedRole: string | null }) {
  const [recommendations, setRecommendations] = useState<RecommendedCourse[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)

  // Fetch course recommendations when component mounts
  useEffect(() => {
    const fetchCourseRecommendations = async () => {
      try {
        setLoading(true)

        // First, fetch the assessment data to get technical skills and industry info
        const assessmentResponse = await fetch(`/api/assess/${assessmentId}`)
        if (!assessmentResponse.ok) {
          throw new Error('Failed to fetch assessment data')
        }
        
        const assessmentData = await assessmentResponse.json()
        if (!assessmentData.success || !assessmentData.assessment) {
          throw new Error('Invalid assessment data')
        }
        
        setAssessment(assessmentData.assessment)
        
        // Then, fetch course recommendations
        const recommendationsResponse = await fetch(`/api/course-recommendations?id=${assessmentId}`)
        if (!recommendationsResponse.ok) {
          throw new Error('Failed to fetch course recommendations')
        }
        
        const recommendationsData = await recommendationsResponse.json()
        if (!recommendationsData.success) {
          throw new Error('Failed to generate course recommendations')
        }
        
        setRecommendations(recommendationsData.recommendations)
        console.log("Course recommendations fetched successfully:", recommendationsData.recommendations)
      } catch (err) {
        console.error("Error fetching course recommendations:", err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseRecommendations()
  }, [assessmentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading course recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-red-100 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <p className="mt-2">Unable to load course recommendations at this time.</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="p-6 text-center border border-yellow-100 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">Assessment data not found</p>
      </div>
    )
  }

  return (
    <div>
     {/* {selectedRole && (
        <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg">
          <h3 className="text-lg font-medium flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-green-600" />
            Courses for {selectedRole}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing personalized course recommendations for your selected career path.
          </p>
        </div>
      )}
      */}
      
      <CourseLibrary
        technicalSkills={assessment.technicalSkills}
        improvementAreas={assessment.improvementAreas}
        industry={assessment.industryAnalysis.industry as Industry}
        selectedRole={selectedRole}
        careerTrajectory={assessment.careerTrajectory}
        recommendedCourses={recommendations || []}
      />
    </div>
  )
}

export default function AssessmentPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingAssessment />}>
      <AssessmentPageContent params={params} />
    </Suspense>
  )
}
