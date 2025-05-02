"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useEmailCollection } from "@/contexts/email-collection-context"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateUuid } from "@/lib/utils"

export default function EmailCollectionDialog() {
  const { email, setEmail, collectEmail, showEmailDialog, setShowEmailDialog } = useEmailCollection()
  const { t } = useLanguage()
  const [error, setError] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address")
      return
    }
    
    // Extract the assessment ID if we're on an assessment page
    let assessmentId = null
    const assessmentIdMatch = pathname.match(/\/assessment\/([^\/]+)/)
    if (assessmentIdMatch && assessmentIdMatch[1]) {
      assessmentId = assessmentIdMatch[1]
    } else {
      // Generate a new UUID for Supabase if we're not on an assessment page
      assessmentId = generateUuid()
    }
    
    // Store email in context and Supabase
    await collectEmail(email, assessmentId)
    
    // Navigate to appropriate page
    if (assessmentIdMatch && assessmentIdMatch[1]) {
      // If already on an assessment page, just add email as query param and reload
      router.push(`/assessment/${assessmentId}?email=${encodeURIComponent(email)}`)
    } else {
      // Otherwise go to the assessment page
      router.push(`/assessment?email=${encodeURIComponent(email)}&id=${assessmentId}`)
    }
  }

  return (
    <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Enter your email to continue</DialogTitle>
          <DialogDescription className="text-center">
            We'll use this to save your assessment progress and send your results.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                className="w-full"
                required
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-red-500 text-sm mt-1"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Continue to Assessment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 