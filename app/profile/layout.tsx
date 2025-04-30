import type { Metadata } from "next"
import AppHeader from "@/components/AppHeader"

export const metadata: Metadata = {
  title: "Profile | Opptunity",
  description: "View your profile and CV analysis",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gray-50 pb-10">
        {children}
      </main>
    </>
  )
} 