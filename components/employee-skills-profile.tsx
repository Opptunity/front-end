"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Star,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Code,
  Users,
  Brain,
  Trophy,
  Zap,
  Clock,
  Building
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types based on the skills assessment structure
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

type EmployeeAssessment = {
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

interface EmployeeProfile {
  id: string
  name: string
  email: string
  position?: string
  department?: string
  startDate?: string
  phone?: string
  location?: string
  avatar?: string
  assessment?: EmployeeAssessment
}

interface EmployeeSkillsProfileProps {
  employeeId: string
  employeeData?: EmployeeProfile
  assessmentId?: string
}

const getLevelColor = (level: SkillLevel) => {
  switch (level) {
    case "Beginner":
      return "bg-blue-100 text-blue-800"
    case "Intermediate":
      return "bg-green-100 text-green-800"
    case "Advanced":
      return "bg-purple-100 text-purple-800"
    case "Expert":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function EmployeeSkillsProfile({ 
  employeeId, 
  employeeData, 
  assessmentId 
}: EmployeeSkillsProfileProps) {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(employeeData || null)
  const [loading, setLoading] = useState(!employeeData)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!employeeData) {
      fetchEmployeeProfile()
    }
  }, [employeeId, employeeData])

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch employee data and their latest assessment
      const response = await fetch(`/api/employees/${employeeId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch employee profile")
      }

      const data = await response.json()
      setEmployee(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching employee profile:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={fetchEmployeeProfile}
          >
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (!employee) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <User className="h-12 w-12 mx-auto mb-4" />
          <p>Employee profile not found</p>
        </div>
      </Card>
    )
  }

  const assessment = employee.assessment

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/20">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="text-xl font-bold bg-white/20">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
                <p className="text-blue-100 text-lg mb-1">{employee.position || "Employee"}</p>
                {employee.department && (
                  <p className="text-blue-200 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {employee.department}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="space-y-2 text-sm">
                  {employee.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{employee.email}</span>
                    </div>
                  )}
                  {employee.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Since {new Date(employee.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {employee.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{employee.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Skills Assessment Content */}
      {assessment ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Technical Skills</TabsTrigger>
              <TabsTrigger value="career">Career Path</TabsTrigger>
              <TabsTrigger value="gaps">Development Areas</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{assessment.summary}</p>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Skills Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Technical Skills</span>
                      <Badge variant="secondary">{assessment.technicalSkills.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Soft Skills</span>
                      <Badge variant="secondary">{assessment.softSkills.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Key Strengths</span>
                      <Badge variant="secondary">{assessment.strengths.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Industry</span>
                      <Badge>{assessment.industryAnalysis.industry}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Soft Skills and Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Soft Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {assessment.softSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {assessment.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Technical Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Technical Skills Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assessment.technicalSkills.map((skill, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-help"
                              whileHover={{ y: -2 }}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium">{skill.skill}</h3>
                                <Badge className={getLevelColor(skill.level)}>
                                  {skill.level}
                                </Badge>
                              </div>
                              <Progress 
                                value={getLevelPercentage(skill.level)} 
                                className="h-2"
                              />
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-sm">
                              <h4 className="font-semibold mb-2">Assessment Details</h4>
                              <p className="text-sm">{skill.justification}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Career Path Tab */}
            <TabsContent value="career" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Career Trajectory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Current Level</h4>
                      <p className="font-medium">{assessment.careerTrajectory.currentLevel}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Time to Next Level</h4>
                      <p className="font-medium">{assessment.careerTrajectory.timeToNextLevel}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-2">Potential Roles</h4>
                      <div className="space-y-1">
                        {assessment.careerTrajectory.potentialRoles.map((role, index) => (
                          <Badge key={index} variant="outline">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Development Focus Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {assessment.careerTrajectory.developmentAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-600" />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Development Areas Tab */}
            <TabsContent value="gaps" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Critical Skill Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {assessment.skillGapAnalysis.criticalGaps.map((gap, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      Important Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {assessment.improvementAreas.map((area, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Development Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assessment.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {assessment.skillGapAnalysis.learningResources.map((resource, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{resource}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Skills Assessment Available</h3>
            <p className="text-gray-500 mb-4">
              This employee hasn't completed a skills assessment yet.
            </p>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Start Skills Assessment
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
} 