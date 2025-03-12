"use client"

import { motion } from "framer-motion"
import { BarChart2, TrendingUp, Users, Award, Download, Calendar, Filter, ChevronDown } from "lucide-react"

export default function AnalyticsMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">ROI-Driven Analytics</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-md">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center gap-1 text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-md">
              <Calendar className="h-4 w-4" />
              <span>Last 30 days</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-blue-100 text-sm">Track upskilling impact with comprehensive dashboards</p>
      </div>

      {/* Main content */}
      <div className="p-4">
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "Total Learning Hours",
              value: "2,845",
              change: "+12.5%",
              icon: <BarChart2 className="h-5 w-5 text-blue-600" />,
              color: "bg-blue-50 border-blue-200",
            },
            {
              title: "Skills Acquired",
              value: "342",
              change: "+8.3%",
              icon: <Award className="h-5 w-5 text-green-600" />,
              color: "bg-green-50 border-green-200",
            },
            {
              title: "Active Learners",
              value: "189",
              change: "+5.2%",
              icon: <Users className="h-5 w-5 text-purple-600" />,
              color: "bg-purple-50 border-purple-200",
            },
            {
              title: "Productivity Gain",
              value: "15.8%",
              change: "+2.3%",
              icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
              color: "bg-orange-50 border-orange-200",
            },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              className={`p-4 rounded-lg ${kpi.color} border`}
              whileHover={{ y: -5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className="p-2 rounded-full bg-white">{kpi.icon}</div>
              </div>
              <div className="text-xs text-green-600 mt-1">{kpi.change} vs previous period</div>
            </motion.div>
          ))}
        </div>

        {/* Main chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Learning Activity & Skill Acquisition</h4>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-xs border border-gray-300 rounded-md px-2 py-1 bg-white">
                <Filter className="h-3 w-3" />
                <span>Filter</span>
              </button>
              <select className="text-xs border rounded p-1">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Product</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>
          <MainAnalyticsChart />
        </div>

        {/* Bottom charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Top Skills by Acquisition</h4>
              <select className="text-xs border rounded p-1">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>
            </div>
            <SkillsAcquisitionChart />
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">ROI by Department</h4>
              <select className="text-xs border rounded p-1">
                <option>By productivity</option>
                <option>By retention</option>
                <option>By innovation</option>
              </select>
            </div>
            <ROIByDepartmentChart />
          </div>
        </div>
      </div>
    </div>
  )
}

function MainAnalyticsChart() {
  // This is a simplified chart representation
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const learningHours = [120, 150, 180, 210, 190, 220, 250, 280, 310, 340, 320, 350]
  const skillsAcquired = [15, 18, 22, 25, 23, 28, 32, 35, 38, 42, 40, 45]

  const maxHours = Math.max(...learningHours)
  const maxSkills = Math.max(...skillsAcquired)

  return (
    <div className="h-64 relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
        <div>350h</div>
        <div>175h</div>
        <div>0h</div>
      </div>

      {/* Secondary Y-axis labels */}
      <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
        <div>45</div>
        <div>22</div>
        <div>0</div>
      </div>

      {/* Chart area */}
      <div className="ml-12 mr-12 h-full flex items-end">
        {months.map((month, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            {/* Bar for learning hours */}
            <div
              className="w-6 bg-blue-500 rounded-t"
              style={{ height: `${(learningHours[i] / maxHours) * 80}%` }}
            ></div>

            {/* Line for skills acquired */}
            <div
              className="w-2 h-2 bg-green-500 rounded-full relative mt-[-4px]"
              style={{ marginBottom: `${(skillsAcquired[i] / maxSkills) * 80}%` }}
            >
              {i > 0 && (
                <div
                  className="absolute right-full top-1/2 h-0.5 bg-green-500"
                  style={{
                    width: "100%",
                    transform: `rotate(${
                      Math.atan2(((skillsAcquired[i] - skillsAcquired[i - 1]) / maxSkills) * 80, 100 / months.length) *
                      (180 / Math.PI)
                    }deg)`,
                    transformOrigin: "right center",
                  }}
                ></div>
              )}
            </div>

            {/* X-axis label */}
            <div className="text-xs text-gray-500 mt-2">{month}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs">Learning Hours</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs">Skills Acquired</span>
        </div>
      </div>
    </div>
  )
}

function SkillsAcquisitionChart() {
  // This is a simplified horizontal bar chart
  const skills = [
    { name: "Data Analysis", count: 42, color: "bg-blue-500" },
    { name: "Cloud Computing", count: 38, color: "bg-blue-400" },
    { name: "Machine Learning", count: 35, color: "bg-blue-500" },
    { name: "DevOps", count: 30, color: "bg-blue-400" },
    { name: "UX Design", count: 28, color: "bg-blue-500" },
    { name: "Project Management", count: 25, color: "bg-blue-400" },
    { name: "Agile Methodologies", count: 22, color: "bg-blue-500" },
  ]

  const maxCount = Math.max(...skills.map((s) => s.count))

  return (
    <div className="space-y-3">
      {skills.map((skill, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-24 text-xs truncate">{skill.name}</div>
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${skill.color} rounded-full`}
              style={{ width: `${(skill.count / maxCount) * 100}%` }}
            ></div>
          </div>
          <div className="w-8 text-xs font-medium">{skill.count}</div>
        </div>
      ))}
    </div>
  )
}

function ROIByDepartmentChart() {
  // This is a simplified donut chart
  const departments = [
    { name: "Engineering", percentage: 35, color: "bg-blue-500" },
    { name: "Product", percentage: 25, color: "bg-green-500" },
    { name: "Marketing", percentage: 20, color: "bg-purple-500" },
    { name: "Sales", percentage: 15, color: "bg-yellow-500" },
    { name: "Operations", percentage: 5, color: "bg-red-500" },
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="w-32 h-32 rounded-full border-8 border-gray-100 relative">
        {departments.map((dept, i) => {
          const prevDepts = departments.slice(0, i).reduce((sum, d) => sum + d.percentage, 0)
          return (
            <div
              key={i}
              className={`absolute inset-0 ${dept.color}`}
              style={{
                clipPath: `polygon(50% 50%, ${(50 + 50 * Math.cos((2 * Math.PI * prevDepts) / 100 - Math.PI / 2)).toFixed(4)}% ${(50 + 50 * Math.sin((2 * Math.PI * prevDepts) / 100 - Math.PI / 2)).toFixed(4)}%, ${(50 + 50 * Math.cos((2 * Math.PI * (prevDepts + dept.percentage)) / 100 - Math.PI / 2)).toFixed(4)}% ${(50 + 50 * Math.sin((2 * Math.PI * (prevDepts + dept.percentage)) / 100 - Math.PI / 2)).toFixed(4)}%)`,
              }}
            ></div>
          )
        })}
      </div>
      <div className="flex flex-col gap-2">
        {departments.map((dept, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${dept.color} rounded-sm`}></div>
            <span className="text-sm">{dept.name}</span>
            <span className="text-sm font-medium">{dept.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

