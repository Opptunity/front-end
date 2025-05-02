"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useEmailCollection } from "@/contexts/email-collection-context"
import EmailCollectionDialog from "./email-collection-dialog"

export default function AssessmentRouteHandler() {
  const pathname = usePathname()
  const router = useRouter()
  const { isEmailCollected, showEmailDialog, setShowEmailDialog } = useEmailCollection()
  
  useEffect(() => {
    // If the user is trying to access the assessment page and hasn't provided an email
    if (pathname === "/assessment" && !isEmailCollected) {
      // Show the email collection dialog
      setShowEmailDialog(true)
      // Redirect to home page temporarily
      router.replace("/")
    }
  }, [pathname, isEmailCollected, setShowEmailDialog, router])
  
  return <EmailCollectionDialog />
} 