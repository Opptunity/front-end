"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BookOpen, 
  Award, 
  Calendar, 
  CheckCircle, 
  Code, 
  FileText, 
  TrendingUp,
  AlertCircle,
  Lightbulb
} from "lucide-react"
import { LearningPathStep, ProjectItem, CertificationItem } from "@/lib/learning-pathway-types"

// Types
type LearningPathwayProps = {
  assessmentId: string
  selectedRole: string | null
}

export function LearningPathway({ assessmentId, selectedRole }: LearningPathwayProps) {
  const [pathway, setPathway] = useState<LearningPathStep[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState("0") // Default to first step

  // Fetch learning pathway when role is selected
  useEffect(() => {
    if (!selectedRole || !assessmentId) {
      setPathway(null)
      return
    }

    const fetchPathway = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Add retry logic for the learning pathway endpoint
        const fetchWithRetry = async (retries = 2, delay = 1500) => {
          try {
            const response = await fetch(
              `/api/learning-pathway?assessmentId=${assessmentId}&selectedRole=${encodeURIComponent(selectedRole)}&steps=3`
            )
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(
                errorData.error || `Error: ${response.status}`
              )
            }
            
            return await response.json()
          } catch (error) {
            if (retries <= 0) throw error
            
            console.log(`Retrying learning pathway fetch (${retries} attempts left)...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return fetchWithRetry(retries - 1, delay * 1.5)
          }
        }
        
        const data = await fetchWithRetry()
        
        if (data.pathway && Array.isArray(data.pathway)) {
          setPathway(data.pathway)
          setActiveStep("0") // Reset to first step when new pathway is loaded
        } else {
          throw new Error("Invalid learning pathway data")
        }
      } catch (err) {
        console.error("Failed to fetch learning pathway:", err)
        setError("Failed to load learning pathway. Please try again.")
        
        // Try to use a simplified fallback pathway
        try {
          console.log("Using fallback learning pathway")
          
          // Create a simple fallback pathway
          const fallbackPathway: LearningPathStep[] = [
            {
              title: `Step 1: Building Foundation for ${selectedRole}`,
              description: `Start with fundamental skills and knowledge required for a ${selectedRole} position.`,
              timeframe: "3-6 months",
              courses: [
                {
                  title: `${selectedRole} Fundamentals`,
                  provider: "General Learning",
                  level: "Beginner",
                  url: "",
                  relevance: "Essential starting point for this career path"
                }
              ],
              skillsToAcquire: ["Core Knowledge", "Basic Skills", "Industry Understanding"],
              completionCriteria: "Complete at least one foundational course and build a simple portfolio project."
            },
            {
              title: `Step 2: Advancing Your ${selectedRole} Skills`,
              description: "Deepen your knowledge and gain practical experience.",
              timeframe: "6-9 months",
              courses: [
                {
                  title: "Advanced Techniques",
                  provider: "Industry Courses",
                  level: "Intermediate",
                  url: "",
                  relevance: "Builds on fundamentals to develop specialized skills"
                }
              ],
              skillsToAcquire: ["Specialized Knowledge", "Problem Solving", "Technical Skills"],
              completionCriteria: "Complete advanced courses and contribute to real-world projects."
            }
          ]
          
          setPathway(fallbackPathway)
        } catch (fallbackError) {
          console.error("Failed to create fallback pathway:", fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPathway()
  }, [assessmentId, selectedRole])

  if (!selectedRole) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No role selected</AlertTitle>
        <AlertDescription>
          Please select a role from the Career Trajectory section to view a personalized learning pathway.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return <LearningPathwaySkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!pathway || pathway.length === 0) {
    return (
      <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-100">
        <Lightbulb className="h-4 w-4 text-yellow-600" />
        <AlertTitle>No pathway available</AlertTitle>
        <AlertDescription>
          We couldn't find a learning pathway for the selected role. Please try selecting a different role.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Learning Pathway for {selectedRole}
          </CardTitle>
          <CardDescription>
            Follow this personalized learning path to progress from your current position to {selectedRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="mb-4">
                <h3 className="font-medium text-lg mb-2">Pathway Summary</h3>
                <div className="flex flex-col gap-4">
                  {pathway.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title.replace(/^Step \d+: /, '')}</h4>
                        <p className="text-sm text-muted-foreground">{step.timeframe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-lg mb-2">Key Skills to Acquire</h3>
                <div className="flex flex-wrap gap-2">
                  {pathway.flatMap(step => step.skillsToAcquire).slice(0, 12).map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Recommended Certifications</h3>
                <div className="space-y-2">
                  {pathway.flatMap(step => step.certifications || []).slice(0, 3).map((cert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">{cert.provider}</p>
                      </div>
                    </div>
                  ))}
                  
                  {pathway.flatMap(step => step.certifications || []).length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No specific certifications recommended for this pathway</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4">
              <Accordion type="single" collapsible value={activeStep} onValueChange={setActiveStep}>
                {pathway.map((step, index) => (
                  <AccordionItem key={index} value={index.toString()}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <span>{step.title.replace(/^Step \d+: /, '')}</span>
                        <Badge variant="outline" className="ml-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {step.timeframe}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <p>{step.description}</p>
                        
                        <div>
                          <h4 className="font-medium flex items-center mb-2">
                            <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                            Recommended Courses
                          </h4>
                          <div className="space-y-3">
                            {step.courses.map((course, courseIndex) => (
                              <Card key={courseIndex} className="p-3">
                                <div className="flex flex-col">
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-medium">{course.title}</h5>
                                    <Badge variant="outline">{course.level}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                                  <p className="text-sm mt-2">{course.relevance}</p>
                                  {course.url && (
                                    <div className="mt-2">
                                      <Button variant="link" className="p-0 h-auto text-sm" asChild>
                                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                                          View Course
                                        </a>
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium flex items-center mb-2">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                            Skills to Acquire
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {step.skillsToAcquire.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline" className="bg-green-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {step.projects && step.projects.length > 0 && (
                          <div>
                            <h4 className="font-medium flex items-center mb-2">
                              <Code className="h-4 w-4 mr-2 text-purple-600" />
                              Practical Projects
                            </h4>
                            <div className="space-y-3">
                              {step.projects.map((project, projectIndex) => (
                                <Card key={projectIndex} className="p-3">
                                  <h5 className="font-medium">{project.title}</h5>
                                  <p className="text-sm mt-1">{project.description}</p>
                                  <div className="mt-2">
                                    <h6 className="text-sm font-medium">Learning Outcomes:</h6>
                                    <ul className="text-sm pl-5 list-disc">
                                      {project.learningOutcomes.map((outcome, i) => (
                                        <li key={i}>{outcome}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {step.certifications && step.certifications.length > 0 && (
                          <div>
                            <h4 className="font-medium flex items-center mb-2">
                              <Award className="h-4 w-4 mr-2 text-amber-600" />
                              Certifications
                            </h4>
                            <div className="space-y-3">
                              {step.certifications.map((cert, certIndex) => (
                                <Card key={certIndex} className="p-3">
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-medium">{cert.name}</h5>
                                    <Badge variant="outline">{cert.difficulty}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{cert.provider}</p>
                                  <p className="text-sm mt-2">{cert.relevance}</p>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium flex items-center mb-2">
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                            Completion Criteria
                          </h4>
                          <p className="text-sm">{step.completionCriteria}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LearningPathwaySkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <Skeleton className="h-8 w-80 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-60" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-60" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 