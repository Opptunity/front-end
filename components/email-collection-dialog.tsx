"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEmailCollection } from "@/contexts/email-collection-context"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateUuid } from "@/lib/utils"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

export default function EmailCollectionDialog() {
  const { email, setEmail, collectEmail, showEmailDialog, setShowEmailDialog } = useEmailCollection()
  const { t } = useLanguage()
  const [error, setError] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const { backendUser } = useBackendAuth()

  // Determine if user is coming from dashboard or is already logged in
  const isFromDashboard = searchParams?.get('source') === 'dashboard'
  const isLoggedIn = !!auth.user || !!backendUser

  // This effect automatically collects the email for logged-in users
  useEffect(() => {
    // Skip this logic for the homepage or non-assessment pages
    if (pathname === '/' || (!pathname?.includes('/assessment') && pathname !== '/assessment')) {
      return;
    }

    // Skip auto-redirect for the base assessment page - allow users to stay here
    if (pathname === '/assessment') {
      // Just collect the email but don't redirect
      if ((isFromDashboard || isLoggedIn) && (auth.user?.email || backendUser?.email)) {
        const userEmail = auth.user?.email || backendUser?.email || '';
        if (userEmail) {
          // Just collect the email in the context, don't redirect
          collectEmail(userEmail);
        }
      }
      return;
    }

    // For other assessment pages (not the base page), continue with normal flow
    // Extract the assessment ID if we're on an assessment page
    let assessmentId: string | null = null
    const assessmentIdMatch = pathname?.match(/\/assessment\/([^\/]+)/)
    if (assessmentIdMatch && assessmentIdMatch[1]) {
      assessmentId = assessmentIdMatch[1]
    }

    // Auto-collect email if user is logged in or coming from dashboard
    if ((isFromDashboard || isLoggedIn) && (auth.user?.email || backendUser?.email)) {
      const userEmail = auth.user?.email || backendUser?.email || ''
      
      if (userEmail) {
        // Generate a UUID for the assessment if not already on an assessment page
        if (!assessmentId) {
          assessmentId = generateUuid()
        }

        // Automatically collect email without showing dialog
        collectEmail(userEmail, assessmentId);
      }
    }
  }, [isFromDashboard, isLoggedIn, auth.user, backendUser, pathname, collectEmail, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address")
      return
    }
    
    // Extract the assessment ID if we're on an assessment page
    let assessmentId: string | null = null
    const assessmentIdMatch = pathname?.match(/\/assessment\/([^\/]+)/)
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
      // If already on an assessment page, just reload
      router.push(`/assessment/${assessmentId}`)
    } else if (pathname === '/assessment') {
      // If on the base assessment page, stay there
      setShowEmailDialog(false)
    } else {
      // For visitors from homepage, navigate to assessment with source parameter
      const source = searchParams?.get('source') || 'visitor'
      router.push(`/assessment?source=${source}`)
    }
  }

  // Don't render the dialog for logged-in users or users from dashboard
  if (isFromDashboard || isLoggedIn) {
    return null
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