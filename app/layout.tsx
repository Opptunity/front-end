import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components'
import { BackendAuthProvider } from '@/contexts/backend-auth-context'
import ConditionalLayout from "@/components/conditional-layout"

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
        <AuthKitProvider>
          <BackendAuthProvider>
            <LanguageProvider>
              <ConditionalLayout>
                <div id="page-transitions">{children}</div>
              </ConditionalLayout>
            </LanguageProvider>
          </BackendAuthProvider>
        </AuthKitProvider>
      </body>
    </html>
  )
}