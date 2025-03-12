"use client"

import { motion } from "framer-motion"
import AnimatedButton from "./animations/animated-button"
import DashboardMockup from "./ui-mockups/dashboard-mockup"
import { useLanguage } from "@/contexts/language-context"

export default function Hero() {
  const { t, isRTL } = useLanguage()

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50 overflow-hidden relative">
      {/* Background elements */}
      <motion.div
        className="absolute -right-20 top-20 w-80 h-80 rounded-full bg-blue-100 opacity-30 blur-3xl"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 15,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -left-20 bottom-20 w-80 h-80 rounded-full bg-indigo-100 opacity-30 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: 18,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {t("heroTitle")}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatedButton className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-6 text-lg">
              {t("joinWaitlist")}
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
            >
              {t("learnMore")}
            </AnimatedButton>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
            <DashboardMockup />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

