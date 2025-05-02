"use client"

import { FileUpload } from "@/components/file-upload"
import { AssessmentProcess } from "@/components/assessment-process"
//import { ApiTest } from "@/components/api-test"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { AnimatedContainer, FadeIn } from "@/components/animated-container"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useEmailCollection } from "@/contexts/email-collection-context"

export default function Home() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  const { collectEmail } = useEmailCollection()
  
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
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
    </div>
  )
}
