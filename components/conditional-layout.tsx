"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { EmailCollectionProvider } from "@/contexts/email-collection-context"
import AssessmentRouteHandler from "./assessment-route-handler"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Ne pas charger les composants avec useSearchParams sur certaines pages
  const shouldLoadSearchParamsComponents = !pathname.includes('not-found') && pathname !== '/404'

  if (shouldLoadSearchParamsComponents) {
    return (
      <Suspense fallback={<div className="min-h-screen" />}>
        <EmailCollectionProvider>
          <AssessmentRouteHandler />
          {children}
        </EmailCollectionProvider>
      </Suspense>
    )
  }

  return <>{children}</>
}
