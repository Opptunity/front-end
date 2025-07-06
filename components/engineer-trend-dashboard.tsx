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
  Target, 
  TrendingUp, 
  Star, 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Users,
  Zap,
  Heart,
  Plus,
  X,
  ExternalLink,
  BarChart3,
  Trophy,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { EngineerTrendDashboard, EngineerTrendFocus, EngineerTrendRecommendation } from '@/lib/types/engineer-ranking'

interface EngineerTrendDashboardProps {
  engineerId: number
  className?: string
}

export default function EngineerTrendDashboardComponent({ engineerId, className = '' }: EngineerTrendDashboardProps) {
  const [dashboard, setDashboard] = useState<EngineerTrendDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const generateInitialRecommendations = async (currentSkills: string[]) => {
    try {
      console.log('🔄 Auto-generating recommendations for engineer:', engineerId);
      console.log('📋 Current skills:', currentSkills);
      
      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_recommendations',
          engineer_id: engineerId,
          current_skills: currentSkills,
          include_emerging_trends: true,
          time_availability: 5 // Default 5 hours per week
        }),
      })

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Recommendations generated successfully:', result);
        
        // Refresh the dashboard data to show new recommendations
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          console.log('📊 Dashboard refreshed with new data:', data);
          setDashboard(data)
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to generate recommendations:', response.status, errorData);
      }
    } catch (error) {
      console.error('💥 Error generating initial recommendations:', error)
    }
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Fetched dashboard data:', data);
          setDashboard(data)
          
          // Auto-generate recommendations if none exist and engineer has skills
          const hasNoRecommendations = !data.recommendations || data.recommendations.length === 0;
          const hasSkills = data.engineer_info?.current_skills?.length > 0;
          
          console.log('🔍 Auto-generation check:');
          console.log('  - Has no recommendations:', hasNoRecommendations);
          console.log('  - Has skills:', hasSkills, data.engineer_info?.current_skills?.length || 0);
          
          if (hasNoRecommendations && hasSkills) {
            console.log('🚀 Triggering auto-generation of recommendations...');
            setTimeout(() => {
              generateInitialRecommendations(data.engineer_info.current_skills)
            }, 1000) // Small delay to avoid immediate re-render
          } else {
            console.log('⏸️ Skipping auto-generation');
          }
        } else {
          console.error('Failed to fetch engineer trends dashboard')
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [engineerId])

  const handleDismissRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'dismiss_recommendation',
          recommendation_id: recommendationId
        }),
      })

      if (response.ok) {
        // Remove recommendation from local state
        setDashboard(prev => prev ? {
          ...prev,
          recommendations: prev.recommendations.filter(rec => rec.id !== recommendationId)
        } : null)
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error)
    }
  }

  const handleGenerateRecommendations = async () => {
    try {
      setIsLoading(true)
      toast.loading('Generating personalized recommendations...', { id: 'generate-recommendations' })
      console.log('🎯 Manual recommendation generation for engineer:', engineerId);
      
      const currentSkills = dashboard?.engineer_info?.current_skills || [];
      console.log('📋 Available skills for recommendations:', currentSkills);
      
      // If no skills are available, use general popular trends
      const skillsToUse = currentSkills.length > 0 ? currentSkills : ['JavaScript', 'Python', 'React'];
      
      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_recommendations',
          engineer_id: engineerId,
          current_skills: skillsToUse,
          include_emerging_trends: true,
          time_availability: 5 // Default 5 hours per week
        }),
      })

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Manual recommendations generated:', result);
        
        // Refresh the dashboard data to show new recommendations
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          console.log('📊 Dashboard updated with recommendations:', data);
          setDashboard(data)
          
          const recommendationCount = data.recommendations?.length || 0;
          toast.success(`Successfully generated ${recommendationCount} personalized recommendations!`, { 
            id: 'generate-recommendations' 
          })
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to generate recommendations:', response.status, errorData);
        toast.error('Failed to generate recommendations. Please try again.', { 
          id: 'generate-recommendations' 
        })
      }
    } catch (error) {
      console.error('💥 Error generating recommendations:', error)
      toast.error('An error occurred while generating recommendations.', { 
        id: 'generate-recommendations' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToFocus = async (recommendation: any) => {
    try {
      console.log('🎯 Adding trend to focus:', recommendation.trend_name);
      
      // Check if this trend is already in focus
      const alreadyFocused = dashboard?.active_trends?.some(
        trend => trend.trend_id === recommendation.trend_id
      );
      
      if (alreadyFocused) {
        toast.error(`${recommendation.trend_name} is already in your active trends!`);
        return;
      }

      toast.loading('Adding trend to your focus...', { id: 'add-focus' });

      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_trend_focus',
          engineer_id: engineerId,
          trend_id: recommendation.trend_id,
          trend_name: recommendation.trend_name,
          focus_reason: `Added from AI recommendation: ${recommendation.recommendation_reason}`,
          priority_level: 'medium',
          target_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months from now
          learning_goals: []
        }),
      })

      if (response.ok) {
        console.log('✅ Successfully added trend to focus');
        
        // Remove the recommendation from local state to prevent re-adding
        setDashboard(prev => prev ? {
          ...prev,
          recommendations: prev.recommendations.filter(rec => rec.trend_id !== recommendation.trend_id)
        } : null);
        
        // Refresh the dashboard data to show new trend focus
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboard(data)
          
          toast.success(`${recommendation.trend_name} added to your active trends!`, { 
            id: 'add-focus' 
          });
          
          // Switch to active trends tab to show the newly added focus
          setActiveTab('active-trends')
        }
      } else if (response.status === 409) {
        // Conflict - trend already exists
        const errorData = await response.json();
        console.log('⚠️ Trend already in focus:', errorData);
        
        // Remove the recommendation from UI since it's already focused
        setDashboard(prev => prev ? {
          ...prev,
          recommendations: prev.recommendations.filter(rec => rec.trend_id !== recommendation.trend_id)
        } : null);
        
        toast.error(`${recommendation.trend_name} is already in your active trends!`, { 
          id: 'add-focus' 
        });
        
        // Switch to active trends to show existing focus
        setActiveTab('active-trends');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to add trend to focus:', errorData);
        toast.error('Failed to add trend to focus. Please try again.', { 
          id: 'add-focus' 
        });
      }
    } catch (error) {
      console.error('💥 Error adding trend to focus:', error)
      toast.error('An error occurred while adding the trend.', { 
        id: 'add-focus' 
      });
    }
  }

  const handleCleanupDuplicates = async () => {
    try {
      console.log('🧹 Cleaning up duplicate trend focuses...');
      toast.loading('Cleaning up duplicates...', { id: 'cleanup' });

      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cleanup_duplicates',
          engineer_id: engineerId
        }),
      })

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cleanup completed:', result);
        
        // Refresh the dashboard
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboard(data)
        }
        
        if (result.duplicates_removed > 0) {
          toast.success(`Removed ${result.duplicates_removed} duplicate trend focuses!`, { 
            id: 'cleanup' 
          });
        } else {
          toast.success('No duplicates found - your data is clean!', { 
            id: 'cleanup' 
          });
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to cleanup duplicates:', errorData);
        toast.error('Failed to cleanup duplicates. Please try again.', { 
          id: 'cleanup' 
        });
      }
    } catch (error) {
      console.error('💥 Error cleaning up duplicates:', error)
      toast.error('An error occurred during cleanup.', { 
        id: 'cleanup' 
      });
    }
  }

  const handleViewResources = async (trend: any) => {
    try {
      console.log('📚 Generating learning resources for:', trend.trend_name);
      toast.loading('Finding learning resources...', { id: 'resources' });

      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_learning_resources',
          engineer_id: engineerId,
          trend_id: trend.trend_id,
          trend_name: trend.trend_name
        }),
      })

      if (response.ok) {
        const resources = await response.json();
        console.log('✅ Resources found:', resources);
        
        toast.success('Resources generated! Check the Activities tab.', { 
          id: 'resources' 
        });
        
        // Refresh dashboard to show new resources
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboard(data)
          setActiveTab('activities') // Switch to activities to see the resources
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to get resources:', errorData);
        toast.error('Failed to find resources. Please try again.', { 
          id: 'resources' 
        });
      }
    } catch (error) {
      console.error('💥 Error getting resources:', error)
      toast.error('An error occurred while finding resources.', { 
        id: 'resources' 
      });
    }
  }

  const handleTrackProgress = async (trend: any) => {
    try {
      console.log('📈 Updating progress for:', trend.trend_name);
      
      // Prompt user for new progress value
      const newProgressStr = prompt(
        `Update progress for "${trend.trend_name}".\n\nCurrent progress: ${trend.current_progress}%\n\nEnter new progress (0-100):`,
        trend.current_progress.toString()
      );
      
      if (newProgressStr === null) return; // User cancelled
      
      const newProgress = parseInt(newProgressStr);
      if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
        toast.error('Please enter a valid progress value between 0 and 100.');
        return;
      }

      toast.loading('Updating progress...', { id: 'progress' });

      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_progress',
          engineer_id: engineerId,
          trend_focus_id: trend.id,
          new_progress: newProgress,
          activity_description: `Progress updated to ${newProgress}%`
        }),
      })

      if (response.ok) {
        console.log('✅ Progress updated successfully');
        
        // Refresh dashboard to show updated progress
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboard(data)
        }
        
        toast.success(`Progress updated to ${newProgress}%!`, { 
          id: 'progress' 
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update progress:', errorData);
        toast.error('Failed to update progress. Please try again.', { 
          id: 'progress' 
        });
      }
    } catch (error) {
      console.error('💥 Error updating progress:', error)
      toast.error('An error occurred while updating progress.', { 
        id: 'progress' 
      });
    }
  }

  const handleCreateSampleActivities = async () => {
    try {
      console.log('📚 Creating sample activities...');
      toast.loading('Creating sample activities...', { id: 'sample-activities' });

      const response = await fetch('/api/engineer-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_sample_activities',
          engineer_id: engineerId
        }),
      })

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sample activities created:', result);
        
        // Refresh dashboard to show new activities
        const dashboardResponse = await fetch(`/api/engineer-trends?engineer_id=${engineerId}`)
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json()
          setDashboard(data)
          
          // Switch to activities tab to show the new activities
          setActiveTab('activities')
        }
        
        toast.success(`Created ${result.activities?.length || 5} sample learning activities!`, { 
          id: 'sample-activities' 
        });
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create sample activities:', errorData);
        toast.error('Failed to create sample activities. Please try again.', { 
          id: 'sample-activities' 
        });
      }
    } catch (error) {
      console.error('💥 Error creating sample activities:', error)
      toast.error('An error occurred while creating activities.', { 
        id: 'sample-activities' 
      });
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'dropped': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
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
              {Array.from({ length: 3 }).map((_, i) => (
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
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Your IT Trends Dashboard</h3>
        <p className="text-gray-600 mb-6">
          Get personalized trend recommendations based on your skills and career goals.
        </p>
        <Button onClick={handleGenerateRecommendations} disabled={isLoading} size="lg">
          <Zap className="h-4 w-4 mr-2" />
          {isLoading ? 'Setting up your dashboard...' : 'Setup My Dashboard'}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Your Learning Progress</h3>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {dashboard.recommendations?.length > 0 
                ? `${dashboard.recommendations.length} recommendations available`
                : 'Generate recommendations to get started'
              }
            </p>
            {dashboard.engineer_info?.professional_field && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                🎯 {dashboard.engineer_info.professional_field.replace('_', ' ').toUpperCase()} Focus
              </Badge>
            )}
          </div>
        </div>
                 <div className="flex gap-2">
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => window.location.reload()}
             disabled={isLoading}
           >
             <RefreshCw className="h-4 w-4 mr-2" />
             Refresh
           </Button>
           {(!dashboard.recommendations || dashboard.recommendations.length === 0) && (
             <Button 
               size="sm" 
               onClick={handleGenerateRecommendations}
               disabled={isLoading}
             >
               <Zap className="h-4 w-4 mr-2" />
               {isLoading ? 'Generating...' : 'Get Recommendations'}
             </Button>
           )}
           {dashboard.active_trends.length > 1 && (
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleCleanupDuplicates}
               disabled={isLoading}
             >
               🧹 Clean Duplicates
             </Button>
           )}
           {dashboard.recent_activities.length === 0 && (
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleCreateSampleActivities}
               disabled={isLoading}
             >
               📚 Add Sample Activities
             </Button>
           )}
         </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trends</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.progress_summary.total_active_trends}</div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.progress_summary.completed_trends}</div>
            <p className="text-xs text-muted-foreground">Trends mastered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.progress_summary.total_learning_hours}</div>
            <p className="text-xs text-muted-foreground">Total invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Gained</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.progress_summary.skills_gained_this_month}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active-trends">Active Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Trends Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                Currently Focused Trends
              </CardTitle>
              <CardDescription>
                Your active learning focuses and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.active_trends.length === 0 ? (
                <div className="text-center py-6">
                  <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No active trend focuses yet</p>
                  <p className="text-sm text-gray-500">Add trends you want to focus on to track your progress</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.active_trends.slice(0, 3).map((trend) => (
                    <div key={trend.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{trend.trend_name}</h4>
                          <Badge className={getPriorityColor(trend.priority_level)}>
                            {trend.priority_level}
                          </Badge>
                        </div>
                        <Progress value={trend.current_progress} className="w-full mb-2" />
                        <p className="text-sm text-gray-600">{trend.current_progress}% complete</p>
                      </div>
                      <div className="ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setActiveTab('active-trends')}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {dashboard.active_trends.length > 3 && (
                    <Button variant="link" onClick={() => setActiveTab('active-trends')}>
                      View all {dashboard.active_trends.length} active trends →
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Recent Learning Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recent_activities.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No activities recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.recent_activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.activity_title}</p>
                        <p className="text-xs text-gray-600">
                          {activity.activity_type.replace('_', ' ')} • {new Date(activity.activity_date).toLocaleDateString()}
                        </p>
                      </div>
                      {activity.skills_gained.length > 0 && (
                        <div className="flex gap-1">
                          {activity.skills_gained.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {activity.skills_gained.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{activity.skills_gained.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-trends" className="space-y-4">
          {dashboard.active_trends.map((trend) => (
            <Card key={trend.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {trend.trend_name}
                      <Badge className={getPriorityColor(trend.priority_level)}>
                        {trend.priority_level}
                      </Badge>
                    </CardTitle>
                    {trend.focus_reason && (
                      <CardDescription>{trend.focus_reason}</CardDescription>
                    )}
                  </div>
                  <Badge className={getStatusColor(trend.status)}>
                    {trend.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-600">{trend.current_progress}%</span>
                    </div>
                    <Progress value={trend.current_progress} className="w-full" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Started:</span>
                      <span className="ml-2">{new Date(trend.started_at).toLocaleDateString()}</span>
                    </div>
                    {trend.target_completion_date && (
                      <div>
                        <span className="text-gray-600">Target Date:</span>
                        <span className="ml-2">{new Date(trend.target_completion_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewResources(trend)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Resources
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleTrackProgress(trend)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Track Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {dashboard.recommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Available</h3>
                <p className="text-gray-600 mb-2">Generate personalized trend recommendations based on your skills and professional field.</p>
                {dashboard.engineer_info?.professional_field && (
                  <p className="text-sm text-blue-600 mb-4">
                    🎯 Trends will be filtered for <strong>{dashboard.engineer_info.professional_field.replace('_', ' ')}</strong> relevance
                  </p>
                )}
                <Button onClick={handleGenerateRecommendations} disabled={isLoading}>
                  <Zap className="h-4 w-4 mr-2" />
                  {isLoading ? 'Generating...' : 'Generate Recommendations'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            dashboard.recommendations.map((recommendation) => {
              const isAlreadyFocused = dashboard.active_trends.some(
                trend => trend.trend_id === recommendation.trend_id
              );

              return (
                <Card key={recommendation.id} className={isAlreadyFocused ? 'border-green-200 bg-green-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {recommendation.trend_name}
                          {isAlreadyFocused && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              In Focus
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{recommendation.recommendation_reason}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {recommendation.relevance_score}% match
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismissRecommendation(recommendation.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{recommendation.market_alignment_score}%</div>
                        <div className="text-xs text-gray-600">Market Alignment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{recommendation.career_impact_score}%</div>
                        <div className="text-xs text-gray-600">Career Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">{recommendation.estimated_learning_time}</div>
                        <div className="text-xs text-gray-600">Time to Learn</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isAlreadyFocused ? (
                        <Button size="sm" variant="outline" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already in Focus
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleAddToFocus(recommendation)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Focus
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`https://google.com/search?q=${encodeURIComponent(recommendation.trend_name + ' tutorial guide documentation')}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {dashboard.recent_activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{activity.activity_title}</CardTitle>
                    <CardDescription>
                      {activity.activity_type.replace('_', ' ')} • {new Date(activity.activity_date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {activity.completion_percentage < 100 && (
                    <Badge variant="outline">
                      {activity.completion_percentage}% complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {activity.activity_description && (
                  <p className="text-gray-600 mb-3">{activity.activity_description}</p>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {activity.provider && (
                      <span>Provider: {activity.provider}</span>
                    )}
                    {activity.time_spent_hours && (
                      <span>Time: {activity.time_spent_hours}h</span>
                    )}
                  </div>
                </div>

                {activity.skills_gained.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills Gained:</p>
                    <div className="flex flex-wrap gap-1">
                      {activity.skills_gained.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {activity.activity_url && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <a href={activity.activity_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Resource
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
} 