"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function AuthHeader() {
  const { user, logout, isAuthenticated } = useAuth()
  
  // Don't render the header if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
          Opptunity
        </Link>
        <div className="flex items-center">
          <span className="mr-4 text-gray-700">
            welcome, {user?.username || "User"}
          </span>
          <button 
            onClick={logout}
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            logout
          </button>
        </div>
      </div>
    </header>
  )
}
