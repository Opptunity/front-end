"use client"

import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/animations/page-transition"
import { useLanguage } from "@/contexts/language-context"
import CareerAIAgentInterface from "@/components/career-ai-agent-interface"

export default function CareerAgentPage() {
  const { t, isRTL } = useLanguage();
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 px-4 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
          {/* Abstract background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-purple-100/30 blur-3xl"></div>
            <div className="absolute -bottom-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-indigo-100/30 blur-3xl"></div>
            <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-100/20 blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
                {t("careerAIAgentTitle") || "Career AI Agent"}
              </h1>
              <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
                {t("careerAIAgentDescription") || "Get personalized career advice, job search strategies, and professional development guidance from our AI career agent."}
              </p>
              <CareerAIAgentInterface />
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
} 