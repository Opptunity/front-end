"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function TextInput() {
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter your CV text")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/parse-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit text")
      }

      // Redirect to results page
      router.push(`/assessment/${data.id}`)
    } catch (err) {
      setError(`Failed to submit: ${err instanceof Error ? err.message : "Unknown error"}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Textarea
          placeholder="Paste your CV text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] transition-all duration-200 focus:shadow-md"
          disabled={submitting}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          className="w-full relative overflow-hidden"
        >
          {submitting ? (
            <motion.div
              className="absolute inset-0 bg-primary/20"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
            />
          ) : null}
          <span className="relative z-10">{submitting ? "Processing..." : "Submit Text"}</span>
        </Button>
      </motion.div>
    </div>
  )
}
