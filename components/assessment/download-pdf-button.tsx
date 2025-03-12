"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Check } from "lucide-react"
import { generatePDF } from "@/utils/generate-pdf"
import { motion } from "framer-motion"

interface DownloadPDFButtonProps {
  elementId: string
  filename?: string
}

export default function DownloadPDFButton({ elementId, filename = "assessment-results.pdf" }: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    setIsComplete(false)

    try {
      const success = await generatePDF(elementId, filename)

      if (success) {
        setIsComplete(true)
        setTimeout(() => setIsComplete(false), 3000)
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`button-enhanced relative overflow-hidden ${
          isComplete
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
        } transition-all duration-300`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : isComplete ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Results as PDF
          </>
        )}
      </Button>
    </motion.div>
  )
}

