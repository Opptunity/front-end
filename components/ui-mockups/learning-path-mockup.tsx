"use client"

import { motion } from "framer-motion"
import { BookOpen, CheckCircle, Clock, Award, ChevronRight, Play, FileText, Code, Video } from "lucide-react"

export default function LearningPathMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h3 className="font-bold text-lg">Frontend Development Learning Path</h3>
        <p className="text-blue-100 text-sm">Personalized curriculum based on your skill assessment</p>
      </div>

      {/* Progress overview */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Your progress: 42% complete</div>
          <div className="text-sm text-gray-500">Estimated completion: 3 weeks</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "42%" }}></div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span className="text-sm">12 of 28 modules completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-green-600" />
            <span className="text-sm">5 skills acquired</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span className="text-sm">18 hours invested</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        {/* Module sections */}
        <div className="space-y-6">
          {/* Completed section */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Completed Modules</span>
            </h4>
            <div className="space-y-3">
              {[
                {
                  title: "HTML Fundamentals",
                  type: "Course",
                  duration: "2h 15m",
                  icon: <FileText className="h-4 w-4" />,
                  completed: true,
                },
                {
                  title: "CSS Basics & Layouts",
                  type: "Course",
                  duration: "3h 30m",
                  icon: <Code className="h-4 w-4" />,
                  completed: true,
                },
                {
                  title: "JavaScript Essentials",
                  type: "Course",
                  duration: "4h 45m",
                  icon: <Code className="h-4 w-4" />,
                  completed: true,
                },
              ].map((module, i) => (
                <motion.div
                  key={i}
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50 flex justify-between items-center"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      {module.icon}
                    </div>
                    <div>
                      <h5 className="font-medium">{module.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{module.type}</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completed</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* In progress section */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>In Progress</span>
            </h4>
            <div className="space-y-3">
              {[
                {
                  title: "React Fundamentals",
                  type: "Course",
                  duration: "5h 20m",
                  progress: 65,
                  icon: <Code className="h-4 w-4" />,
                },
                {
                  title: "Building UI Components",
                  type: "Workshop",
                  duration: "2h 45m",
                  progress: 30,
                  icon: <Video className="h-4 w-4" />,
                },
              ].map((module, i) => (
                <motion.div
                  key={i}
                  className="p-3 border border-blue-200 rounded-lg bg-blue-50 flex justify-between items-center"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      {module.icon}
                    </div>
                    <div>
                      <h5 className="font-medium">{module.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{module.type}</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16">
                      <div className="text-xs text-right mb-1">{module.progress}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${module.progress}%` }}></div>
                      </div>
                    </div>
                    <button className="p-1.5 bg-blue-600 text-white rounded-full">
                      <Play className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming section */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <span>Upcoming Modules</span>
            </h4>
            <div className="space-y-3">
              {[
                {
                  title: "State Management",
                  type: "Course",
                  duration: "4h 15m",
                  icon: <Code className="h-4 w-4" />,
                },
                {
                  title: "API Integration",
                  type: "Course",
                  duration: "3h 30m",
                  icon: <Code className="h-4 w-4" />,
                },
                {
                  title: "Performance Optimization",
                  type: "Workshop",
                  duration: "2h 45m",
                  icon: <Video className="h-4 w-4" />,
                },
              ].map((module, i) => (
                <motion.div
                  key={i}
                  className="p-3 border border-gray-200 rounded-lg bg-white flex justify-between items-center"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      {module.icon}
                    </div>
                    <div>
                      <h5 className="font-medium">{module.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{module.type}</span>
                        <span>•</span>
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

