"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"
import { useLanguage } from "@/contexts/language-context"

export default function Testimonials() {
  const { t, isRTL } = useLanguage()

  const testimonials = [
    {
      quote: t("testimonial1.quote"),
      author: t("testimonial1.author"),
      title: t("testimonial1.title"),
      image: "https://placehold.co/200x200/e6f7ff/2563eb?text=SJ",
    },
    {
      quote: t("testimonial2.quote"),
      author: t("testimonial2.author"),
      title: t("testimonial2.title"),
      image: "https://placehold.co/200x200/e6f7ff/2563eb?text=MC",
    },
    {
      quote: t("testimonial3.quote"),
      author: t("testimonial3.author"),
      title: t("testimonial3.title"),
      image: "https://placehold.co/200x200/e6f7ff/2563eb?text=JW",
    },
  ]

  const logos = [
    { name: "TechCorp", image: "https://placehold.co/120x60/e6f7ff/2563eb?text=TechCorp" },
    { name: "InnovateSoft", image: "https://placehold.co/120x60/e6f7ff/2563eb?text=InnovateSoft" },
    { name: "GlobalFinance", image: "https://placehold.co/120x60/e6f7ff/2563eb?text=GlobalFinance" },
    { name: "MegaRetail", image: "https://placehold.co/120x60/e6f7ff/2563eb?text=MegaRetail" },
    { name: "HealthPlus", image: "https://placehold.co/120x60/e6f7ff/2563eb?text=HealthPlus" },
    { name: "EduTech", image: "https://placehold.co/120x60/e6f7ff/2563eb?text=EduTech" },
  ]

  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">{t("trustedBy")}</h2>
        </ScrollReveal>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto mb-20 relative">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className="md:w-1/4 flex-shrink-0">
                  <div className="relative w-24 h-24 mx-auto">
                    <Image
                      src={testimonials[current].image || "/placeholder.svg"}
                      alt={testimonials[current].author}
                      fill
                      className="rounded-full object-cover bg-blue-100"
                    />
                  </div>
                </div>
                <div className="md:w-3/4">
                  <blockquote>
                    <p className="text-xl text-gray-700 italic mb-6">"{testimonials[current].quote}"</p>
                    <footer>
                      <p className="font-semibold text-gray-900">{testimonials[current].author}</p>
                      <p className="text-gray-600">{testimonials[current].title}</p>
                    </footer>
                  </blockquote>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 gap-4">
              <button
                onClick={isRTL ? next : prev}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label={isRTL ? "Next testimonial" : "Previous testimonial"}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAutoplay(false)
                    setCurrent(index)
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    current === index ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
              <button
                onClick={isRTL ? prev : next}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label={isRTL ? "Previous testimonial" : "Next testimonial"}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Logos */}
        <ScrollReveal>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {logos.map((logo, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="grayscale hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={logo.image || "/placeholder.svg"}
                  alt={logo.name}
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain bg-white rounded-md p-2"
                />
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

