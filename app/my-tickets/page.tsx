"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from '@workos-inc/authkit-nextjs/components'
import { useBackendAuth } from '@/contexts/backend-auth-context'

interface Ticket {
  id: string
  ticket_number: string
  company_name: string
  contact_name: string
  position_title: string
  status: 'pending' | 'in-review' | 'matched' | 'placed' | 'completed' | 'cancelled'
  priority: string
  created_at: string
  updated_at: string
  assigned_to?: string
  budget_min?: number
  budget_max?: number
  currency?: string
  source?: 'local' | 'jira'
  jira_key?: string
  jira_project?: string
  placements?: any[]
  has_placements?: boolean
}

export default function MyTicketsPage() {
  const { t } = useLanguage()
  const auth = useAuth()
  const { backendUser } = useBackendAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-review' | 'matched' | 'completed'>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'local' | 'jira'>('all')
  const [placementFilter, setPlacementFilter] = useState<'all' | 'with-placements' | 'without-placements'>('all')

  // Fetch real tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      try {
        const userEmail = auth.user?.email || backendUser?.email
        
        if (!userEmail) {
          console.warn('No user email found for fetching tickets')
          setTickets([])
          return
        }

        const response = await fetch(`/api/tickets?include_jira=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Failed to fetch tickets:', errorData)
          setTickets([])
          return
        }
        
        const ticketsData = await response.json()
        // Handle the new API response format that includes both local and JIRA tickets
        const ticketsArray = ticketsData.tickets || ticketsData
        setTickets(ticketsArray)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [auth.user, backendUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-review':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'matched':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filter === 'all' || ticket.status === filter
    const sourceMatch = sourceFilter === 'all' || ticket.source === sourceFilter
    const placementMatch = placementFilter === 'all' || 
      (placementFilter === 'with-placements' && ticket.has_placements) ||
      (placementFilter === 'without-placements' && !ticket.has_placements)
    return statusMatch && sourceMatch && placementMatch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M19 12H5m7-7-7 7 7 7"/>
              </svg>
              <span className="text-gray-700 font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              My Tickets
            </h1>
            <Link href="/create-ticket">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                New Ticket
              </button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h18v18H3z"></path>
                      <path d="M8 8h8"></path>
                      <path d="M8 12h8"></path>
                      <path d="M8 16h5"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Local</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tickets.filter(t => t.source === 'local').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4"></path>
                      <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                      <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">JIRA</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tickets.filter(t => t.source === 'jira').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tickets.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tickets.filter(t => t.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">With Placements</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tickets.filter(t => t.has_placements).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="space-y-4">
                {/* Status Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'in-review', 'matched', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          filter === status
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Source Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Source</h3>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'local', 'jira'].map((source) => (
                      <button
                        key={source}
                        onClick={() => setSourceFilter(source as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          sourceFilter === source
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Placement Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Placements</h3>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'with-placements', 'without-placements'].map((placement) => (
                      <button
                        key={placement}
                        onClick={() => setPlacementFilter(placement as any)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          placementFilter === placement
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {placement === 'all' ? 'All' : 
                         placement === 'with-placements' ? 'With Placements' : 
                         'Without Placements'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">Loading tickets...</span>
                </div>
              ) : filteredTickets.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {ticket.position_title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                            {ticket.source && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ticket.source === 'jira' 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}>
                                {ticket.source.toUpperCase()}
                              </span>
                            )}
                            {ticket.has_placements && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-purple-200">
                                PLACEMENTS
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            <p><strong>Client:</strong> {ticket.contact_name} • {ticket.company_name}</p>
                            <p><strong>Ticket #:</strong> {ticket.ticket_number}</p>
                            {ticket.budget_min && ticket.budget_max && (
                              <p><strong>Budget:</strong> {ticket.budget_min} - {ticket.budget_max} {ticket.currency || 'USD'}</p>
                            )}
                            {ticket.assigned_to && (
                              <p><strong>Assigned to:</strong> {ticket.assigned_to}</p>
                            )}
                            {ticket.jira_key && (
                              <p><strong>JIRA Key:</strong> {ticket.jira_key}</p>
                            )}
                            {ticket.has_placements && (
                              <p><strong>Placements:</strong> {ticket.placements?.length || 0} candidate(s) assigned</p>
                            )}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 gap-4">
                            <span>Created: {formatDate(ticket.created_at)}</span>
                            <span>Updated: {formatDate(ticket.updated_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-6">
                          <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                            View Details
                          </button>
                          <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                            Edit
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h18v18H3z"></path>
                      <path d="M8 8h8"></path>
                      <path d="M8 12h8"></path>
                      <path d="M8 16h5"></path>
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">
                    {filter === 'all' ? 'No tickets found' : `No ${filter.replace('-', ' ')} tickets`}
                  </p>
                  <p className="text-gray-400 mt-1">
                    {filter === 'all' 
                      ? 'Create your first ticket to get started' 
                      : 'Try adjusting your filter or create a new ticket'
                    }
                  </p>
                  <Link href="/create-ticket">
                    <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Create New Ticket
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 