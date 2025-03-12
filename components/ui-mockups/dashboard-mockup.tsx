"use client"

import type React from "react"
import dynamic from 'next/dynamic'

import { Users, Award, BookOpen, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

// Create a client-only version of the chart component
const ClientOnlySkillDistribution = dynamic(() => Promise.resolve(SkillDistributionChart), {
  ssr: false
})

export default function DashboardMockup() {
  const { t, isRTL, language } = useLanguage()

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{t("dashboard")}</h3>
          <p className="text-blue-100 text-sm">{t("welcomeBack")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 hover:bg-blue-700 p-2 rounded-full cursor-pointer">
            <Bell className="h-5 w-5" />
          </div>
          <div className="bg-blue-500 hover:bg-blue-700 p-2 rounded-full cursor-pointer">
            <Settings className="h-5 w-5" />
          </div>
          <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">AJ</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Users className="h-5 w-5 text-blue-600" />, label: t("teamMembers"), value: "24", change: "+3" },
            {
              icon: <Award className="h-5 w-5 text-green-600" />,
              label: t("skillsAcquired"),
              value: "187",
              change: "+12",
            },
            {
              icon: <BookOpen className="h-5 w-5 text-purple-600" />,
              label: t("coursesCompleted"),
              value: "42",
              change: "+5",
            },
            {
              icon: <Clock className="h-5 w-5 text-orange-600" />,
              label: t("learningHours"),
              value: "368",
              change: "+28",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-gray-50 p-3 rounded-lg border border-gray-100"
              whileHover={{ y: -5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 rounded-full bg-white">{stat.icon}</div>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {stat.change} {t("thisMonth")}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">{t("skillsProgress")}</h4>
              <select className="text-xs border rounded p-1">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>
            </div>
            <SkillsProgressChart />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">{t("skillDistribution")}</h4>
              <select className="text-xs border rounded p-1">
                <option>By category</option>
                <option>By level</option>
                <option>By team</option>
              </select>
            </div>
            <ClientOnlySkillDistribution isRTL={isRTL} />
          </div>
        </div>

        {/* Team skills table */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">{t("teamSkillsOverview")}</h4>
            <button className="text-xs text-blue-600 hover:text-blue-800">{t("viewAll")}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "عضو الفريق" : "Team Member"}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "الدور" : "Role"}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "أهم المهارات" : "Top Skills"}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "التقدم" : "Progress"}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === "ar" ? "الحالة" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[
                  {
                    name: language === "ar" ? "إيما طومسون" : "Emma Thompson",
                    role: language === "ar" ? "مدير المنتج" : "Product Manager",
                    skills: language === "ar" ? ["القيادة", "أجايل", "تجربة المستخدم"] : ["Leadership", "Agile", "UX"],
                    progress: 78,
                    status: t("onTrack"),
                  },
                  {
                    name: language === "ar" ? "جيمس ويلسون" : "James Wilson",
                    role: language === "ar" ? "مطور واجهة أمامية" : "Frontend Developer",
                    skills:
                      language === "ar" ? ["رياكت", "تايب سكريبت", "واجهة المستخدم"] : ["React", "TypeScript", "UI/UX"],
                    progress: 92,
                    status: t("ahead"),
                  },
                  {
                    name: language === "ar" ? "صوفيا تشين" : "Sophia Chen",
                    role: language === "ar" ? "عالم بيانات" : "Data Scientist",
                    skills: language === "ar" ? ["بايثون", "تعلم آلي", "إحصاء"] : ["Python", "ML", "Statistics"],
                    progress: 65,
                    status: t("onTrack"),
                  },
                  {
                    name: language === "ar" ? "مايكل براون" : "Michael Brown",
                    role: language === "ar" ? "مهندس ديف أوبس" : "DevOps Engineer",
                    skills: language === "ar" ? ["AWS", "دوكر", "CI/CD"] : ["AWS", "Docker", "CI/CD"],
                    progress: 45,
                    status: t("behind"),
                  },
                ].map((person, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <span className="text-xs">
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{person.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{person.role}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex gap-1">
                        {person.skills.map((skill, j) => (
                          <span key={j} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            person.progress > 80
                              ? "bg-green-600"
                              : person.progress > 60
                                ? "bg-blue-600"
                                : person.progress > 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${person.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          person.status === t("ahead")
                            ? "bg-green-100 text-green-800"
                            : person.status === t("onTrack")
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  )
}

function Settings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  )
}

function SkillsProgressChart() {
  // This is a simplified chart representation
  return (
    <div className="h-48 flex items-end justify-between gap-1 pt-5 pb-1">
      {[65, 72, 58, 80, 75, 90, 85].map((value, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full bg-blue-500 rounded-t" style={{ height: `${value * 0.4}%` }}></div>
          <span className="text-xs text-gray-500">W{i + 1}</span>
        </div>
      ))}
      <div className="absolute left-0 right-0 h-48 pointer-events-none">
        {[0, 25, 50, 75, 100].map((value, i) => (
          <div key={i} className="absolute border-t border-gray-100 w-full" style={{ bottom: `${value * 0.4}%` }}>
            <span className="text-xs text-gray-400 absolute -left-6">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillDistributionChart({ isRTL }: { isRTL: boolean }) {
  // This is a simplified pie chart representation
  const skills = [
    { name: isRTL ? "تقني" : "Technical", percentage: 40, color: "bg-blue-500" },
    { name: isRTL ? "قيادة" : "Leadership", percentage: 25, color: "bg-green-500" },
    { name: isRTL ? "تواصل" : "Communication", percentage: 20, color: "bg-purple-500" },
    { name: isRTL ? "أخرى" : "Other", percentage: 15, color: "bg-yellow-500" },
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="w-32 h-32 rounded-full border-8 border-gray-100 relative">
        {skills.map((skill, i) => {
          const prevSkills = skills.slice(0, i).reduce((sum, s) => sum + s.percentage, 0)
          return (
            <div
              key={i}
              className={`absolute inset-0 ${skill.color}`}
              style={{
                clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((2 * Math.PI * prevSkills) / 100 - Math.PI / 2)}% ${50 + 50 * Math.sin((2 * Math.PI * prevSkills) / 100 - Math.PI / 2)}%, ${50 + 50 * Math.cos((2 * Math.PI * (prevSkills + skill.percentage)) / 100 - Math.PI / 2)}% ${50 + 50 * Math.sin((2 * Math.PI * (prevSkills + skill.percentage)) / 100 - Math.PI / 2)}%)`,
              }}
            ></div>
          )
        })}
      </div>
      <div className="flex flex-col gap-2">
        {skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${skill.color} rounded-sm`}></div>
            <span className="text-sm">{skill.name}</span>
            <span className="text-sm font-medium">{skill.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

