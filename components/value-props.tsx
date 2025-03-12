"use client"

import { Brain, Target, MessageSquare, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import ScrollReveal from "./animations/scroll-reveal"
import SkillMappingMockup from "./ui-mockups/skill-mapping-mockup"
import AssessmentMockup from "./ui-mockups/assessment-mockup"
import AiMentorMockup from "./ui-mockups/ai-mentor-mockup"
import AnalyticsMockup from "./ui-mockups/analytics-mockup"
import { useLanguage } from "@/contexts/language-context"

export default function ValueProps() {
  const { t, isRTL } = useLanguage()

  const features = [
    {
      icon: <Brain className="h-10 w-10 text-blue-600" />,
      title: t("intelligentSkillMapping"),
      description: t("skillMappingDesc"),
      mockup: <SkillMappingMockup />,
    },
    {
      icon: <Target className="h-10 w-10 text-blue-600" />,
      title: t("adaptiveAssessments"),
      description: t("assessmentsDesc"),
      mockup: <AssessmentMockup />,
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-blue-600" />,
      title: t("aiMentorship"),
      description: t("aiMentorshipDesc"),
      mockup: <AiMentorMockup />,
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-blue-600" />,
      title: t("roiAnalytics"),
      description: t("analyticsDesc"),
      mockup: <AnalyticsMockup />,
    },
  ]

  return (
    <section id="value-props" className="py-20 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">{t("keyFeatures")}</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                className="flex flex-col items-center text-center p-6"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="mb-5 p-4 bg-blue-50 rounded-full"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <div className="relative w-full h-40 mb-5 rounded-lg overflow-hidden">{feature.mockup}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

