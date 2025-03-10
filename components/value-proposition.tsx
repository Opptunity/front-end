"use client"

import { CheckCircle } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"
import { motion } from "framer-motion"
import DashboardMockup from "./ui-mockups/dashboard-mockup"

export default function ValueProposition() {
  const organizationBenefits = [
    "Comprehensive workforce skill mapping and gap analysis",
    "Optimized company taxonomy aligned with industry standards",
    "Data-driven insights for strategic talent development",
    "Reduced hiring costs through internal upskilling initiatives",
    "Improved employee retention through career growth opportunities",
  ]

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* For Organizations Section */}
        <section id="for-organizations" className="py-10">
          <div className="flex flex-col lg:flex-row-reverse items-center">
            <ScrollReveal className="lg:w-1/2 lg:pl-12 mb-10 lg:mb-0" direction="left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">For Organizations</h2>
              <p className="text-xl text-gray-600 mb-8">
                Transform your workforce with data-driven insights and strategic talent development aligned with your
                business objectives.
              </p>
              <ul className="space-y-4">
                {organizationBenefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start"
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={listItemVariants}
                  >
                    <motion.div whileHover={{ scale: 1.1, color: "#22c55e" }} transition={{ duration: 0.2 }}>
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal className="lg:w-1/2" direction="right">
              <motion.div
                className="relative h-[350px] w-full rounded-xl overflow-hidden shadow-lg"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
              >
                <DashboardMockup />
              </motion.div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>
  )
}

