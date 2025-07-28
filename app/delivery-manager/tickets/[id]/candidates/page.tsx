'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Users, Star, MapPin, Clock, DollarSign, Phone, Mail, ExternalLink, Plus, CheckCircle, Calendar, Globe, Briefcase, Award, User, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Ticket {
  id: string;
  ticket_number: string;
  position_title: string;
  company_name: string;
  required_skills: string[];
  preferred_skills: string[];
}

interface MatchedProfiler {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  availability_status: string;
  skills: any[];
  experience_level: string;
  years_of_experience: number;
  hourly_rate: number;
  daily_rate: number;
  currency: string;
  bio: string;
  linkedin_url: string;
  portfolio_url: string;
  contract_types: string[];
  notice_period_days: number;
  match_score: number;
  budget_compatible: boolean;
  existing_placement: any;
  match_details: {
    skills_match: number;
    experience_match: number;
    location_match: number;
    availability_match: number;
    budget_compatibility: number;
  };
  ai_analysis: {
    reasoning: string;
    overall_fit: string;
    strengths: string[];
    concerns: string[];
  };
}

export default function CandidateMatchingPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [allCandidates, setAllCandidates] = useState<MatchedProfiler[]>([]); // Store all candidates
  const [filteredCandidates, setFilteredCandidates] = useState<MatchedProfiler[]>([]); // Store filtered candidates
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availabilityOnly, setAvailabilityOnly] = useState(true);
  const [minMatchScore, setMinMatchScore] = useState(0.3);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchedProfiler | null>(null);
  const [placementNotes, setPlacementNotes] = useState('');
  const [placementLoading, setPlacementLoading] = useState(false);
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);

  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  useEffect(() => {
    if (ticketId) {
      fetchCandidates();
    }
  }, [ticketId, availabilityOnly]);

  // Filter candidates when match score changes
  useEffect(() => {
    filterCandidates();
  }, [minMatchScore, allCandidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Fetch all candidates with a very low minimum score to get the full dataset
      const queryParams = new URLSearchParams({
        availability_only: availabilityOnly.toString(),
        min_match_score: '0.1', // Very low threshold to get all candidates
        limit: '50' // Get more candidates for better filtering
      });

      const response = await fetch(`/api/profilers/match/${ticketId}?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setTicket(data.ticket);
        setAllCandidates(data.matched_profilers || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch candidates');
      }
    } catch (err) {
      setError('Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates locally based on match score
  const filterCandidates = () => {
    if (allCandidates.length === 0) return;
    const filtered = allCandidates.filter(candidate => candidate.match_score >= minMatchScore);
    setFilteredCandidates(filtered);
  };

  const createPlacement = async (profiler: MatchedProfiler) => {
    try {
      setPlacementLoading(true);
      
      const response = await fetch('/api/placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          profiler_id: profiler.id,
          status: 'proposed',
          notes: placementNotes || `Automatically matched with ${Math.round(profiler.match_score * 100)}% compatibility`
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state to show placement status without refetching
        setAllCandidates(prevCandidates => 
          prevCandidates.map(candidate => 
            candidate.id === profiler.id 
              ? { ...candidate, existing_placement: data }
              : candidate
          )
        );
        
        setFilteredCandidates(prevCandidates => 
          prevCandidates.map(candidate => 
            candidate.id === profiler.id 
              ? { ...candidate, existing_placement: data }
              : candidate
          )
        );
        
        // Close dialogs
        setSelectedCandidate(null);
        setPlacementNotes('');
        setShowCandidateDetails(false);
      } else {
        alert(data.error || 'Failed to create placement');
      }
    } catch (err) {
      console.error('Error creating placement:', err);
      alert('Failed to create placement');
    } finally {
      setPlacementLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAvailabilityColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'busy': return 'text-yellow-600 bg-yellow-50';
      case 'unavailable': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const openCandidateDetails = (candidate: MatchedProfiler) => {
    setSelectedCandidate(candidate);
    setShowCandidateDetails(true);
  };

  const closeCandidateDetails = () => {
    setShowCandidateDetails(false);
    setSelectedCandidate(null);
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
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/delivery-manager/tickets/${ticketId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Ticket
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Candidates</h1>
            {ticket && (
              <p className="text-gray-600">
                {ticket.position_title} at {ticket.company_name} • {ticket.ticket_number}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex items-center space-x-2">
              <Switch
                id="availability-filter"
                checked={availabilityOnly}
                onCheckedChange={setAvailabilityOnly}
              />
              <label htmlFor="availability-filter" className="text-sm font-medium">
                Available candidates only
              </label>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">
                Minimum Match Score: {Math.round(minMatchScore * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="text-sm text-gray-600">
              Found {filteredCandidates.length} candidates
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Required & Preferred Skills Reference */}
      {ticket && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Position Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticket.required_skills && ticket.required_skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.required_skills.map((skill, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {ticket.preferred_skills && ticket.preferred_skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {ticket.preferred_skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="border-green-300 text-green-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more candidates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCandidates.map((candidate: MatchedProfiler, index: number) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="hover:shadow-lg transition-shadow hover:border-purple-300"
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => openCandidateDetails(candidate)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {candidate.first_name} {candidate.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{candidate.email}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`px-3 py-1 rounded-full ${getMatchScoreColor(candidate.match_score)}`}>
                        <Star className="h-3 w-3 mr-1" />
                        {Math.round(candidate.match_score * 100)}% match
                      </Badge>
                      <Badge className={`px-3 py-1 rounded-full ${getAvailabilityColor(candidate.availability_status)}`}>
                        {candidate.availability_status}
                      </Badge>
                      {!candidate.budget_compatible && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Over Budget
                        </Badge>
                      )}
                      {candidate.existing_placement && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Already Proposed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Clickable content area */}
                    <div 
                      className="cursor-pointer space-y-4" 
                      onClick={() => openCandidateDetails(candidate)}
                    >
                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Experience:</span>
                        <p className="font-medium">{candidate.experience_level} ({candidate.years_of_experience}y)</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {candidate.location || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {/* Rates */}
                    {(candidate.hourly_rate || candidate.daily_rate) && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-500 mr-2">Rates:</span>
                        <span className="font-medium">
                          {candidate.hourly_rate && `${formatCurrency(candidate.hourly_rate, candidate.currency)}/hr`}
                          {candidate.hourly_rate && candidate.daily_rate && ' • '}
                          {candidate.daily_rate && `${formatCurrency(candidate.daily_rate, candidate.currency)}/day`}
                        </span>
                      </div>
                    )}

                    {/* Notice Period */}
                    {candidate.notice_period_days > 0 && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-500 mr-2">Notice Period:</span>
                        <span className="font-medium">{candidate.notice_period_days} days</span>
                      </div>
                    )}

                    {/* Skills Preview */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm block mb-2">Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 6).map((skill: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {typeof skill === 'string' ? skill : skill.name || skill.skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio Preview */}
                    {candidate.bio && (
                      <div>
                        <span className="text-gray-500 text-sm block mb-1">Bio:</span>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {candidate.bio.length > 120 ? `${candidate.bio.substring(0, 120)}...` : candidate.bio}
                        </p>
                      </div>
                    )}

                    {/* AI Analysis */}
                    {candidate.ai_analysis && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">AI Analysis</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-blue-700">Overall Fit:</span>
                            <span className="ml-1 text-xs text-blue-800">{candidate.ai_analysis.overall_fit}</span>
                          </div>
                          
                          {candidate.ai_analysis.strengths?.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-green-700">Strengths:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {candidate.ai_analysis.strengths.slice(0, 3).map((strength: string, idx: number) => (
                                  <Badge key={idx} className="text-xs bg-green-100 text-green-800 border-green-200">
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {candidate.ai_analysis.concerns?.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-orange-700">Concerns:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {candidate.ai_analysis.concerns.slice(0, 2).map((concern: string, idx: number) => (
                                  <Badge key={idx} className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                                    {concern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Match Details */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Match Breakdown</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Skills:</span>
                          <span className="ml-1 font-medium">{Math.round(candidate.match_details.skills_match * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Experience:</span>
                          <span className="ml-1 font-medium">{Math.round(candidate.match_details.experience_match * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-1 font-medium">{Math.round(candidate.match_details.location_match * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Availability:</span>
                          <span className="ml-1 font-medium">{Math.round(candidate.match_details.availability_match * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <span className="ml-1 font-medium">{Math.round(candidate.match_details.budget_compatibility * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      {candidate.linkedin_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(candidate.linkedin_url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          LinkedIn
                        </Button>
                      )}
                      
                      {candidate.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${candidate.phone}`, '_self')}
                          className="flex-1"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`mailto:${candidate.email}`, '_self')}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>

                      {candidate.existing_placement ? (
                        <Button disabled size="sm" className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Proposed
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(candidate);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Propose
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Propose Candidate</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">
                                  Propose <strong>{candidate.first_name} {candidate.last_name}</strong> for this position
                                </p>
                                <p className="text-xs text-gray-500">
                                  Match Score: {Math.round(candidate.match_score * 100)}% • 
                                  Status: {candidate.availability_status}
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Notes (optional)
                                </label>
                                <Textarea
                                  value={placementNotes}
                                  onChange={(e) => setPlacementNotes(e.target.value)}
                                  placeholder="Add any notes about this placement..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCandidate(null);
                                    setPlacementNotes('');
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => createPlacement(candidate)}
                                  disabled={placementLoading}
                                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                  {placementLoading ? 'Creating...' : 'Create Placement'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detailed Candidate Popup */}
      <Dialog open={showCandidateDetails} onOpenChange={setShowCandidateDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedCandidate?.first_name} {selectedCandidate?.last_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-lg font-medium">{selectedCandidate.email}</span>
                  </div>
                  {selectedCandidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="text-lg">{selectedCandidate.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-lg">{selectedCandidate.location || 'Location not specified'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`px-4 py-2 text-lg ${getMatchScoreColor(selectedCandidate.match_score)}`}>
                    <Star className="h-4 w-4 mr-2" />
                    {Math.round(selectedCandidate.match_score * 100)}% Match
                  </Badge>
                  <Badge className={`px-4 py-2 text-lg ${getAvailabilityColor(selectedCandidate.availability_status)}`}>
                    {selectedCandidate.availability_status}
                  </Badge>
                  {selectedCandidate.existing_placement && (
                    <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Already Proposed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Experience Level</span>
                      <p className="text-lg font-semibold">{selectedCandidate.experience_level} ({selectedCandidate.years_of_experience} years)</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Contract Types</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedCandidate.contract_types?.map((type, idx) => (
                          <Badge key={idx} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Notice Period</span>
                      <p className="text-lg">{selectedCandidate.notice_period_days} days</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCandidate.hourly_rate && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Hourly Rate</span>
                        <p className="text-lg font-semibold">{formatCurrency(selectedCandidate.hourly_rate, selectedCandidate.currency)}/hr</p>
                      </div>
                    )}
                    
                    {selectedCandidate.daily_rate && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Daily Rate</span>
                        <p className="text-lg font-semibold">{formatCurrency(selectedCandidate.daily_rate, selectedCandidate.currency)}/day</p>
                      </div>
                    )}

                    <div>
                      <span className="text-sm font-medium text-gray-500">Budget Compatibility</span>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedCandidate.budget_compatible ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Within Budget
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            Over Budget
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skills Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill: any, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {typeof skill === 'string' ? skill : skill.name || skill.skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills listed</p>
                  )}
                </CardContent>
              </Card>

              {/* Bio Section */}
              {selectedCandidate.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Bio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{selectedCandidate.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* AI Analysis */}
              {selectedCandidate.ai_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Analysis & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Overall Assessment</span>
                      <p className="text-lg font-semibold text-blue-800">{selectedCandidate.ai_analysis.overall_fit}</p>
                    </div>

                    {selectedCandidate.ai_analysis.reasoning && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Detailed Reasoning</span>
                        <p className="text-gray-700 mt-1">{selectedCandidate.ai_analysis.reasoning}</p>
                      </div>
                    )}

                    {selectedCandidate.ai_analysis.strengths?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Key Strengths</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCandidate.ai_analysis.strengths.map((strength: string, idx: number) => (
                            <Badge key={idx} className="bg-green-100 text-green-800 border-green-200">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCandidate.ai_analysis.concerns?.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Areas of Concern</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCandidate.ai_analysis.concerns.map((concern: string, idx: number) => (
                            <Badge key={idx} className="bg-orange-100 text-orange-800 border-orange-200">
                              {concern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Match Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Match Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(selectedCandidate.match_details.skills_match * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Skills Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(selectedCandidate.match_details.experience_match * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(selectedCandidate.match_details.location_match * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Location</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(selectedCandidate.match_details.availability_match * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Availability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {Math.round(selectedCandidate.match_details.budget_compatibility * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Budget</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* External Links */}
              {(selectedCandidate.linkedin_url || selectedCandidate.portfolio_url) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      External Profiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {selectedCandidate.linkedin_url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedCandidate.linkedin_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          LinkedIn Profile
                        </Button>
                      )}
                      {selectedCandidate.portfolio_url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedCandidate.portfolio_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Portfolio
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedCandidate.phone && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedCandidate.phone}`, '_self')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call Candidate
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => window.open(`mailto:${selectedCandidate.email}`, '_self')}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>

                {selectedCandidate.existing_placement ? (
                  <Button disabled className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Already Proposed
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                                              <Button 
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(selectedCandidate);
                          }}
                        >
                        <Plus className="h-4 w-4" />
                        Propose Candidate
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Propose Candidate</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Propose <strong>{selectedCandidate.first_name} {selectedCandidate.last_name}</strong> for this position
                          </p>
                          <p className="text-xs text-gray-500">
                            Match Score: {Math.round(selectedCandidate.match_score * 100)}% • 
                            Status: {selectedCandidate.availability_status}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (optional)
                          </label>
                          <Textarea
                            value={placementNotes}
                            onChange={(e) => setPlacementNotes(e.target.value)}
                            placeholder="Add any notes about this placement..."
                            rows={3}
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedCandidate(null);
                              setPlacementNotes('');
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => createPlacement(selectedCandidate)}
                            disabled={placementLoading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            {placementLoading ? 'Creating...' : 'Create Placement'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 