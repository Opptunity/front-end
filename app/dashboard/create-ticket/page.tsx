"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createTicket } from "@/lib/tickets-local";

type Priority = "Critical" | "High" | "Medium" | "Low";

interface Ticket {
  id: string;
  specification: string;
  priority: Priority;
  createdAt: string;
}

export default function CreateTicketPage() {
  const [specification, setSpecification] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const analyzePriority = async (text: string) => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/tickets/analyze-priority', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ specification: text }),
      });

      if (response.ok) {
        const data = await response.json();
        setPriority(data.priority);
      }
    } catch (error) {
      console.error('Error analyzing priority:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpecificationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSpecification(value);
    
    // Analyze priority when user stops typing (debounced)
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        analyzePriority(value);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ticket = await createTicket({
        specification,
        priority,
      });

      if (ticket) {
        setSubmitted(true);
      } else {
        alert('Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-700">Ticket Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Your ticket has been submitted and is now in the queue.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Create a Job Specification Ticket</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Back to dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-1" htmlFor="specification">
              Job Specification
            </label>
            <textarea
              id="specification"
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-2"
              value={specification}
              onChange={handleSpecificationChange}
              required
              placeholder="Paste or write the full job specification here..."
            />
          </div>

          {/* Priority Display */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-gray-700">Priority Level:</span>
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Analyzing...</span>
                </div>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(priority)}`}>
                  {priority}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              AI-powered analysis
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 