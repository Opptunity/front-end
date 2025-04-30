"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Brain, Award } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatedList, AnimatedListItem } from "./animated-container"

export function AssessmentProcess() {
  return (
    <Card className="mb-8 overflow-hidden">
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatedList className="flex flex-col md:flex-row justify-between">
          <AnimatedListItem className="flex flex-col items-center text-center p-4 md:w-1/3 group">
            <motion.div
              className="bg-blue-100 p-3 rounded-full mb-3 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 bg-blue-200 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              />
              <FileText className="h-6 w-6 text-blue-600 relative z-10" />
            </motion.div>
            <h3 className="font-medium mb-2">1. CV Analysis</h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Our system extracts and processes the text from your CV
            </p>
          </AnimatedListItem>

          <AnimatedListItem className="flex flex-col items-center text-center p-4 md:w-1/3 group">
            <motion.div
              className="bg-purple-100 p-3 rounded-full mb-3 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 bg-purple-200 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.2 }}
              />
              <Brain className="h-6 w-6 text-purple-600 relative z-10" />
            </motion.div>
            <h3 className="font-medium mb-2">2. AI Assessment</h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Advanced AI evaluates your skills and experience
            </p>
          </AnimatedListItem>

          <AnimatedListItem className="flex flex-col items-center text-center p-4 md:w-1/3 group">
            <motion.div
              className="bg-green-100 p-3 rounded-full mb-3 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 bg-green-200 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.2, opacity: 0 }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.4 }}
              />
              <Award className="h-6 w-6 text-green-600 relative z-10" />
            </motion.div>
            <h3 className="font-medium mb-2">3. Detailed Results</h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              Receive a comprehensive breakdown of your professional profile
            </p>
          </AnimatedListItem>
        </AnimatedList>
      </CardContent>
    </Card>
  )
}
