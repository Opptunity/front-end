"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"
import { useLanguage } from "@/contexts/language-context"

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useLanguage()

  const faqs = [
    {
      question: t("dataProtection"),
      answer: t("dataProtectionAnswer"),
    },
    {
      question: t("existingLms"),
      answer: t("existingLmsAnswer"),
    },
    {
      question: t("hrIntegration"),
      answer: t("hrIntegrationAnswer"),
    },
    {
      question: t("multiLingual"),
      answer: t("multiLingualAnswer"),
    },
    {
      question: t("implementation"),
      answer: t("implementationAnswer"),
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">{t("faqTitle")}</h2>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="mb-4">
                <button
                  onClick={() => toggleFaq(index)}
                  className={`w-full text-left p-6 rounded-lg flex justify-between items-center ${
                    openIndex === index ? "bg-white shadow-md" : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium text-lg text-gray-900">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 text-gray-600">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

