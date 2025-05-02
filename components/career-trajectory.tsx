"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp, Award, Star, Clock } from "lucide-react"
import type { Industry } from "@/lib/industry-detection"

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Unknown"

type TechnicalSkill = {
  skill: string
  level: SkillLevel
}

type CareerTrajectoryProps = {
  skills: TechnicalSkill[]
  strengths: string[]
  improvementAreas: string[]
  industry: Industry
}

// Career path data (in a real app, this would come from an API or database)
const careerPaths: Record<Industry, string[]> = {
  technology: [
    "Software Engineer → Senior Software Engineer → Tech Lead → Engineering Manager",
    "Frontend Developer → Senior Frontend Developer → UI/UX Architect → Product Manager",
    "Backend Developer → Senior Backend Developer → System Architect → CTO",
    "Full Stack Developer → DevOps Engineer → Cloud Architect → Solutions Architect",
  ],
  marketing: [
    "Marketing Associate → Marketing Manager → Marketing Director → CMO",
    "Content Creator → Content Strategist → Content Director → Brand Strategist",
    "Social Media Specialist → Digital Marketing Manager → Marketing Operations Director",
  ],
  finance: [
    "Financial Analyst → Senior Financial Analyst → Finance Manager → Finance Director → CFO",
    "Investment Analyst → Portfolio Manager → Investment Director → Chief Investment Officer",
    "Accountant → Senior Accountant → Accounting Manager → Controller → CFO",
  ],
  // Add more industries as needed
  healthcare: [],
  education: [],
  design: [],
  legal: [],
  hr: [],
  sales: [],
  manufacturing: [],
  other: [],
}

// Function to determine career level based on skills
function determineCareerLevel(skills: TechnicalSkill[]): "Entry-level" | "Mid-level" | "Senior" | "Leadership" {
  const advancedCount = skills.filter((s) => s.level === "Advanced" || s.level === "Expert").length
  const totalSkills = skills.length

  if (advancedCount / totalSkills > 0.7) return "Leadership"
  if (advancedCount / totalSkills > 0.4) return "Senior"
  if (advancedCount / totalSkills > 0.2) return "Mid-level"
  return "Entry-level"
}

// Function to suggest next career steps
function suggestNextSteps(
  currentLevel: string,
  industry: Industry,
  skills: TechnicalSkill[],
  improvementAreas: string[],
): string[] {
  // This is a simplified version - in a real app, this would be more sophisticated
  const suggestions: string[] = []

  // Skill-based suggestions
  const skillGaps = skills.filter((s) => s.level === "Beginner" || s.level === "Intermediate").slice(0, 2)
  skillGaps.forEach((skill) => {
    suggestions.push(`Improve ${skill.skill} skills to reach Advanced level`)
  })

  // Career path suggestions
  const relevantPaths = careerPaths[industry] || careerPaths.other
  if (relevantPaths.length > 0) {
    const randomPath = relevantPaths[Math.floor(Math.random() * relevantPaths.length)]
    const pathSteps = randomPath.split(" → ")

    let nextStepIndex = 0
    if (currentLevel === "Mid-level") nextStepIndex = 1
    if (currentLevel === "Senior") nextStepIndex = 2
    if (currentLevel === "Leadership") nextStepIndex = 3

    if (pathSteps[nextStepIndex]) {
      suggestions.push(`Work toward a ${pathSteps[nextStepIndex]} position`)
    }
  }

  // Add suggestions based on improvement areas
  if (improvementAreas.length > 0) {
    suggestions.push(`Address gap in ${improvementAreas[0].toLowerCase()}`)
  }

  // Add generic suggestions if we don't have enough
  if (suggestions.length < 3) {
    suggestions.push("Pursue relevant certifications in your field")
    suggestions.push("Develop leadership and management skills")
    suggestions.push("Build a portfolio of successful projects")
  }

  return suggestions.slice(0, 4)
}

// Function to estimate time to next level
function estimateTimeToNextLevel(currentLevel: string): string {
  switch (currentLevel) {
    case "Entry-level":
      return "1-2 years"
    case "Mid-level":
      return "2-3 years"
    case "Senior":
      return "3-5 years"
    default:
      return "Varies"
  }
}

export function CareerTrajectory({ skills, strengths, improvementAreas, industry }: CareerTrajectoryProps) {
  const currentLevel = determineCareerLevel(skills)
  const nextSteps = suggestNextSteps(currentLevel, industry, skills, improvementAreas)
  const timeEstimate = estimateTimeToNextLevel(currentLevel)

  // Determine next level
  const levels = ["Entry-level", "Mid-level", "Senior", "Leadership"]
  const currentIndex = levels.indexOf(currentLevel)
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : "Executive"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Career Trajectory Analysis
        </CardTitle>
        <CardDescription>Your current position and potential career path based on your skills profile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center space-x-3"
          >
            <Briefcase className="h-10 w-10 p-2 bg-blue-100 text-blue-600 rounded-full" />
            <div>
              <h3 className="font-medium">Current Level</h3>
              <div className="flex items-center mt-1">
                <Badge className="bg-blue-100 text-blue-800 mr-2">{currentLevel}</Badge>
                <span className="text-sm text-muted-foreground">in {industry} industry</span>
              </div>
            </div>
          </motion.div>

          {/* Next Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center space-x-3"
          >
            <TrendingUp className="h-10 w-10 p-2 bg-green-100 text-green-600 rounded-full" />
            <div>
              <h3 className="font-medium">Next Target Level</h3>
              <div className="flex items-center mt-1">
                <Badge className="bg-green-100 text-green-800 mr-2">{nextLevel}</Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Est. {timeEstimate}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-start space-x-3"
          >
            <Star className="h-10 w-10 p-2 bg-amber-100 text-amber-600 rounded-full flex-shrink-0" />
            <div>
              <h3 className="font-medium">Key Strengths for Advancement</h3>
              <ul className="mt-1 space-y-1">
                {strengths.slice(0, 2).map((strength, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="text-sm flex items-start"
                  >
                    <span className="text-green-500 mr-1">•</span> {strength}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Recommended Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="font-medium">Recommended Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm flex items-start"
                >
                  <Award className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
