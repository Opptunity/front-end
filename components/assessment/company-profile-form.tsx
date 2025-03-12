"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

export default function CompanyProfileForm({ form }) {
  const { t } = useLanguage();
  
  const industries = [
    t("industryTechnology"),
    t("industryHealthcare"),
    t("industryFinance"),
    t("industryManufacturing"),
    t("industryRetail"),
    t("industryEducation"),
    t("industryGovernment"),
    t("industryNonProfit"),
    t("industryProfessionalServices"),
    t("industryConstruction"),
    t("industryEnergy"),
    t("industryTransportation"),
    t("industryHospitality"),
    t("industryMediaEntertainment"),
    t("industryOther"),
  ]

  const companySizes = [
    t("companySize1to10"),
    t("companySize11to50"),
    t("companySize51to200"),
    t("companySize201to500"),
    t("companySize501to1000"),
    t("companySize1001to5000"),
    t("companySizeOver5000"),
  ]

  const strategicPriorityOptions = [
    { id: "growth", label: t("businessGrowth") },
    { id: "innovation", label: t("innovationProducts") },
    { id: "efficiency", label: t("operationalEfficiency") },
    { id: "customer-experience", label: t("customerExperience") },
    { id: "digital-transformation", label: t("digitalTransformation") },
    { id: "talent-development", label: t("talentDevelopment") },
    { id: "cost-reduction", label: t("costReduction") },
    { id: "sustainability", label: t("sustainability") },
    { id: "market-expansion", label: t("marketExpansion") },
    { id: "compliance", label: t("regulatoryCompliance") },
  ]

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="space-y-8 py-2" variants={container} initial="hidden" animate="show">
      <motion.div className="space-y-2" variants={item}>
        <h2 className="text-2xl font-semibold text-slate-900">{t("companyProfile")}</h2>
        <p className="text-slate-600">
          {t("companyProfileLongDesc")}
        </p>
      </motion.div>

      <div className="space-y-6">
        <motion.div className="grid md:grid-cols-2 gap-6" variants={item}>
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">{t("industry")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base input-enhanced">
                      <SelectValue placeholder={t("selectIndustry")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-80">
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
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
            name="companySize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">{t("companySize")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base input-enhanced">
                      <SelectValue placeholder={t("selectCompanySize")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={item}>
          <FormField
            control={form.control}
            name="strategicPriorities"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-lg font-medium text-slate-900">{t("strategicPriorities")}</FormLabel>
                  <p className="text-sm text-slate-600 mt-1">
                    {t("selectPriorities")}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {strategicPriorityOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="strategicPriorities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.id}
                            className="checkbox-container flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option.id])
                                    : field.onChange(field.value?.filter((value) => value !== option.id))
                                }}
                                className="checkbox-enhanced data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
        </motion.div>
      </div>
    </motion.div>
  )
}

