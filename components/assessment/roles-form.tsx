"use client"
import { useFieldArray } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"

export default function RolesForm({ form }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "keyRoles",
  })

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Key Roles</h2>
        <p className="text-slate-600">
          Identify the key roles in your organization that are most critical or challenging to fill
        </p>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <Card
            key={field.id}
            className="border border-slate-200 shadow-sm hover:shadow transition-shadow duration-200"
          >
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-900">Role {index + 1}</h3>
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
                    <FormLabel className="text-base">Role Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Software Engineer, Project Manager"
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
                      <FormLabel className="text-base">Business Importance</FormLabel>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Low</span>
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
                        <span className="text-sm text-slate-500">High</span>
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
                      <FormLabel className="text-base">Hiring/Retention Difficulty</FormLabel>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">Easy</span>
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
                        <span className="text-sm text-slate-500">Hard</span>
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
          Add Another Role
        </Button>
      </div>
    </div>
  )
}

