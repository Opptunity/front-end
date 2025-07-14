"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Search, 
  Filter,
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  BookOpen,
  Star,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
  Plus,
  Check,
  Loader2,
  Heart,
  X,
  Calculator,
  RotateCcw
} from 'lucide-react'
import { MarketIntelligenceClient, getSkillMarketOverview } from '@/lib/market-intelligence-client'
import { SkillMarketAnalytics, MarketTimingInsights } from '@/lib/types/engineer-ranking'

export type ITTrend = {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'ai/ml' | 'devops' | 'mobile' | 'web3' | 'security' | 'cloud' | 'data' | 'emerging'
  description: string
  popularity: 'rising' | 'hot' | 'stable' | 'declining'
  relevance: 'high' | 'medium' | 'low'
  skills: string[]
  learningResources: Array<{
    type: 'documentation' | 'course' | 'tutorial' | 'book' | 'certification'
    title: string
    url: string
    provider: string
  }>
  marketDemand: {
    jobOpenings: number
    salaryRange: string
    growthRate: string
  }
  timeToLearn: string
  prerequisites: string[]
  relatedTechnologies: string[]
  lastUpdated: string
}

interface ITTrendsExplorerProps {
  userSkills?: string[]
  userIndustry?: string
  personalized?: boolean
  engineerId?: number // Added for engineer integration
  showFocusActions?: boolean // Added to show/hide focus buttons
  showMarketIntelligence?: boolean // New prop to enable market intelligence
}

const getCategoryIcon = (category: string) => {
  const iconClass = "h-4 w-4"
  switch (category) {
    case 'all': return <Target className={iconClass} />
    case 'frontend': return <Zap className={iconClass} />
    case 'backend': return <BarChart3 className={iconClass} />
    case 'ai/ml': return <Star className={iconClass} />
    case 'devops': return <Users className={iconClass} />
    case 'mobile': return <TrendingUp className={iconClass} />
    case 'web3': return <Flame className={iconClass} />
    case 'security': return <BookOpen className={iconClass} />
    case 'cloud': return <ChevronRight className={iconClass} />
    case 'data': return <BarChart3 className={iconClass} />
    case 'emerging': return <Star className={iconClass} />
    default: return <Target className={iconClass} />
  }
}

const popularityConfig = {
  hot: { icon: 'Flame', color: 'text-red-500', label: 'Hot' },
  rising: { icon: 'TrendingUp', color: 'text-green-500', label: 'Rising' },
  stable: { icon: 'BarChart3', color: 'text-blue-500', label: 'Stable' },
  declining: { icon: 'TrendingDown', color: 'text-gray-500', label: 'Declining' }
}

