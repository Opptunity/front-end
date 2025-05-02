"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import type { Industry } from "@/lib/industry-detection"

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Unknown"

type TechnicalSkill = {
  skill: string
  level: SkillLevel
}

type BenchmarkProps = {
  skills: TechnicalSkill[]
  industry: Industry
}

// Industry benchmark data (in a real app, this would come from an API or database)
const industryBenchmarks: Record<
  Industry,
  Record<string, { junior: SkillLevel; mid: SkillLevel; senior: SkillLevel }>
> = {
  technology: {
    JavaScript: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    React: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    "Node.js": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    Python: { junior: "Beginner", mid: "Intermediate", senior: "Expert" },
    AWS: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    Docker: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    TypeScript: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    SQL: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
  },
  marketing: {
    SEO: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    "Content Marketing": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    "Social Media": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    "Google Analytics": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    "Email Marketing": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
  },
  finance: {
    "Financial Analysis": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    Excel: { junior: "Intermediate", mid: "Advanced", senior: "Expert" },
    "Financial Modeling": { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
    Accounting: { junior: "Beginner", mid: "Intermediate", senior: "Advanced" },
  },
  // Add more industries as needed
  healthcare: {},
  education: {},
  design: {},
  legal: {},
  hr: {},
  sales: {},
  manufacturing: {},
  other: {},
}

// Function to get benchmark level for a skill
function getBenchmarkLevel(skill: string, industry: Industry, level: "junior" | "mid" | "senior"): SkillLevel {
  // Try to find an exact match
  const industryData = industryBenchmarks[industry]
  if (industryData[skill]) {
    return industryData[skill][level]
  }

  // Try to find a partial match
  const skillLower = skill.toLowerCase()
  for (const [benchmarkSkill, levels] of Object.entries(industryData)) {
    if (skillLower.includes(benchmarkSkill.toLowerCase()) || benchmarkSkill.toLowerCase().includes(skillLower)) {
      return levels[level]
    }
  }

  // Default values if no match found
  return level === "junior" ? "Beginner" : level === "mid" ? "Intermediate" : "Advanced"
}

// Function to compare user's skill level with benchmark
function compareWithBenchmark(userLevel: SkillLevel, benchmarkLevel: SkillLevel): "below" | "at" | "above" {
  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"]
  const userIndex = levels.indexOf(userLevel)
  const benchmarkIndex = levels.indexOf(benchmarkLevel)

  if (userIndex < benchmarkIndex) return "below"
  if (userIndex > benchmarkIndex) return "above"
  return "at"
}

export function SkillBenchmark({ skills, industry }: BenchmarkProps) {
  // Filter to top skills (to avoid overwhelming the user)
  const topSkills = skills.slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Industry Benchmark
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This compares your skill levels to industry standards for different career stages.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>How your skills compare to industry expectations at different career levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topSkills.map((skill, index) => (
            <motion.div
              key={skill.skill}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{skill.skill}</h3>
                <Badge
                  className={
                    skill.level === "Expert"
                      ? "bg-green-200 text-green-800"
                      : skill.level === "Advanced"
                        ? "bg-purple-200 text-purple-800"
                        : skill.level === "Intermediate"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 text-gray-800"
                  }
                >
                  {skill.level}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["junior", "mid", "senior"].map((level) => {
                  const benchmarkLevel = getBenchmarkLevel(skill.skill, industry, level as "junior" | "mid" | "senior")
                  const comparison = compareWithBenchmark(skill.level, benchmarkLevel)

                  return (
                    <div key={level} className="relative">
                      <div
                        className={`
                        text-xs rounded-md p-2 flex justify-between items-center
                        ${level === "junior" ? "bg-gray-100" : level === "mid" ? "bg-gray-200" : "bg-gray-300"}
                        ${
                          comparison === "below"
                            ? "border-l-2 border-amber-500"
                            : comparison === "above"
                              ? "border-l-2 border-green-500"
                              : "border-l-2 border-blue-500"
                        }
                      `}
                      >
                        <span className="capitalize">{level}</span>
                        <span className="text-xs font-medium">{benchmarkLevel}</span>
                      </div>

                      {comparison === "below" && (
                        <Badge
                          variant="outline"
                          className="absolute -top-2 -right-2 text-xs bg-amber-50 text-amber-800 border-amber-200"
                        >
                          Gap
                        </Badge>
                      )}
                      {comparison === "above" && (
                        <Badge
                          variant="outline"
                          className="absolute -top-2 -right-2 text-xs bg-green-50 text-green-800 border-green-200"
                        >
                          Exceeds
                        </Badge>
                      )}
                      {comparison === "at" && (
                        <Badge
                          variant="outline"
                          className="absolute -top-2 -right-2 text-xs bg-blue-50 text-blue-800 border-blue-200"
                        >
                          Meets
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
