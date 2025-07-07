"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle2,
  Award,
  TrendingUp,
  FileText,
  RefreshCcw,
  Brain,
  Briefcase,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Zap,
  Info,
  GraduationCap,
  Calendar,
  Code,
  CheckCircle
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedContainer, AnimatedList, AnimatedListItem } from "./animated-container"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LearningPathStep } from "@/lib/learning-pathway-types"
import { CVImprovement } from "@/lib/cv-improvement-prompt"
import { getApiUrl } from "@/utils/api-client"

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Unknown"

type TechnicalSkill = {
  skill: string
  level: SkillLevel
  justification: string
}

type IndustryAnalysis = {
  industry: string
  alignment: string
  trends: string[]
  keyInsights: string[]
}

type CareerTrajectory = {
  currentLevel: string
  potentialRoles: string[]
  timeToNextLevel: string
  developmentAreas: string[]
}

type SkillGapAnalysis = {
  criticalGaps: string[]
  importantGaps: string[]
  learningResources: string[]
}

type AssessmentData = {
  summary: string
  technicalSkills: TechnicalSkill[]
  softSkills: string[]
  strengths: string[]
  improvementAreas: string[]
  recommendations: string[]
  industryAnalysis: IndustryAnalysis
  careerTrajectory: CareerTrajectory
  skillGapAnalysis: SkillGapAnalysis
}

// New type for role-specific recommendations
type RoleRecommendations = {
  role: string
  courses: string[]
  skills: string[]
  certifications: string[]
}

const getLevelColor = (level: SkillLevel) => {
  switch (level) {
    case "Beginner":
      return "bg-gray-200 text-gray-800"
    case "Intermediate":
      return "bg-blue-200 text-blue-800"
    case "Advanced":
      return "bg-purple-200 text-purple-800"
    case "Expert":
      return "bg-green-200 text-green-800"
    default:
      return "bg-gray-200 text-gray-800"
  }
}

const getLevelPercentage = (level: SkillLevel) => {
  switch (level) {
    case "Beginner":
      return 25
    case "Intermediate":
      return 50
    case "Advanced":
      return 75
    case "Expert":
      return 100
    default:
      return 0
  }
}

