"use client"

import React, { createContext, useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

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

  // Check if email has been collected from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("assessmentEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setIsEmailCollected(true)
    }
  }, [])

  // Store email in Supabase
  const storeEmailInSupabase = async (email: string, assessmentId?: string) => {
    if (!assessmentId) return

    try {
      // First check if record exists
      const { data, error } = await supabase
        .from('cv_data')
        .select('id')
        .eq('id', assessmentId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking CV data:', error)
        return
      }

      // If record exists, update it
      if (data) {
        await supabase
          .from('cv_data')
          .update({ 
            email: email,
            updated_at: new Date().toISOString()
          })
          .eq('id', assessmentId)
      } else {
        // If record doesn't exist, create a new one
        await supabase
          .from('cv_data')
          .insert({ 
            id: assessmentId,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
      
      console.log('Email stored in Supabase successfully')
    } catch (err) {
      console.error('Error storing email in Supabase:', err)
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
      await storeEmailInSupabase(email, assessmentId)
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