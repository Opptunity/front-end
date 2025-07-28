'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Users, MapPin, DollarSign, Phone, Mail, ExternalLink, Plus, User, Calendar, Clock, Upload, FileText, Loader2, ArrowLeft } from 'lucide-react';

interface Profiler {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  availability_status: string;
  preferred_work_arrangement: string[];
  skills: any[];
  experience_level: string;
  years_of_experience: number;
  hourly_rate: number;
  daily_rate: number;
  currency: string;
  bio: string;
  linkedin_url: string;
  portfolio_url: string;
  resume_url: string;
  certifications: any[];
  languages: any[];
  preferred_industries: any[];
  contract_types: string[];
  notice_period_days: number;
  created_at: string;
  updated_at: string;
}

export default function ProfilerDirectoryPage() {
  const router = useRouter();
  const [profilers, setProfilers] = useState<Profiler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedProfiler, setSelectedProfiler] = useState<Profiler | null>(null);
  
  // Add new states for the dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [profilerEmail, setProfilerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchProfilers();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchProfilers();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, skillsFilter, availabilityFilter, locationFilter]);

  const fetchProfilers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (skillsFilter) params.append('skills', skillsFilter);
      if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
      if (locationFilter) params.append('location', locationFilter);

      const response = await fetch(`/api/profilers?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProfilers(data.profilers || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch profilers');
      }
    } catch (err) {
      setError('Failed to fetch profilers');
      console.error('Error fetching profilers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openProfilerDetails = (profiler: Profiler) => {
    setSelectedProfiler(profiler);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  // Add new function to handle CV file upload
  const handleCvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  // Add new function to handle profiler submission
  const handleAddProfiler = async () => {
    if (!cvFile) {
      setSubmitError('Please upload a CV file');
      return;
    }

    if (!profilerEmail.trim()) {
      setSubmitError('Please enter profiler email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      // Upload and process the CV file
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('email', profilerEmail);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to process CV file');
      }

      const uploadData = await uploadResponse.json();
      const cvContent = uploadData.text || uploadData.original_text;

      // Create assessment from CV
      const assessmentResponse = await fetch('/api/assessments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvText: cvContent,
          email: profilerEmail,
        }),
      });

      if (!assessmentResponse.ok) {
        throw new Error('Failed to analyze CV');
      }

      const assessmentData = await assessmentResponse.json();
      console.log('Full Assessment Response:', assessmentData); // Debug log

      // The actual assessment data is nested under the 'assessment' property
      const assessment = assessmentData.assessment || assessmentData;
      console.log('Nested Assessment:', assessment); // Debug log

      // Extract name from assessment data
      let firstName = 'Unknown';
      let lastName = 'User';
      
      if (assessment.name) {
        const nameParts = assessment.name.split(' ');
        firstName = nameParts[0] || 'Unknown';
        lastName = nameParts.slice(1).join(' ') || 'User';
      }

      // Extract skills from technicalSkills array
      let skills = [];
      if (assessment.technicalSkills && Array.isArray(assessment.technicalSkills)) {
        skills = assessment.technicalSkills.map(item => ({
          name: item.skill || item.name || item,
          level: item.level || 'Intermediate'
        }));
      }

      // Extract experience level
      const experienceLevel = assessment.experienceLevel || 'mid';

      // Extract bio/summary
      const bio = assessment.summary || 'Professional profile extracted from CV';

      // Extract years of experience
      const yearsOfExperience = assessment.yearsOfExperience || null;

      // Extract location
      const location = assessment.location || 
                      assessment.contactInfo?.residenceAddress || 
                      null;

      // Extract phone
      const phone = assessment.phone || null;

      console.log('Extracted data:', {
        firstName,
        lastName,
        skills,
        experienceLevel,
        bio,
        yearsOfExperience,
        location,
        phone
      }); // Debug log

      // Create profiler with assessment data
      const profilerResponse = await fetch('/api/profilers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profilerEmail,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          location: location,
          skills: skills,
          experience_level: experienceLevel,
          years_of_experience: yearsOfExperience,
          bio: bio,
        }),
      });

      if (!profilerResponse.ok) {
        throw new Error('Failed to create profiler');
      }

      // Reset form and close dialog
      setCvFile(null);
      setProfilerEmail('');
      setIsAddDialogOpen(false);
      
      // Refresh profilers list
      fetchProfilers();

    } catch (error) {
      console.error('Error adding profiler:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to add profiler');
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profiler Directory</h1>
            <p className="text-gray-600">Browse and manage your candidate database</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 lg:mt-0 bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Profiler
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Add New Profiler
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div>
                  <Label htmlFor="profilerEmail">Email Address *</Label>
                  <Input
                    id="profilerEmail"
                    type="email"
                    value={profilerEmail}
                    onChange={(e) => setProfilerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                {/* CV Upload Section */}
                <div className="space-y-4">
                  <Label>CV File *</Label>
                  
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleCvFileChange}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Upload CV file (.txt, .pdf, .doc, .docx)
                      </span>
                    </label>
                  </div>

                  {/* File Selected Display */}
                  {cvFile && (
                    <div className="flex items-center justify-between p-2 border rounded-md bg-blue-50">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm">{cvFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCvFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProfiler}
                    disabled={isSubmitting || !cvFile}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Profiler
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search profilers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Input
              placeholder="Filter by skills..."
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
            />

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Profilers</p>
                <p className="text-2xl font-bold text-gray-900">{profilers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profilers.filter(p => p.availability_status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Busy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profilers.filter(p => p.availability_status === 'busy').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Unavailable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profilers.filter(p => p.availability_status === 'unavailable').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Profilers Grid */}
      {profilers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No profilers found</h3>
            <p className="text-gray-600">No profilers match your current search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {profilers.map((profiler, index) => (
            <motion.div
              key={profiler.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openProfilerDetails(profiler)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {profiler.first_name} {profiler.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{profiler.email}</p>
                    </div>
                    <Badge className={getAvailabilityColor(profiler.availability_status)}>
                      {profiler.availability_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Experience:</span>
                        <p className="font-medium">{profiler.experience_level}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Years:</span>
                        <p className="font-medium">{profiler.years_of_experience || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {profiler.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-700">{profiler.location}</span>
                      </div>
                    )}

                    {/* Rates */}
                    {(profiler.hourly_rate || profiler.daily_rate) && (
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-700">
                          {profiler.hourly_rate && `${formatCurrency(profiler.hourly_rate, profiler.currency)}/hr`}
                          {profiler.hourly_rate && profiler.daily_rate && ' • '}
                          {profiler.daily_rate && `${formatCurrency(profiler.daily_rate, profiler.currency)}/day`}
                        </span>
                      </div>
                    )}

                    {/* Notice Period */}
                    {profiler.notice_period_days > 0 && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-gray-700">{profiler.notice_period_days} days notice</span>
                      </div>
                    )}

                    {/* Skills Preview */}
                    {profiler.skills && profiler.skills.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm block mb-2">Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {profiler.skills.slice(0, 4).map((skill: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {typeof skill === 'string' ? skill : skill.name || skill.skill}
                            </Badge>
                          ))}
                          {profiler.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{profiler.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bio Preview */}
                    {profiler.bio && (
                      <div>
                        <span className="text-gray-500 text-sm block mb-1">Bio:</span>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {profiler.bio.length > 100 ? `${profiler.bio.substring(0, 100)}...` : profiler.bio}
                        </p>
                      </div>
                    )}

                    {/* Contract Types */}
                    {profiler.contract_types && profiler.contract_types.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm block mb-1">Contract Types:</span>
                        <div className="flex flex-wrap gap-1">
                          {profiler.contract_types.map((type, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Last updated: {formatDate(profiler.updated_at)}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2 pt-2">
                      {profiler.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${profiler.phone}`, '_self');
                          }}
                          className="flex-1"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${profiler.email}`, '_self');
                        }}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>

                      {profiler.linkedin_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(profiler.linkedin_url, '_blank');
                          }}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          LinkedIn
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Profiler Details Modal */}
      <Dialog open={!!selectedProfiler} onOpenChange={() => setSelectedProfiler(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedProfiler && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedProfiler.first_name} {selectedProfiler.last_name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 mb-2">{selectedProfiler.email}</p>
                    {selectedProfiler.phone && (
                      <p className="text-gray-600 mb-2">📞 {selectedProfiler.phone}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getAvailabilityColor(selectedProfiler.availability_status)}>
                      {selectedProfiler.availability_status}
                    </Badge>
                    {selectedProfiler.notice_period_days > 0 && (
                      <Badge variant="outline">
                        {selectedProfiler.notice_period_days} days notice
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {selectedProfiler.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedProfiler.bio}</p>
                  </div>
                )}

                {/* Professional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Professional Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Experience Level:</span>
                        <span className="ml-2 font-medium">{selectedProfiler.experience_level || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Years of Experience:</span>
                        <span className="ml-2 font-medium">{selectedProfiler.years_of_experience || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <span className="ml-2 font-medium">{selectedProfiler.location || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Rates & Availability</h3>
                    <div className="space-y-2 text-sm">
                      {selectedProfiler.hourly_rate && (
                        <div>
                          <span className="text-gray-500">Hourly Rate:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(selectedProfiler.hourly_rate, selectedProfiler.currency)}
                          </span>
                        </div>
                      )}
                      {selectedProfiler.daily_rate && (
                        <div>
                          <span className="text-gray-500">Daily Rate:</span>
                          <span className="ml-2 font-medium">
                            {formatCurrency(selectedProfiler.daily_rate, selectedProfiler.currency)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Notice Period:</span>
                        <span className="ml-2 font-medium">{selectedProfiler.notice_period_days} days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedProfiler.skills && selectedProfiler.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfiler.skills.map((skill: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {typeof skill === 'string' ? skill : skill.name || skill.skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contract Types & Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedProfiler.contract_types && selectedProfiler.contract_types.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Contract Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfiler.contract_types.map((type, idx) => (
                          <Badge key={idx} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProfiler.preferred_work_arrangement && selectedProfiler.preferred_work_arrangement.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Work Arrangements</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfiler.preferred_work_arrangement.map((arrangement, idx) => (
                          <Badge key={idx} variant="outline">{arrangement}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {selectedProfiler.certifications && selectedProfiler.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfiler.certifications.map((cert: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {typeof cert === 'string' ? cert : cert.name || cert.certification}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedProfiler.languages && selectedProfiler.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfiler.languages.map((lang: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {typeof lang === 'string' ? lang : lang.name || lang.language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                <div className="flex space-x-4">
                  {selectedProfiler.linkedin_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedProfiler.linkedin_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      LinkedIn Profile
                    </Button>
                  )}
                  
                  {selectedProfiler.portfolio_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedProfiler.portfolio_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portfolio
                    </Button>
                  )}

                  {selectedProfiler.resume_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedProfiler.resume_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>

                {/* Timestamps */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  <p>Added: {formatDate(selectedProfiler.created_at)}</p>
                  <p>Last updated: {formatDate(selectedProfiler.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 