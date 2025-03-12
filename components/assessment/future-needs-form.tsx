"use client"

import { useFieldArray } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FutureNeedsForm({ form }) {
  const { t } = useLanguage();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "plannedRoles",
  })

  const timelineOptions = [t("timeline0to3"), t("timeline4to6"), t("timeline7to9"), t("timeline10to12")]

  const barrierOptions = [
    { id: "budget", label: t("budgetConstraints") },
    { id: "time", label: t("timeLimitations") },
    { id: "engagement", label: t("employeeEngagement") },
    { id: "measuring-roi", label: t("measuringROI") },
    { id: "relevant-content", label: t("findingContent") },
    { id: "personalization", label: t("personalizingLearning") },
    { id: "retention", label: t("knowledgeRetention") },
    { id: "tech-adoption", label: t("technologyAdoption") },
    { id: "leadership-buy-in", label: t("leadershipBuyIn") },
    { id: "skill-identification", label: t("identifyingSkills") },
  ]

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{t("futureNeeds")}</h2>
        <p className="text-slate-600">{t("futureNeedsLongDesc")}</p>
      </div>

      <div className="space-y-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-slate-900">{t("plannedRoles")}</h3>
          <p className="text-sm text-slate-600 mt-1">{t("plannedRolesDesc")}</p>
        </div>

        {fields.length > 0 ? (
          fields.map((field, index) => (
            <Card
              key={field.id}
              className="border border-slate-200 shadow-sm hover:shadow transition-shadow duration-200"
            >
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">{t("newRole")} {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`plannedRoles.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t("roleTitle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("newRolePlaceholder")}
                          {...field}
                          className="h-12 text-base focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`plannedRoles.${index}.timeline`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t("hiringTimeline")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder={t("selectTimeline")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timelineOptions.map((option) => (
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
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-6 border border-dashed rounded-lg bg-slate-50">
            <p className="text-slate-500">{t("noPlannedRoles")}</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: "", timeline: "" })}
          className="w-full h-12 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addPlannedRole")}
        </Button>

        <FormField
          control={form.control}
          name="upcomingProjects"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">{t("upcomingProjects")}</FormLabel>
              <p className="text-sm text-slate-600 mb-3">
                {t("upcomingProjectsDesc")}
              </p>
              <FormControl>
                <Textarea
                  placeholder={t("projectsPlaceholder")}
                  className="resize-none min-h-[120px] focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upskillBarriers"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">{t("upskillBarriers")}</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  {t("upskillBarriersDesc")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {barrierOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="upskillBarriers"
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
      </div>
    </div>
  )
}

