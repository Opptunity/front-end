export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Unknown"

export type TechnicalSkill = {
  skill: string
  level: SkillLevel
  justification?: string
}

export type IndustryAnalysis = {
  industry: string
  alignment: string
  trends: string[]
  keyInsights: string[]
}

export type CareerTrajectory = {
  currentLevel: string
  potentialRoles: string[]
  timeToNextLevel: string
  developmentAreas: string[]
}

export type SkillGapAnalysis = {
  criticalGaps: string[]
  importantGaps: string[]
  learningResources: string[]
}

export type RecommendedCourse = {
  title: string
  provider: string
  level: string
  url: string
  relevance: string
}

export type AssessmentData = {
  summary: string
  technicalSkills: TechnicalSkill[]
  softSkills: string[]
  strengths: string[]
  improvementAreas: string[]
  recommendations: string[]
  industryAnalysis: IndustryAnalysis
  careerTrajectory: CareerTrajectory
  skillGapAnalysis: SkillGapAnalysis
  recommendedCourses?: RecommendedCourse[]
}
