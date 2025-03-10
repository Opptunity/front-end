"use client"

import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: number
  color?: string
}

export default function LoadingSpinner({ size = 40, color = "text-blue-600" }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className={`rounded-full border-t-2 border-b-2 ${color}`}
        style={{
          width: size,
          height: size,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        aria-label="Loading"
      />
    </div>
  )
}

