"use client"

import { motion } from "framer-motion"
import ScrollReveal from "./animations/scroll-reveal"
import AnimatedButton from "./animations/animated-button"
import AnimatedForm from "./animated-form"

export default function CtaSection() {
  return (
    <section className="py-16 md:py-24 bg-blue-600 text-white relative overflow-hidden">
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Organization?</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join leading organizations already leveraging our AI-powered platform to optimize their workforce and unlock
            their full potential.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="max-w-md mx-auto mb-12">
            <AnimatedForm />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <AnimatedButton variant="outline" className="border-white text-white hover:bg-blue-700 px-8 py-6 text-lg">
              Request a demo
            </AnimatedButton>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.8}>
          <motion.p
            className="mt-8 text-blue-100"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Limited spots available. Early access coming soon.
          </motion.p>
        </ScrollReveal>
      </div>
    </section>
  )
}

