"use client"

import { motion } from "framer-motion"
import ScrollReveal from "./animations/scroll-reveal"
import AnimatedButton from "./animations/animated-button"
import { useLanguage } from "@/contexts/language-context"

export default function SecondaryCta() {
  const { t, isRTL } = useLanguage()

  return (
    <section className="py-20 bg-blue-600 text-white relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500 opacity-20"
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 20,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-400 opacity-10"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 25,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("readyTitle")}</h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl mb-10 max-w-3xl mx-auto">{t("readySubtitle")}</p>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <AnimatedButton className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
                {t("joinWaitlist")}
              </AnimatedButton>
              <AnimatedButton variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-6 text-lg">
                {t("learnMore")}
              </AnimatedButton>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

