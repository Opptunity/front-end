"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

type EmailCollectionContextType = {
  email: string
  setEmail: (email: string) => void
  isEmailCollected: boolean
  collectEmail: (email: string, assessmentId?: string) => Promise<void>
  showEmailDialog: boolean
  setShowEmailDialog: (show: boolean) => void
}

const EmailCollectionContext = createContext<EmailCollectionContextType | undefined>(undefined)

export const EmailCollectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState("")
  const [isEmailCollected, setIsEmailCollected] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const router = useRouter()
  let searchParams = null
  try {
    searchParams = useSearchParams()
  } catch (error) {
    console.warn("SearchParams not available during prerendering")
  }
  const auth = useAuth()
  const { backendUser } = useBackendAuth()

  // Check if user is coming from dashboard or is already logged in
  const isFromDashboard = searchParams?.get('source') === 'dashboard'
  const isLoggedIn = !!auth.user || !!backendUser

  // Check if email has been collected from localStorage on mount
  useEffect(() => {
    // First check if user is already logged in from WorkOS or our backend
    if (auth.user?.email) {
      setEmail(auth.user.email)
      setIsEmailCollected(true)
      return
    }
    
    if (backendUser?.email) {
      setEmail(backendUser.email)
      setIsEmailCollected(true)
      return
    }

    // Otherwise check localStorage
    const savedEmail = localStorage.getItem("assessmentEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setIsEmailCollected(true)
    }
  }, [auth.user, backendUser])

  // Store assessment data in Supabase
  const storeAssessmentInSupabase = async (email: string, assessmentId?: string) => {
    if (!assessmentId) return

    try {
      // Try to get user ID from auth contexts
      let userId = null;
      
      // First, try to find user by email to get their UUID
      if (auth.user?.id) {
        userId = auth.user.id;
      } else if (backendUser?.id) {
        userId = backendUser.id;
      } else {
        // If not logged in, try to look up user by email
        const { data: userData, error: userError } = await supabase
          .from('Users')
          .select('id')
          .eq('email', email)
          .single()
        
        if (!userError && userData?.id) {
          userId = userData.id;
        } else {
          console.log('User not found by email, will use email as identifier');
        }
      }

      // First check if record exists
      const { data, error } = await supabase
        .from('Assessments')
        .select('id')
        .eq('id', assessmentId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking for existing record:', error)
        return
      }

      // If record exists, update it
      if (data) {
        await supabase
          .from('Assessments')
          .update({ 
            userId: userId || email, // Use UUID if available, otherwise use email
            updatedAt: new Date().toISOString()
          })
          .eq('id', assessmentId)
      } else {
        // If record doesn't exist, create a new one
        await supabase
          .from('Assessments')
          .insert({ 
            id: assessmentId,
            userId: userId || email, // Use UUID if available, otherwise use email
            name: `Skill Assessment ${new Date().toLocaleDateString()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
      }
      
      console.log('Assessment data stored in Supabase successfully with userId:', userId || email)
    } catch (err) {
      console.error('Error storing assessment in Supabase:', err)
    }
  }

  const collectEmail = async (email: string, assessmentId?: string) => {
    setEmail(email)
    localStorage.setItem("assessmentEmail", email)
    localStorage.setItem("userEmail", email)
    setIsEmailCollected(true)
    setShowEmailDialog(false)
    
    // Store in Supabase if assessmentId is provided
    if (assessmentId) {
      await storeAssessmentInSupabase(email, assessmentId)
    }
  }

  return (
    <EmailCollectionContext.Provider
      value={{
        email,
        setEmail,
        isEmailCollected,
        collectEmail,
        showEmailDialog,
        setShowEmailDialog
      }}
    >
      {children}
    </EmailCollectionContext.Provider>
  )
}

export const useEmailCollection = (): EmailCollectionContextType => {
  const context = useContext(EmailCollectionContext)
  if (context === undefined) {
    throw new Error("useEmailCollection must be used within an EmailCollectionProvider")
  }
  return context
} 