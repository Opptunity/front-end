"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const toggleLanguage = (lang: "en" | "ar") => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">{language === "en" ? "EN" : "عربي"}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute top-full ${isRTL ? "left-0" : "right-0"} mt-1 bg-white shadow-md rounded-md overflow-hidden z-50 min-w-[120px]`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              className={`w-full text-left px-4 py-2 text-sm ${language === "en" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
              onClick={() => toggleLanguage("en")}
            >
              English
            </button>
            <button
              className={`w-full text-${isRTL ? "right" : "left"} px-4 py-2 text-sm ${language === "ar" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
              onClick={() => toggleLanguage("ar")}
            >
              العربية
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

