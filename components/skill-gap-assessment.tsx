"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"

import CompanyProfileForm from "./assessment/company-profile-form"
import WorkforceSkillsForm from "./assessment/workforce-skills-form"
import FutureNeedsForm from "./assessment/future-needs-form"
import ResourcesForm from "./assessment/resources-form"
import AssessmentResults from "./assessment/assessment-results"
import ProgressIndicator from "./assessment/progress-indicator"

// Define the form schema
const formSchema = z.object({
  // Company Profile
  industry: z.string().min(1, { message: "Please select an industry" }),
  companySize: z.string().min(1, { message: "Please select company size" }),
  strategicPriorities: z.array(z.string()).min(1, { message: "Please select at least one strategic priority" }),

  // Workforce Roles/Skills
  keyRoles: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Role title is required" }),
        importance: z.number().min(1).max(5),
        difficulty: z.number().min(1).max(5),
      }),
    )
    .min(1, { message: "Please add at least one role" }),
  skillGaps: z.array(z.string()).min(1, { message: "Please select at least one skill gap" }),
  keyCompetencies: z.array(z.string()).min(1, { message: "Please select at least one key competency" }),

  // Future Needs
  plannedRoles: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Role title is required" }),
        timeline: z.string().min(1, { message: "Please select a timeline" }),
      }),
    )
    .optional(),
  upcomingProjects: z.string().optional(),
  upskillBarriers: z.array(z.string()).min(1, { message: "Please select at least one barrier" }),

  // Resources
  trainingBudget: z.string().min(1, { message: "Please select a training budget range" }),
  trainingTime: z.string().min(1, { message: "Please select available training time" }),
  existingTools: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function SkillGapAssessment() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [direction, setDirection] = useState(0)
  const totalSteps = 4

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      companySize: "",
      strategicPriorities: [],
      keyRoles: [{ title: "", importance: 3, difficulty: 3 }],
      skillGaps: [],
      keyCompetencies: [],
      plannedRoles: [],
      upcomingProjects: "",
      upskillBarriers: [],
      trainingBudget: "",
      trainingTime: "",
      existingTools: [],
      additionalNotes: "",
    },
    mode: "onChange",
  })

  // Handle next step
  const handleNext = async () => {
    let isValid = false

    if (step === 1) {
      isValid = await form.trigger(["industry", "companySize", "strategicPriorities"])
    } else if (step === 2) {
      isValid = await form.trigger(["keyRoles", "skillGaps", "keyCompetencies"])
    } else if (step === 3) {
      isValid = await form.trigger(["upskillBarriers"])
    } else if (step === 4) {
      isValid = await form.trigger(["trainingBudget", "trainingTime"])
    }

    if (isValid) {
      setDirection(1)
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    setDirection(-1)
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data)
    setDirection(1)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Animation variants
  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 200 : -200,
        opacity: 0,
      }
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 200 : -200,
        opacity: 0,
      }
    },
  }

  // Get step title
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return t("companyProfile")
      case 2:
        return t("workforceRoles")
      case 3:
        return t("futureNeeds")
      case 4:
        return t("resources")
      default:
        return ""
    }
  }

  // Get step description
  const getStepDescription = () => {
    switch (step) {
      case 1:
        return t("companyProfileDesc")
      case 2:
        return t("workforceRolesDesc")
      case 3:
        return t("futureNeedsDesc")
      case 4:
        return t("resourcesDesc")
      default:
        return ""
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto glass-card rounded-xl overflow-hidden border-0 transition-all duration-300">
      <CardHeader className="relative border-b">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"></div>

        <div className="relative z-10">
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            {isSubmitted ? (
              <>
                <Sparkles className="h-5 w-5 text-primary" />
                {t("assessmentResults")}
              </>
            ) : (
              <>
                {getStepTitle()}{" "}
                <span className="text-base text-slate-500">
                  ({t("step")} {step} {t("of")} {totalSteps})
                </span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-base opacity-90 mt-1">
            {isSubmitted
              ? t("resultsDescription")
              : getStepDescription()}
          </CardDescription>
          {!isSubmitted && <ProgressIndicator currentStep={step} totalSteps={totalSteps} />}
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-0">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={isSubmitted ? "results" : `step-${step}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="p-6"
              >
                {!isSubmitted ? (
                  <>
                    {step === 1 && <CompanyProfileForm form={form} />}
                    {step === 2 && <WorkforceSkillsForm form={form} />}
                    {step === 3 && <FutureNeedsForm form={form} />}
                    {step === 4 && <ResourcesForm form={form} />}
                  </>
                ) : (
                  <AssessmentResults data={form.getValues()} />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6 bg-gradient-to-r from-slate-50 to-white">
            {!isSubmitted ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className="button-enhanced transition-all duration-200 hover:translate-x-[-2px]"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("previous")}
                </Button>
                {step === totalSteps ? (
                  <Button 
                    type="submit" 
                    className="button-enhanced transition-all duration-200 hover:translate-x-[2px]"
                  >
                    {t("submitAssessment")}
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="button-enhanced transition-all duration-200 hover:translate-x-[2px]"
                  >
                    {t("next")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="button-enhanced mx-auto"
              >
                {t("startNewAssessment")}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

