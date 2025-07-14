"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import PageTransition from "@/components/animations/page-transition"
import ITTrendsExplorer from "@/components/it-trends-explorer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  Star,
  User,
  Settings,
  Sparkles
} from 'lucide-react'

interface UserPreferences {
  skills: string[]
  industry: string
  experienceLevel: string
  interests: string[]
}

export default function ITTrendsPage() {
  const { t, isRTL } = useLanguage()
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    skills: [],
    industry: 'technology',
    experienceLevel: 'mid-level',
    interests: []
  })

  // Load user preferences from localStorage or API
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        setUserPreferences(preferences)
        setIsPersonalized(true)
      } catch (error) {
        console.error('Error loading user preferences:', error)
      }
    }
  }, [])

  const handlePersonalizationToggle = (enabled: boolean) => {
    setIsPersonalized(enabled)
    if (enabled && userPreferences.skills.length === 0) {
      // Open preferences modal or redirect to onboarding
      // For now, we'll use some default skills
      setUserPreferences(prev => ({
        ...prev,
        skills: ['JavaScript', 'React', 'Node.js', 'Python']
      }))
    }
  }

  const trendCategories = [
    {
      icon: <Star className="h-6 w-6" />,
      title: "AI & Machine Learning",
      description: "Latest developments in artificial intelligence",
      color: "from-purple-500 to-pink-500",
      count: "12 trends"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Frontend Technologies",
      description: "Modern UI frameworks and tools",
      color: "from-blue-500 to-cyan-500",
      count: "8 trends"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Backend & Infrastructure",
      description: "Server technologies and cloud platforms",
      color: "from-green-500 to-teal-500",
      count: "10 trends"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Emerging Technologies",
      description: "Cutting-edge innovations and concepts",
      color: "from-orange-500 to-red-500",
      count: "6 trends"
    }
  ]

  const benefits = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Stay Ahead",
      description: "Keep up with the latest technology trends and innovations"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Personalized Insights",
      description: "Get recommendations tailored to your skills and career goals"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Market Intelligence",
      description: "Understand job market demand and salary insights"
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Learning Pathways",
      description: "Discover resources and roadmaps for new technologies"
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir={isRTL ? "rtl" : "ltr"}>
        {/* Simple Header with only Opptunity Logo */}
        <motion.header
          className="border-b border-gray-100 bg-white sticky top-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center">
              <motion.div 
                className="flex items-center" 
                whileHover={{ scale: 1.05 }} 
                transition={{ duration: 0.2 }}
              >
                <Link href="/dashboard" className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">Opptunity</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.header>

          {/* Hero Section */}
          <section className="py-16 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] rounded-full bg-blue-100/30 blur-3xl"></div>
              <div className="absolute -bottom-[30%] -left-[10%] w-[80%] h-[80%] rounded-full bg-indigo-100/30 blur-3xl"></div>
              <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-100/20 blur-3xl"></div>
            </div>

            <div className="container mx-auto relative z-10">
              <motion.div 
                className="text-center max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex justify-center mb-6">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Latest Technology Trends
                  </Badge>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Discover IT Trends & Technologies
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Stay ahead of the curve with AI-powered insights into the latest trending technologies, 
                  market demand, and personalized learning recommendations for your career growth.
                </p>

                {/* Personalization Toggle */}
                <motion.div 
                  className="flex items-center justify-center gap-4 mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-lg border"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Personalized Recommendations</span>
                  <Switch 
                    checked={isPersonalized}
                    onCheckedChange={handlePersonalizationToggle}
                  />
                  {isPersonalized && (
                    <Badge className="bg-green-100 text-green-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </motion.div>

                {/* Category Preview */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {trendCategories.map((category, index) => (
                    <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                          {category.icon}
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{category.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                        <Badge variant="outline" className="text-xs">{category.count}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-12 px-4 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-4">Why Track IT Trends?</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Understanding technology trends helps you make informed career decisions, 
                  plan your learning journey, and stay competitive in the job market.
                </p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {benefits.map((benefit, index) => (
                  <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {benefit.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Main Trends Explorer */}
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <ITTrendsExplorer 
                  userSkills={userPreferences.skills}
                  userIndustry={userPreferences.industry}
                  personalized={isPersonalized}
                />
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="container mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Level Up Your Tech Skills?
                </h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Use our AI-powered assessments and personalized learning paths to master 
                  the trending technologies that matter most for your career.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Target className="h-5 w-5 mr-2" />
                    Take Skill Assessment
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Chat with AI Agent
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
      </div>
    </PageTransition>
  )
} 