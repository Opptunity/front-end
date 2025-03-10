"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How is user data protected?",
      answer:
        "We take data security seriously. All data is encrypted both in transit and at rest using industry-standard protocols. We are GDPR compliant and offer SOC 2 compliance for enterprise customers. Your organization maintains full ownership of all data, and we provide comprehensive data export options.",
    },
    {
      question: "What if my team doesn't have an existing LMS?",
      answer:
        "Our platform works as a standalone solution, so you don't need an existing Learning Management System. We provide all the tools necessary for skill mapping, content delivery, and progress tracking in one integrated platform. If you do have an existing LMS, we offer integration options to work alongside your current systems.",
    },
    {
      question: "Can I integrate with other HR systems?",
      answer:
        "Yes, we offer robust API integrations with popular HR systems including Workday, BambooHR, SAP SuccessFactors, and more. Our team can help set up custom integrations for enterprise customers to ensure seamless data flow between systems.",
    },
    {
      question: "Is there support for multi-lingual content?",
      answer:
        "Absolutely. Our platform supports content in over 30 languages, and our AI mentorship feature can communicate in multiple languages. We can also help translate custom content for global teams, ensuring consistent learning experiences across your organization regardless of location.",
    },
    {
      question: "How long does implementation typically take?",
      answer:
        "For small to medium teams, you can be up and running in as little as 48 hours. Enterprise implementations with custom integrations typically take 2-4 weeks. Our customer success team provides dedicated support throughout the onboarding process to ensure a smooth transition.",
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">Frequently Asked Questions</h2>
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

