"use client"

import { motion } from "framer-motion"
import { Clock, AlertTriangle, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react"

export default function AssessmentMockup() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Adaptive Assessment</h3>
          <p className="text-blue-100 text-sm">Frontend Development Skills</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-full">
          <Clock className="h-4 w-4" />
          <span className="text-sm">12:45 remaining</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Question 7 of 15</div>
          <div className="text-sm text-gray-500">47% complete</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "47%" }}></div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Question */}
        <div className="mb-8">
          <div className="flex items-start gap-2 mb-4">
            <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium">7</span>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">
                Which of the following is the correct way to create a React functional component?
              </h4>
              <p className="text-gray-600">Select the most appropriate answer based on modern React practices.</p>
            </div>
          </div>

          {/* Code example */}
          <div className="bg-gray-800 text-gray-200 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
            <pre>{`// Option A
function MyComponent(props) {
  return <div>{props.name}</div>;
}

// Option B
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

// Option C
const MyComponent = (props) => {
  return <div>{props.name}</div>;
}

// Option D
const MyComponent = function(props) {
  return <div>{props.name}</div>;
}`}</pre>
          </div>

          {/* Answer options */}
          <div className="space-y-3">
            {["Option A", "Option B", "Option C", "Option D"].map((option, i) => (
              <motion.div
                key={i}
                className={`p-3 border rounded-lg cursor-pointer ${
                  i === 2 ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border ${
                      i === 2 ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    } flex items-center justify-center`}
                  >
                    {i === 2 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Question navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <HelpCircle className="h-4 w-4" />
              <span>Hint</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <AlertTriangle className="h-4 w-4" />
              <span>Flag</span>
            </button>
          </div>
          <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-center">
        <div className="flex gap-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                i < 6 ? "bg-green-500" : i === 6 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

