"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"

export default function ResourcesForm({ form }) {
  const { t } = useLanguage();
  
  const budgetOptions = [
    t("budgetLessThan10k"),
    t("budget10kTo50k"),
    t("budget50kTo100k"),
    t("budget100kTo250k"),
    t("budget250kTo500k"),
    t("budget500kTo1m"),
    t("budgetMoreThan1m"),
    t("budgetPreferNotToSay"),
  ]

  const timeOptions = [
    t("timeLessThan1Hour"),
    t("time1To2Hours"),
    t("time3To5Hours"),
    t("time6To10Hours"),
    t("timeMoreThan10Hours"),
    t("timeVaries"),
  ]

  const toolOptions = [
    { id: "lms", label: t("lmsLabel") },
    { id: "hris", label: t("hrisLabel") },
    { id: "talent-management", label: t("talentManagementLabel") },
    { id: "performance-management", label: t("performanceManagementLabel") },
    { id: "e-learning", label: t("eLearningLabel") },
    { id: "skills-assessment", label: t("skillsAssessmentLabel") },
    { id: "mentoring", label: t("mentoringLabel") },
    { id: "content-library", label: t("contentLibraryLabel") },
    { id: "none", label: t("noToolsLabel") },
  ]

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{t("resources")}</h2>
        <p className="text-slate-600">{t("resourcesLongDesc")}</p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="trainingBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">{t("annualTrainingBudget")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={t("selectBudgetRange")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {budgetOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trainingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">{t("availableTrainingTime")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder={t("selectTimeAvailable")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="existingTools"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">{t("existingTools")}</FormLabel>
                <p className="text-sm text-slate-600 mt-1">{t("existingToolsDesc")}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {toolOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="existingTools"
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
              <FormLabel className="text-base">{t("additionalNotes")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("additionalNotesPlaceholder")}
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

