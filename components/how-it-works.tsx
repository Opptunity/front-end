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
import { useLanguage } from "@/contexts/language-context"

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const { t, isRTL } = useLanguage()

  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: t("createAccount"),
      description: t("createAccountDesc"),
      color: "bg-blue-500",
      mockup: <DashboardMockup />,
    },
    {
      icon: <LineChart className="h-8 w-8" />,
      title: t("identifySkills"),
      description: t("identifySkillsDesc"),
      color: "bg-indigo-500",
      mockup: <SkillMappingMockup />,
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: t("accessContent"),
      description: t("accessContentDesc"),
      color: "bg-purple-500",
      mockup: <LearningPathMockup />,
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: t("engageMentor"),
      description: t("engageMentorDesc"),
      color: "bg-pink-500",
      mockup: <AiMentorMockup />,
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: t("trackGrowth"),
      description: t("trackGrowthDesc"),
      color: "bg-red-500",
      mockup: <AnalyticsMockup />,
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-20">{t("howItWorksTitle")}</h2>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto">
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
                  {t("step")} {index + 1}
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
              className="bg-gray-50 rounded-xl p-6 md:p-8 lg:p-10"
            >
              <div className="flex flex-col gap-8">
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

                <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] mt-6 rounded-lg overflow-y-auto overflow-x-hidden border border-gray-200 bg-white shadow-inner">
                  <div className="min-h-full">
                    {steps[activeStep].mockup}
                  </div>
                </div>
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
              {t("previous")}
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
              {t("next")}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

