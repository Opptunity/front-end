"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedContainer, AnimatedList, AnimatedListItem } from "./animated-container"
import {
  BookOpen,
  ExternalLink,
  Star,
  Clock,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  Award,
  Briefcase,
  CheckCircle,
  Tag,
} from "lucide-react"
import type { SkillLevel, RecommendedCourse } from "@/lib/types"

type Course = {
  id: string
  title: string
  provider: string
  url: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  duration: string
  rating: number
  price: string
  skills: string[]
  tags: string[]
  image?: string
}

type CourseLibraryProps = {
  technicalSkills: Array<{ skill: string; level: SkillLevel; justification?: string }>
  improvementAreas: string[]
  industry: string
  selectedRole?: string | null
  careerTrajectory?: { potentialRoles: string[] }
  recommendedCourses?: RecommendedCourse[]
}

export function CourseLibrary({ 
  technicalSkills, 
  improvementAreas, 
  industry, 
  selectedRole, 
  careerTrajectory,
  recommendedCourses = []
}: CourseLibraryProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<{
    skills: string[]
    levels: string[]
    providers: string[]
  }>({
    skills: [],
    levels: [],
    providers: [],
  })
  const [activeTab, setActiveTab] = useState<"all" | "recommended" | "skills" | "gaps">("recommended")
  
  // Use potential roles from careerTrajectory if available, otherwise use defaults
  const defaultRoles = ["Junior Software Developer", "Full-Stack Developer", "Mobile Application Developer"];
  const [potentialRoles, setPotentialRoles] = useState<string[]>(
    careerTrajectory?.potentialRoles || defaultRoles
  )
  const [localSelectedRole, setLocalSelectedRole] = useState<string | null>(selectedRole || null)

  // Update potential roles when careerTrajectory changes
  useEffect(() => {
    if (careerTrajectory?.potentialRoles && careerTrajectory.potentialRoles.length > 0) {
      setPotentialRoles(careerTrajectory.potentialRoles);
    }
  }, [careerTrajectory]);

  // Generate or fetch courses based on skills or use recommendedCourses if available
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)

      let generatedCourses: Course[] = []

      if (recommendedCourses && recommendedCourses.length > 0) {
        // Transform recommendedCourses to match the Course type
        generatedCourses = recommendedCourses.map((course, index) => {
          // Extract skills from the course title and relevance
          const extractedSkills = extractSkillsFromCourse(course);
          
          return {
            id: `recommended-${index}`,
            title: course.title,
            provider: course.provider,
            url: course.url || generateCourseUrl(extractedSkills[0] || course.title, course.provider),
            description: course.relevance || `Recommended course based on your skills profile.`,
            level: (course.level as "Beginner" | "Intermediate" | "Advanced" | "All Levels") || "All Levels",
            duration: generateRandomDuration(),
            rating: 4 + (Math.random() * 1), // Generate a random rating between 4 and 5
            price: course.provider.includes("Free") ? "Free" : generateRandomPrice(),
            skills: extractedSkills,
            tags: ["Recommended", "Career advancement", industry]
          }
        })
      } else {
        // If no recommendedCourses are provided, generate them based on skills
        generatedCourses = generateCoursesForSkills(technicalSkills, improvementAreas, industry)
      }

      setCourses(generatedCourses)
      setFilteredCourses(generatedCourses)
      setLoading(false)
    }

    fetchCourses()
  }, [technicalSkills, improvementAreas, industry, recommendedCourses])

  // Update localSelectedRole when selectedRole prop changes
  useEffect(() => {
    setLocalSelectedRole(selectedRole || null);
  }, [selectedRole]);

  // Apply role filter if selectedRole is provided or localSelectedRole is set
  useEffect(() => {
    const roleToApply = localSelectedRole || selectedRole;
    
    if (roleToApply) {
      const roleRelatedSkills = getRoleRelatedSkills(roleToApply);
      
      // Filter courses related to the selected role
      let filtered = courses.filter(course => 
        course.title.toLowerCase().includes(roleToApply.toLowerCase()) || 
        course.description.toLowerCase().includes(roleToApply.toLowerCase()) ||
        course.skills.some(skill => roleRelatedSkills.includes(skill))
      );
      
      // If we don't have enough courses after filtering, add some generic ones related to the role
      if (filtered.length < 3) {
        filtered = [
          ...filtered,
          ...courses.filter(course => 
            !filtered.includes(course) && 
            (course.tags.includes('Career advancement') || course.level === 'Advanced')
          )
        ].slice(0, 6);
      }
      
      setFilteredCourses(filtered);
      // Set active tab to recommended when a role is selected
      setActiveTab("recommended");
    } else {
      // Reset filters when no role is selected
      let filtered = [...courses];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query) ||
            course.skills.some((skill) => skill.toLowerCase().includes(query)),
        );
      }
      
      // Apply skill filters
      if (activeFilters.skills.length > 0) {
        filtered = filtered.filter((course) => course.skills.some((skill) => activeFilters.skills.includes(skill)));
      }
      
      // Apply level filters
      if (activeFilters.levels.length > 0) {
        filtered = filtered.filter((course) => activeFilters.levels.includes(course.level));
      }
      
      // Apply provider filters
      if (activeFilters.providers.length > 0) {
        filtered = filtered.filter((course) => activeFilters.providers.includes(course.provider));
      }
      
      setFilteredCourses(filtered);
    }
  }, [localSelectedRole, selectedRole, courses, activeFilters, searchQuery]);

  // Helper function to get skills related to a role
  const getRoleRelatedSkills = (role: string): string[] => {
    const roleToSkills: Record<string, string[]> = {
      'Junior Software Engineer': ['Programming', 'Data Structures', 'Algorithms', 'Git', 'CI/CD', 'Unit Testing'],
      'Junior Software Developer': ['Programming', 'Data Structures', 'Algorithms', 'Git', 'CI/CD', 'Unit Testing'],
      'Full-Stack Developer': ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express', 'GraphQL', 'RESTful APIs'],
      'Mobile Application Developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile UI/UX', 'App Store Deployment'],
      'Microservices Developer': ['Docker', 'Kubernetes', 'API Gateway', 'Event-Driven Architecture', 'Serverless'],
      // Add more roles as needed
    };
    
    return roleToSkills[role] || ['Software Development', 'Programming', 'Computer Science'];
  };

  // Filter courses when search query or filters change
  useEffect(() => {
    if (!selectedRole) {
      let filtered = [...courses]

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query) ||
            course.skills.some((skill) => skill.toLowerCase().includes(query)),
        )
      }

      // Apply skill filters
      if (activeFilters.skills.length > 0) {
        filtered = filtered.filter((course) => course.skills.some((skill) => activeFilters.skills.includes(skill)))
      }

      // Apply level filters
      if (activeFilters.levels.length > 0) {
        filtered = filtered.filter((course) => activeFilters.levels.includes(course.level))
      }

      // Apply provider filters
      if (activeFilters.providers.length > 0) {
        filtered = filtered.filter((course) => activeFilters.providers.includes(course.provider))
      }

      setFilteredCourses(filtered)
    }
  }, [activeFilters, searchQuery, courses, selectedRole])

  const toggleFilter = (type: "skills" | "levels" | "providers", value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type]
      return {
        ...prev,
        [type]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      }
    })
  }

  // Extract unique values for filters
  const uniqueSkills = [...new Set(courses.flatMap((course) => course.skills))]
  const uniqueLevels = [...new Set(courses.map((course) => course.level))]
  const uniqueProviders = [...new Set(courses.map((course) => course.provider))]

  // Get appropriate level for a skill
  const getRecommendedLevel = (skill: string): string => {
    const foundSkill = technicalSkills.find((s) => s.skill === skill)
    if (!foundSkill) return "Beginner"

    switch (foundSkill.level) {
      case "Beginner":
        return "Intermediate"
      case "Intermediate":
        return "Advanced"
      case "Advanced":
      case "Expert":
        return "Advanced"
      default:
        return "Intermediate"
    }
  }

  // Handle role selection
  const handleRoleSelect = (role: string) => {
    const newSelectedRole = role === localSelectedRole ? null : role;
    setLocalSelectedRole(newSelectedRole);
  };

  return (
    <AnimatedContainer className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Course Library
          </CardTitle>
          <CardDescription>Discover courses tailored to your skills profile and improvement areas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setActiveFilters({ skills: [], levels: [], providers: [] })}
            >
              <Filter className="h-4 w-4" />
              {activeFilters.skills.length > 0 || activeFilters.levels.length > 0 || activeFilters.providers.length > 0
                ? `Clear Filters (${activeFilters.skills.length + activeFilters.levels.length + activeFilters.providers.length})`
                : "Filters"}
            </Button>
          </div>

          {/* Filter options */}
          <AnimatePresence>
            {(activeFilters.skills.length > 0 ||
              activeFilters.levels.length > 0 ||
              activeFilters.providers.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 overflow-hidden"
              >
                {activeFilters.skills.map((skill) => (
                  <Badge
                    key={`skill-${skill}`}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleFilter("skills", skill)}
                  >
                    <Tag className="h-3 w-3" />
                    {skill} ×
                  </Badge>
                ))}
                {activeFilters.levels.map((level) => (
                  <Badge
                    key={`level-${level}`}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleFilter("levels", level)}
                  >
                    <Award className="h-3 w-3" />
                    {level} ×
                  </Badge>
                ))}
                {activeFilters.providers.map((provider) => (
                  <Badge
                    key={`provider-${provider}`}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => toggleFilter("providers", provider)}
                  >
                    <Briefcase className="h-3 w-3" />
                    {provider} ×
                  </Badge>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course tabs */}
          <Tabs defaultValue="recommended" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
           {/* <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recommended" className="relative group">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Recommended</span>
                </div>
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
              <TabsTrigger value="all" className="relative group">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>All Courses</span>
                </div>
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
              <TabsTrigger value="skills" className="relative group">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Your Skills</span>
                </div>
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
              <TabsTrigger value="gaps" className="relative group">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Skill Gaps</span>
                </div>
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </TabsTrigger>
            </TabsList>
            */}

            {/* Tab content */}
           {/*  <TabsContent value="all" className="mt-6">
              <CourseGrid
                courses={filteredCourses}
                loading={loading}
                toggleFilter={toggleFilter}
                showFilters={() => {
                  // Show filter options
                  const filterOptions = document.getElementById("filter-options")
                  if (filterOptions) {
                    filterOptions.scrollIntoView({ behavior: "smooth" })
                  }
                }}
                selectedRole={localSelectedRole}
              />
            </TabsContent>
            */}
            

            <TabsContent value="recommended" className="mt-6">
              <CourseGrid
                courses={filteredCourses}
                loading={loading}
                toggleFilter={toggleFilter}
                showFilters={() => {}}
                selectedRole={localSelectedRole}
              />
            </TabsContent>
            {/*
            <TabsContent value="skills" className="mt-6">
              <CourseGrid
                courses={filteredCourses}
                loading={loading}
                toggleFilter={toggleFilter}
                showFilters={() => {}}
                selectedRole={localSelectedRole}
              />
            </TabsContent>

            <TabsContent value="gaps" className="mt-6">
              <CourseGrid
                courses={filteredCourses}
                loading={loading}
                toggleFilter={toggleFilter}
                showFilters={() => {}}
                selectedRole={localSelectedRole}
              />
            </TabsContent>
            */}
          </Tabs>

          {/* Filter options */}
          <div id="filter-options" className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Filter Options</h3>

            {/* Skills filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" /> Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueSkills.slice(0, 15).map((skill) => (
                  <Badge
                    key={skill}
                    variant={activeFilters.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("skills", skill)}
                  >
                    {skill}
                  </Badge>
                ))}
                {uniqueSkills.length > 15 && <Badge variant="outline">+{uniqueSkills.length - 15} more</Badge>}
              </div>
            </div>

            {/* Levels filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <Award className="h-4 w-4 mr-1" /> Levels
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueLevels.map((level) => (
                  <Badge
                    key={level}
                    variant={activeFilters.levels.includes(level) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("levels", level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Providers filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center">
                <Briefcase className="h-4 w-4 mr-1" /> Providers
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueProviders.map((provider) => (
                  <Badge
                    key={provider}
                    variant={activeFilters.providers.includes(provider) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("providers", provider)}
                  >
                    {provider}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedContainer>
  )
}

// Course grid component
function CourseGrid({
  courses,
  loading,
  toggleFilter,
  showFilters,
  selectedRole,
}: {
  courses: Course[]
  loading: boolean
  toggleFilter: (type: "skills" | "levels" | "providers", value: string) => void
  showFilters: () => void
  selectedRole?: string | null
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <Search className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No courses found</h3>
        <p className="text-muted-foreground mb-4">Try adjusting your search or filters to find courses.</p>
        <Button onClick={showFilters} variant="outline">
          Reset Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedRole && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-green-600" />
            Courses for {selectedRole}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing specialized courses tailored for your selected career path.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} toggleFilter={toggleFilter} />
        ))}
      </div>
    </div>
  )
}

// Course card component
function CourseCard({
  course,
  index,
  toggleFilter,
}: {
  course: Course
  index: number
  toggleFilter: (type: "skills" | "levels" | "providers", value: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <Badge className="cursor-pointer" onClick={() => toggleFilter("providers", course.provider)}>
              {course.provider}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-1 mb-3">
            {course.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer"
                onClick={() => toggleFilter("skills", skill)}
              >
                {skill}
              </Badge>
            ))}
            {course.skills.length > 3 && <Badge variant="outline">+{course.skills.length - 3}</Badge>}
          </div>

          <div className="flex justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {course.duration}
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {course.rating.toFixed(1)}
            </div>
            <Badge variant="secondary" className="cursor-pointer" onClick={() => toggleFilter("levels", course.level)}>
              {course.level}
            </Badge>
          </div>

          <div className="text-sm font-medium">
            {course.price === "Free" ? <span className="text-green-600">Free</span> : <span>{course.price}</span>}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button asChild className="w-full">
            <a href={course.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
              View Course <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Skeleton loader for course cards
function CourseCardSkeleton() {
  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-4 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  )
}

// Function to generate courses based on skills
function generateCoursesForSkills(
  skills: Array<{ skill: string; level: string }>,
  improvementAreas: string[],
  industry: string,
): Course[] {
  // Course providers
  const providers = [
    "Coursera",
    "Udemy",
    "edX",
    "LinkedIn Learning",
    "Pluralsight",
    "Codecademy",
    "Khan Academy",
    "FreeCodeCamp",
    "Udacity",
    "Skillshare",
  ]

  // Course levels
  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"] as const

  // Course durations
  const durations = [
    "1-2 hours",
    "2-4 hours",
    "4-8 hours",
    "8-12 hours",
    "12-20 hours",
    "20+ hours",
    "Self-paced",
    "4 weeks",
    "8 weeks",
    "12 weeks",
  ]

  // Course prices
  const prices = [
    "Free",
    "$9.99",
    "$19.99",
    "$29.99",
    "$49.99",
    "$99.99",
    "Free trial available",
    "Subscription required",
    "Free with certificate option",
  ]

  // Generate courses for each skill
  const skillCourses = skills.flatMap((skill) => {
    // Generate 2-4 courses per skill
    const numCourses = 2 + Math.floor(Math.random() * 3)

    return Array.from({ length: numCourses }).map((_, i) => {
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const level = determineLevel(skill.level, i)
      const duration = durations[Math.floor(Math.random() * durations.length)]
      const price = prices[Math.floor(Math.random() * prices.length)]
      const rating = 3.5 + Math.random() * 1.5

      // Generate a unique ID
      const id = `${skill.skill.toLowerCase().replace(/\s+/g, "-")}-${provider.toLowerCase().replace(/\s+/g, "-")}-${i}`

      // Generate related skills
      const relatedSkills = generateRelatedSkills(
        skill.skill,
        skills.map((s) => s.skill),
      )

      return {
        id,
        title: generateCourseTitle(skill.skill, level, i),
        provider,
        url: generateCourseUrl(skill.skill, provider),
        description: generateCourseDescription(skill.skill, level, industry),
        level,
        duration,
        rating,
        price,
        skills: [skill.skill, ...relatedSkills],
        tags: generateTags(skill.skill, level, industry),
      }
    })
  })

  // Generate courses for improvement areas
  const improvementCourses = improvementAreas.flatMap((area) => {
    // Generate 1-3 courses per improvement area
    const numCourses = 1 + Math.floor(Math.random() * 3)

    return Array.from({ length: numCourses }).map((_, i) => {
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const level = levels[Math.floor(Math.random() * levels.length)]
      const duration = durations[Math.floor(Math.random() * durations.length)]
      const price = prices[Math.floor(Math.random() * prices.length)]
      const rating = 3.5 + Math.random() * 1.5

      // Extract potential skill from improvement area
      const potentialSkill = extractSkillFromImprovement(area)

      // Generate a unique ID
      const id = `improvement-${potentialSkill.toLowerCase().replace(/\s+/g, "-")}-${provider.toLowerCase().replace(/\s+/g, "-")}-${i}`

      return {
        id,
        title: generateImprovementCourseTitle(area, potentialSkill, i),
        provider,
        url: generateCourseUrl(potentialSkill, provider),
        description: generateImprovementCourseDescription(area, potentialSkill, industry),
        level,
        duration,
        rating,
        price,
        skills: [potentialSkill],
        tags: generateTags(potentialSkill, level, industry),
      }
    })
  })

  // Combine and shuffle all courses
  return shuffleArray([...skillCourses, ...improvementCourses])
}

// Helper function to determine course level based on skill level
function determineLevel(
  skillLevel: string,
  courseIndex: number,
): "Beginner" | "Intermediate" | "Advanced" | "All Levels" {
  // For the first course, match the user's current level
  if (courseIndex === 0) {
    switch (skillLevel) {
      case "Beginner":
        return "Beginner"
      case "Intermediate":
        return "Intermediate"
      case "Advanced":
      case "Expert":
        return "Advanced"
      default:
        return "All Levels"
    }
  }

  // For subsequent courses, offer the next level up
  switch (skillLevel) {
    case "Beginner":
      return courseIndex === 1 ? "Intermediate" : "Advanced"
    case "Intermediate":
      return "Advanced"
    case "Advanced":
    case "Expert":
      return "Advanced"
    default:
      return "All Levels"
  }
}

// Helper function to generate related skills
function generateRelatedSkills(mainSkill: string, allSkills: string[]): string[] {
  // Map of related skills
  const relatedSkillsMap: Record<string, string[]> = {
    JavaScript: ["TypeScript", "React", "Node.js", "Angular", "Vue.js"],
    Python: ["Django", "Flask", "Data Science", "Machine Learning", "NumPy"],
    Java: ["Spring", "Hibernate", "Android", "Microservices", "JUnit"],
    React: ["JavaScript", "Redux", "Next.js", "TypeScript", "React Native"],
    "Node.js": ["JavaScript", "Express", "MongoDB", "REST API", "GraphQL"],
    SQL: ["Database Design", "PostgreSQL", "MySQL", "Data Modeling", "NoSQL"],
    AWS: ["Cloud Computing", "DevOps", "Serverless", "Docker", "Kubernetes"],
    DevOps: ["CI/CD", "Docker", "Kubernetes", "Jenkins", "Terraform"],
    "Machine Learning": ["Python", "TensorFlow", "PyTorch", "Data Science", "Neural Networks"],
    "Data Science": ["Python", "R", "Statistics", "Data Visualization", "Machine Learning"],
    "UX Design": ["UI Design", "Figma", "User Research", "Wireframing", "Prototyping"],
    "Product Management": ["Agile", "Scrum", "User Stories", "Roadmapping", "Stakeholder Management"],
    "Digital Marketing": ["SEO", "Content Marketing", "Social Media", "Google Analytics", "Email Marketing"],
    SEO: ["Content Marketing", "Google Analytics", "Keyword Research", "Link Building", "Technical SEO"],
    "Content Marketing": ["SEO", "Copywriting", "Social Media", "Content Strategy", "Brand Messaging"],
  }

  // Get related skills for the main skill
  const relatedSkills = relatedSkillsMap[mainSkill] || []

  // Filter out skills that are already in the user's skill set
  const filteredSkills = relatedSkills.filter((skill) => !allSkills.includes(skill))

  // Return 1-2 related skills
  return shuffleArray(filteredSkills).slice(0, 1 + Math.floor(Math.random() * 2))
}

// Helper function to generate course title
function generateCourseTitle(skill: string, level: string, index: number): string {
  const beginnerTitles = [
    `${skill} Fundamentals`,
    `Introduction to ${skill}`,
    `${skill}\` for Beginners`,
    `Getting Started with ${skill}`,
    `${skill} Basics: A Complete Guide`,
  ]

  const intermediateTitles = [
    `${skill} Intermediate Course`,
    `Advanced ${skill} Techniques`,
    `${skill} in Practice`,
    `Building Real-World Projects with ${skill}`,
    `${skill} Masterclass`,
  ]

  const advancedTitles = [
    `Expert ${skill} Development`,
    `${skill} Architecture and Best Practices`,
    `Professional ${skill} Certification`,
    `${skill} at Scale`,
    `${skill} Deep Dive`,
  ]

  const allLevelsTitles = [
    `Complete ${skill} Bootcamp`,
    `${skill} from Zero to Hero`,
    `The Ultimate ${skill} Guide`,
    `${skill} Comprehensive Course`,
    `${skill} A-Z`,
  ]

  // Select appropriate titles based on level
  let titles: string[] = []
  switch (level) {
    case "Beginner":
      titles = beginnerTitles
      break
    case "Intermediate":
      titles = intermediateTitles
      break
    case "Advanced":
      titles = advancedTitles
      break
    default:
      titles = allLevelsTitles
  }

  // Return a random title from the appropriate list
  return titles[index % titles.length]
}

// Helper function to generate course URL
function generateCourseUrl(skill: string, provider: string): string {
  const skillSlug = skill.toLowerCase().replace(/\s+/g, "-")

  switch (provider) {
    case "Coursera":
      return `https://www.coursera.org/courses?query=${skillSlug}`
    case "Udemy":
      return `https://www.udemy.com/courses/search/?src=ukw&q=${skillSlug}`
    case "edX":
      return `https://www.edx.org/search?q=${skillSlug}`
    case "LinkedIn Learning":
      return `https://www.linkedin.com/learning/search?keywords=${skillSlug}`
    case "Pluralsight":
      return `https://www.pluralsight.com/search?q=${skillSlug}`
    case "Codecademy":
      return `https://www.codecademy.com/search?query=${skillSlug}`
    case "Khan Academy":
      return `https://www.khanacademy.org/search?page_search_query=${skillSlug}`
    case "FreeCodeCamp":
      return `https://www.freecodecamp.org/news/search/?query=${skillSlug}`
    case "Udacity":
      return `https://www.udacity.com/courses/all?search=${skillSlug}`
    case "Skillshare":
      return `https://www.skillshare.com/search?query=${skillSlug}`
    default:
      return `https://www.google.com/search?q=${skillSlug}+course+${provider.toLowerCase()}`
  }
}

// Helper function to generate course description
function generateCourseDescription(skill: string, level: string, industry: string): string {
  const beginnerDescriptions = [
    `Learn the fundamentals of ${skill} in this beginner-friendly course designed for ${industry} professionals.`,
    `Start your journey with ${skill} and build a solid foundation for your career in ${industry}.`,
    `This introductory course covers all the basics of ${skill} with practical examples relevant to ${industry}.`,
  ]

  const intermediateDescriptions = [
    `Take your ${skill} skills to the next level with this intermediate course tailored for ${industry} professionals.`,
    `Build on your existing knowledge of ${skill} and learn advanced techniques used in the ${industry} industry.`,
    `Expand your ${skill} toolkit with industry-standard practices and real-world applications in ${industry}.`,
  ]

  const advancedDescriptions = [
    `Master advanced ${skill} concepts and techniques used by top professionals in the ${industry} industry.`,
    `This expert-level course covers cutting-edge ${skill} practices essential for senior roles in ${industry}.`,
    `Elevate your ${skill} expertise to an advanced level with this comprehensive course designed for ${industry} leaders.`,
  ]

  const allLevelsDescriptions = [
    `A comprehensive ${skill} course covering beginner to advanced topics relevant to ${industry} professionals.`,
    `Learn ${skill} from the ground up in this complete course designed for all experience levels in ${industry}.`,
    `This all-in-one ${skill} bootcamp will take you from novice to expert with real-world ${industry} applications.`,
  ]

  // Select appropriate descriptions based on level
  let descriptions: string[] = []
  switch (level) {
    case "Beginner":
      descriptions = beginnerDescriptions
      break
    case "Intermediate":
      descriptions = intermediateDescriptions
      break
    case "Advanced":
      descriptions = advancedDescriptions
      break
    default:
      descriptions = allLevelsDescriptions
  }

  // Return a random description
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// Helper function to extract a skill from an improvement area
function extractSkillFromImprovement(improvementArea: string): string {
  // Try to extract a skill from the improvement area
  const words = improvementArea.split(/\s+/)

  // Common skills that might be mentioned in improvement areas
  const commonSkills = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "AWS",
    "Azure",
    "GCP",
    "DevOps",
    "CI/CD",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "Data Science",
    "AI",
    "Deep Learning",
    "SQL",
    "NoSQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Leadership",
    "Communication",
    "Project Management",
    "Agile",
    "Scrum",
    "UI/UX",
    "Design",
    "Figma",
    "Sketch",
    "Adobe XD",
    "Marketing",
    "SEO",
    "Content",
    "Social Media",
    "Analytics",
  ]

  // Check if any common skills are mentioned in the improvement area
  for (const skill of commonSkills) {
    if (improvementArea.includes(skill)) {
      return skill
    }
  }

  // If no common skill is found, use the first few words
  return words.slice(0, 2).join(" ")
}

// Helper function to generate improvement course title
function generateImprovementCourseTitle(area: string, skill: string, index: number): string {
  const titles = [
    `Mastering ${skill}: Addressing ${area}`,
    `${skill} Deep Dive: Overcoming Common Challenges`,
    `Essential ${skill} Skills for Professional Growth`,
    `${skill} Bootcamp: Filling the Gaps`,
    `${skill} Masterclass: From Weakness to Strength`,
  ]

  return titles[index % titles.length]
}

// Helper function to generate improvement course description
function generateImprovementCourseDescription(area: string, skill: string, industry: string): string {
  const descriptions = [
    `This course specifically addresses ${area} by focusing on key ${skill} concepts relevant to ${industry} professionals.`,
    `Designed to help you overcome challenges with ${area}, this course provides practical ${skill} training for ${industry}.`,
    `Fill the gaps in your ${skill} knowledge with this targeted course addressing ${area} in the context of ${industry}.`,
  ]

  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

// Helper function to generate tags
function generateTags(skill: string, level: string, industry: string): string[] {
  const baseTags = [skill, level, industry]

  // Add additional tags based on skill and industry
  const additionalTags = []

  // Add methodology tags
  const methodologies = ["Practical", "Hands-on", "Project-based", "Interactive", "Self-paced"]
  additionalTags.push(methodologies[Math.floor(Math.random() * methodologies.length)])

  // Add benefit tags
  const benefits = ["Career advancement", "Certification prep", "Portfolio building", "Skill enhancement"]
  additionalTags.push(benefits[Math.floor(Math.random() * benefits.length)])

  return [...baseTags, ...additionalTags]
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Helper function to extract skills from course title and relevance
const extractSkillsFromCourse = (course: { title: string; relevance: string }): string[] => {
  const skills: Set<string> = new Set();
  
  // Common technical skills to look for
  const commonSkills = [
    "JavaScript", "Python", "Java", "React", "Angular", "Vue", "Node.js", 
    "AWS", "Azure", "GCP", "DevOps", "CI/CD", "Docker", "Kubernetes", 
    "Machine Learning", "Data Science", "AI", "Deep Learning", "SQL", 
    "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "TypeScript", "HTML", 
    "CSS", "Git", "Agile", "Scrum", "UI/UX", "Testing"
  ];
  
  // Look for skills in the title
  for (const skill of commonSkills) {
    if (course.title.includes(skill)) {
      skills.add(skill);
    }
    if (course.relevance && course.relevance.includes(skill)) {
      skills.add(skill);
    }
  }
  
  // Extract words that might be skills from the title
  const titleWords = course.title.split(/\s+/);
  for (const word of titleWords) {
    if (word.length > 3 && /^[A-Z]/.test(word) && !["Course", "for", "with", "and", "the", "Development"].includes(word)) {
      skills.add(word);
    }
  }
  
  // If we didn't find any skills, extract from title
  if (skills.size === 0) {
    const firstTwoWords = course.title.split(/\s+/).slice(0, 2).join(" ");
    skills.add(firstTwoWords);
  }
  
  return Array.from(skills);
};

// Helper function to generate a random duration
const generateRandomDuration = (): string => {
  const durations = [
    "1-2 hours", "2-4 hours", "4-8 hours", "8-12 hours", 
    "12-20 hours", "20+ hours", "Self-paced", "4 weeks", "8 weeks"
  ];
  return durations[Math.floor(Math.random() * durations.length)];
};

// Helper function to generate a random price
const generateRandomPrice = (): string => {
  const prices = [
    "$9.99", "$19.99", "$29.99", "$49.99", "$99.99", 
    "Free trial available", "Subscription required"
  ];
  return prices[Math.floor(Math.random() * prices.length)];
};
