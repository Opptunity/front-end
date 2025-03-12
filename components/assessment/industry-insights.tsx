"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon } from "lucide-react"
import { industryInsights } from "@/utils/industry-insights"
import { motion } from "framer-motion"

export default function IndustryInsights({ industry }) {
  // Default to "Other" if the industry isn't in our database
  const insights = industryInsights[industry] || industryInsights["Other"]

  return (
    <Card className="card-enhanced shadow-md hover:shadow-lg transition-shadow border-0 overflow-hidden">
      <CardHeader className="card-header-enhanced border-b pb-4 bg-gradient-to-r from-indigo-50 to-indigo-50/50">
        <CardTitle className="text-lg flex items-center gap-2 text-indigo-800">
          <LightbulbIcon className="h-5 w-5 text-indigo-600" />
          {industry} Industry Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium mb-3 flex items-center gap-2 text-slate-900">
              <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
              Industry-Specific Challenges
            </h4>
            <ul className="space-y-2">
              {insights.challenges.map((challenge, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-amber-500 mt-1">•</span>
                  <span className="text-slate-700">{challenge}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium mb-3 flex items-center gap-2 text-slate-900">
              <TrendingUpIcon className="h-4 w-4 text-indigo-500" />
              Industry Trends
            </h4>
            <ul className="space-y-2">
              {insights.stats.map((stat, index) => (
                <motion.li
                  key={index}
                  className="bg-gradient-to-r from-slate-50 to-white p-3 rounded-md text-slate-700 text-sm shadow-sm hover:shadow transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {stat}
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium mb-3 text-slate-900">Industry-Specific Recommendations</h4>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-2 hover:bg-indigo-50/30 p-2 rounded-md transition-colors"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge className="mt-0.5 flex-shrink-0 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                    {index + 1}
                  </Badge>
                  <p className="text-slate-700">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