const relevanceConfig = {
  high: { color: 'bg-green-100 text-green-800', label: 'High Relevance' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Relevance' },
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low Relevance' }
}

export default function ITTrendsExplorer({ 
  userSkills = [], 
  userIndustry = 'technology', 
  personalized = false,
  engineerId,
  showFocusActions = false,
  showMarketIntelligence = true
}: ITTrendsExplorerProps) {
  const [trends, setTrends] = useState<ITTrend[]>([])
  const [filteredTrends, setFilteredTrends] = useState<ITTrend[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTrend, setSelectedTrend] = useState<ITTrend | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [focusLoading, setFocusLoading] = useState<string | null>(null) // Track which trend is being focused
  const [engineerFocusedTrends, setEngineerFocusedTrends] = useState<string[]>([]) // Track focused trends
  const [marketData, setMarketData] = useState<Record<string, {
    analytics?: SkillMarketAnalytics;
    timing?: MarketTimingInsights;
    roi_calculated?: boolean;
  }>>({})
  const [loadingMarketData, setLoadingMarketData] = useState<Record<string, boolean>>({})

  // Frontend cache for comprehensive trends
  const [comprehensiveTrends, setComprehensiveTrends] = useState<ITTrend[]>([])
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [fetchInProgress, setFetchInProgress] = useState(false)
  
  // Cache duration: 5 minutes (to allow some frontend caching but still refresh periodically)
  const FRONTEND_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Fetch comprehensive trends (only when cache is empty or expired)
  const fetchComprehensiveTrends = async (forceRefresh: boolean = false) => {
    const now = Date.now()
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && comprehensiveTrends.length > 0 && (now - lastFetchTime) < FRONTEND_CACHE_DURATION) {
      console.log('Using cached comprehensive trends')
      return comprehensiveTrends
    }

    // Don't make multiple concurrent requests
    if (fetchInProgress) {
      console.log('Fetch already in progress, waiting...')
      return comprehensiveTrends
    }

    try {
      setFetchInProgress(true)
      console.log('Fetching comprehensive trends from API...')
      
      const params = new URLSearchParams()
      
      // Only include personalization if enabled
      if (personalized && userSkills.length > 0) {
        params.append('personalize', 'true')
        params.append('skills', userSkills.join(','))
        params.append('industry', userIndustry)
      }

      const response = await fetch(`/api/it-trends?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      const allTrends = data.trends || []
      
      // Cache the comprehensive trends
      setComprehensiveTrends(allTrends)
      setLastFetchTime(now)
      setCategories(data.categories || [])
      setLastUpdated(data.lastUpdated || '')
      
      console.log(`Cached ${allTrends.length} comprehensive trends`)
      return allTrends
      
    } catch (error) {
      console.error('Error fetching comprehensive trends:', error)
      return comprehensiveTrends // Return cached data on error
    } finally {
      setFetchInProgress(false)
    }
  }

  // Filter trends by category (client-side, instant)
  const getFilteredTrends = (allTrends: ITTrend[], category: string): ITTrend[] => {
    if (category === 'all') {
      return allTrends
    }
    
    const filtered = allTrends.filter(trend => trend.category === category)
    console.log(`Filtered ${filtered.length} trends for category: ${category}`)
    return filtered
  }

  // Initial load: fetch comprehensive trends
  useEffect(() => {
    let isCancelled = false

    const loadTrends = async () => {
      setIsLoading(true)
      try {
        const allTrends = await fetchComprehensiveTrends()
        
        if (!isCancelled) {
          // Filter by selected category
          const filtered = getFilteredTrends(allTrends, selectedCategory)
          setTrends(filtered)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading trends:', error)
          setTrends([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTrends()

    return () => {
      isCancelled = true
    }
  }, [personalized, userSkills, userIndustry]) // Removed selectedCategory from deps!

  // Handle category changes (client-side filtering, no API call)
  useEffect(() => {
    if (comprehensiveTrends.length > 0) {
      console.log(`Switching to category: ${selectedCategory} (client-side filter)`)
      const filtered = getFilteredTrends(comprehensiveTrends, selectedCategory)
      setTrends(filtered)
    }
  }, [selectedCategory, comprehensiveTrends])

  // Filter trends based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTrends(trends)
      return
    }

    const filtered = trends.filter(trend =>
      trend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredTrends(filtered)
  }, [trends, searchQuery])

  // Fetch engineer's focused trends if engineer ID is provided
  useEffect(() => {
    if (engineerId && showFocusActions) {
      const fetchFocusedTrends = async () => {
        try {
          const response = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
          if (response.ok) {
            const data = await response.json()
            const focusedTrendIds = data.active_trends?.map((trend: any) => trend.trend_id) || []
            setEngineerFocusedTrends(focusedTrendIds)
          }
        } catch (error) {
          console.error('Error fetching focused trends:', error)
        }
      }
      fetchFocusedTrends()
    }
  }, [engineerId, showFocusActions])

  // Load market intelligence data for visible trends
  // DISABLED: Causing refresh loops due to missing database tables
  // useEffect(() => {
  //   if (showMarketIntelligence && filteredTrends.length > 0) {
  //     loadMarketIntelligenceForTrends(filteredTrends.slice(0, 10)) // Load for first 10 trends
  //   }
  // }, [filteredTrends, showMarketIntelligence])

  const loadMarketIntelligenceForTrends = async (trendsToLoad: ITTrend[]) => {
    for (const trend of trendsToLoad) {
      // Skip if already loaded
      if (marketData[trend.id]) continue

      setLoadingMarketData(prev => ({ ...prev, [trend.id]: true }))
      
      try {
        // Load market overview for the primary skill of the trend
        const primarySkill = trend.skills[0]
        if (primarySkill) {
          const overview = await getSkillMarketOverview(primarySkill)
          setMarketData(prev => ({
            ...prev,
            [trend.id]: {
              analytics: overview.analytics,
              timing: overview.timing,
              roi_calculated: false
            }
          }))
        }
      } catch (error) {
        console.error(`Failed to load market data for ${trend.name}:`, error)
      } finally {
        setLoadingMarketData(prev => ({ ...prev, [trend.id]: false }))
      }
    }
  }

  const calculateROIForTrend = async (trend: ITTrend) => {
    if (!engineerId) return

    try {
      setLoadingMarketData(prev => ({ ...prev, [trend.id]: true }))
      
      const primarySkill = trend.skills[0]
      const roiResult = await MarketIntelligenceClient.calculateROI(
        engineerId, 
        primarySkill,
        undefined, // Will use default current salary
        'Global'
      )

      setMarketData(prev => ({
        ...prev,
        [trend.id]: {
          ...prev[trend.id],
          roi_calculated: true
        }
      }))

      // Show ROI in a toast or modal
      console.log(`ROI for ${trend.name}:`, roiResult.roi_analysis)
      
    } catch (error) {
      console.error(`Failed to calculate ROI for ${trend.name}:`, error)
    } finally {
      setLoadingMarketData(prev => ({ ...prev, [trend.id]: false }))
    }
  }

  // Handle adding trend to focus
  const handleAddTrendFocus = async (trend: ITTrend, focusReason?: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!engineerId) return

    setFocusLoading(trend.id)
    try {
      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_trend_focus',
          engineer_id: engineerId,
          trend_id: trend.id,
          trend_name: trend.name,
          focus_reason: focusReason,
          priority_level: priority,
          selected_skills: trend.skills.slice(0, 5), // Focus on first 5 skills
          learning_goals: trend.skills.slice(0, 3).map(skill => ({
            skill_name: skill,
            current_level: 1,
            target_level: 3
          }))
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEngineerFocusedTrends(prev => [...prev, trend.id])
        // Could show a success toast here
        console.log('Successfully added trend focus:', data.message)
      } else {
        throw new Error('Failed to add trend focus')
      }
    } catch (error) {
      console.error('Error adding trend focus:', error)
      // Could show an error toast here
    } finally {
      setFocusLoading(null)
    }
  }

  // Handle removing trend from focus
  const handleRemoveTrendFocus = async (trendId: string) => {
    if (!engineerId) return

    // This would require additional API endpoint for removing focus
    // For now, just update the UI
    setEngineerFocusedTrends(prev => prev.filter(id => id !== trendId))
  }

  // Manual refresh handler
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered')
    setIsLoading(true)
    try {
      const allTrends = await fetchComprehensiveTrends(true) // Force refresh
      const filtered = getFilteredTrends(allTrends, selectedCategory)
      setTrends(filtered)
    } catch (error) {
      console.error('Error during manual refresh:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const TrendCard = ({ trend }: { trend: ITTrend }) => {
    const popularityInfo = popularityConfig[trend.popularity]
    const relevanceInfo = relevanceConfig[trend.relevance]
    const isFocused = engineerFocusedTrends.includes(trend.id)
    const isLoading = focusLoading === trend.id
    const trendMarketData = marketData[trend.id]
    const isLoadingMarketData = loadingMarketData[trend.id]

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`h-full transition-all ${
          isFocused ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/50' : 'hover:shadow-lg'
        }`}>
          {/* Card Header with focus status indicator */}
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedTrend(trend)}>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {trend.name}
                  </CardTitle>
                  {isFocused && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Focused
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1 line-clamp-2">
                  {trend.description}
                </CardDescription>
              </div>
              
              {/* Market Intelligence Indicators */}
              {showMarketIntelligence && (
                <div className="flex flex-col gap-1 ml-4">
                  {trendMarketData?.analytics && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        trendMarketData.analytics.demand_score >= 80 ? 'border-green-500 text-green-700' :
                        trendMarketData.analytics.demand_score >= 60 ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }`}
                    >
                      {trendMarketData.analytics.demand_score}/100 demand
                    </Badge>
                  )}
                  
                  {trendMarketData?.timing && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        trendMarketData.timing.learning_window_urgency === 'critical' ? 'border-red-500 text-red-700' :
                        trendMarketData.timing.learning_window_urgency === 'high' ? 'border-orange-500 text-orange-700' :
                        trendMarketData.timing.learning_window_urgency === 'medium' ? 'border-yellow-500 text-yellow-700' :
                        'border-green-500 text-green-700'
                      }`}
                    >
                      {trendMarketData.timing.learning_window_urgency} urgency
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {popularityInfo.icon === 'Flame' && <Flame className={`h-4 w-4 ${popularityInfo.color}`} />}
                {popularityInfo.icon === 'TrendingUp' && <TrendingUp className={`h-4 w-4 ${popularityInfo.color}`} />}
                {popularityInfo.icon === 'BarChart3' && <BarChart3 className={`h-4 w-4 ${popularityInfo.color}`} />}
                {popularityInfo.icon === 'TrendingDown' && <TrendingDown className={`h-4 w-4 ${popularityInfo.color}`} />}
                <span className="capitalize">{trend.popularity}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="capitalize">{trend.relevance} relevance</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Enhanced Market Intelligence Section */}
            {showMarketIntelligence && trendMarketData && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Market Intelligence
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {trendMarketData.analytics && (
                    <>
                      <div>
                        <span className="text-gray-600">Demand Score:</span>
                        <div className="font-semibold">{trendMarketData.analytics.demand_score}/100</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Growth:</span>
                        <div className={`font-semibold ${
                          trendMarketData.analytics.growth_velocity > 0 ? 'text-green-600' : 
                          trendMarketData.analytics.growth_velocity < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {trendMarketData.analytics.growth_velocity > 0 ? '+' : ''}{trendMarketData.analytics.growth_velocity}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">ROI Score:</span>
                        <div className="font-semibold text-blue-600">{trendMarketData.analytics.learning_roi_score}/100</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Auto Risk:</span>
                        <div className={`font-semibold ${
                          trendMarketData.analytics.automation_risk > 50 ? 'text-red-600' : 
                          trendMarketData.analytics.automation_risk > 25 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {Math.round(trendMarketData.analytics.automation_risk)}%
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {trendMarketData.timing && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Market Phase:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          trendMarketData.timing.market_phase === 'growth' ? 'border-green-500 text-green-700' :
                          trendMarketData.timing.market_phase === 'emerging' ? 'border-blue-500 text-blue-700' :
                          trendMarketData.timing.market_phase === 'maturity' ? 'border-yellow-500 text-yellow-700' :
                          'border-gray-500 text-gray-700'
                        }`}
                      >
                        {trendMarketData.timing.market_phase}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-600">Best Entry:</span>
                      <span className="font-semibold">{trendMarketData.timing.optimal_entry_timing}</span>
                    </div>
                  </div>
                )}

                {/* ROI Calculation Button - DISABLED due to missing database tables */}
                {/* {engineerId && !trendMarketData.roi_calculated && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      calculateROIForTrend(trend)
                    }}
                    disabled={isLoadingMarketData}
                  >
                    {isLoadingMarketData ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Calculator className="h-3 w-3 mr-1" />
                    )}
                    Calculate ROI
                  </Button>
                )} */}
              </div>
            )}

            {/* Original Skills Section */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Key Skills:</p>
              <div className="flex flex-wrap gap-1">
                {trend.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {trend.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{trend.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {trend.learningResources.length} resource{trend.learningResources.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedTrend(trend)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              {/* Focus Actions */}
              {showFocusActions && engineerId && (
                <div className="flex gap-2">
                  {!isFocused ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddTrendFocus(trend)
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      Focus
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveTrendFocus(trend.id)
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Unfocus
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">IT Trends Explorer</h1>
          <p className="text-gray-600 mt-1">
            Discover the latest trending technologies and concepts in IT
            {lastUpdated && ` • Updated ${new Date(lastUpdated).toLocaleDateString()}`}
            {!isLoading && (
              <span className="ml-2 text-blue-600 font-medium">
                • {filteredTrends.length} trend{filteredTrends.length !== 1 ? 's' : ''} 
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
              </span>
            )}
          </p>
        </div>
        {personalized && selectedCategory === 'all' && (
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Star className="h-4 w-4 mr-1" />
            Personalized for you
          </Badge>
        )}
        {personalized && selectedCategory !== 'all' && (
          <Badge className="bg-gray-100 text-gray-600 border border-gray-300">
            <Target className="h-4 w-4 mr-1" />
            Filtered by {selectedCategory}
          </Badge>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search trends, skills, or technologies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className={`text-xs transition-all ${
                selectedCategory === category 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-1">
                {getCategoryIcon(category)}
                <span className="hidden lg:inline capitalize">{category}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : filteredTrends.length > 0 ? (
              <motion.div
                key="trends-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTrends.map((trend) => (
                  <TrendCard key={trend.id} trend={trend} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trends found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or selecting a different category.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Trend Detail Modal */}
      <Dialog open={!!selectedTrend} onOpenChange={() => setSelectedTrend(null)}>
        {selectedTrend && (
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{selectedTrend.name}</DialogTitle>
                  <DialogDescription className="mt-2 text-base">
                    {selectedTrend.description}
                  </DialogDescription>
                </div>
                <Badge className={`bg-gray-100 text-gray-800 flex items-center gap-1`}>
                  {popularityConfig[selectedTrend.popularity].icon === 'Flame' && <Flame className={`h-3 w-3 ${popularityConfig[selectedTrend.popularity].color}`} />}
                  {popularityConfig[selectedTrend.popularity].icon === 'TrendingUp' && <TrendingUp className={`h-3 w-3 ${popularityConfig[selectedTrend.popularity].color}`} />}
                  {popularityConfig[selectedTrend.popularity].icon === 'BarChart3' && <BarChart3 className={`h-3 w-3 ${popularityConfig[selectedTrend.popularity].color}`} />}
                  {popularityConfig[selectedTrend.popularity].icon === 'TrendingDown' && <TrendingDown className={`h-3 w-3 ${popularityConfig[selectedTrend.popularity].color}`} />}
                  {popularityConfig[selectedTrend.popularity].label}
                </Badge>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Market Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Job Openings</span>
                    <span className="text-sm font-bold">{selectedTrend.marketDemand.jobOpenings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Salary Range</span>
                    <span className="text-sm font-bold">{selectedTrend.marketDemand.salaryRange}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className="text-sm font-bold text-green-600">{selectedTrend.marketDemand.growthRate}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Time to Learn</span>
                    <span className="text-sm font-bold text-blue-600">{selectedTrend.timeToLearn}</span>
                  </div>
                </div>
              </div>

              {/* Skills & Prerequisites */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skills & Prerequisites
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrend.skills.map((skill) => (
                        <Badge key={skill} className="bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Prerequisites:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrend.prerequisites.map((prereq) => (
                        <Badge key={prereq} variant="outline">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTrend.learningResources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-sm group-hover:text-blue-600">{resource.title}</p>
                      <p className="text-xs text-gray-500">{resource.provider} • {resource.type}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  </a>
                ))}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
} 