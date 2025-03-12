"use client"

import { useState } from "react"
import { Sparkles, Loader2, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

// Add a new prop to accept the industry
export default function AIRecommendationDemo({ industry = "" }) {
  const [skill, setSkill] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [recentSkills, setRecentSkills] = useState<string[]>([])

  // Sample recommendations for demo purposes
  const sampleRecommendations = {
    "data analysis": `
      ## Data Analysis Training Outline
      
      **Duration:** 4 weeks (2 hours/week)
      
      **Modules:**
      1. Fundamentals of data collection and cleaning
      2. Statistical analysis techniques
      3. Data visualization best practices
      4. Communicating insights to stakeholders
      
      **Recommended approach:** Blended learning with hands-on projects using real company data
    `,
    leadership: `
      ## Leadership Development Plan
      
      **Duration:** 6 weeks (3 hours/week)
      
      **Focus areas:**
      1. Strategic decision making
      2. Effective delegation and team empowerment
      3. Difficult conversations and feedback
      4. Leading through change and uncertainty
      
      **Recommended approach:** Combination of workshops, peer coaching, and real-world application
    `,
    communication: `
      ## Communication Skills Enhancement
      
      **Duration:** 3 weeks (2 hours/week)
      
      **Key components:**
      1. Active listening techniques
      2. Clear and concise messaging
      3. Presentation skills for different audiences
      4. Written communication best practices
      
      **Recommended approach:** Role-playing exercises, video recording/feedback, and practical assignments
    `,
    "project management": `
      ## Project Management Accelerator
      
      **Duration:** 5 weeks (2.5 hours/week)
      
      **Core curriculum:**
      1. Project planning and scope definition
      2. Resource allocation and timeline management
      3. Risk assessment and mitigation strategies
      4. Stakeholder communication and management
      
      **Recommended approach:** Case studies, project simulation, and mentoring from experienced PMs
    `,
    "digital marketing": `
      ## Digital Marketing Essentials
      
      **Duration:** 4 weeks (2 hours/week)
      
      **Learning path:**
      1. Digital marketing strategy fundamentals
      2. Content creation and distribution
      3. Analytics and performance measurement
      4. Campaign optimization techniques
      
      **Recommended approach:** Hands-on campaign development with real-time analytics review
    `,
  }

  // Function to generate a recommendation
  const generateRecommendation = () => {
    if (!skill.trim()) {
      setError("Please enter a skill gap")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call delay
    setTimeout(() => {
      const lowercaseSkill = skill.toLowerCase()

      // Check if we have a predefined recommendation
      const matchedSkill = Object.keys(sampleRecommendations).find(
        (key) => lowercaseSkill.includes(key) || key.includes(lowercaseSkill),
      )

      // Add industry-specific context to the recommendations
      let industryContext = ""
      if (industry) {
        switch (industry.toLowerCase()) {
          case "finance":
            industryContext = `\n\n**Industry Context:** In finance, 65% of institutions plan to invest in AI-based risk analysis—your team can benefit from these skills.`
            break
          case "retail":
            industryContext = `\n\n**Industry Context:** In retail, omnichannel retailers outperform single-channel retailers by 80% in customer retention—these skills are critical.`
            break
          case "technology":
            industryContext = `\n\n**Industry Context:** In technology, 92% of IT leaders believe the skills gap has increased in the last year—continuous learning is essential.`
            break
          case "healthcare":
            industryContext = `\n\n**Industry Context:** In healthcare, digital initiatives require 40% more IT skills than 5 years ago—technical training is increasingly important.`
            break
          case "manufacturing":
            industryContext = `\n\n**Industry Context:** In manufacturing, smart factory initiatives require 38% more digital skills—upskilling is critical for Industry 4.0.`
            break
          default:
            if (matchedSkill === "leadership") {
              industryContext = `\n\n**Industry Context:** Organizations with strong leadership development are 1.5x more likely to outperform competitors.`
            } else if (matchedSkill === "data analysis") {
              industryContext = `\n\n**Industry Context:** Data-driven organizations are 23% more profitable than their peers across all industries.`
            }
        }
      }

      // Add the industry context to the recommendation
      if (matchedSkill) {
        setRecommendation(sampleRecommendations[matchedSkill] + (industryContext || ""))
        // Add to recent skills if not already there
        if (!recentSkills.includes(matchedSkill)) {
          setRecentSkills((prev) => [matchedSkill, ...prev].slice(0, 3))
        }
      } else {
        setRecommendation(`
          ## ${skill.charAt(0).toUpperCase() + skill.slice(1)} Development Plan
          
          **Duration:** 4 weeks (flexible)
          
          **Suggested approach:**
          1. Skill assessment and gap analysis
          2. Personalized learning path creation
          3. Curated resources and practice exercises
          4. Progress tracking and skill validation
          
          **Recommended format:** Self-paced online learning with weekly check-ins
          ${industryContext}
        `)

        // Add to recent skills
        if (!recentSkills.includes(skill)) {
          setRecentSkills((prev) => [skill, ...prev].slice(0, 3))
        }
      }

      setIsLoading(false)
    }, 1500) // 1.5 second delay to simulate processing
  }

  // Handle quick skill selection
  const handleQuickSkill = (selectedSkill: string) => {
    setSkill(selectedSkill)
    // Auto-generate after selection
    setTimeout(() => {
      setIsLoading(true)
      setError("")

      setTimeout(() => {
        const matchedSkill = Object.keys(sampleRecommendations).find(
          (key) => selectedSkill.toLowerCase().includes(key) || key.includes(selectedSkill.toLowerCase()),
        )

        // Add industry context if available
        let industryContext = ""
        if (industry) {
          switch (industry.toLowerCase()) {
            case "finance":
              industryContext = `\n\n**Industry Context:** In finance, 65% of institutions plan to invest in AI-based risk analysis—your team can benefit from these skills.`
              break
            case "retail":
              industryContext = `\n\n**Industry Context:** In retail, omnichannel retailers outperform single-channel retailers by 80% in customer retention—these skills are critical.`
              break
            case "technology":
              industryContext = `\n\n**Industry Context:** In technology, 92% of IT leaders believe the skills gap has increased in the last year—continuous learning is essential.`
              break
            case "healthcare":
              industryContext = `\n\n**Industry Context:** In healthcare, digital initiatives require 40% more IT skills than 5 years ago—technical training is increasingly important.`
              break
            case "manufacturing":
              industryContext = `\n\n**Industry Context:** In manufacturing, smart factory initiatives require 38% more digital skills—upskilling is critical for Industry 4.0.`
              break
            default:
              if (matchedSkill === "leadership") {
                industryContext = `\n\n**Industry Context:** Organizations with strong leadership development are 1.5x more likely to outperform competitors.`
              } else if (matchedSkill === "data analysis") {
                industryContext = `\n\n**Industry Context:** Data-driven organizations are 23% more profitable than their peers across all industries.`
              }
          }
        }

        if (matchedSkill) {
          setRecommendation(sampleRecommendations[matchedSkill] + (industryContext || ""))
        }

        setIsLoading(false)
      }, 1000)
    }, 100)
  }

  return (
    <Card className="glass-card shadow-md border-0">
      <CardHeader className="relative border-b overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-lg text-violet-800">AI Recommendation Engine</CardTitle>
          </div>
          <CardDescription className="text-slate-700">
            Enter a specific skill gap to see a preview of our AI-generated training recommendations
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-700">Try:</span>
            {["Leadership", "Data Analysis", "Communication", "Project Management", "Digital Marketing"].map(
              (quickSkill) => (
                <Badge
                  key={quickSkill}
                  variant="outline"
                  className="badge-enhanced cursor-pointer hover:bg-violet-50 transition-colors"
                  onClick={() => handleQuickSkill(quickSkill)}
                >
                  {quickSkill}
                </Badge>
              ),
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Enter a skill gap (e.g., Data Analysis, Leadership)"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="h-10 input-enhanced pl-9"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <Button
              onClick={generateRecommendation}
              disabled={isLoading}
              className="button-enhanced bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {recentSkills.length > 0 && !recommendation && (
            <div className="flex gap-2 items-center mt-2">
              <span className="text-xs text-slate-500">Recent:</span>
              {recentSkills.map((recentSkill) => (
                <Badge
                  key={recentSkill}
                  variant="secondary"
                  className="badge-enhanced text-xs cursor-pointer bg-slate-100 hover:bg-slate-200"
                  onClick={() => handleQuickSkill(recentSkill)}
                >
                  {recentSkill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {recommendation && (
            <motion.div
              className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-100 prose prose-sm max-w-none shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="whitespace-pre-line">{recommendation}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-slate-50 to-white border-t text-sm text-slate-500 italic">
        <p>
          This is just a preview. Our full platform provides comprehensive, personalized recommendations based on your
          organization's specific needs and resources.
        </p>
      </CardFooter>
    </Card>
  )
}

