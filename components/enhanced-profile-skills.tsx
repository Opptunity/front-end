"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Award,
  TrendingUp,
  Users,
  Star,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Brain,
  BookOpen,
  Target,
  Code
} from 'lucide-react'

interface SkillAssessment {
  summary: string
  technicalSkills: Array<{
    skill: string
    level: string
    justification: string
  }>
  softSkills: string[]
  strengths: string[]
  improvementAreas: string[]
  recommendations: string[]
  industryAnalysis: {
    industry: string
    alignment: string
    trends: string[]
    keyInsights: string[]
  }
  careerTrajectory: {
    currentLevel: string
    potentialRoles: string[]
    timeToNextLevel: string
    developmentAreas: string[]
  }
  skillGapAnalysis: {
    criticalGaps: string[]
    importantGaps: string[]
    learningResources: string[]
  }
}

interface EnhancedProfileSkillsProps {
  userEmail?: string
  assessment?: SkillAssessment
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "beginner":
      return "bg-blue-100 text-blue-800"
    case "intermediate":
      return "bg-green-100 text-green-800"
    case "advanced":
      return "bg-purple-100 text-purple-800"
    case "expert":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getLevelPercentage = (level: string) => {
  switch (level.toLowerCase()) {
    case "beginner":
      return 25
    case "intermediate":
      return 50
    case "advanced":
      return 75
    case "expert":
      return 100
    default:
      return 0
  }
}

export function EnhancedProfileSkills({ userEmail, assessment: providedAssessment }: EnhancedProfileSkillsProps) {
  const [assessment, setAssessment] = useState<SkillAssessment | null>(providedAssessment || null)
  const [loading, setLoading] = useState(!providedAssessment)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!providedAssessment && userEmail) {
      fetchAssessment()
    }
  }, [userEmail, providedAssessment])

  const fetchAssessment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assessments/user?email=${userEmail}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          // Use the most recent assessment
          const latestAssessment = data[0]
          
          setAssessment({
            summary: latestAssessment.summary || 'No summary available',
            technicalSkills: latestAssessment.technical_skills || [],
            softSkills: latestAssessment.soft_skills || [],
            strengths: latestAssessment.strengths || [],
            improvementAreas: latestAssessment.improvement_areas || [],
            recommendations: latestAssessment.recommendations || [],
            industryAnalysis: latestAssessment.industry_analysis || {
              industry: 'Unknown',
              alignment: 'Not assessed',
              trends: [],
              keyInsights: []
            },
            careerTrajectory: latestAssessment.career_trajectory || {
              currentLevel: 'Not assessed',
              potentialRoles: [],
              timeToNextLevel: 'Unknown',
              developmentAreas: []
            },
            skillGapAnalysis: latestAssessment.skill_gap_analysis || {
              criticalGaps: [],
              importantGaps: [],
              learningResources: []
            }
          })
        }
      }
    } catch (err) {
      setError('Failed to load assessment data')
      console.error('Error fetching assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading skills profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Skills Assessment Available</h3>
          <p className="text-gray-500 mb-4">
            Create a skills profile by uploading your CV or taking an assessment.
          </p>
          <Button>
            <Award className="h-4 w-4 mr-2" />
            Create Skills Profile
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{assessment.summary}</p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Technical Skills</span>
              <Badge variant="secondary">{assessment.technicalSkills.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Soft Skills</span>
              <Badge variant="secondary">{assessment.softSkills.length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Industry</span>
              <Badge>{assessment.industryAnalysis.industry}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Career Level</span>
              <Badge variant="outline">{assessment.careerTrajectory.currentLevel}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Skills */}
      {assessment.technicalSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Technical Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.technicalSkills.slice(0, 8).map((skill, index) => (
                <motion.div
                  key={index}
                  className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">{skill.skill}</h4>
                    <Badge className={getLevelColor(skill.level)} variant="secondary">
                      {skill.level}
                    </Badge>
                  </div>
                  <Progress 
                    value={getLevelPercentage(skill.level)} 
                    className="h-1.5"
                  />
                </motion.div>
              ))}
            </div>
            {assessment.technicalSkills.length > 8 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                And {assessment.technicalSkills.length - 8} more skills...
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assessment.strengths.slice(0, 5).map((strength, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Development Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Areas for Improvement</h4>
              <div className="space-y-2">
                {assessment.improvementAreas.slice(0, 3).map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {assessment.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 