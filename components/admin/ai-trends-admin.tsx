"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RefreshCw, 
  Zap, 
  BarChart3, 
  Clock, 
  Database, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

interface CacheStats {
  trends: boolean
  categoryTrends: number
  categories: boolean
  recommendations: number
  learningPaths: number
  marketAnalysis: number
  generationInProgress: number
  totalSize: number
  lastGenerated?: string
}

export default function AITrendsAdmin() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string>('')
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Fetch cache stats
  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/it-trends?category=all')
      const data = await response.json()
      setCacheStats(data.cacheStats)
    } catch (error) {
      console.error('Error fetching cache stats:', error)
    }
  }

  // Force regenerate all trends
  const forceRegenerate = async () => {
    setIsLoading(true)
    setLastAction('Regenerating all trends...')
    try {
      const response = await fetch('/api/it-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force-regenerate' })
      })
      
      const result = await response.json()
      if (response.ok) {
        setActionResult({
          type: 'success',
          message: `Successfully generated ${result.trendsCount} trends`
        })
        await fetchCacheStats()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setActionResult({
        type: 'error',
        message: `Failed to regenerate trends: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsLoading(false)
      setLastAction('')
    }
  }

  // Refresh market data
  const refreshMarketData = async () => {
    setIsLoading(true)
    setLastAction('Refreshing market data...')
    try {
      const response = await fetch('/api/it-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-market-data' })
      })
      
      const result = await response.json()
      if (response.ok) {
        setActionResult({
          type: 'success',
          message: 'Market data refreshed successfully'
        })
        await fetchCacheStats()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setActionResult({
        type: 'error',
        message: `Failed to refresh market data: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsLoading(false)
      setLastAction('')
    }
  }

  // Test category filtering (no AI generation needed)
  const testCategoryFiltering = async (category: string) => {
    setIsLoading(true)
    setLastAction(`Filtering ${category} trends...`)
    try {
      const response = await fetch(`/api/it-trends?category=${category}`)
      const result = await response.json()
      
      if (response.ok) {
        setActionResult({
          type: 'success',
          message: `Filtered ${result.totalTrends} ${category} trends from comprehensive cache`
        })
        await fetchCacheStats()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setActionResult({
        type: 'error',
        message: `Failed to filter ${category} trends: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsLoading(false)
      setLastAction('')
    }
  }

  useEffect(() => {
    fetchCacheStats()
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchCacheStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getHealthStatus = () => {
    if (!cacheStats) return { status: 'unknown', color: 'bg-gray-500' }
    
    if (cacheStats.generationInProgress > 0) {
      return { status: 'generating', color: 'bg-blue-500' }
    }
    
    if (cacheStats.trends) {
      return { status: 'healthy', color: 'bg-green-500' }
    }
    
    return { status: 'needs-generation', color: 'bg-yellow-500' }
  }

  const health = getHealthStatus()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Trends Administration</h1>
          <p className="text-gray-600 mt-1">Manage and monitor AI-generated IT trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${health.color}`}></div>
          <Badge variant="outline" className="capitalize">
            {health.status.replace('-', ' ')}
          </Badge>
        </div>
      </div>

      {/* Action Result */}
      {actionResult && (
        <Card className={`border-l-4 ${
          actionResult.type === 'success' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {actionResult.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={actionResult.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {actionResult.message}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trends Cache</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.trends ? 'Active' : 'Empty'}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.lastGenerated ? (
                `Generated ${new Date(cacheStats.lastGenerated).toLocaleTimeString()}`
              ) : (
                'Not generated yet'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category Caches</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.categoryTrends || 0}</div>
            <p className="text-xs text-muted-foreground">Category-specific caches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Operations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats?.generationInProgress || 0}</div>
            <p className="text-xs text-muted-foreground">AI generations in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats ? formatBytes(cacheStats.totalSize) : '0 B'}
            </div>
            <p className="text-xs text-muted-foreground">Total memory usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Generation Controls
            </CardTitle>
            <CardDescription>
              Manage AI-powered trend generation and refresh cycles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={forceRegenerate}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading && lastAction.includes('Regenerating') ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Force Regenerate All Trends
            </Button>
            
            <Button 
              onClick={refreshMarketData}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading && lastAction.includes('Refreshing') ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              Refresh Market Data
            </Button>

            <Button 
              onClick={fetchCacheStats}
              variant="ghost" 
              className="w-full"
            >
              <Clock className="mr-2 h-4 w-4" />
              Refresh Cache Stats
            </Button>
          </CardContent>
        </Card>

        {/* Category Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Filtering
            </CardTitle>
            <CardDescription>
              Test category filtering from comprehensive AI-generated trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {['frontend', 'backend', 'ai/ml', 'devops', 'cloud', 'emerging'].map(category => (
                <Button
                  key={category}
                  onClick={() => testCategoryFiltering(category)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="capitalize"
                >
                  {isLoading && lastAction.includes(category) ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : null}
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Action */}
      {isLoading && lastAction && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{lastAction}</p>
                <p className="text-sm text-blue-700">This may take 30-60 seconds...</p>
              </div>
            </div>
            <Progress value={undefined} className="mt-3" />
          </CardContent>
        </Card>
      )}
    </div>
  )
} 