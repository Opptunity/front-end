"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import ScrollReveal from "./animations/scroll-reveal"
import AnimatedButton from "./animations/animated-button"
import { useLanguage } from "@/contexts/language-context"

export default function PricingCta() {
  const [isAnnual, setIsAnnual] = useState(true)
  const { t } = useLanguage()

  const plans = [
    {
      name: t("teamPlan"),
      description: t("teamDesc"),
      price: isAnnual ? 299 : 349,
      period: t("perMonth"),
      discount: isAnnual ? t("savePercent") : null,
      features: [t("teamMembers25"), t("aiSkillMapping"), t("basicAnalytics"), t("standardContent"), t("emailSupport")],
      cta: t("joinWaitlist"),
      popular: false,
    },
    {
      name: t("businessPlan"),
      description: t("businessDesc"),
      price: isAnnual ? 699 : 799,
      period: t("perMonth"),
      discount: isAnnual ? t("savePercent") : null,
      features: [
        t("teamMembers100"),
        t("advancedSkillMapping"),
        t("comprehensiveAnalytics"),
        t("fullContent"),
        t("aiMentorshipFeature"),
        t("customLearning"),
        t("prioritySupport"),
      ],
      cta: t("joinWaitlist"),
      popular: true,
    },
    {
      name: t("enterprisePlan"),
      description: t("enterpriseDesc"),
      price: t("custom"),
      period: "",
      discount: null,
      features: [
        t("teamMembersUnlimited"),
        t("advancedSkillMapping"),
        t("customAnalytics"),
        t("customContent"),
        t("advancedAiMentorship"),
        t("apiAccess"),
        t("dedicatedManager"),
        t("ssoSecurity"),
      ],
      cta: t("joinWaitlist"),
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("pricingTitle")}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("pricingSubtitle")}</p>

            <div className="flex items-center justify-center mt-8">
              <span className={`mr-3 ${isAnnual ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                {t("annualBilling")}
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 items-center rounded-full"
              >
                <span className="sr-only">Toggle billing period</span>
                <span
                  className={`${
                    isAnnual ? "bg-gray-200" : "bg-blue-600"
                  } absolute inset-0 rounded-full transition-colors`}
                />
                <span
                  className={`${
                    isAnnual ? "translate-x-1" : "translate-x-6"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
              <span className={`ml-3 ${!isAnnual ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                {t("monthlyBilling")}
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <motion.div
                className={`rounded-xl border ${
                  plan.popular ? "border-blue-600 shadow-lg relative" : "border-gray-200"
                } bg-white p-8 flex flex-col h-full`}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {t("mostPopular")}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-end">
                      {typeof plan.price === "number" ? (
                        <>
                          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                          <span className="text-gray-600 ml-2">{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      )}
                    </div>
                    {plan.discount && (
                      <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        {plan.discount}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <AnimatedButton
                  className={`w-full py-3 ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {plan.cta}
                </AnimatedButton>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

