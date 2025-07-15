"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, Priority, getTicketById } from "@/lib/tickets-local";

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicketById(ticketId);
        setTicket(data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "Critical": return "🔥";
      case "High": return "⚡";
      case "Medium": return "📋";
      case "Low": return "📌";
      default: return "📄";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl border border-gray-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-red-700">Ticket Not Found</h2>
          <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push("/dashboard/my-tickets")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-gray-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-2">Ticket #{ticket.id}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                {getPriorityIcon(ticket.priority)} {ticket.priority} Priority
              </span>
              <span className="text-sm text-gray-500">
                Created: {new Date(ticket.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/my-tickets")}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Back to tickets"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Ticket Content */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Job Specification</h2>
          <div className="text-gray-800 whitespace-pre-line leading-relaxed">
            {ticket.specification}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push("/dashboard/my-tickets")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Back to Tickets
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Edit Ticket
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Mark as Complete
          </button>
        </div>
      </motion.div>
    </div>
  );
} 