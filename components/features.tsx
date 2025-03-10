"use client"

import { Brain, Target, Network, BarChart3, Users, Lightbulb } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"
import { motion } from "framer-motion"

export default function Features() {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-Personalized Learning",
      description: "Tailored learning paths based on individual skills, goals, and learning preferences.",
    },
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Skill Gap Analysis",
      description: "Identify critical skill gaps at individual and organizational levels with precision.",
    },
    {
      icon: <Network className="h-8 w-8 text-blue-600" />,
      title: "Company Taxonomy Optimization",
      description: "Align your organizational structure with evolving industry standards and market demands.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Progress Tracking",
      description: "Monitor skill development with real-time analytics and actionable insights.",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Team Collaboration",
      description: "Foster collaborative learning environments that accelerate skill acquisition.",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-blue-600" />,
      title: "Adaptive Recommendations",
      description: "Receive continuously updated learning recommendations as skills evolve.",
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform leverages cutting-edge artificial intelligence to transform how organizations develop talent
              and optimize their workforce structure.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction={index % 2 === 0 ? "up" : "down"}>
              <motion.div
                className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                whileHover={{
                  y: -10,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div className="mb-5" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }}>
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

