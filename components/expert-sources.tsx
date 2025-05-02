import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Award } from "lucide-react"
import type { Industry } from "@/lib/industry-detection"
import { getExpertSourceDescription } from "@/lib/api-service"

export function ExpertSources({ industry }: { industry: Industry }) {
  // Get the appropriate sources for this industry
  const sources = getIndustrySources(industry)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Expert-Backed Assessment
        </CardTitle>
        <CardDescription>
          Our {industry} skills test questions are derived from authoritative industry sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((source) => {
            const sourceInfo = getExpertSourceDescription(source)
            return (
              <div key={source} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <BookOpen className={`h-5 w-5 text-${sourceInfo.icon}-500 mr-2`} />
                  <h3 className="font-medium">{sourceInfo.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{sourceInfo.description}</p>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Each question is carefully crafted to reflect current {industry} industry standards and expert consensus,
          ensuring your assessment is aligned with real-world expectations.
        </p>
      </CardContent>
    </Card>
  )
}

// Helper function to get sources for a specific industry
function getIndustrySources(industry: Industry): string[] {
  switch (industry) {
    case "technology":
      return ["stackoverflow", "github", "mdn", "arxiv"]
    case "marketing":
      return ["hubspot", "moz", "marketingprofs", "thinkwithgoogle"]
    case "finance":
      return ["bloomberg", "morningstar", "wsj", "investopedia"]
    case "healthcare":
      return ["pubmed", "cdc", "who", "nejm"]
    case "education":
      return ["edutopia", "chronicle", "educause", "edweek"]
    case "design":
      return ["dribbble", "behance", "nielsen", "ixda"]
    case "legal":
      return ["westlaw", "lexisnexis", "americanbar", "justia"]
    case "hr":
      return ["shrm", "hrbartender", "hrexecutive", "workology"]
    case "sales":
      return ["salesforce", "hubspot", "saleshacker", "closeriq"]
    case "manufacturing":
      return ["industryweek", "asq", "isixsigma", "manufacturingnet"]
    default:
      return ["general"]
  }
}
