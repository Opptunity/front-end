"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Award,
  Brain,
  RefreshCcw,
  ExternalLink,
  BookOpen,
  Briefcase,
  User,
  Lightbulb,
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedContainer, AnimatedList, AnimatedListItem } from "./animated-container"
import type { Industry } from "@/lib/industry-detection"
import type { UserProfile } from "@/lib/ai-agent"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: string
  skill: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  explanation: string
  source?: string
  context?: string
  category?: string
  specificTopic?: string
}

type TestResults = {
  score: number
  totalQuestions: number
  answeredCorrectly: string[]
  skillPerformance: Record<string, { correct: number; total: number; percentage: number }>
  categoryPerformance?: Record<string, { correct: number; total: number; percentage: number }>
}

export function PersonalizedTest({ id }: { id: string }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [industry, setIndustry] = useState<Industry>("other")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activeFilters, setActiveFilters] = useState<{
    skills: string[]
    categories: string[]
    difficulties: string[]
  }>({
    skills: [],
    categories: [],
    difficulties: [],
  })
  const [testLength, setTestLength] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [optimizedAssessment, setOptimizedAssessment] = useState<any>(null)
  const [isTestStarted, setIsTestStarted] = useState(false)

  useEffect(() => {
    // Don't auto-fetch questions, wait for user to click start
  }, [id])

  useEffect(() => {
    if (questions.length === 0) return

    let filtered = [...questions]

    if (activeFilters.skills.length > 0) {
      filtered = filtered.filter((q) => activeFilters.skills.includes(q.skill))
    }

    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter((q) => q.category && activeFilters.categories.includes(q.category))
    }

    if (activeFilters.difficulties.length > 0) {
      filtered = filtered.filter((q) => activeFilters.difficulties.includes(q.difficulty))
    }

    filtered = filtered.slice(0, testLength)

    setFilteredQuestions(filtered)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
  }, [questions, activeFilters, testLength])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)
      setUserAnswers({})
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
      setIsTestStarted(true)

      const response = await fetch(`/api/generate-test/${id}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || "No questions could be generated")
      }

      setQuestions(data.questions)
      setFilteredQuestions(data.questions.slice(0, testLength))

      if (data.industry) {
        setIndustry(data.industry)
      }

      if (data.userProfile) {
        setUserProfile(data.userProfile)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load test questions")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswerSubmitted) return

    const currentQuestion = filteredQuestions[currentQuestionIndex]
    const correct = selectedAnswer === currentQuestion.correctAnswer

    setIsCorrect(correct)
    setIsAnswerSubmitted(true)

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      calculateResults()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      const prevQuestion = filteredQuestions[currentQuestionIndex - 1]
      setSelectedAnswer(userAnswers[prevQuestion.id] || null)
      setIsAnswerSubmitted(!!userAnswers[prevQuestion.id])
      setIsCorrect(userAnswers[prevQuestion.id] === prevQuestion.correctAnswer)
    }
  }

  const calculateResults = () => {
    const answeredQuestions = filteredQuestions.filter((q) => userAnswers[q.id])
    const correctAnswers = answeredQuestions.filter((q) => userAnswers[q.id] === q.correctAnswer)
    const score = (correctAnswers.length / answeredQuestions.length) * 100

    const skillPerformance: Record<string, { correct: number; total: number; percentage: number }> = {}

    answeredQuestions.forEach((question) => {
      if (!skillPerformance[question.skill]) {
        skillPerformance[question.skill] = { correct: 0, total: 0, percentage: 0 }
      }

      skillPerformance[question.skill].total += 1

      if (userAnswers[question.id] === question.correctAnswer) {
        skillPerformance[question.skill].correct += 1
      }
    })

    Object.keys(skillPerformance).forEach((skill) => {
      const { correct, total } = skillPerformance[skill]
      skillPerformance[skill].percentage = (correct / total) * 100
    })

    const categoryPerformance: Record<string, { correct: number; total: number; percentage: number }> = {}

    answeredQuestions.forEach((question) => {
      if (question.category) {
        if (!categoryPerformance[question.category]) {
          categoryPerformance[question.category] = { correct: 0, total: 0, percentage: 0 }
        }

        categoryPerformance[question.category].total += 1

        if (userAnswers[question.id] === question.correctAnswer) {
          categoryPerformance[question.category].correct += 1
        }
      }
    })

    Object.keys(categoryPerformance).forEach((category) => {
      const { correct, total } = categoryPerformance[category]
      categoryPerformance[category].percentage = (correct / total) * 100
    })

    setResults({
      score,
      totalQuestions: answeredQuestions.length,
      answeredCorrectly: correctAnswers.map((q) => q.id),
      skillPerformance,
      categoryPerformance,
    })

    sendSkillPerformanceToBackend(skillPerformance, userProfile?.cvText || "")
  }

  const sendSkillPerformanceToBackend = async (
    skillPerformance: Record<string, { correct: number; total: number; percentage: number }>,
    cvText: string
  ) => {
    try {
      const response = await fetch('/api/assessment-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          skillPerformance, 
          id, 
          cvText,
          latestTestResults: results
        }),
      });
      const data = await response.json();
      if (data.success && data.assessment) {
        setOptimizedAssessment(data.assessment);
      }
    } catch (error) {
    }
  };

  const restartTest = () => {
    setResults(null)
    setUserAnswers({})
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
  }

  const generateNewTest = () => {
    fetchQuestions()
  }

  const toggleFilter = (type: "skills" | "categories" | "difficulties", value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type]
      return {
        ...prev,
        [type]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      }
    })
  }

  const uniqueSkills = [...new Set(questions.map((q) => q.skill))]
  const uniqueCategories = [...new Set(questions.map((q) => q.category).filter(Boolean) as string[])]
  const uniqueDifficulties = [...new Set(questions.map((q) => q.difficulty))]

  const startTest = () => {
    fetchQuestions();
  };

  if (!isTestStarted && !loading && !results) {
    return (
      <AnimatedContainer>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Skills Assessment Test
            </CardTitle>
            <CardDescription>
              Take a personalized test to validate your skills and identify areas for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Brain className="h-16 w-16 mx-auto text-primary" />
              </motion.div>
              <h3 className="text-xl font-medium mb-2">Ready to Test Your Skills?</h3>
              <p className="text-muted-foreground mb-6">
                This test will be personalized based on your profile and will help you identify strengths and improvement areas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-sm">
                        <span>Test Length:</span>
                        <select
                          value={testLength}
                          onChange={(e) => setTestLength(Number(e.target.value))}
                          className="border rounded px-2 py-1"
                        >
                          <option value={5}>5 Questions</option>
                          <option value={10}>10 Questions</option>
                          <option value={15}>15 Questions</option>
                          <option value={20}>20 Questions</option>
                        </select>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select how many questions you want in your test</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={startTest} size="lg" className="px-8">
                    <Brain className="mr-2 h-4 w-4" />
                    Start Test
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generating Your Personalized Test</CardTitle>
          <CardDescription>
            Creating questions tailored specifically to your background and experience...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "linear" },
                scale: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" },
              }}
            >
              <Brain className="h-12 w-12 text-primary" />
            </motion.div>
            <motion.p
              className="text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              This may take a moment as our AI agent analyzes your profile
            </motion.p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={fetchQuestions} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </motion.div>
          </AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  if (results) {
    return (
      <AnimatedContainer>
        {userProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Your Professional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                className="flex flex-wrap gap-2 mb-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {[
                  { icon: <Briefcase className="h-3 w-3" />, text: industry, className: "capitalize" },
                  { icon: <User className="h-3 w-3" />, text: userProfile.careerLevel },
                  { icon: <Award className="h-3 w-3" />, text: userProfile.specialization },
                  { icon: <BookOpen className="h-3 w-3" />, text: userProfile.experience },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant="outline" className={`flex items-center gap-1 ${item.className || ""}`}>
                      {item.icon}
                      <span>{item.text}</span>
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Your test was specifically designed for your unique background and experience level.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-6 w-6 text-primary" />
              Test Results
            </CardTitle>
            <CardDescription>
              You scored {Math.round(results.score)}% ({results.answeredCorrectly.length} out of{" "}
              {results.totalQuestions} correct)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score</span>
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  {Math.round(results.score)}%
                </motion.span>
              </div>
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8 }}>
                <Progress value={results.score} className="h-2" />
              </motion.div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Performance by Skill</h3>
              <AnimatedList className="space-y-4">
                {Object.entries(results.skillPerformance).map(([skill, data], index) => (
                  <AnimatedListItem key={skill}>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{skill}</span>
                        <span>
                          {data.correct}/{data.total} ({Math.round(data.percentage)}%)
                        </span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      >
                        <Progress
                          value={data.percentage}
                          className={
                            "h-2 " +
                            (data.percentage >= 70
                              ? "bg-green-500"
                              : data.percentage >= 40
                                ? "bg-amber-500"
                                : "bg-red-500")
                          }
                        />
                      </motion.div>
                    </div>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </div>

            {results.categoryPerformance && Object.keys(results.categoryPerformance).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Performance by Category</h3>
                <AnimatedList className="space-y-4">
                  {Object.entries(results.categoryPerformance).map(([category, data], index) => (
                    <AnimatedListItem key={category}>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{category}</span>
                          <span>
                            {data.correct}/{data.total} ({Math.round(data.percentage)}%)
                          </span>
                        </div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                          <Progress
                            value={data.percentage}
                            className={
                              "h-2 " +
                              (data.percentage >= 70
                                ? "bg-green-500"
                                : data.percentage >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500")
                            }
                          />
                        </motion.div>
                      </div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={restartTest} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retake Test
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => window.location.href = `/assessment/${id}?regenerate=true`}
                variant="secondary"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Full Assessment
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={generateNewTest}>Generate New Test</Button>
            </motion.div>
          </CardFooter>
        </Card>

        {optimizedAssessment && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Optimized Assessment Report</h2>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(optimizedAssessment, null, 2)}</pre>
          </div>
        )}
      </AnimatedContainer>
    )
  }

  if (filteredQuestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Questions Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">No questions are available for this test. This could be due to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>No profile information to generate personalized questions</li>
            <li>Selected filters exclude all available questions</li>
            <li>An error occurred while generating questions</li>
          </ul>
          <Button onClick={startTest}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-blue-100 text-blue-800",
    Advanced: "bg-purple-100 text-purple-800",
    Expert: "bg-red-100 text-red-800",
  }

  return (
    <AnimatedContainer>
      {userProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Your Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <motion.div
              className="flex flex-wrap gap-2 mb-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {[
                { icon: <Briefcase className="h-3 w-3" />, text: industry, className: "capitalize" },
                { icon: <User className="h-3 w-3" />, text: userProfile.careerLevel },
                { icon: <Award className="h-3 w-3" />, text: userProfile.specialization },
                { icon: <BookOpen className="h-3 w-3" />, text: userProfile.experience },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="outline" className={`flex items-center gap-1 ${item.className || ""}`}>
                    {item.icon}
                    <span>{item.text}</span>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Your test was specifically designed for your unique background and experience level.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <span>Test Length:</span>
                  <select
                    value={testLength}
                    onChange={(e) => setTestLength(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select how many questions you want in your test</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {filteredQuestions.length}
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Customize Your Test</CardTitle>
            <CardDescription>Filter questions by skill, category, and difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uniqueSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-1" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={activeFilters.skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter("skills", skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {uniqueCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" /> Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map((category) => (
                      <Badge
                        key={category}
                        variant={activeFilters.categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleFilter("categories", category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {uniqueDifficulties.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-1" /> Difficulty
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueDifficulties.map((difficulty) => (
                      <Badge
                        key={difficulty}
                        variant={activeFilters.difficulties.includes(difficulty) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter("difficulties", difficulty)}
                      >
                        {difficulty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Question {currentQuestionIndex + 1} of {filteredQuestions.length}
            </CardTitle>
            <motion.div
              className={`text-xs px-2 py-1 rounded-full ${difficultyColors[currentQuestion.difficulty]}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentQuestion.difficulty}
            </motion.div>
          </div>
          <CardDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Topic: {currentQuestion.skill}</span>
              {currentQuestion.specificTopic && (
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.specificTopic}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {currentQuestion.category && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                    <Tag className="h-3 w-3" />
                    <span>{currentQuestion.category}</span>
                  </Badge>
                </motion.div>
              )}
              {currentQuestion.context && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    <span>Personalized</span>
                  </Badge>
                </motion.div>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            className="text-lg font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {currentQuestion.text}
          </motion.div>

          <RadioGroup value={selectedAnswer || ""} className="space-y-3">
            <AnimatePresence>
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center space-x-2 border p-4 rounded-md cursor-pointer transition-colors
                    ${selectedAnswer === option ? "border-primary bg-primary/5" : "hover:bg-muted"}
                    ${isAnswerSubmitted && option === currentQuestion.correctAnswer ? "border-green-500 bg-green-50" : ""}
                    ${isAnswerSubmitted && selectedAnswer === option && option !== currentQuestion.correctAnswer ? "border-red-500 bg-red-50" : ""}
                  `}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    disabled={isAnswerSubmitted}
                    className="sr-only"
                  />
                  <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                    {option}
                  </Label>
                  <AnimatePresence>
                    {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                    {isAnswerSubmitted && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      >
                        <XCircle className="h-5 w-5 text-red-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </RadioGroup>

          <AnimatePresence>
            {isAnswerSubmitted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className={isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                  {isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className={isCorrect ? "text-green-700" : "text-red-700"}>
                    <p className="font-medium">{isCorrect ? "Correct!" : "Incorrect"}</p>
                    <p className="mt-1">{currentQuestion.explanation}</p>

                    {currentQuestion.context && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-100"
                      >
                        <p className="text-xs font-medium flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                          Why this is relevant to you:
                        </p>
                        <p className="text-xs mt-1">{currentQuestion.context}</p>
                      </motion.div>
                    )}

                    {currentQuestion.source && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-2 text-xs flex items-center"
                      >
                        <span className="font-medium mr-1">Source:</span>
                        {currentQuestion.source.startsWith("http") ? (
                          <a
                            href={currentQuestion.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            {currentQuestion.source.substring(0, 40)}...
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        ) : (
                          <span>{currentQuestion.source}</span>
                        )}
                      </motion.div>
                    )}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1} of {filteredQuestions.length}
            </div>
          </div>
          <div>
            {!isAnswerSubmitted ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                  Submit Answer
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleNextQuestion} className="flex items-center">
                  {currentQuestionIndex < filteredQuestions.length - 1 ? (
                    <>
                      Next Question
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    "View Results"
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </CardFooter>
      </Card>
    </AnimatedContainer>
  )
}
