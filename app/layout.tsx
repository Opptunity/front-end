import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Opptunity - AI-Powered Skills & Taxonomy Platform",
  description:
    "Transform your workforce with personalized learning paths, precise skill gap analysis, and optimized company taxonomy.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                <div id="page-transitions">{children}</div>
              </main>
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}



import './globals.css'