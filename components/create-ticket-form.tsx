"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CreateTicketFormProps {
  onClose: () => void;
}

export default function CreateTicketForm({ onClose }: CreateTicketFormProps) {
  const [requirements, setRequirements] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would send the ticket to the backend
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-700">Ticket Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Your ticket has been submitted and is now in the queue.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Create a New Ticket</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <p className="mb-6 text-gray-600">Please enter the customer requirements below to create a structured ticket.</p>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="requirements" className="block font-medium mb-2 text-gray-700">
            Customer Requirements
          </label>
          <textarea
            id="requirements"
            className="w-full border border-gray-300 rounded-lg p-3 mb-6 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
            required
            placeholder="Describe the customer requirements in detail..."
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </motion.div>
  );
} 