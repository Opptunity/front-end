"use client"

import { CheckCircle2, BookOpen, Award, TrendingUp, BarChart3, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// Add the import for the AI recommendation demo at the top of the file
import AIRecommendationDemo from "./ai-recommendation-demo"
// Add the import for the IndustryInsights component at the top of the file
import IndustryInsights from "./industry-insights"
// Add the import for the DownloadPDFButton component
import DownloadPDFButton from "./download-pdf-button"

export default function AssessmentResults({ data }) {
  // Map IDs to readable labels
  const strategicPriorityLabels = {
    growth: "Business Growth",
    innovation: "Innovation & New Products",
    efficiency: "Operational Efficiency",
    "customer-experience": "Customer Experience",
    "digital-transformation": "Digital Transformation",
    "talent-development": "Talent Development",
    "cost-reduction": "Cost Reduction",
    sustainability: "Sustainability",
    "market-expansion": "Market Expansion",
    compliance: "Regulatory Compliance",
  }

  const skillGapLabels = {
    "data-analysis": "Data Analysis & Reporting",
    programming: "Programming & Development",
    "project-management": "Project Management",
    "digital-marketing": "Digital Marketing",
    cybersecurity: "Cybersecurity",
    "cloud-computing": "Cloud Computing",
    "ai-ml": "AI & Machine Learning",
    "design-ux": "Design & UX",
    leadership: "Leadership",
    communication: "Communication",
    "problem-solving": "Problem Solving",
    adaptability: "Adaptability",
    teamwork: "Teamwork & Collaboration",
    "time-management": "Time Management",
    "critical-thinking": "Critical Thinking",
    "emotional-intelligence": "Emotional Intelligence",
  }

  const competencyLabels = {
    "technical-expertise": "Technical Expertise",
    "strategic-thinking": "Strategic Thinking",
    innovation: "Innovation & Creativity",
    "customer-focus": "Customer Focus",
    "business-acumen": "Business Acumen",
    "change-management": "Change Management",
    "cross-functional": "Cross-Functional Collaboration",
    "digital-literacy": "Digital Literacy",
    "data-driven": "Data-Driven Decision Making",
    "agile-methodologies": "Agile Methodologies",
  }

  const barrierLabels = {
    budget: "Budget Constraints",
    time: "Time Limitations",
    engagement: "Employee Engagement",
    "measuring-roi": "Measuring ROI",
    "relevant-content": "Finding Relevant Content",
    personalization: "Personalizing Learning",
    retention: "Knowledge Retention",
    "tech-adoption": "Technology Adoption",
    "leadership-buy-in": "Leadership Buy-in",
    "skill-identification": "Identifying Required Skills",
  }

  const toolLabels = {
    lms: "Learning Management System (LMS)",
    hris: "HR Information System (HRIS)",
    "talent-management": "Talent Management Software",
    "performance-management": "Performance Management System",
    "e-learning": "E-Learning Platforms",
    "skills-assessment": "Skills Assessment Tools",
    mentoring: "Mentoring/Coaching Software",
    "content-library": "Learning Content Library",
    none: "No formal tools in place",
  }

  // Get top 3 roles by importance and difficulty
  const topRoles = [...data.keyRoles]
    .sort((a, b) => b.importance + b.difficulty - (a.importance + a.difficulty))
    .slice(0, 3)

  // Get top skill gaps
  const topSkillGaps = data.skillGaps.slice(0, 5)

  // Get top barriers
  const topBarriers = data.upskillBarriers.slice(0, 3)

  // Get top priorities
  const topPriorities = data.strategicPriorities.slice(0, 3)

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Generate recommendations based on selected skills and challenges
  const getRecommendations = () => {
    const recommendations = []

    // Strategic priority-based recommendations
    if (data.strategicPriorities.includes("digital-transformation")) {
      recommendations.push(
        "Develop a digital literacy program for all employees to support your digital transformation goals",
      )
    }

    if (data.strategicPriorities.includes("innovation")) {
      recommendations.push("Implement innovation workshops and design thinking training to foster creativity")
    }

    // Skill gap-based recommendations
    if (data.skillGaps.includes("data-analysis")) {
      recommendations.push("Implement data literacy workshops for teams that need to interpret data")
    }

    if (data.skillGaps.includes("leadership")) {
      recommendations.push("Develop a leadership mentoring program for high-potential employees")
    }

    // Barrier-based recommendations
    if (data.upskillBarriers.includes("budget")) {
      recommendations.push("Explore cost-effective learning solutions like peer-to-peer learning")
    }

    if (data.upskillBarriers.includes("time")) {
      recommendations.push("Consider microlearning approaches that fit into busy schedules")
    }

    // Resource-based recommendations
    if (data.trainingTime === "Less than 1 hour per week" || data.trainingTime === "1-2 hours per week") {
      recommendations.push("Focus on bite-sized learning content that can be consumed in short sessions")
    }

    if (data.existingTools && data.existingTools.includes("lms")) {
      recommendations.push("Leverage your existing LMS to create personalized learning paths for critical roles")
    }

    if (data.existingTools && data.existingTools.includes("none")) {
      recommendations.push("Consider implementing a basic learning management system to track and manage training")
    }

    // Add generic recommendations if we don't have enough specific ones
    if (recommendations.length < 5) {
      recommendations.push("Create personalized learning paths based on role requirements")
      recommendations.push("Implement skills assessments before and after training initiatives")
      recommendations.push("Consider a mix of internal and external training resources")
      recommendations.push("Develop a skills matrix to map current capabilities against future needs")
      recommendations.push("Establish a regular cadence for reviewing and updating training plans")
    }

    // Return top 5 recommendations
    return recommendations.slice(0, 5)
  }

  return (
    <motion.div
      className="space-y-8 py-2"
      variants={container}
      initial="hidden"
      animate="show"
      id="assessment-results-content" // Add an ID for the PDF generation
    >
      <motion.div
        variants={item}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 flex items-start gap-4 shadow-sm"
      >
        <div className="bg-white rounded-full p-2 shadow-md">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-semibold text-xl text-emerald-800 mb-1">Assessment Complete</h3>
          <p className="text-emerald-700">
            Thank you for completing the assessment. Here's a summary of your results and recommendations.
          </p>
        </div>
      </motion.div>

      {/* Add the download button at the top of the results */}
      <motion.div variants={item} className="flex justify-center">
        <DownloadPDFButton
          elementId="assessment-results-content"
          filename={`workforce-skills-assessment-${new Date().toISOString().split("T")[0]}.pdf`}
        />
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="card-enhanced shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
            <CardHeader className="card-header-enhanced border-b pb-4 bg-gradient-to-r from-blue-50 to-blue-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <Award className="h-5 w-5 text-blue-600" />
                Key Roles & Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-3 text-slate-900">Strategic Priorities</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {topPriorities.map((priority) => (
                      <Badge
                        key={priority}
                        className="badge-enhanced px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        {strategicPriorityLabels[priority]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium mb-3 text-slate-900">Critical Roles</h4>
                  <ul className="space-y-4">
                    {topRoles.map((role, index) => (
                      <li
                        key={index}
                        className="pb-4 border-b last:border-0 last:pb-0 hover:bg-slate-50/50 p-2 rounded-md transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{role.title}</span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-xs">
                            <span className="font-medium text-blue-700">Importance:</span>
                            <span className="text-blue-800">{role.importance}/5</span>
                          </div>
                          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full text-xs">
                            <span className="font-medium text-amber-700">Difficulty:</span>
                            <span className="text-amber-800">{role.difficulty}/5</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="card-enhanced shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
            <CardHeader className="card-header-enhanced border-b pb-4 bg-gradient-to-r from-red-50 to-red-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                <TrendingUp className="h-5 w-5 text-red-600" />
                Skill Gaps & Barriers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <h4 className="text-base font-medium mb-3 text-slate-900">Top Skill Gaps</h4>
                  <div className="flex flex-wrap gap-2">
                    {topSkillGaps.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="badge-enhanced px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        {skillGapLabels[skill]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium mb-3 text-slate-900">Upskilling Barriers</h4>
                  <div className="flex flex-wrap gap-2">
                    {topBarriers.map((barrier) => (
                      <Badge
                        key={barrier}
                        variant="outline"
                        className="badge-enhanced px-3 py-1 text-sm border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {barrierLabels[barrier]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add the Industry Insights component here */}
      <motion.div variants={item} className="mt-8">
        <IndustryInsights industry={data.industry} />
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="card-enhanced shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
            <CardHeader className="card-header-enhanced border-b pb-4 bg-gradient-to-r from-amber-50 to-amber-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <Calendar className="h-5 w-5 text-amber-600" />
                Future Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {data.plannedRoles && data.plannedRoles.length > 0 ? (
                  <div>
                    <h4 className="text-base font-medium mb-3 text-slate-900">Planned New Roles</h4>
                    <ul className="space-y-3">
                      {data.plannedRoles.map((role, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center border-b pb-2 last:border-0 hover:bg-amber-50/30 p-2 rounded-md transition-colors"
                        >
                          <span>{role.title}</span>
                          <Badge variant="outline" className="bg-amber-50">
                            {role.timeline}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-base font-medium mb-3 text-slate-900">Planned New Roles</h4>
                    <p className="text-slate-500 text-sm">No planned roles indicated</p>
                  </div>
                )}

                {data.upcomingProjects ? (
                  <div>
                    <h4 className="text-base font-medium mb-2 text-slate-900">Upcoming Projects</h4>
                    <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-md">{data.upcomingProjects}</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="card-enhanced shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
            <CardHeader className="card-header-enhanced border-b pb-4 bg-gradient-to-r from-green-50 to-green-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Available Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-slate-900">Training Budget</h4>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded text-sm">{data.trainingBudget}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1 text-slate-900">Available Time</h4>
                    <p className="text-slate-700 bg-slate-50 p-2 rounded text-sm">{data.trainingTime}</p>
                  </div>
                </div>

                {data.existingTools && data.existingTools.length > 0 ? (
                  <div>
                    <h4 className="text-base font-medium mb-2 text-slate-900">Existing Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.existingTools.map((tool) => (
                        <Badge
                          key={tool}
                          className="badge-enhanced px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          {toolLabels[tool]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-base font-medium mb-2 text-slate-900">Existing Tools</h4>
                    <p className="text-slate-500 text-sm">No existing tools indicated</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="card-enhanced shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
          <CardHeader className="card-header-enhanced border-b pb-4 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="grid gap-4 md:grid-cols-2">
              {getRecommendations().map((recommendation, index) => (
                <li
                  key={index}
                  className="flex gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add the AI recommendation demo component after the "Recommended Actions" card */}
      <motion.div variants={item} className="mt-8">
        <AIRecommendationDemo industry={data.industry} />
      </motion.div>

      {/* Add another download button at the bottom for convenience */}
      <motion.div variants={item} className="flex justify-center mt-6">
        <DownloadPDFButton
          elementId="assessment-results-content"
          filename={`workforce-skills-assessment-${new Date().toISOString().split("T")[0]}.pdf`}
        />
      </motion.div>

      <motion.div
        variants={item}
        className="bg-gradient-to-r from-primary/20 via-indigo-500/20 to-primary/10 rounded-lg p-6 shadow-md"
      >
        <h3 className="font-semibold text-xl text-primary mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Next Steps
        </h3>
        <p className="text-slate-700 mb-4">
          This assessment provides a high-level overview of your organization's skill gaps and development needs. Our
          full AI-driven solution offers deeper insights, personalized learning paths, and ROI tracking to transform
          your workforce development strategy.
        </p>
        <Button
          className="button-enhanced bg-white text-primary hover:bg-white/90 transition-colors"
          onClick={() => (window.location.href = "/contact")}
        >
          Learn More About Our Full Solution
        </Button>
      </motion.div>
    </motion.div>
  )
}

