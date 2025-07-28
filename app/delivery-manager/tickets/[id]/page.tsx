'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building, Calendar, Clock, DollarSign, MapPin, Users, User, FileText, Phone, Mail, ExternalLink } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Ticket {
  id: string;
  ticket_number: string;
  client_company?: string;
  company_name?: string;
  client_name: string; // Required - must always be provided
  client_email?: string;
  client_phone?: string;
  position_title: string;
  status: string;
  priority: string;
  required_skills?: string[] | string;
  preferred_skills?: string[] | string;
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
  project_description?: string;
  special_requirements?: string;
  responsibilities?: string[] | string;
  education_requirements?: string;
  certifications_required?: string[] | string;
  created_at: string;
  updated_at?: string;
  assigned_to?: string | null;
  created_by_user?: {
    email: string;
    username: string;
  };
  source?: 'local' | 'jira';
  jira_key?: string;
  jira_project?: string;
  jira_url?: string;
  jira_status?: string;
  jira_priority?: string;
}

interface Placement {
  id: string;
  profiler_id: string;
  status: string;
  match_score: number;
  notes: string;
  interview_scheduled_at: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  profilers: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    availability_status: string;
    skills: any[];
    experience_level: string;
    location: string;
  };
  placement_history: {
    id: string;
    status_changed_to: string;
    reason: string;
    notes: string;
    created_at: string;
    changed_by_user?: {
      email: string;
      username: string;
    };
  }[];
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketLoaded, setTicketLoaded] = useState(false);
  const [placementsLoaded, setPlacementsLoaded] = useState(false);

  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
      fetchPlacements();
    }
  }, [ticketId]);

  // Update loading state when both API calls complete
  useEffect(() => {
    if (ticketLoaded && placementsLoaded) {
      setLoading(false);
    }
  }, [ticketLoaded, placementsLoaded]);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      const data = await response.json();

      if (response.ok) {
        setTicket(data.ticket);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch ticket details');
      }
    } catch (err) {
      setError('Failed to fetch ticket details');
      console.error('Error fetching ticket:', err);
    } finally {
      setTicketLoaded(true);
    }
  };

  const fetchPlacements = async () => {
    try {
      const response = await fetch(`/api/placements?ticket_id=${ticketId}`);
      const data = await response.json();

      if (response.ok) {
        setPlacements(data.placements || []);
      } else {
        console.error('Failed to fetch placements:', data.error);
      }
    } catch (err) {
      console.error('Error fetching placements:', err);
    } finally {
      setPlacementsLoaded(true);
    }
  };

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

  const getPlacementStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'proposed': return 'bg-blue-100 text-blue-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'placed': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const findCandidates = () => {
    router.push(`/delivery-manager/tickets/${ticketId}/candidates`);
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

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested ticket could not be found.'}</p>
          <Button onClick={() => router.push('/delivery-manager/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/delivery-manager/tickets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{ticket.position_title}</h1>
              {ticket.source === 'jira' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  JIRA
                </Badge>
              )}
            </div>
            <p className="text-gray-600 flex items-center">
              <Building className="h-4 w-4 mr-1" />
              {ticket.company_name || ticket.client_company} • {ticket.ticket_number}
              {ticket.source === 'jira' && ticket.jira_url && (
                <a 
                  href={ticket.jira_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority.toUpperCase()} PRIORITY
            </Badge>
            {ticket.source !== 'jira' && (
            <Button onClick={findCandidates} className="bg-purple-600 hover:bg-purple-700">
              <Users className="h-4 w-4 mr-2" />
              Find Candidates
            </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Ticket Details</TabsTrigger>
          <TabsTrigger value="placements">
            Placements {placements.length > 0 && `(${placements.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Project Description</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {ticket.project_description || 'No description provided'}
                    </p>
                  </div>
                  
                  {ticket.responsibilities && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Responsibilities</h4>
                      {Array.isArray(ticket.responsibilities) ? (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {ticket.responsibilities.map((responsibility, index) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.responsibilities}</p>
                      )}
                    </div>
                  )}

                  {ticket.special_requirements && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Special Requirements</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.special_requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills & Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticket.required_skills && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                      {Array.isArray(ticket.required_skills) ? (
                      <div className="flex flex-wrap gap-2">
                        {ticket.required_skills.map((skill, index) => (
                          <Badge key={index} variant="default" className="bg-red-100 text-red-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      ) : (
                        <p className="text-gray-700">{ticket.required_skills}</p>
                      )}
                    </div>
                  )}

                  {ticket.preferred_skills && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Preferred Skills</h4>
                      {Array.isArray(ticket.preferred_skills) ? (
                      <div className="flex flex-wrap gap-2">
                        {ticket.preferred_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      ) : (
                        <p className="text-gray-700">{ticket.preferred_skills}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Experience Level</h4>
                      <p className="text-gray-700">{ticket.experience_level || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Education</h4>
                      <p className="text-gray-700">{ticket.education_requirements || 'Not specified'}</p>
                    </div>
                  </div>

                  {ticket.certifications_required && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Required Certifications</h4>
                      {Array.isArray(ticket.certifications_required) ? (
                      <div className="flex flex-wrap gap-2">
                        {ticket.certifications_required.map((cert, index) => (
                          <Badge key={index} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                      ) : (
                        <p className="text-gray-700">{ticket.certifications_required}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Key Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{ticket.location || ticket.work_location || 'Remote'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Work Arrangement</p>
                      <p className="font-medium">{ticket.work_arrangement || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Contract Type</p>
                      <p className="font-medium">{ticket.contract_type || 'Not specified'}</p>
                    </div>
                  </div>

                  {(ticket.budget_min || ticket.budget_max) && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="font-medium">
                          {ticket.budget_min && ticket.budget_max 
                            ? `${formatCurrency(ticket.budget_min, ticket.currency)} - ${formatCurrency(ticket.budget_max, ticket.currency)}`
                            : ticket.budget_min 
                              ? `From ${formatCurrency(ticket.budget_min, ticket.currency)}`
                              : `Up to ${formatCurrency(ticket.budget_max, ticket.currency)}`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.start_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Timeline</p>
                        <p className="font-medium">
                          {formatDate(ticket.start_date)}
                          {ticket.end_date && ` - ${formatDate(ticket.end_date)}`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Name</p>
                      <p className="font-medium">{ticket.contact_name || ticket.client_name || 'Not provided'}</p>
                    </div>
                  </div>

                  {(ticket.contact_email || ticket.client_email) && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a href={`mailto:${ticket.contact_email || ticket.client_email}`} className="font-medium text-blue-600 hover:underline">
                          {ticket.contact_email || ticket.client_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {(ticket.contact_phone || ticket.client_phone) && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a href={`tel:${ticket.contact_phone || ticket.client_phone}`} className="font-medium text-blue-600 hover:underline">
                          {ticket.contact_phone || ticket.client_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Created by</p>
                    <p className="font-medium">{ticket.created_by_user?.email || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">on {formatDate(ticket.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="placements">
          <div className="space-y-6">
            {placements.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No placements yet</h3>
                  <p className="text-gray-600 mb-4">Start by finding candidates for this position.</p>
                  <Button onClick={findCandidates} className="bg-purple-600 hover:bg-purple-700">
                    <Users className="h-4 w-4 mr-2" />
                    Find Candidates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {placements.map((placement) => (
                  <Card key={placement.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {placement.profilers.first_name} {placement.profilers.last_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{placement.profilers.email}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getPlacementStatusColor(placement.status)}>
                            {placement.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {placement.match_score && (
                            <Badge variant="outline">
                              {Math.round(placement.match_score * 100)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Experience:</span>
                            <p className="font-medium">{placement.profilers.experience_level || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="font-medium">{placement.profilers.location || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Availability:</span>
                            <p className="font-medium">{placement.profilers.availability_status || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{placement.profilers.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        {placement.notes && (
                          <div>
                            <span className="text-gray-500 text-sm">Notes:</span>
                            <p className="text-sm mt-1">{placement.notes}</p>
                          </div>
                        )}

                        {placement.interview_scheduled_at && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Interview: {formatDate(placement.interview_scheduled_at)}</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Placement created: {formatDate(placement.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 