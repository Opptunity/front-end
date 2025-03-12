"use client"

import ScrollReveal from "./animations/scroll-reveal"
import AiMentorMockup from "./ui-mockups/ai-mentor-mockup"
import { useLanguage } from "@/contexts/language-context"

export default function AiMentorPreview() {
  const { t, isRTL } = useLanguage()

  return (
    <section className="py-20 bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("meetMentor")}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("mentorDesc")}</p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <AiMentorMockup />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

