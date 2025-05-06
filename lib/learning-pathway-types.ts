import { RecommendedCourse, TechnicalSkill } from "./types"

/**
 * Project item in a learning pathway step
 */
export type ProjectItem = {
  title: string
  description: string
  learningOutcomes: string[]
}

/**
 * Certification item in a learning pathway step
 */
export type CertificationItem = {
  name: string
  provider: string
  difficulty: string
  relevance: string
}

/**
 * Enhanced learning path step with projects and certifications
 */
export type LearningPathStep = {
  title: string
  description: string
  timeframe: string
  courses: RecommendedCourse[]
  skillsToAcquire: string[]
  projects?: ProjectItem[]
  certifications?: CertificationItem[]
  completionCriteria: string
}

/**
 * User profile for generating learning pathways
 */
export type UserProfile = {
  industry: string
  careerLevel: string
  specialization: string
  experience: string | number
  summary: string
  technicalSkills: TechnicalSkill[]
  strengths: string[]
  improvementAreas: string[]
}

/**
 * Role-specific learning pathway
 */
export type RoleLearningPathway = {
  role: string
  pathway: LearningPathStep[]
}

/**
 * Common elements across learning pathways
 */
export type PathwayCommonalities = {
  commonSkills: string[]
  commonCourses: string[]
  commonCertifications: string[]
}

/**
 * Complete learning pathway package
 */
export type LearningPathwayPackage = {
  pathwaysByRole: Record<string, LearningPathStep[]>
  commonElements: PathwayCommonalities
  selectedPathway?: LearningPathStep[]
} 