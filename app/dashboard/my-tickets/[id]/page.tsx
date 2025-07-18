"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, Priority, getTicketById, updateTicket } from "@/lib/tickets-local";
import { FaUser, FaBuilding, FaEnvelope, FaList, FaCheckCircle, FaExclamationTriangle, FaMoneyBill, FaMapMarkerAlt, FaBriefcase, FaLightbulb, FaClipboardList, FaPhone, FaCalendarAlt } from 'react-icons/fa';

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

  const handleMarkAsComplete = async () => {
    await updateTicket(ticketId, { status: "Completed" });
    router.push("/dashboard/my-tickets");
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
          <div className="text-gray-800 whitespace-pre-line leading-relaxed mb-4">
            {ticket.specification}
          </div>
          {/* Enhanced Description Display */}
          {ticket.description && (() => {
            let summary: any = null;
            try {
              summary = JSON.parse(ticket.description);
            } catch {
              // Not JSON, show as plain text
              return (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                  <div className="text-gray-700 whitespace-pre-line">{ticket.description}</div>
                </div>
              );
            }
            // If JSON, show as summary fields
            return (
              <div className="mb-4 space-y-6">
                {summary.summary_sentence && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded mb-4 flex items-center">
                    <span style={{ marginRight: '0.5rem' }}><FaLightbulb color="#60a5fa" /></span>
                    <span className="text-blue-800 font-semibold">{summary.summary_sentence}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
                  {summary.position_title && <div><span style={{ marginRight: '0.25rem' }}><FaBriefcase color="#6b7280" /></span><strong>Position Title:</strong> {summary.position_title}</div>}
                  {summary.client_name && <div><span style={{ marginRight: '0.25rem' }}><FaUser color="#6b7280" /></span><strong>Client Name:</strong> {summary.client_name}</div>}
                  {summary.client_company && <div><span style={{ marginRight: '0.25rem' }}><FaBuilding color="#6b7280" /></span><strong>Client Company:</strong> {summary.client_company}</div>}
                  {summary.seniority && <div><span style={{ marginRight: '0.25rem' }}><FaClipboardList color="#6b7280" /></span><strong>Seniority:</strong> {summary.seniority}</div>}
                  {summary.required_skills && summary.required_skills.length > 0 && <div><span style={{ marginRight: '0.25rem' }}><FaList color="#6b7280" /></span><strong>Required Skills:</strong> {summary.required_skills.join(', ')}</div>}
                  {summary.contract_type && <div><span style={{ marginRight: '0.25rem' }}><FaBriefcase color="#6b7280" /></span><strong>Contract Type:</strong> {summary.contract_type}</div>}
                  {summary.duration && <div><span style={{ marginRight: '0.25rem' }}><FaClipboardList color="#6b7280" /></span><strong>Duration:</strong> {summary.duration}</div>}
                  {summary.experience && <div><span style={{ marginRight: '0.25rem' }}><FaClipboardList color="#6b7280" /></span><strong>Experience:</strong> {summary.experience}</div>}
                  {(summary.budget_min || summary.budget_max) && <div><span style={{ marginRight: '0.25rem' }}><FaMoneyBill color="#6b7280" /></span><strong>Budget:</strong> {summary.budget_min} - {summary.budget_max} {summary.currency || ''} ({summary.rate_type || ''})</div>}
                  {summary.work_arrangement && <div><span style={{ marginRight: '0.25rem' }}><FaClipboardList color="#6b7280" /></span><strong>Work Arrangement:</strong> {summary.work_arrangement}</div>}
                  {summary.work_location && <div><span style={{ marginRight: '0.25rem' }}><FaMapMarkerAlt color="#6b7280" /></span><strong>Work Location:</strong> {summary.work_location}</div>}
                  {summary.client_email && <div><span style={{ marginRight: '0.25rem' }}><FaEnvelope color="#6b7280" /></span><strong>Client Email:</strong> {summary.client_email}</div>}
                  {summary.client_phone && <div><span style={{ marginRight: '0.25rem' }}><FaPhone color="#6b7280" /></span><strong>Client Phone:</strong> {summary.client_phone}</div>}
                  {summary.start_date && <div><span style={{ marginRight: '0.25rem' }}><FaCalendarAlt color="#6b7280" /></span><strong>Start Date:</strong> {summary.start_date}</div>}
                </div>
                {summary.responsibilities && summary.responsibilities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><span style={{ marginRight: '0.5rem' }}><FaList color="#6b7280" /></span>Responsibilities</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {summary.responsibilities.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {summary.preferred_qualifications && summary.preferred_qualifications.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><span style={{ marginRight: '0.5rem' }}><FaCheckCircle color="#22c55e" /></span>Preferred Qualifications</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {summary.preferred_qualifications.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {summary.benefits && summary.benefits.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><span style={{ marginRight: '0.5rem' }}><FaMoneyBill color="#22c55e" /></span>Benefits</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {summary.benefits.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {summary.application_process && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><span style={{ marginRight: '0.5rem' }}><FaClipboardList color="#3b82f6" /></span>Application Process</h4>
                    <div className="text-gray-700 whitespace-pre-line">{summary.application_process}</div>
                  </div>
                )}
                {summary.red_flags && summary.red_flags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><span style={{ marginRight: '0.5rem' }}><FaExclamationTriangle color="#ef4444" /></span>Red Flags</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {summary.red_flags.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
          <div className="text-sm text-gray-600 mt-4 space-y-1">
            <div><strong>Status:</strong> {ticket.status}</div>
            <div><strong>Created At:</strong> {new Date(ticket.created_at).toLocaleString()}</div>
            <div><strong>Updated At:</strong> {new Date(ticket.updated_at).toLocaleString()}</div>
            {ticket.jiraKey && <div><strong>Jira Key:</strong> {ticket.jiraKey}</div>}
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
            onClick={handleMarkAsComplete}
          >
            Mark as Complete
          </button>
        </div>
      </motion.div>
    </div>
  );
} 