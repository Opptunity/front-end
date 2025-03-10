"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, LineChart, BookOpen, MessageCircle, BarChart } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"
import DashboardMockup from "./ui-mockups/dashboard-mockup"
import SkillMappingMockup from "./ui-mockups/skill-mapping-mockup"
import LearningPathMockup from "./ui-mockups/learning-path-mockup"
import AiMentorMockup from "./ui-mockups/ai-mentor-mockup"
import AnalyticsMockup from "./ui-mockups/analytics-mockup"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: "Create Your Account",
      description: "Quick sign-up with SSO integration for seamless enterprise access.",
      color: "bg-blue-500",
      mockup: <DashboardMockup />,
    },
    {
      icon: <LineChart className="h-8 w-8" />,
      title: "Identify Skills & Gaps",
      description: "Our AI generates a comprehensive skill map for your organization.",
      color: "bg-indigo-500",
      mockup: <SkillMappingMockup />,
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Access Custom Content",
      description: "Tailored learning pathways based on identified skill gaps.",
      color: "bg-purple-500",
      mockup: <LearningPathMockup />,
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Engage with AI Mentorship",
      description: "Get personalized guidance and feedback from our AI mentors.",
      color: "bg-pink-500",
      mockup: <AiMentorMockup />,
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Track Growth & ROI",
      description: "Comprehensive analytics to measure impact and return on investment.",
      color: "bg-red-500",
      mockup: <AnalyticsMockup />,
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto">
          {/* Step indicators */}
          <div className="flex justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

            {steps.map((step, index) => (
              <motion.button
                key={index}
                className={`relative z-10 flex flex-col items-center`}
                onClick={() => setActiveStep(index)}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                    index <= activeStep ? step.color : "bg-gray-300"
                  }`}
                  animate={{
                    scale: index === activeStep ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: index === activeStep ? Number.POSITIVE_INFINITY : 0,
                    repeatType: "reverse",
                  }}
                >
                  {step.icon}
                </motion.div>
                <span
                  className={`mt-2 text-sm font-medium ${index === activeStep ? "text-gray-900" : "text-gray-500"}`}
                >
                  Step {index + 1}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-xl p-8 md:p-12"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${steps[activeStep].color}`}
                  >
                    {steps[activeStep].icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{steps[activeStep].title}</h3>
                    <p className="text-lg text-gray-600">{steps[activeStep].description}</p>
                  </div>
                </div>

                <div className="relative w-full h-64 mt-4 rounded-lg overflow-hidden">{steps[activeStep].mockup}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className={`px-4 py-2 rounded-md ${
                activeStep === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStep === steps.length - 1}
              className={`px-4 py-2 rounded-md ${
                activeStep === steps.length - 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

