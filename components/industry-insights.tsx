"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ExternalLink } from "lucide-react"
import type { Industry } from "@/lib/industry-detection"

type IndustryInsightsProps = {
  industry: Industry
  skills: Array<{ skill: string; level: string }>
}

// Industry trends data (in a real app, this would come from an API or database)
const industryTrends: Record<Industry, Array<{ trend: string; relevance: "high" | "medium" | "low"; url: string }>> = {
  technology: [
    {
      trend: "AI and Machine Learning Integration",
      relevance: "high",
      url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-state-of-ai-in-2023-generative-ais-breakout-year",
    },
    {
      trend: "Serverless Architecture",
      relevance: "medium",
      url: "https://aws.amazon.com/serverless/",
    },
    {
      trend: "Web3 and Blockchain Development",
      relevance: "medium",
      url: "https://ethereum.org/en/developers/docs/",
    },
    {
      trend: "Low-Code/No-Code Development",
      relevance: "medium",
      url: "https://www.gartner.com/en/documents/3991199",
    },
  ],
  marketing: [
    {
      trend: "AI-Generated Content",
      relevance: "high",
      url: "https://hbr.org/2023/07/how-generative-ai-is-changing-creative-work",
    },
    {
      trend: "First-Party Data Strategies",
      relevance: "high",
      url: "https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-demise-of-third-party-cookies-and-identifiers",
    },
    {
      trend: "Video-First Content Strategy",
      relevance: "medium",
      url: "https://blog.hubspot.com/marketing/state-of-video-marketing-new-data",
    },
  ],
  finance: [
    {
      trend: "ESG (Environmental, Social, Governance) Investing",
      relevance: "high",
      url: "https://www.blackrock.com/us/individual/investment-ideas/sustainable-investing",
    },
    {
      trend: "Blockchain in Financial Services",
      relevance: "medium",
      url: "https://www2.deloitte.com/us/en/insights/topics/understanding-blockchain-potential/global-blockchain-survey.html",
    },
    {
      trend: "Automated Financial Planning",
      relevance: "medium",
      url: "https://www.forbes.com/advisor/investing/robo-advisor/",
    },
  ],
  // Add more industries as needed
  healthcare: [],
  education: [],
  design: [],
  legal: [],
  hr: [],
  sales: [],
  manufacturing: [],
  other: [],
}

// Function to determine trend relevance to user's skills
function determineTrendRelevance(
  trend: string,
  skills: Array<{ skill: string; level: string }>,
): "high" | "medium" | "low" {
  // This is a simplified version - in a real app, this would be more sophisticated
  const trendLower = trend.toLowerCase()

  // Check if any skills directly match the trend
  for (const skill of skills) {
    const skillLower = skill.skill.toLowerCase()
    if (trendLower.includes(skillLower) || skillLower.includes(trendLower)) {
      return skill.level === "Advanced" || skill.level === "Expert" ? "high" : "medium"
    }
  }

  // Check for related skills
  const relatedTerms: Record<string, string[]> = {
    ai: ["machine learning", "python", "data science", "tensorflow", "pytorch"],
    blockchain: ["web3", "ethereum", "smart contract", "cryptocurrency"],
    cloud: ["aws", "azure", "gcp", "serverless", "kubernetes", "docker"],
    data: ["analytics", "sql", "database", "visualization", "tableau", "power bi"],
  }

  for (const [category, terms] of Object.entries(relatedTerms)) {
    if (trendLower.includes(category)) {
      for (const term of terms) {
        for (const skill of skills) {
          const skillLower = skill.skill.toLowerCase()
          if (skillLower.includes(term)) {
            return skill.level === "Advanced" || skill.level === "Expert" ? "high" : "medium"
          }
        }
      }
    }
  }

  return "low"
}

export function IndustryInsights({ industry, skills }: IndustryInsightsProps) {
  const trends = industryTrends[industry] || industryTrends.other || []

  // If we don't have trends for this industry, show generic trends
  const trendsToShow =
    trends.length > 0
      ? trends
      : [
          {
            trend: "Digital Transformation",
            relevance: "medium",
            url: "https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/five-fifty-the-quickening",
          },
          {
            trend: "Remote Work and Collaboration",
            relevance: "medium",
            url: "https://www.gartner.com/smarterwithgartner/9-future-of-work-trends-post-covid-19",
          },
          {
            trend: "Sustainability and Green Initiatives",
            relevance: "medium",
            url: "https://www.weforum.org/agenda/2023/01/davos-2023-sustainability-esg-investment/",
          },
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5" />
          Industry Trends & Insights
        </CardTitle>
        <CardDescription>Current trends in the {industry} industry relevant to your skill set</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendsToShow.map((trend, index) => {
            // Determine relevance based on user's skills
            const userRelevance = determineTrendRelevance(trend.trend, skills)
            // Use the higher of the two relevances
            const relevance =
              userRelevance === "high" || trend.relevance === "high"
                ? "high"
                : userRelevance === "medium" || trend.relevance === "medium"
                  ? "medium"
                  : "low"

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{trend.trend}</h3>
                  <Badge
                    className={
                      relevance === "high"
                        ? "bg-green-100 text-green-800"
                        : relevance === "medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }
                  >
                    {relevance === "high"
                      ? "High Relevance"
                      : relevance === "medium"
                        ? "Medium Relevance"
                        : "Low Relevance"}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {relevance === "high"
                    ? "This trend aligns strongly with your skill set and presents significant opportunities."
                    : relevance === "medium"
                      ? "This trend is moderately relevant to your skills and worth exploring further."
                      : "This trend has limited direct relevance to your current skill set but may be worth monitoring."}
                </p>

                <a
                  href={trend.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  Learn more <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
