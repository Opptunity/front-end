"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEmailCollection } from "@/contexts/email-collection-context"
import EmailCollectionDialog from "./email-collection-dialog"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

export default function AssessmentRouteHandler() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Gérer l'absence de searchParams pendant le prerendering
  let searchParams = null
  try {
    searchParams = useSearchParams()
  } catch (error) {
    console.warn("SearchParams not available during prerendering")
  }
  
  const { isEmailCollected, showEmailDialog, setShowEmailDialog } = useEmailCollection()
  const auth = useAuth()
  const { backendUser } = useBackendAuth()
  
  // Determine if user is coming from dashboard (avec fallback)
  const isFromDashboard = searchParams?.get('source') === 'dashboard'
  
  useEffect(() => {
    // If the user is trying to access the assessment page
    if (pathname === "/assessment") {
      // Check if the user is authenticated or coming from dashboard
      const isLoggedIn = auth.user || backendUser
      
      // If user is not logged in, not coming from dashboard, and hasn't provided an email
      if (!isLoggedIn && !isFromDashboard && !isEmailCollected) {
        // Show the email collection dialog
        setShowEmailDialog(true)
        // Don't redirect away - stay on the assessment page
      } else if (isLoggedIn || isFromDashboard) {
        // If user is logged in or coming from dashboard, make sure dialog is closed
        setShowEmailDialog(false)
      }
    }
  }, [pathname, isEmailCollected, setShowEmailDialog, auth.user, backendUser, isFromDashboard])
  
  return <EmailCollectionDialog />
} 