"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function SSOCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the code from URL params
        const code = searchParams.get("code");
        
        if (!code) {
          throw new Error("Authorization code is missing");
        }
        
        // Exchange the code for a profile
        const response = await fetch("/api/sso/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Authentication failed");
        }
        
        // Store the auth token
        localStorage.setItem("authToken", data.token);
        
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("SSO callback error:", error);
        setError(error instanceof Error ? error.message : "Authentication failed");
        setIsProcessing(false);
      }
    };
    
    processCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Authentication Error</div>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => router.push("/login")}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    </div>
  );
} 