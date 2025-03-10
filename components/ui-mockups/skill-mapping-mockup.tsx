"use client"

import { motion } from "framer-motion"
import { Search, Filter, Download, ChevronDown, Plus } from "lucide-react"

export default function SkillMappingMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h3 className="font-bold text-lg">Intelligent Skill Mapping</h3>
        <p className="text-blue-100 text-sm">Discover and catalog enterprise-wide skills</p>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              className="pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-md w-64"
            />
          </div>
          <button className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
        <button className="flex items-center gap-1 text-sm bg-blue-600 text-white rounded-md px-3 py-1.5">
          <Plus className="h-4 w-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Main content */}
      <div className="p-4">
        {/* Skill categories */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { name: "Technical Skills", count: 48, color: "bg-blue-100 border-blue-300" },
            { name: "Leadership Skills", count: 24, color: "bg-green-100 border-green-300" },
            { name: "Soft Skills", count: 36, color: "bg-purple-100 border-purple-300" },
          ].map((category, i) => (
            <motion.div
              key={i}
              className={`p-4 rounded-lg ${category.color} border flex justify-between items-center`}
              whileHover={{ y: -5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.count} skills mapped</p>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
          ))}
        </div>

        {/* Skill map visualization */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Organization Skill Map</h4>
            <div className="flex gap-2">
              <select className="text-xs border rounded p-1">
                <option>Department view</option>
                <option>Team view</option>
                <option>Individual view</option>
              </select>
              <select className="text-xs border rounded p-1">
                <option>All skills</option>
                <option>Critical skills</option>
                <option>Emerging skills</option>
              </select>
            </div>
          </div>
          <SkillMapVisualization />
        </div>

        {/* Skills table */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Top Skills by Department</h4>
            <button className="text-xs text-blue-600 hover:text-blue-800">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proficiency
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gap
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[
                  { name: "Data Analysis", category: "Technical", proficiency: 72, demand: "High", gap: "Low" },
                  { name: "Project Management", category: "Leadership", proficiency: 85, demand: "High", gap: "None" },
                  { name: "Cloud Architecture", category: "Technical", proficiency: 45, demand: "High", gap: "High" },
                  { name: "Communication", category: "Soft Skills", proficiency: 68, demand: "Medium", gap: "Medium" },
                  { name: "Machine Learning", category: "Technical", proficiency: 38, demand: "High", gap: "High" },
                ].map((skill, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium">{skill.name}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          skill.category === "Technical"
                            ? "bg-blue-100 text-blue-800"
                            : skill.category === "Leadership"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              skill.proficiency > 80
                                ? "bg-green-600"
                                : skill.proficiency > 60
                                  ? "bg-blue-600"
                                  : skill.proficiency > 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{skill.proficiency}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          skill.demand === "High"
                            ? "bg-red-100 text-red-800"
                            : skill.demand === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {skill.demand}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          skill.gap === "High"
                            ? "bg-red-100 text-red-800"
                            : skill.gap === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : skill.gap === "Low"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {skill.gap}
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

function SkillMapVisualization() {
  // This is a simplified skill map visualization
  const departments = [
    { name: "Engineering", color: "bg-blue-500" },
    { name: "Product", color: "bg-green-500" },
    { name: "Marketing", color: "bg-purple-500" },
    { name: "Sales", color: "bg-yellow-500" },
    { name: "Operations", color: "bg-red-500" },
  ]

  const skills = [
    { name: "Programming", size: 80, deps: [0] },
    { name: "Data Analysis", size: 70, deps: [0, 1, 4] },
    { name: "UX Design", size: 60, deps: [1] },
    { name: "Leadership", size: 75, deps: [0, 1, 2, 3, 4] },
    { name: "Communication", size: 65, deps: [0, 1, 2, 3, 4] },
    { name: "Marketing", size: 70, deps: [2, 3] },
    { name: "Sales", size: 75, deps: [3] },
    { name: "Project Management", size: 65, deps: [0, 1, 4] },
    { name: "Customer Service", size: 60, deps: [3, 4] },
    { name: "Finance", size: 55, deps: [4] },
  ]

  return (
    <div className="relative h-64 border border-gray-100 rounded-lg p-4">
      {/* Department legend */}
      <div className="absolute top-2 right-2 bg-white p-2 border border-gray-100 rounded-md shadow-sm">
        <div className="text-xs font-medium mb-1">Departments</div>
        {departments.map((dept, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div className={`w-2 h-2 ${dept.color} rounded-sm`}></div>
            <span>{dept.name}</span>
          </div>
        ))}
      </div>

      {/* Skill bubbles */}
      <div className="relative h-full w-full">
        {skills.map((skill, i) => {
          // Position bubbles in a somewhat organized way
          const row = Math.floor(i / 5)
          const col = i % 5
          const top = 20 + row * 80
          const left = 40 + col * 110

          return (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer"
              style={{
                width: skill.size,
                height: skill.size,
                top,
                left,
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-center">
                <div className="text-xs font-medium">{skill.name}</div>
                <div className="flex justify-center mt-1">
                  {skill.deps.map((depIndex) => (
                    <div key={depIndex} className={`w-2 h-2 ${departments[depIndex].color} rounded-full mx-0.5`}></div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Connection lines between related skills - simplified */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="80" y1="60" x2="150" y2="60" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="150" y1="60" x2="260" y2="60" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="80" y1="60" x2="80" y2="140" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="150" y1="60" x2="150" y2="140" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="260" y1="60" x2="370" y2="60" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="370" y1="60" x2="480" y2="60" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="80" y1="140" x2="150" y2="140" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="150" y1="140" x2="260" y2="140" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="260" y1="140" x2="370" y2="140" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}

