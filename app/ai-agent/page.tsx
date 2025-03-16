"use client"

import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PageTransition from "@/components/animations/page-transition"
import { useLanguage } from "@/contexts/language-context"
import AIAgentInterface from "@/components/ai-agent-interface"

export default function AiAgentPage() {
  const { t, isRTL } = useLanguage();
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
          {/* Abstract background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-blue-100/30 blur-3xl"></div>
            <div className="absolute -bottom-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-indigo-100/30 blur-3xl"></div>
            <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-100/20 blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AIAgentInterface />
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}