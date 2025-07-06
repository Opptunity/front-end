"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  MapPin,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Globe,
  Zap,
  Star,
  Award,
  Calculator,
  Timer,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from 'lucide-react'
import { 
  MarketIntelligenceDashboard, 
  CareerROIAnalysis,
  SkillMarketAnalytics,
  MarketTimingInsights,
  SkillCombinationValue,
  GeographicMarketData
} from '@/lib/types/engineer-ranking'

interface MarketIntelligenceDashboardProps {
  engineerId: number
  location?: string
  className?: string
}

export default function MarketIntelligenceDashboardComponent({ 
  engineerId, 
  location = 'Global',
  className = '' 
}: MarketIntelligenceDashboardProps) {
  const [dashboard, setDashboard] = useState<MarketIntelligenceDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMarketIntelligence()
  }, [engineerId, location])

  const fetchMarketIntelligence = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/market-intelligence?type=dashboard&engineer_id=${engineerId}&location=${location}`)
      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      } else {
        console.error('Failed to fetch market intelligence dashboard')
      }
    } catch (error) {
      console.error('Error fetching market intelligence:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchMarketIntelligence()
    setRefreshing(false)
  }

  const getRecommendationColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'avoid': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Market Intelligence Available</h3>
        <p className="text-gray-600 mb-4">Generate market intelligence analysis for your skills to see insights.</p>
        <Button onClick={fetchMarketIntelligence}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate Analysis
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Intelligence Dashboard</h2>
          <p className="text-gray-600">Data-driven insights for your career development</p>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Analyzed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.market_summary.total_skills_analyzed}</div>
            <p className="text-xs text-muted-foreground">Active skill monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Demand Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(dashboard.market_summary.average_demand_score)}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(dashboard.market_summary.best_roi_opportunity)}%</div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Timing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.market_summary.critical_timing_count}</div>
            <p className="text-xs text-muted-foreground">Skills need urgent attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Analytics</TabsTrigger>
          <TabsTrigger value="timing">Timing Insights</TabsTrigger>
          <TabsTrigger value="combinations">Skill Combos</TabsTrigger>
        </Tabs>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Key Recommendations
              </CardTitle>
              <CardDescription>
                Top opportunities based on your current skills and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboard.recommendations.high_roi_skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">🚀 High ROI Skills</h4>
                  <div className="space-y-2">
                    {dashboard.recommendations.high_roi_skills.slice(0, 3).map((roi) => (
                      <div key={roi.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <span className="font-medium">{roi.skill_name}</span>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(roi.projected_market_value - roi.current_market_value)} potential increase
                          </p>
                        </div>
                        <Badge className={getRecommendationColor(roi.recommendation_strength)}>
                          {Math.round(roi.roi_percentage)}% ROI
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dashboard.recommendations.urgent_learning.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">⚡ Urgent Learning</h4>
                  <div className="space-y-2">
                    {dashboard.recommendations.urgent_learning.slice(0, 3).map((timing) => (
                      <div key={timing.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <span className="font-medium">{timing.skill_or_trend}</span>
                          <p className="text-sm text-gray-600">
                            {timing.market_phase} phase • {timing.optimal_entry_timing}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getUrgencyColor(timing.learning_window_urgency)}`} />
                          <span className="text-sm font-medium capitalize">{timing.learning_window_urgency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dashboard.recommendations.valuable_combinations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-blue-700">💎 Valuable Combinations</h4>
                  <div className="space-y-2">
                    {dashboard.recommendations.valuable_combinations.slice(0, 3).map((combo) => (
                      <div key={combo.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-wrap gap-1">
                            {combo.skill_combination.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            +{Math.round(combo.market_premium_percentage)}% salary
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Popular roles: {combo.typical_roles.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                Career ROI Analysis ({dashboard.roi_opportunities.length} skills)
              </CardTitle>
              <CardDescription>
                Return on investment calculations for learning new skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.roi_opportunities.map((roi) => (
                  <div key={roi.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{roi.skill_name}</h4>
                        <p className="text-sm text-gray-600">
                          {roi.time_to_proficiency_months} months to proficiency • {roi.learning_investment_hours} hours
                        </p>
                      </div>
                      <Badge className={getRecommendationColor(roi.recommendation_strength)}>
                        {roi.recommendation_strength.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Current Value</div>
                        <div className="text-lg font-bold">{formatCurrency(roi.current_market_value)}</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Projected Value</div>
                        <div className="text-lg font-bold text-green-700">{formatCurrency(roi.projected_market_value)}</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">ROI</div>
                        <div className="text-lg font-bold text-blue-700">{Math.round(roi.roi_percentage)}%</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600">Payback</div>
                        <div className="text-lg font-bold text-purple-700">{roi.payback_period_months}mo</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">
                        Confidence: {roi.market_confidence_score}%
                      </div>
                      <div className="text-gray-600">
                        Career Impact: {roi.career_advancement_potential}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Skill Market Analytics ({dashboard.skill_market_analytics.length} skills)
              </CardTitle>
              <CardDescription>
                Current market demand and growth trends for your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.skill_market_analytics.map((analytics) => (
                  <div key={analytics.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{analytics.skill_name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{analytics.category}</p>
                      </div>
                      <Badge 
                        className={
                          analytics.demand_score >= 80 ? 'bg-green-100 text-green-800' :
                          analytics.demand_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {analytics.demand_score}/100 demand
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Growth Velocity</div>
                        <div className="flex items-center gap-2">
                          {analytics.growth_velocity > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : analytics.growth_velocity < 0 ? (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="font-bold">{Math.abs(analytics.growth_velocity)}%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Market Saturation</div>
                        <div className="space-y-1">
                          <Progress value={analytics.market_saturation} className="h-2" />
                          <div className="text-sm font-bold">{Math.round(analytics.market_saturation)}%</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Automation Risk</div>
                        <div className="space-y-1">
                          <Progress 
                            value={analytics.automation_risk} 
                            className="h-2"
                            // Red for high risk
                          />
                          <div className="text-sm font-bold">{Math.round(analytics.automation_risk)}%</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Learning ROI</div>
                        <div className="text-lg font-bold text-green-700">{analytics.learning_roi_score}/100</div>
                      </div>
                    </div>

                    {analytics.geographic_hotspots.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Geographic Hotspots:</div>
                        <div className="flex flex-wrap gap-2">
                          {analytics.geographic_hotspots.slice(0, 4).map((hotspot) => (
                            <Badge key={hotspot.location} variant="outline" className="text-xs">
                              {hotspot.location} ({hotspot.demand_score})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-500" />
                Market Timing Insights ({dashboard.timing_insights.length} trends)
              </CardTitle>
              <CardDescription>
                Optimal timing for learning trending technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.timing_insights.map((timing) => (
                  <div key={timing.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{timing.skill_or_trend}</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {timing.market_phase} phase • {timing.optimal_entry_timing}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getUrgencyColor(timing.learning_window_urgency)}`} />
                        <Badge className={
                          timing.learning_window_urgency === 'critical' ? 'bg-red-100 text-red-800' :
                          timing.learning_window_urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          timing.learning_window_urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {timing.learning_window_urgency} urgency
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Adoption Progress</div>
                        <div className="space-y-1">
                          <Progress value={timing.adoption_curve_position} className="h-2" />
                          <div className="text-sm font-bold">{Math.round(timing.adoption_curve_position)}%</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Competition Level</div>
                        <div className="space-y-1">
                          <Progress value={timing.competitive_intensity} className="h-2" />
                          <div className="text-sm font-bold">{timing.competitive_intensity}/100</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">Disruption Risk</div>
                        <div className="text-lg font-bold text-orange-700">{Math.round(timing.market_disruption_risk)}%</div>
                      </div>
                    </div>

                    {timing.historical_patterns.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Historical Context:</div>
                        <div className="text-sm italic text-gray-700">
                          {timing.historical_patterns.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                High-Value Skill Combinations ({dashboard.skill_combinations.length} combos)
              </CardTitle>
              <CardDescription>
                Skill combinations that command market premiums
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.skill_combinations.map((combo) => (
                  <div key={combo.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-1">
                        {combo.skill_combination.map((skill) => (
                          <Badge key={skill} className="bg-indigo-100 text-indigo-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{Math.round(combo.market_premium_percentage)}%
                        </div>
                        <div className="text-xs text-gray-600">salary premium</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Job Availability</div>
                        <div className="flex items-center gap-2">
                          <Progress value={combo.job_availability_score} className="h-2 flex-1" />
                          <span className="text-sm font-bold">{combo.job_availability_score}/100</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Trend Direction</div>
                        <Badge className={
                          combo.trend_direction === 'rising' ? 'bg-green-100 text-green-800' :
                          combo.trend_direction === 'stable' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {combo.trend_direction}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Experience Levels</div>
                        <div className="flex flex-wrap gap-1">
                          {combo.experience_levels.map((level) => (
                            <Badge key={level} variant="outline" className="text-xs">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Typical Roles:</div>
                        <div className="text-sm">{combo.typical_roles.join(', ')}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Top Companies:</div>
                        <div className="text-sm">{combo.companies_demanding.slice(0, 5).join(', ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 