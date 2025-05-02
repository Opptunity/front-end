"use client"

import { AssessmentResults } from "@/components/assessment-results"
import { PersonalizedTest } from "@/components/personalized-test"
import { CourseLibrary } from "@/components/course-library"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Brain, BookOpen } from "lucide-react"
import { AnimatedContainer } from "@/components/animated-container"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { updateEmailForAssessment } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { AssessmentData } from "@/lib/types"
import { useEmailCollection } from "@/contexts/email-collection-context"

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [emailReceived, setEmailReceived] = useState<string | null>(null)
  const [emailDebug, setEmailDebug] = useState<string>("")
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
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

  // Debug: Log search params and email on component mount
  useEffect(() => {
    console.log("URL SearchParams:", Object.fromEntries(searchParams ? [...searchParams.entries()] : []))
    console.log("Email from URL:", email)
    setEmailReceived(email)
    
    // Debug all URL parameters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      console.log("Full URL:", url.toString())
      console.log("URL parameters:", url.search)
      
      setEmailDebug(`Email in URL: ${email || 'none'}, Search params: ${url.search}`)
      
      // Also try to get email from localStorage
      const storedEmail = localStorage.getItem("assessmentEmail")
      if (storedEmail) {
        console.log("Email found in localStorage:", storedEmail)
        setEmailDebug(prev => `${prev}\nEmail in localStorage: ${storedEmail}`)
        
        // If we have an email in localStorage but not in URL, use that one
        if (!email && storedEmail) {
          console.log("Using email from localStorage")
          setEmailReceived(storedEmail)
          
          // Save to context as well
          collectEmail(storedEmail)
        }
      }
    }
    
    // Save to context if we have an email in URL
    if (email) {
      collectEmail(email)
    }
  }, [searchParams, email, collectEmail])

  // Fetch assessment data to pass to CourseLibrary
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assess/${params.id}`)

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (data.success && data.assessment) {
          setAssessment(data.assessment)
        }
      } catch (err) {
        console.error("Error fetching assessment:", err)
      }
    }

    fetchAssessment()
  }, [params.id])
  
  // Save email to Supabase if provided in URL or localStorage
  useEffect(() => {
    const finalEmail = emailReceived || email
    
    if (finalEmail) {
      const saveEmail = async () => {
        try {
          await updateEmailForAssessment(params.id, finalEmail)
          console.log('Email saved to Supabase:', finalEmail)
          setEmailDebug(prev => `${prev}\nEmail saved to Supabase: ${finalEmail}`)
        } catch (err) {
          console.error('Error saving email to Supabase:', err)
          setEmailDebug(prev => `${prev}\nError saving to Supabase: ${err}`)
        }
      }
      
      saveEmail()
    } else {
      console.log('No email provided in URL or localStorage')
      setEmailDebug(prev => `${prev}\nNo email provided in URL or localStorage`)
    }
  }, [params.id, email, emailReceived])

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

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <AnimatedContainer>
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
              <TabsTrigger value="courses" id="courses-tab-trigger" className="flex items-center relative group">
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
            </TabsContent>
            <TabsContent value="test" className="mt-4">
              <div className="space-y-6">
                <PersonalizedTest id={params.id} />
              </div>
            </TabsContent>
            <TabsContent value="courses" className="mt-4">
              <div className="space-y-6">
                {assessment ? (
                  <div>
                    {selectedRole && (
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
                    <CourseLibrary
                      technicalSkills={assessment.technicalSkills}
                      improvementAreas={assessment.improvementAreas}
                      industry={assessment.industryAnalysis.industry}
                      selectedRole={selectedRole}
                      careerTrajectory={assessment.careerTrajectory}
                      recommendedCourses={assessment.recommendedCourses}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="text-muted-foreground">Loading course recommendations...</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </AnimatedContainer>
      </div>
    </div>
  )
}
