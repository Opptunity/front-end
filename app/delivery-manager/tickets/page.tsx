'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, Search, User, Building, Clock, DollarSign, Users, ArrowRight, Eye, ExternalLink, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Ticket {
  id: string;
  ticket_number: string;
  client_company?: string;
  company_name?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  position_title: string;
  status: string;
  priority: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level?: string;
  work_location?: string;
  location?: string;
  work_arrangement?: string;
  contract_type?: string;
  start_date?: string;
  end_date?: string;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  created_at: string;
  updated_at?: string;
  assigned_to?: string | null;
  placement_count?: number;
  project_description?: string;
  special_requirements?: string;
  created_by_user?: {
    email: string;
    username: string;
  };
  source?: 'local' | 'jira';
  jira_key?: string;
  jira_project?: string;
}

export default function DeliveryManagerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Change default to 'without_placements'
  const [placementFilter, setPlacementFilter] = useState('without_placements');
  const [ticketStats, setTicketStats] = useState({ 
    total: 0, 
    local_count: 0, 
    jira_count: 0,
    with_placements: 0,
    without_placements: 0
  });
  const [includeJira, setIncludeJira] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [debuggingAI, setDebuggingAI] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for placementFilter URL parameter
    const urlPlacementFilter = searchParams.get('placementFilter');
    if (urlPlacementFilter && ['all', 'with_placements', 'without_placements'].includes(urlPlacementFilter)) {
      setPlacementFilter(urlPlacementFilter);
    }
    
    // Check for success message parameter (only show if explicitly set)
    const showSuccess = searchParams.get('showSuccess');
    if (showSuccess === 'true') {
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Remove the success parameter from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('showSuccess');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (!includeJira) params.append('include_jira', 'false');

      console.log('Fetching tickets with params:', params.toString());
      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();

      console.log('API Response:', { status: response.status, data });

      if (response.ok) {
        const tickets = data.tickets || data || [];
        console.log(`Found ${tickets.length} tickets for delivery manager`);
        
        // Update statistics
        setTicketStats({
          total: data.total || tickets.length,
          local_count: data.local_count || tickets.filter((t: Ticket) => t.source !== 'jira').length,
          jira_count: data.jira_count || tickets.filter((t: Ticket) => t.source === 'jira').length,
          with_placements: 0,
          without_placements: 0
        });
        
        // Fetch placement counts for each ticket (both local and JIRA tickets)
        const ticketsWithPlacements = await Promise.all(
          tickets.map(async (ticket: Ticket) => {
            try {
              // Fetch placements for all tickets (both local and JIRA)
              const placementResponse = await fetch(`/api/placements?ticket_id=${ticket.id}`);
              const placementData = await placementResponse.json();
              
              return {
                ...ticket,
                placement_count: placementData.placements?.length || 0
              };
            } catch (err) {
              console.error('Error fetching placements for ticket:', ticket.id, err);
              return {
                ...ticket,
                placement_count: 0
              };
            }
          })
        );

        setTickets(ticketsWithPlacements);
        
        // Update placement statistics
        const withPlacements = ticketsWithPlacements.filter((t: Ticket) => (t.placement_count || 0) > 0).length;
        const withoutPlacements = ticketsWithPlacements.filter((t: Ticket) => (t.placement_count || 0) === 0).length;
        
        setTicketStats(prev => ({
          ...prev,
          with_placements: withPlacements,
          without_placements: withoutPlacements
        }));
        
        setError('');
      } else {
        console.error('API Error:', data);
        setError(data.error || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchTickets();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, includeJira]);

  // Filter tickets based on placement filter
  const filteredTickets = tickets.filter(ticket => {
    if (placementFilter === 'all') return true;
    if (placementFilter === 'with_placements') return (ticket.placement_count || 0) > 0;
    if (placementFilter === 'without_placements') return (ticket.placement_count || 0) === 0;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const viewTicketDetails = (ticketId: string) => {
    router.push(`/delivery-manager/tickets/${ticketId}`);
  };

  const findCandidates = (ticketId: string) => {
    router.push(`/delivery-manager/tickets/${ticketId}/candidates`);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const syncJiraTickets = async () => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      console.log('Starting manual JIRA sync...');
      const response = await fetch('/api/jira-sync?action=sync&maxResults=100');
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('JIRA sync completed:', data.details);
        // Refresh the tickets after sync
        await fetchTickets();
      } else {
        console.error('JIRA sync failed:', data.error);
        setError(data.error || 'Failed to sync JIRA tickets');
      }
    } catch (err) {
      console.error('Error triggering JIRA sync:', err);
      setError('Failed to sync JIRA tickets');
    } finally {
      setSyncing(false);
    }
  };

  const cleanupDeletedTickets = async () => {
    if (cleaningUp) return;
    
    setCleaningUp(true);
    try {
      console.log('Starting JIRA cleanup...');
      const response = await fetch('/api/jira-sync?action=cleanup');
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('JIRA cleanup completed:', data.details);
        const deletedCount = data.details?.deleted || 0;
        if (deletedCount > 0) {
          alert(`✅ Cleanup completed! Removed ${deletedCount} deleted JIRA tickets from the database.`);
        } else {
          alert('✅ Cleanup completed! No deleted tickets found.');
        }
        // Refresh the tickets after cleanup
        await fetchTickets();
      } else {
        console.error('JIRA cleanup failed:', data.error);
        setError(data.error || 'Failed to cleanup JIRA tickets');
      }
    } catch (err) {
      console.error('Error triggering JIRA cleanup:', err);
      setError('Failed to cleanup JIRA tickets');
    } finally {
      setCleaningUp(false);
    }
  };

  const testJiraAI = async () => {
    if (testingAI) return;
    
    setTestingAI(true);
    try {
      console.log('Testing JIRA AI field extraction (description only)...');
      const response = await fetch('/api/test-jira-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: `We need a Senior Full-Stack Developer for our E-commerce platform project.

Requirements:
- 5+ years React and TypeScript experience
- Node.js backend development
- AWS cloud services knowledge
- Experience with PostgreSQL
- Bachelor's degree preferred

Responsibilities:
- Build modern web applications
- Develop REST APIs
- Work with cross-functional teams
- Code reviews and mentoring

Budget: $95,000 - $125,000 annually
Location: San Francisco, CA (Remote friendly)
Contract: Full-time permanent position
Start Date: February 2025

Contact: hiring@techcorp.com
Phone: (555) 123-4567

This is an urgent high-priority position for our growing engineering team.`,
          summary: "Senior Full-Stack Developer - E-commerce Platform"
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('AI field extraction test successful:', data.extracted_fields);
        alert(`✅ AI Test Successful!\n\nExtracted Database Fields:\n- Position: ${data.extracted_fields.position_title}\n- Company: ${data.extracted_fields.company_name || 'Not extracted'}\n- Skills: ${data.extracted_fields.required_skills?.slice(0, 3).join(', ') || 'Not extracted'}${data.extracted_fields.required_skills?.length > 3 ? '...' : ''}\n- Budget: $${data.extracted_fields.budget_min || '?'} - $${data.extracted_fields.budget_max || '?'}\n- Location: ${data.extracted_fields.work_location || data.extracted_fields.location || 'Not extracted'}\n- Seniority: ${data.extracted_fields.seniority || 'Not extracted'}\n- Contact: ${data.extracted_fields.contact_email || 'Not extracted'}\n\n🎯 AI field extraction from description only is working!`);
      } else {
        console.error('AI test failed:', data.error);
        alert(`❌ AI Test Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error testing AI:', err);
      alert(`❌ AI Test Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setTestingAI(false);
    }
  };

  const debugAI = async () => {
    if (debuggingAI) return;
    
    setDebuggingAI(true);
    try {
      console.log('Testing AI configuration...');
      const response = await fetch('/api/debug-ai');
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('AI debug successful:', data.details);
        alert(`✅ OpenAI Configuration OK!\n\nModel: ${data.details.model_used}\nOpenAI Configured: ${data.details.openai_configured}\n\nResponse: ${data.details.ai_response}\n\n🎯 AI is ready for JIRA field extraction!`);
      } else {
        console.error('AI debug failed:', data.error);
        alert(`❌ AI Configuration Issue!\n\n${data.error}\n\n${data.details?.message || ''}\n\n🔧 Fix: Add OPENAI_API_KEY to your .env.local file`);
      }
    } catch (err) {
      console.error('Error debugging AI:', err);
      alert(`❌ AI Debug Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDebuggingAI(false);
    }
  };

  // Add function to handle placement filter change
  const handlePlacementFilterChange = (filter: string) => {
    setPlacementFilter(filter);
    // Update URL parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('placementFilter', filter);
    // Don't include showSuccess parameter when manually switching filters
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToDashboard}
                className="flex items-center mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Queue</h1>
            <p className="text-gray-600">Manage incoming staffing requests and assign candidates</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
              {/*ticketStats.total > 0 && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Total: {ticketStats.total}</span>
                  </div>
                  {ticketStats.local_count > 0 && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Local: {ticketStats.local_count}</span>
                    </div>
                  )}
                  {ticketStats.jira_count > 0 && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">JIRA: {ticketStats.jira_count}</span>
                    </div>
                  )}
                  {ticketStats.with_placements > 0 && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">With Placements: {ticketStats.with_placements}</span>
                    </div>
                  )}
                  {ticketStats.without_placements > 0 && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Without Placements: {ticketStats.without_placements}</span>
                    </div>
                  )}
                </div>
              ) */}
              {includeJira && (              
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={debugAI}
                    disabled={debuggingAI}
                    className="flex items-center bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${debuggingAI ? 'animate-spin' : ''}`} />
                    {debuggingAI ? 'Checking...' : 'Debug AI'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testJiraAI}
                    disabled={testingAI}
                    className="flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${testingAI ? 'animate-spin' : ''}`} />
                    {testingAI ? 'Testing...' : 'Test AI'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={syncJiraTickets}
                    disabled={syncing}
                    className="flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync JIRA'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cleanupDeletedTickets}
                    disabled={cleaningUp}
                    className="flex items-center bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${cleaningUp ? 'animate-spin' : ''}`} />
                    {cleaningUp ? 'Cleaning...' : 'Cleanup'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">
              ✅ Placement created successfully! You can now see the ticket in the "Filled Positions" filter.
            </p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Segmented Control for Placement Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Ticket Status</Label>
              <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                <Button
                  variant={placementFilter === 'without_placements' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePlacementFilterChange('without_placements')}
                  className={`rounded-md transition-all ${
                    placementFilter === 'without_placements'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Open Positions
                  {ticketStats.without_placements > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {ticketStats.without_placements}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={placementFilter === 'with_placements' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePlacementFilterChange('with_placements')}
                  className={`rounded-md transition-all ${
                    placementFilter === 'with_placements'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Filled Positions
                  {ticketStats.with_placements > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {ticketStats.with_placements}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={placementFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handlePlacementFilterChange('all')}
                  className={`rounded-md transition-all ${
                    placementFilter === 'all'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  All Tickets
                  {ticketStats.total > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {ticketStats.total}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* JIRA Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="include-jira"
                checked={includeJira}
                onCheckedChange={setIncludeJira}
              />
              <Label htmlFor="include-jira" className="text-sm font-medium">
                Include JIRA tickets
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600">No tickets match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">
                        {ticket.position_title}
                      </CardTitle>
                          {ticket.source === 'jira' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              JIRA
                            </Badge>
                          )}
                        </div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        { ticket.company_name ||  'Unknown Company'}
                          {ticket.source === 'jira' && ticket.jira_key && (
                            <span className="ml-2 text-xs text-blue-600 font-mono">
                              {ticket.jira_key}
                            </span>
                          )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      {ticket.placement_count !== undefined && ticket.placement_count > 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Users className="h-3 w-3 mr-1" />
                          {ticket.placement_count} assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Ticket Number and Date */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="font-mono">{ticket.ticket_number}</span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>

                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Experience:</span>
                        <p className="font-medium">{ticket.experience_level || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium">{ticket.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Contract:</span>
                        <p className="font-medium">{ticket.contract_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Work Style:</span>
                        <p className="font-medium">{ticket.work_arrangement || 'Not specified'}</p>
                      </div>
                    </div>

                    {/* Budget */}
                    {(ticket.budget_min || ticket.budget_max) && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-500 mr-2">Budget:</span>
                        <span className="font-medium">
                          {ticket.budget_min && ticket.budget_max 
                            ? `${formatCurrency(ticket.budget_min, ticket.currency)} - ${formatCurrency(ticket.budget_max, ticket.currency)}`
                            : ticket.budget_min 
                              ? `From ${formatCurrency(ticket.budget_min, ticket.currency)}`
                              : ticket.budget_max
                                ? `Up to ${formatCurrency(ticket.budget_max, ticket.currency)}`
                                : 'Budget not specified'
                          }
                        </span>
                      </div>
                    )}

                    {/* Required Skills */}
                    {ticket.required_skills && ticket.required_skills.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm block mb-2">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {ticket.required_skills.slice(0, 4).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {ticket.required_skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{ticket.required_skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {ticket.start_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Start: {formatDate(ticket.start_date)}</span>
                        {ticket.end_date && (
                          <span className="ml-2">• End: {formatDate(ticket.end_date)}</span>
                        )}
                      </div>
                    )}

                    {/* Created By */}
                    {ticket.created_by_user && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        <span>Created by: {ticket.created_by_user.email}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTicketDetails(ticket.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => findCandidates(ticket.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {ticket.placement_count && ticket.placement_count > 0 ? 'Manage Candidates' : 'Find Candidates'}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 