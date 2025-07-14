"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { FadeIn } from "./animated-container"
import { Input } from "@/components/ui/input"
import { useEmailCollection } from "@/contexts/email-collection-context"
import { generateUuid } from "@/lib/utils"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

interface FileUploadProps {
  initialEmail?: string;
}

export function FileUpload({ initialEmail = "" }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [email, setEmail] = useState(initialEmail)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlId = searchParams.get('id')
  const urlEmail = searchParams.get('email')
  const { collectEmail } = useEmailCollection()
  const auth = useAuth()
  const { backendUser } = useBackendAuth()
  
  // Update email if initialEmail prop changes or from URL
  useEffect(() => {
    if (urlEmail) {
      setEmail(urlEmail)
    } else if (initialEmail) {
      setEmail(initialEmail)
    } else if (auth.user?.email) {
      setEmail(auth.user.email)
    } else if (backendUser?.email) {
      setEmail(backendUser.email)
    }
  }, [initialEmail, urlEmail, auth.user, backendUser])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setDebugInfo(null)

    if (!selectedFile) return

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setFile(selectedFile)
    setDebugInfo(
      `Selected file: ${selectedFile.name}, Size: ${(selectedFile.size / 1024).toFixed(2)}KB, Type: ${selectedFile.type}`,
    )
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setDebugInfo("Starting upload...")

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      const formData = new FormData()
      formData.append("file", file)
      
      // Add email to formData if provided
      if (email) {
        formData.append("email", email)
        
        // Save email in context and Supabase
        const assessmentId = urlId || generateUuid()
        await collectEmail(email, assessmentId)
        
        // Also add the assessment ID to the form data if available
        formData.append("assessment_id", assessmentId)
      }

      setDebugInfo("Processing PDF...")

      // First upload and extract text from the PDF
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        throw new Error(uploadData.error || `Upload failed with status: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()
      
      // Check if the extracted text exists and has content
      if (!uploadData.text) {
        setDebugInfo("PDF processed but no text was extracted. Checking original text in storage...")
        
        // Try to get the text from the storage
        try {
          const textCheckResponse = await fetch(`/api/upload/${uploadData.id}/text`, {
            method: "GET",
          })
          
          if (!textCheckResponse.ok) {
            throw new Error("Could not retrieve text content")
          }
          
          const textData = await textCheckResponse.json()
          if (!textData.text || textData.text.length < 10) {
            throw new Error("Retrieved text is too short or empty")
          }
          
          // Use the retrieved text
          uploadData.text = textData.text
        } catch (textError) {
          throw new Error("Failed to extract text from PDF. Please ensure the PDF contains searchable text.")
        }
      }
      
      setUploadProgress(70)
      setDebugInfo(`PDF processed successfully. Analyzing...`)

      // Get the user ID from auth, or let the API handle visitor users
      const userId = backendUser?.id || auth.user?.id || undefined; // Don't send empty string

      // Now create the assessment using the extracted text
      const assessmentResponse = await fetch("/api/assessments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvText: uploadData.text || uploadData.original_text,
          userId: userId // This will be undefined for visitors, which is fine
        }),
      })

      clearInterval(progressInterval)

      if (!assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json()
        throw new Error(assessmentData.error || `Assessment generation failed: ${assessmentResponse.status}`)
      }

      const assessmentData = await assessmentResponse.json()
      setUploadProgress(100)
      setDebugInfo(`Assessment created successfully! ID: ${assessmentData.id}`)

      // Get source parameter to preserve it in navigation
      const source = searchParams.get('source')
      const targetUrl = source ? `/assessment/${assessmentData.id}?source=${source}` : `/assessment/${assessmentData.id}`

      // Redirect to the assessment results page
      router.push(targetUrl)
    } catch (err) {
      clearInterval(progressInterval)
      console.error("Process error:", err)
      setError(`Failed to process file: ${err instanceof Error ? err.message : "Unknown error"}`)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => document.getElementById("file-upload")?.click()}
        whileHover={{ scale: 1.01, borderColor: "#3b82f6" }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />

        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
        </motion.div>

        <p className="text-sm text-gray-600 mb-1">{file ? file.name : "Click to upload or drag and drop"}</p>
        <p className="text-xs text-gray-500">PDF (max. 5MB)</p>
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

      <AnimatePresence>
        {debugInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">{debugInfo}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {file && !uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-2 border rounded-md"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleUpload}>Upload</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {uploading && (
        <FadeIn>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading{uploadProgress >= 70 ? " and analyzing" : ""}...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        </FadeIn>
      )}
    </div>
  )
}
