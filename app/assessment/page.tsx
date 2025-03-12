"use client"

import { motion } from "framer-motion"
import SkillGapAssessment from "../../components/skill-gap-assessment"
import Header from "../../components/header"
import PageTransition from "../../components/animations/page-transition"
import { useLanguage } from "../../contexts/language-context"

export default function AssessmentPage() {
  const { t } = useLanguage();
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-blue-100/30 blur-3xl"></div>
            <div className="absolute -bottom-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-indigo-100/30 blur-3xl"></div>
            <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-100/20 blur-3xl"></div>
          </div>

          <div className="container mx-auto py-12 px-4 relative z-10">
            <motion.div 
              className="max-w-xl mx-auto text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-bold mb-3 text-3xl md:text-4xl text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                {t("assessmentTitle")}
              </h1>
              <p className="text-slate-600 text-lg max-w-md mx-auto">
                {t("assessmentSubtitle")}
              </p>
            </motion.div>
            
            {/* Main assessment component */}
            <SkillGapAssessment />
          </div>
        </main>
      </div>
    </PageTransition>
  )
}