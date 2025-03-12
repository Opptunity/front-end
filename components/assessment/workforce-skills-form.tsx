"use client"

import { useFieldArray } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function WorkforceSkillsForm({ form }) {
  const { t } = useLanguage();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "keyRoles",
  })

  const skillGapOptions = [
    { id: "data-analysis", label: t("dataAnalysis") },
    { id: "programming", label: t("programming") },
    { id: "project-management", label: t("projectManagement") },
    { id: "digital-marketing", label: t("digitalMarketing") },
    { id: "cybersecurity", label: t("cybersecurity") },
    { id: "cloud-computing", label: t("cloudComputing") },
    { id: "ai-ml", label: t("aiMachineLearning") },
    { id: "design-ux", label: t("designUX") },
    { id: "leadership", label: t("leadership") },
    { id: "communication", label: t("communication") },
    { id: "problem-solving", label: t("problemSolving") },
    { id: "adaptability", label: t("adaptability") },
    { id: "teamwork", label: t("teamwork") },
    { id: "time-management", label: t("timeManagement") },
    { id: "critical-thinking", label: t("criticalThinking") },
    { id: "emotional-intelligence", label: t("emotionalIntelligence") },
  ]

  const keyCompetencyOptions = [
    { id: "technical-expertise", label: t("technicalExpertise") },
    { id: "strategic-thinking", label: t("strategicThinking") },
    { id: "innovation", label: t("innovationCreativity") },
    { id: "customer-focus", label: t("customerFocus") },
    { id: "business-acumen", label: t("businessAcumen") },
    { id: "change-management", label: t("changeManagement") },
    { id: "cross-functional", label: t("crossFunctional") },
    { id: "digital-literacy", label: t("digitalLiteracy") },
    { id: "data-driven", label: t("dataDecisionMaking") },
    { id: "agile-methodologies", label: t("agileMethodologies") },
  ]

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{t("workforceRoles")}</h2>
        <p className="text-slate-600">{t("workforceRolesLongDesc")}</p>
      </div>

      <div className="space-y-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-slate-900">{t("keyRoles")}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {t("keyRolesDesc")}
          </p>
        </div>

        {fields.map((field, index) => (
          <Card
            key={field.id}
            className="border border-slate-200 shadow-sm hover:shadow transition-shadow duration-200"
          >
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">{t("role")} {index + 1}</h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`keyRoles.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">{t("roleTitle")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("rolePlaceholder")}
                        {...field}
                        className="h-12 text-base focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name={`keyRoles.${index}.importance`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t("businessImportance")}</FormLabel>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{t("low")}</span>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="text-sm text-slate-500">{t("high")}</span>
                        <span className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary font-medium">
                          {field.value}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`keyRoles.${index}.difficulty`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t("hiringDifficulty")}</FormLabel>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">{t("easy")}</span>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="text-sm text-slate-500">{t("hard")}</span>
                        <span className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary font-medium">
                          {field.value}
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: "", importance: 3, difficulty: 3 })}
          className="w-full h-12 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addAnotherRole")}
        </Button>

        <FormField
          control={form.control}
          name="skillGaps"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">{t("skillGaps")}</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  {t("skillGapsDesc")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skillGapOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="skillGaps"
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
          name="keyCompetencies"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-lg font-medium text-slate-900">{t("keyCompetencies")}</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  {t("keyCompetenciesDesc")}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyCompetencyOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="keyCompetencies"
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

