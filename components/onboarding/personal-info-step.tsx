'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, Calendar, MapPin, Mail, Briefcase } from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

// Add interface for team
interface Team {
  equipe_id: number;
  nom_equipe: string;
}

interface PersonalInfoStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: any) => void;
  data: Partial<OnboardingProfile>;
}

export function PersonalInfoStep({ onNext, onPrevious, onDataChange, data }: PersonalInfoStepProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    department: '',
    location: '',
    manager_email: '',
    adresse_residence: '',
    ...data
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch teams from database
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoadingTeams(true);
        const response = await fetch('/api/teams');
        if (response.ok) {
          const teamsData = await response.json();
          setTeams(teamsData);
        } else {
          console.warn('Failed to fetch teams, using fallback');
          setTeams([
            { equipe_id: 1, nom_equipe: 'Core Engineering' },
            { equipe_id: 2, nom_equipe: 'Frontend Specialists' },
            { equipe_id: 3, nom_equipe: 'Data & AI' },
            { equipe_id: 4, nom_equipe: 'Cloud & DevOps' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([
          { equipe_id: 1, nom_equipe: 'Core Engineering' },
          { equipe_id: 2, nom_equipe: 'Frontend Specialists' },
          { equipe_id: 3, nom_equipe: 'Data & AI' },
          { equipe_id: 4, nom_equipe: 'Cloud & DevOps' }
        ]);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.role?.trim()) {
      newErrors.role = 'Role is required';
    }
    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'DevOps',
    'Data Science',
    'QA/Testing',
    'Security',
    'Mobile',
    'Backend',
    'Frontend',
    'Full Stack',
    'Infrastructure',
    'Other'
  ];

  const roles = [
    'Software Engineer',
    'Senior Software Engineer',
    'Staff Software Engineer',
    'Principal Engineer',
    'Engineering Manager',
    'Tech Lead',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Security Engineer',
    'Mobile Developer',
    'QA Engineer',
    'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Tell us about yourself
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={formData.role || ''} 
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              value={formData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="Enter your department"
              className={errors.department ? 'border-red-500' : ''}
            />
            {errors.department && (
              <p className="text-sm text-red-500">{errors.department}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., New York, NY or Remote"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Manager Email (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="manager_email">Manager's Email (Optional)</Label>
          <Input
            id="manager_email"
            type="email"
            value={formData.manager_email || ''}
            onChange={(e) => handleChange('manager_email', e.target.value)}
            placeholder="Enter your manager's email (for notifications)"
          />
        </div>

        {/* Residence Address (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="adresse_residence">
            Residence Address
            <span className="text-gray-500 text-sm ml-1">(from CV if available)</span>
          </Label>
          <Input
            id="adresse_residence"
            value={formData.adresse_residence || ''}
            onChange={(e) => handleChange('adresse_residence', e.target.value)}
            placeholder="Enter your residence address"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 