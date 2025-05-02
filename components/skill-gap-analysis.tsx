"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, BookOpen } from "lucide-react"
import type { Industry } from "@/lib/industry-detection"

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Unknown"

type TechnicalSkill = {
  skill: string
  level: SkillLevel
}

type SkillGapAnalysisProps = {
  skills: TechnicalSkill[]
  industry: Industry
}

// Industry required skills data (in a real app, this would come from an API or database)
const industryRequiredSkills: Record<
  Industry,
  Array<{ skill: string; importance: "critical" | "important" | "nice-to-have" }>
> = {
  technology: [
    { skill: "JavaScript", importance: "critical" },
    { skill: "React", importance: "important" },
    { skill: "Node.js", importance: "important" },
    { skill: "TypeScript", importance: "important" },
    { skill: "Git", importance: "critical" },
    { skill: "SQL", importance: "important" },
    { skill: "AWS", importance: "important" },
    { skill: "Docker", importance: "nice-to-have" },
    { skill: "CI/CD", importance: "nice-to-have" },
    { skill: "Testing", importance: "important" },
  ],
  marketing: [
    { skill: "Content Marketing", importance: "critical" },
    { skill: "SEO", importance: "important" },
    { skill: "Social Media", importance: "important" },
    { skill: "Google Analytics", importance: "important" },
    { skill: "Email Marketing", importance: "important" },
    { skill: "Marketing Automation", importance: "nice-to-have" },
    { skill: "CRM", importance: "important" },
    { skill: "Copywriting", importance: "critical" },
  ],
  finance: [
    { skill: "Financial Analysis", importance: "critical" },
    { skill: "Excel", importance: "critical" },
    { skill: "Financial Modeling", importance: "important" },
    { skill: "Accounting", importance: "important" },
    { skill: "Budgeting", importance: "important" },
    { skill: "Forecasting", importance: "important" },
    { skill: "Financial Reporting", importance: "important" },
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

// Function to check if user has a required skill
function hasSkill(userSkills: TechnicalSkill[], requiredSkill: string): { has: boolean; level: SkillLevel | null } {
  // Check for exact match
  const exactMatch = userSkills.find((s) => s.skill.toLowerCase() === requiredSkill.toLowerCase())
  if (exactMatch) {
    return { has: true, level: exactMatch.level }
  }

  // Check for partial match
  const partialMatch = userSkills.find(
    (s) =>
      s.skill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
      requiredSkill.toLowerCase().includes(s.skill.toLowerCase()),
  )
  if (partialMatch) {
    return { has: true, level: partialMatch.level }
  }

  return { has: false, level: null }
}

// Function to determine if skill level is sufficient
function isSkillLevelSufficient(level: SkillLevel | null, importance: string): boolean {
  if (!level) return false

  if (importance === "critical") {
    return level === "Advanced" || level === "Expert"
  }

  if (importance === "important") {
    return level === "Intermediate" || level === "Advanced" || level === "Expert"
  }

  return true // For "nice-to-have" skills, any level is sufficient
}

export function SkillGapAnalysis({ skills, industry }: SkillGapAnalysisProps) {
  const requiredSkills = industryRequiredSkills[industry] || industryRequiredSkills.other || []

  // Analyze skill gaps
  const skillAnalysis = requiredSkills.map((required) => {
    const userSkill = hasSkill(skills, required.skill)
    const isSufficient = isSkillLevelSufficient(userSkill.level, required.importance)

    return {
      skill: required.skill,
      importance: required.importance,
      has: userSkill.has,
      level: userSkill.level,
      sufficient: isSufficient,
      gap: userSkill.has && !isSufficient,
    }
  })

  // Count metrics
  const criticalGaps = skillAnalysis.filter((s) => s.importance === "critical" && (!s.has || s.gap)).length
  const importantGaps = skillAnalysis.filter((s) => s.importance === "important" && (!s.has || s.gap)).length
  const totalRequired = skillAnalysis.filter((s) => s.importance === "critical" || s.importance === "important").length
  const coveragePercentage = Math.round(((totalRequired - criticalGaps - importantGaps) / totalRequired) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>Identifying missing or underdeveloped skills for your industry</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Coverage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-medium">Industry Skill Coverage</h3>
              <p className="text-sm text-gray-600">
                {coveragePercentage >= 80
                  ? "Excellent coverage of required skills"
                  : coveragePercentage >= 60
                    ? "Good coverage with some gaps"
                    : "Significant skill gaps identified"}
              </p>
            </div>
            <div className="text-2xl font-bold">{coveragePercentage}%</div>
          </motion.div>

          {/* Critical Gaps */}
          {skillAnalysis.filter((s) => s.importance === "critical" && (!s.has || s.gap)).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-2"
            >
              <h3 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                Critical Skill Gaps
              </h3>
              <div className="space-y-2">
                {skillAnalysis
                  .filter((s) => s.importance === "critical" && (!s.has || s.gap))
                  .map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      className="flex justify-between items-center p-2 border border-red-100 bg-red-50 rounded-md"
                    >
                      <span>{skill.skill}</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        {!skill.has ? "Missing" : "Insufficient Level"}
                      </Badge>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Important Gaps */}
          {skillAnalysis.filter((s) => s.importance === "important" && (!s.has || s.gap)).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-2"
            >
              <h3 className="font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                Important Skill Gaps
              </h3>
              <div className="space-y-2">
                {skillAnalysis
                  .filter((s) => s.importance === "important" && (!s.has || s.gap))
                  .map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      className="flex justify-between items-center p-2 border border-amber-100 bg-amber-50 rounded-md"
                    >
                      <span>{skill.skill}</span>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        {!skill.has ? "Missing" : "Insufficient Level"}
                      </Badge>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Strong Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2"
          >
            <h3 className="font-medium flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Strong Industry-Aligned Skills
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {skillAnalysis
                .filter((s) => s.has && s.sufficient)
                .slice(0, 6)
                .map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex justify-between items-center p-2 border border-green-100 bg-green-50 rounded-md"
                  >
                    <span className="text-sm">{skill.skill}</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      {skill.importance === "critical"
                        ? "Critical"
                        : skill.importance === "important"
                          ? "Important"
                          : "Nice to have"}
                    </Badge>
                  </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Learning Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-4 p-4 border rounded-lg bg-blue-50 border-blue-100"
          >
            <div className="flex items-center mb-2">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium">Recommended Learning Resources</h3>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              Focus on these resources to address your most critical skill gaps:
            </p>
            <ul className="space-y-1 text-sm">
              {skillAnalysis
                .filter((s) => s.importance === "critical" && (!s.has || s.gap))
                .slice(0, 2)
                .map((skill, index) => (
                  <li key={index} className="text-blue-700 hover:underline">
                    <a
                      href={`https://www.coursera.org/search?query=${encodeURIComponent(skill.skill)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {skill.skill} courses on Coursera
                    </a>
                  </li>
                ))}
              {skillAnalysis
                .filter((s) => s.importance === "important" && (!s.has || s.gap))
                .slice(0, 2)
                .map((skill, index) => (
                  <li key={index} className="text-blue-700 hover:underline">
                    <a
                      href={`https://www.udemy.com/courses/search/?src=ukw&q=${encodeURIComponent(skill.skill)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {skill.skill} tutorials on Udemy
                    </a>
                  </li>
                ))}
            </ul>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}
