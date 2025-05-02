"use client"

import { useRouter } from "next/navigation"
import { useEmailCollection } from "@/contexts/email-collection-context"

export const useAssessmentNavigation = () => {
  const router = useRouter()
  const { isEmailCollected, setShowEmailDialog } = useEmailCollection()
  
  const navigateToAssessment = () => {
    // If email is already collected, navigate directly to assessment
    if (isEmailCollected) {
      router.push("/assessment")
    } else {
      // Otherwise show the email collection dialog
      setShowEmailDialog(true)
    }
  }
  
  return { navigateToAssessment }
} 