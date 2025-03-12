"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

export default function SkillGapsForm({ form }) {
  const technicalSkillOptions = [
    { id: "data-analysis", label: "Data Analysis & Reporting" },
    { id: "programming", label: "Programming & Development" },
    { id: "project-management", label: "Project Management" },
    { id: "digital-marketing", label: "Digital Marketing" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "cloud-computing", label: "Cloud Computing" },
    { id: "ai-ml", label: "AI & Machine Learning" },
    { id: "design-ux", label: "Design & UX" },
  ]

  const softSkillOptions = [
    { id: "leadership", label: "Leadership" },
    { id: "communication", label: "Communication" },
    { id: "problem-solving", label: "Problem Solving" },
    { id: "adaptability", label: "Adaptability" },
    { id: "teamwork", label: "Teamwork & Collaboration" },
    { id: "time-management", label: "Time Management" },
    { id: "critical-thinking", label: "Critical Thinking" },
    { id: "emotional-intelligence", label: "Emotional Intelligence" },
  ]

  const challengeOptions = [
    { id: "budget", label: "Budget Constraints" },
    { id: "time", label: "Time Limitations" },
    { id: "engagement", label: "Employee Engagement" },
    { id: "measuring-roi", label: "Measuring ROI" },
    { id: "relevant-content", label: "Finding Relevant Content" },
    { id: "personalization", label: "Personalizing Learning" },
    { id: "retention", label: "Knowledge Retention" },
    { id: "tech-adoption", label: "Technology Adoption" },
  ]

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Skill Gaps Assessment</h2>
        <p className="text-slate-600">Identify the areas where your organization faces the biggest skill gaps</p>
      </div>

      <div className="space-y-8">
        <FormField
          control={form.control}
          name="technicalSkills"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">Technical Skills Gaps</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  Select the technical skills where your organization faces the biggest gaps
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {technicalSkillOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="technicalSkills"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.id])
                                  : field.onChange(field.value?.filter((value) => value !== option.id))
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-base">{option.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="softSkills"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">Soft Skills Gaps</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  Select the soft skills where your organization faces the biggest gaps
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {softSkillOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="softSkills"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.id])
                                  : field.onChange(field.value?.filter((value) => value !== option.id))
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-base">{option.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upskillChallenges"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">Upskilling Challenges</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  What are your biggest challenges when it comes to upskilling your workforce?
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challengeOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="upskillChallenges"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, option.id])
                                  : field.onChange(field.value?.filter((value) => value !== option.id))
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-base">{option.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any other skill gaps or challenges you'd like to mention?"
                  className="resize-none min-h-[120px] focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

