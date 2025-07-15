"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, Priority, getUserTickets, clearAllTickets } from "@/lib/tickets-local";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getUserTickets();
        // Sort tickets by priority and then by creation date
        const sortedTickets = data.sort((a: Ticket, b: Ticket) => {
          const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTickets(sortedTickets);
        setFilteredTickets(sortedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

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

  const handleTicketClick = (ticketId: string) => {
    router.push(`/dashboard/my-tickets/${ticketId}`);
  };

  const handleClearAllTickets = () => {
    if (confirm('Are you sure you want to clear all tickets? This action cannot be undone.')) {
      clearAllTickets();
      setTickets([]);
      setFilteredTickets([]);
    }
  };

  const handlePriorityFilter = (priority: Priority | 'All') => {
    setSelectedPriority(priority);
    if (priority === 'All') {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket => ticket.priority === priority);
      setFilteredTickets(filtered);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-gray-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl border border-gray-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">My Tickets</h1>
          <div className="flex items-center space-x-2">
            {tickets.length > 0 && (
              <button
                onClick={handleClearAllTickets}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                title="Clear all tickets (for testing)"
              >
                Clear All
              </button>
            )}
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
        </div>

        {/* Priority Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Filter by Priority:</h3>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityFilter(priority)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                  selectedPriority === priority
                    ? priority === 'All'
                      ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'
                      : getPriorityColor(priority as Priority) + ' shadow-sm'
                    : priority === 'All'
                    ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {priority === 'All' ? '📋 All' : `${getPriorityIcon(priority as Priority)} ${priority}`}
              </button>
            ))}
          </div>
          {selectedPriority !== 'All' && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} with {selectedPriority} priority
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <p className="text-gray-500 text-lg">
              {selectedPriority === 'All' ? 'No tickets found' : `No ${selectedPriority} priority tickets found`}
            </p>
            <p className="text-gray-400 mt-1">
              {selectedPriority === 'All' ? 'Create a ticket to see it here' : 'Try selecting a different priority or create a new ticket'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                whileHover={{ scale: 1.01 }}
                onClick={() => handleTicketClick(ticket.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityIcon(ticket.priority)} {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-400">ID: {ticket.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-gray-800 whitespace-pre-line group-hover:text-gray-900 transition-colors duration-200">
                  {ticket.specification.length > 200 
                    ? `${ticket.specification.substring(0, 200)}...` 
                    : ticket.specification
                  }
                </div>
                <div className="mt-3 text-xs text-gray-500 group-hover:text-blue-600 transition-colors duration-200">
                  Click to view full details →
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 