export function AssessmentResults({ id, onRoleSelect }: { id: string; onRoleSelect?: (role: string | null) => void }) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  // Add state for selected role
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  // Add state for role-specific recommendations
  const [roleRecommendations, setRoleRecommendations] = useState<RoleRecommendations | null>(null)
  const [learningPathway, setLearningPathway] = useState<LearningPathStep[] | null>(null)
  const [pathwayLoading, setPathwayLoading] = useState(false)
  const [pathwayError, setPathwayError] = useState<string | null>(null)
  const [cvImprovements, setCVImprovements] = useState<CVImprovement[] | null>(null)
  const [cvImprovementsLoading, setCVImprovementsLoading] = useState(false)
  const [cvImprovementsError, setCVImprovementsError] = useState<string | null>(null)

  const fetchAssessment = async (regenerate = false) => {
    try {
      setLoading(true)
      setError(null)

      if (regenerate) {
        setIsRegenerating(true)
        // Request a new assessment report generation
        const regenerateResponse = await fetch(`/api/assessment-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, includeLatestTest: true }),
        });
        
        if (!regenerateResponse.ok) {
          throw new Error("Failed to regenerate assessment report");
        }
        
        await regenerateResponse.json();
        setIsRegenerating(false);
      }

      // Fetch the assessment results with retry logic
      const fetchWithRetry = async (retries = 3, delay = 2000) => {
        try {
          // Fetch the assessment results
          const response = await fetch(`/api/assess/${id}`)
          
          // Handle processing status (202)
          if (response.status === 202) {
            const data = await response.json().catch(() => ({}))
            console.log("Assessment is still processing:", data)
            
            if (retries > 0) {
              // Wait and retry
              setDebugInfo ? setDebugInfo(`Assessment is being processed, retrying in ${delay/1000} seconds...`) : null
              console.log(`Retrying assessment fetch in ${delay/1000} seconds... (${retries} retries left)`)
              
              return new Promise(resolve => {
                setTimeout(() => resolve(fetchWithRetry(retries - 1, delay)), delay)
              })
            } else {
              throw new Error("Assessment is still processing after multiple retries")
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
              errorData.error || errorData.details || `Server error: ${response.status} ${response.statusText}`,
            )
          }

          const data = await response.json()

          if (!data.success) {
            throw new Error(data.error || data.details || "Failed to get assessment results")
          }

          return data.assessment
        } catch (err) {
          if (retries > 0 && err instanceof Error && err.message.includes("processing")) {
            // Only retry for processing-related errors
            console.log(`Retrying due to processing error: ${err.message}`)
            
            return new Promise(resolve => {
              setTimeout(() => resolve(fetchWithRetry(retries - 1, delay)), delay)
            })
          }
          
          throw err
        }
      }
      
      // Start the retry process
      const assessmentData = await fetchWithRetry()
      setAssessment(assessmentData)
      
      // Now that we have assessment data, save it to the user profile
     // await saveAssessmentToUserProfile(assessmentData)
    } catch (err) {
      console.error("Error fetching assessment:", err)
      setError(err instanceof Error ? err.message : "Failed to load assessment results")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if we should regenerate the assessment report
    const queryParams = new URLSearchParams(window.location.search);
    const shouldRegenerate = queryParams.get('regenerate') === 'true';
    
    fetchAssessment(shouldRegenerate);
    
    // Clean up the URL after checking
    if (shouldRegenerate) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [id, retryCount]);

  // Effect to fetch CV improvements when assessment is loaded
  useEffect(() => {
    if (assessment) {
      fetchCVImprovements();
    }
  }, [assessment]);

  // Function to generate role-specific recommendations
  const generateRoleRecommendations = (role: string, assessment: AssessmentData) => {
    // In a real application, this would come from an API
    // Here we're generating some example recommendations based on the role
    
    // Get related technologies for the selected role
    const relatedTechnologies = getRelatedTechnologiesForRole(role);
    
    // Filter the user's skills to find gaps
    const userSkills = assessment.technicalSkills.map(skill => skill.skill);
    const skillGaps = relatedTechnologies.filter(tech => !userSkills.includes(tech));
    
    // Generate role-specific recommendations
    setRoleRecommendations({
      role,
      courses: [
        `${role} Fundamentals Bootcamp`,
        `Advanced ${role} Masterclass`,
        `${role} Certification Preparation`,
        ...skillGaps.map(skill => `${skill} for ${role} Professionals`)
      ].slice(0, 3),
      skills: [
        ...skillGaps.slice(0, 2),
        `${role} Best Practices`,
        `${role} Architecture Patterns`
      ].slice(0, 3),
      certifications: [
        `Professional ${role} Certification`,
        `Advanced ${role} Specialist`,
        `${assessment.industryAnalysis.industry} ${role} Expert`
      ].slice(0, 2)
    });
  };

  // Helper function to get related technologies for a role
  const getRelatedTechnologiesForRole = (role: string): string[] => {
    const roleToTech: Record<string, string[]> = {
      'Junior Software Engineer': ['Data Structures', 'Algorithms', 'Git', 'CI/CD', 'Unit Testing'],
      'Full-Stack Developer': ['React', 'Node.js', 'MongoDB', 'Express', 'GraphQL', 'RESTful APIs'],
      'Microservices Developer': ['Docker', 'Kubernetes', 'API Gateway', 'Event-Driven Architecture', 'Serverless'],
      // Add more roles as needed
    };
    
    return roleToTech[role] || ['Programming Fundamentals', 'Software Design', 'Testing Methodologies'];
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Function to handle role selection
  const handleRoleSelect = (role: string) => {
    const newSelectedRole = role === selectedRole ? null : role;
    setSelectedRole(newSelectedRole);
    
    // Clear existing data when role is deselected
    if (!newSelectedRole) {
      setLearningPathway(null);
      setRoleRecommendations(null);
    } else {
      // Fetch learning pathway for the selected role
      fetchLearningPathway(role);
      
      // Generate role-specific recommendations
      if (assessment) {
        generateRoleRecommendations(role, assessment);
      }
    }
    
    // Call the parent's onRoleSelect if provided
    if (onRoleSelect) {
      onRoleSelect(newSelectedRole);
    }
  };

  // Add this function to fetch the learning pathway
  const fetchLearningPathway = async (role: string) => {
    try {
      setPathwayLoading(true)
      setPathwayError(null)

      const response = await fetch(`/api/learning-pathway?assessmentId=${id}&selectedRole=${encodeURIComponent(role)}&steps=3`)

      if (!response.ok) {
        throw new Error(`Failed to fetch learning pathway: ${response.status}`)
      }

      const data = await response.json()
      setLearningPathway(data.pathway)
    } catch (error) {
      console.error("Error fetching learning pathway:", error)
      setPathwayError(error instanceof Error ? error.message : "Failed to load learning pathway")
      setLearningPathway(null)
    } finally {
      setPathwayLoading(false)
    }
  }

  // Function to fetch CV improvements
  const fetchCVImprovements = async () => {
    try {
      setCVImprovementsLoading(true)
      setCVImprovementsError(null)

      console.log(`Fetching CV improvements for assessment ID: ${id}`)
      
      // Add retry logic for the CV improvements endpoint
      const fetchWithRetry = async (retries = 2, delay = 1500) => {
        try {
          const response = await fetch(`/api/cv-improvements?assessmentId=${id}`)
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }
          
          return await response.json()
        } catch (error) {
          if (retries <= 0) throw error
          
          console.log(`Retrying CV improvements fetch (${retries} attempts left)...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return fetchWithRetry(retries - 1, delay * 1.5)
        }
      }
      
      const data = await fetchWithRetry()
      
      if (!data || !data.improvements) {
        throw new Error('Invalid response format from CV improvements API')
      }
      
      setCVImprovements(data.improvements)
      
      // Check if data came from cache
      if (data.fromCache) {
        console.log(`Retrieved CV improvements from cache for assessment ID: ${id}`)
      } else {
        console.log(`Generated new CV improvements for assessment ID: ${id}`)
      }
      
      // Check if there was an error but the API still returned fallback improvements
      if (data.isError) {
        setCVImprovementsError(data.message || "Using fallback CV improvements")
      }
    } catch (error) {
      console.error("Error fetching CV improvements:", error)
      setCVImprovementsError(error instanceof Error ? error.message : "Failed to load CV improvements")
      
      // Try to use fallback improvements directly when API fails completely
      try {
        // Make direct API call to get fallback improvements
        const fallbackResponse = await fetch('/api/cv-improvements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvText: "fallback" }) // Just need any text to trigger fallbacks
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          if (fallbackData && fallbackData.improvements) {
            console.log("Using client-side fallback CV improvements")
            setCVImprovements(fallbackData.improvements)
          }
        }
      } catch (fallbackError) {
        console.error("Failed to get fallback improvements:", fallbackError)
        setCVImprovements(null)
      }
    } finally {
      setCVImprovementsLoading(false)
    }
  }

  // Add this new function to send the assessment to the backend
  const saveAssessmentToUserProfile = async (assessmentData: AssessmentData) => {
    try {
      const userId = localStorage.getItem('userEmail') || localStorage.getItem('assessmentEmail');
      // Get authentication token
     const authToken = localStorage.getItem('authToken'); // Or however you store your auth token
      
      if (!authToken) {
        console.log("User not authenticated, skipping profile save");
        return;
      }
      
      // Send the assessment data to your backend
      const apiUrl = getApiUrl('/api/assessments/user-assessments');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: userId,
          // Send exactly what the controller expects
          summary: assessmentData.summary,
          technicalSkills: assessmentData.technicalSkills,
          softSkills: assessmentData.softSkills,
          strengths: assessmentData.strengths,
          improvementAreas: assessmentData.improvementAreas,
          recommendations: assessmentData.recommendations || [],
          industryAnalysis: assessmentData.industryAnalysis,
          careerTrajectory: assessmentData.careerTrajectory,
          skillGapAnalysis: assessmentData.skillGapAnalysis
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log("Assessment saved to user profile:", result);
      } else {
        console.error("Failed to save assessment to user profile:", result.error);
      }
    } catch (error) {
      console.error("Error saving assessment to user profile:", error);
      // Don't throw the error - we don't want to affect the UI if this fails
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing your CV</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Your CV is being analyzed by our AI</p>
                <p className="text-sm text-muted-foreground">This might take a minute or two</p>
              </div>
              {retryCount > 0 && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Retrying assessment loading... 
                    <span className="text-sm text-muted-foreground ml-1">
                      (Attempt {retryCount + 1})
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col space-y-2">
            <p>{error}</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleRetry} variant="outline" size="sm" className="self-start">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry Assessment
              </Button>
            </motion.div>
          </AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  if (!assessment) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No assessment data found</AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  return (
    <AnimatedContainer className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            {assessment.summary}
          </motion.p>
        </CardContent>
      </Card>

      <Tabs defaultValue="skills">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills" className="relative group">
            <div className="flex items-center">
              <Award className="mr-2 h-4 w-4" />
              <span>Skills</span>
            </div>
            <motion.span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
              initial={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </TabsTrigger>
          <TabsTrigger value="career" className="relative group">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Career Path</span>
            </div>
            <motion.span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </TabsTrigger>
          <TabsTrigger value="gaps" className="relative group">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span>Skill Gaps</span>
            </div>
            <motion.span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </TabsTrigger>
          <TabsTrigger value="cv-improvements" className="relative group">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>CV Improvements</span>
            </div>
            <motion.span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="skills" className="mt-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Technical Skills
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50">
                  Based on Industry Standards
                </Badge>
              </CardHeader>
              <CardContent>
                <AnimatedList className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessment.technicalSkills.map((skill, index) => (
                    <AnimatedListItem key={index}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-help"
                              whileHover={{ y: -2 }}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{skill.skill}</h3>
                                <div className="flex items-center">
                                  <Badge className={getLevelColor(skill.level)}>{skill.level}</Badge>
                                  <Info className="h-4 w-4 ml-1 text-gray-400" />
                                </div>
                              </div>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${getLevelPercentage(skill.level)}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                              >
                                <Progress value={getLevelPercentage(skill.level)} className="h-2" />
                              </motion.div>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Industry Standard Assessment</h4>
                              <p className="text-sm">{skill.justification}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Soft Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList className="flex flex-wrap gap-2">
                  {assessment.softSkills.map((skill, index) => (
                    <AnimatedListItem key={index}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Badge variant="outline" className="text-sm py-1">
                          {skill}
                        </Badge>
                      </motion.div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList className="space-y-2">
                  {assessment.strengths.map((strength, index) => (
                    <AnimatedListItem key={index}>
                      <motion.div
                        className="flex items-start"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1, type: "spring" }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <span>{strength}</span>
                      </motion.div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Career Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full" />
                  <div>
                    <h3 className="font-medium">Current Level</h3>
                    <div className="flex items-center mt-1">
                      <Badge className="bg-blue-100 text-blue-800 mr-2">
                        {assessment.careerTrajectory.currentLevel}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        in {assessment.industryAnalysis.industry} industry
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Potential Next Roles</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select a role to see specific recommendations:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.careerTrajectory.potentialRoles.map((role, index) => (
                      <Badge 
                        key={index} 
                        variant={selectedRole === role ? "default" : "outline"}
                        className={`cursor-pointer ${selectedRole === role ? "bg-primary" : "bg-green-50 hover:bg-green-100"}`}
                        onClick={() => handleRoleSelect(role)}
                      >
                        {role} {selectedRole === role && "✓"}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Estimated Time to Next Level</h3>
                  <p className="text-sm">{assessment.careerTrajectory.timeToNextLevel}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Development Areas</h3>
                  <ul className="space-y-1">
                    {assessment.careerTrajectory.developmentAreas.map((area, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <TrendingUp className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {selectedRole ? `Recommendations for ${selectedRole}` : "General Recommendations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRole ? (
                  <div className="space-y-6">
                    {/* Learning Pathway */}
                    {pathwayLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : pathwayError ? (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{pathwayError}</AlertDescription>
                      </Alert>
                    ) : learningPathway && learningPathway.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center text-lg">
                          <GraduationCap className="h-5 w-5 text-primary mr-2" />
                          Learning Pathway
                        </h3>
                        <div className="space-y-4">
                          {learningPathway.map((step, stepIndex) => (
                            <div key={stepIndex} className="border rounded-lg p-4">
                              <h4 className="font-medium flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Step {stepIndex + 1}: {step.title.replace(/^Step \d+: /, '')}</span>
                                <span className="text-sm text-gray-500 ml-2">({step.timeframe})</span>
                              </h4>
                              <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                              
                              <div className="mt-3 space-y-3">
                                {/* Skills to acquire */}
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                                    Skills to Acquire
                                  </h5>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {step.skillsToAcquire.map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-xs bg-green-50">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Courses */}
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1 text-blue-600" />
                                    Recommended Courses
                                  </h5>
                                  <div className="space-y-1 mt-1">
                                    {step.courses.slice(0, 2).map((course, i) => (
                                      <div key={i} className="text-xs">
                                        <span className="font-medium">{course.title}</span> 
                                        <span className="text-gray-500"> ({course.provider})</span>
                                      </div>
                                    ))}
                                    {step.courses.length > 2 && (
                                      <div className="text-xs text-gray-500">
                                        + {step.courses.length - 2} more courses
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Certifications if available */}
                                {step.certifications && step.certifications.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                      <Award className="h-3 w-3 mr-1 text-amber-600" />
                                      Certifications
                                    </h5>
                                    <div className="text-xs mt-1">
                                      {step.certifications[0].name}
                                      {step.certifications.length > 1 && (
                                        <span className="text-gray-500"> + {step.certifications.length - 1} more</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Dispatch a custom event to switch tabs
                              const event = new CustomEvent('switchTab', { detail: { tab: 'courses' } });
                              window.dispatchEvent(event);
                            }}
                            className="text-xs"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Explore Learning Resources
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <AnimatedList className="space-y-3">
                    {assessment.recommendations.map((recommendation, index) => (
                      <AnimatedListItem key={index}>
                        <motion.div
                          className="flex items-start p-3 border rounded-md"
                          whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1, type: "spring" }}
                          >
                            <TrendingUp className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <span>{recommendation}</span>
                        </motion.div>
                      </AnimatedListItem>
                    ))}
                    {assessment.careerTrajectory.potentialRoles.length > 0 && (
                      <AnimatedListItem>
                        <motion.div
                          className="p-3 border border-dashed rounded-md bg-gray-50"
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <p className="text-center text-sm text-muted-foreground">
                            Select a specific role above to see tailored recommendations
                          </p>
                        </motion.div>
                      </AnimatedListItem>
                    )}
                  </AnimatedList>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaps" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Skill Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.skillGapAnalysis.criticalGaps.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                      Critical Skill Gaps
                    </h3>
                    <div className="space-y-2">
                      {assessment.skillGapAnalysis.criticalGaps.map((gap, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border border-red-100 bg-red-50 rounded-md"
                        >
                          <span>{gap}</span>
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            Critical
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {assessment.skillGapAnalysis.importantGaps.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                      Important Skill Gaps
                    </h3>
                    <div className="space-y-2">
                      {assessment.skillGapAnalysis.importantGaps.map((gap, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border border-amber-100 bg-amber-50 rounded-md"
                        >
                          <span>{gap}</span>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            Important
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 border rounded-lg bg-blue-50 border-blue-100">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium">Recommended Learning Resources</h3>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {assessment.skillGapAnalysis.learningResources.map((resource, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList className="space-y-2">
                  {assessment.improvementAreas.map((area, index) => (
                    <AnimatedListItem key={index}>
                      <motion.div
                        className="flex items-start"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1, type: "spring" }}
                        >
                          <TrendingUp className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        </motion.div>
                        <span>{area}</span>
                      </motion.div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cv-improvements" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  CV Improvements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cvImprovementsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : cvImprovementsError && !cvImprovements ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{cvImprovementsError}</AlertDescription>
                  </Alert>
                ) : cvImprovements && cvImprovements.length > 0 ? (
                  <div className="space-y-6">
                    {cvImprovementsError && (
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Note</AlertTitle>
                        <AlertDescription>{cvImprovementsError}</AlertDescription>
                      </Alert>
                    )}
                    {cvImprovements.map((improvement, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="mb-2">
                          <Badge className="bg-blue-100 text-blue-800">{improvement.category}</Badge>
                        </div>
                        <h3 className="font-medium text-lg mb-2">{improvement.title}</h3>
                        <p className="text-sm mb-3">{improvement.description}</p>
                        
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-1">Suggested Changes:</h4>
                          <ul className="space-y-1">
                            {improvement.suggestedChanges.map((change, i) => (
                              <li key={i} className="text-sm flex items-start">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-1">Impact:</h4>
                          <p className="text-sm">{improvement.impact}</p>
                        </div>
                        
                        {improvement.example && (
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                            <h4 className="font-medium text-sm mb-1">Example:</h4>
                            <p className="text-sm italic">{improvement.example}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No CV improvements found</AlertTitle>
                    <AlertDescription>
                      We couldn't generate any CV improvements. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/*
      {assessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Validate Your Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Take a personalized test based on your skills profile to validate your knowledge and identify areas for
                improvement.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => {
                    // Dispatch a custom event to switch tabs
                    const event = new CustomEvent('switchTab', { detail: { tab: 'test' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full"
                >
                  Take Skills Test
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {assessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Recommended Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Explore personalized course recommendations based on your skills profile and improvement areas.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => {
                    // Dispatch a custom event to switch tabs
                    const event = new CustomEvent('switchTab', { detail: { tab: 'courses' } });
                    window.dispatchEvent(event);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Course Library
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      */}
    </AnimatedContainer>
  )
}