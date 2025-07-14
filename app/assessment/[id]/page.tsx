import { Suspense } from "react"
import { AssessmentPageClient } from "./client"

// Loading state component
function LoadingAssessment() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading assessment data...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Server component that handles async params
export default async function AssessmentPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  return (
    <Suspense fallback={<LoadingAssessment />}>
      <AssessmentPageClient id={id} />
    </Suspense>
  )
}
