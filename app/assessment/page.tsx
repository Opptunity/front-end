"use client"

import { FileUpload } from "@/components/file-upload"
import { AssessmentProcess } from "@/components/assessment-process"
//import { ApiTest } from "@/components/api-test"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, ArrowLeft } from "lucide-react"
import { AnimatedContainer, FadeIn } from "@/components/animated-container"
import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense, useState } from "react"
import { useEmailCollection } from "@/contexts/email-collection-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from '@workos-inc/authkit-nextjs/components' 

// Simple logo component using text like in the header
const OpptunityLogo = () => (
  <div className="py-4 px-6 flex justify-start">
    <motion.div className="flex items-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
      <Link href="/" className="flex items-center">
        <span className="text-2xl font-bold text-blue-600">Opptunity</span>
      </Link>
    </motion.div>
  </div>
)

// Create a client component that uses useSearchParams
function AssessmentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const auth = useAuth()  // Use WorkOS auth
  const { collectEmail } = useEmailCollection()
  
  // Get source from URL param or determine from auth status
  const source = searchParams.get('source') || (auth.user ? 'dashboard' : 'visitor')
  
  // Store source in session storage for tracking navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('assessmentSource', source)
    }
  }, [source])
  
  // Determine if back button should be shown
  const shouldShowBackButton = source === 'dashboard' && auth.user
  
  const goToDashboard = () => {
    router.push('/dashboard')
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Show logo navbar for visitors */}
      {source === 'visitor' && <OpptunityLogo />}
      
      {/* Show back button for logged in users from dashboard */}
      {shouldShowBackButton && (
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={goToDashboard} 
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>
      )}
      
      <AnimatedContainer>
        <motion.h1
          className="text-4xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Skills Assessment Agent
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Upload your CV to get an AI-powered assessment of your professional skills
        </motion.p>

        <AssessmentProcess />

        <Card>
          <CardHeader>
            <CardTitle>Submit Your CV</CardTitle>
            <CardDescription>Upload your CV as a PDF file</CardDescription>
          </CardHeader>
          <CardContent>
            <FadeIn delay={0.2}>
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm">
                    <strong>Important:</strong> Ensure your PDF is properly formatted for the best results.
                  </p>
                </AlertDescription>
              </Alert>
            </FadeIn>

            <FileUpload />
          </CardContent>
          {
             /*  <CardFooter className="flex justify-center border-t pt-4">
               <ApiTest />
             </CardFooter> */
          }
         
        </Card>
      </AnimatedContainer>
    </div>
  )
}

// Fallback loading state
function LoadingAssessment() {
  return <div>Loading assessment...</div>
}

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<LoadingAssessment />}>
        <AssessmentContent />
      </Suspense>
    </div>
  )
}
