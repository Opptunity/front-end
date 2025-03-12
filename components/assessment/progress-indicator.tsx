"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export default function ProgressIndicator({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  const getStepLabel = (step) => {
    switch (step) {
      case 1:
        return "Company"
      case 2:
        return "Workforce"
      case 3:
        return "Future"
      case 4:
        return "Resources"
      default:
        return ""
    }
  }

  return (
    <div className="w-full mt-6">
      <div className="relative flex items-center justify-between">
        {/* Progress bar background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          {/* Animated gradient progress */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              background: "linear-gradient(to right, #4f46e5, #6366f1)",
            }}
            initial={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        {steps.map((step) => (
          <div key={step} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: step <= currentStep ? 1 : 0.8 }}
              animate={{
                scale: step <= currentStep ? 1 : 0.8,
                backgroundColor: step < currentStep ? "#4f46e5" : step === currentStep ? "white" : "white",
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
                step < currentStep
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : step === currentStep
                    ? "border-indigo-600 bg-white text-indigo-600 ring-4 ring-indigo-100"
                    : "border-slate-300 bg-white text-slate-400"
              }`}
              transition={{ duration: 0.2 }}
            >
              {step < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </motion.div>
            <span className={`text-xs mt-2 font-medium ${step <= currentStep ? "text-indigo-600" : "text-slate-400"}`}>
              {getStepLabel(step)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

