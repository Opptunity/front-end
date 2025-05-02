"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export function ApiTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const testApi = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/test")
      const data = await response.json()
      setStatus("success")
      setMessage(data.message)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to connect to API")
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={testApi} disabled={status === "loading"} variant="outline" size="sm">
        Test API Connection
      </Button>

      {status === "loading" && (
        <Alert>
          <AlertDescription>Testing API connection...</AlertDescription>
        </Alert>
      )}

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
