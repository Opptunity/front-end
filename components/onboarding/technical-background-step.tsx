'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Code, Plus, X } from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

interface TechnicalBackgroundStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: any) => void;
  data: Partial<OnboardingProfile>;
}

export function TechnicalBackgroundStep({ onNext, onPrevious, onDataChange, data }: TechnicalBackgroundStepProps) {
  const [technicalBackground, setTechnicalBackground] = useState(data.technical_background || {
    experience_level: 'mid' as const,
    years_experience: 0,
    primary_technologies: [] as string[],
    previous_companies: [] as string[],
    education_background: ''
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    onDataChange({ technical_background: technicalBackground });
  }, [technicalBackground]);

  const handleChange = (field: string, value: string | number) => {
    setTechnicalBackground(prev => ({ ...prev, [field]: value }));
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !technicalBackground.primary_technologies.includes(newTechnology.trim())) {
      setTechnicalBackground(prev => ({
        ...prev,
        primary_technologies: [...prev.primary_technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnicalBackground(prev => ({
      ...prev,
      primary_technologies: prev.primary_technologies.filter(t => t !== tech)
    }));
  };

  const addCompany = () => {
    if (newCompany.trim() && !technicalBackground.previous_companies.includes(newCompany.trim())) {
      setTechnicalBackground(prev => ({
        ...prev,
        previous_companies: [...prev.previous_companies, newCompany.trim()]
      }));
      setNewCompany('');
    }
  };

  const removeCompany = (company: string) => {
    setTechnicalBackground(prev => ({
      ...prev,
      previous_companies: prev.previous_companies.filter(c => c !== company)
    }));
  };

  const suggestedTechnologies = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'C++',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Spring',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL',
    'Redis', 'GraphQL', 'REST API', 'Git', 'Jenkins', 'Terraform'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-600" />
          Your Technical Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Experience Level */}
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select 
              value={technicalBackground.experience_level} 
              onValueChange={(value) => handleChange('experience_level', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                <SelectItem value="senior">Senior (5-8 years)</SelectItem>
                <SelectItem value="lead">Lead (8+ years)</SelectItem>
                <SelectItem value="principal">Principal (10+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Input
              type="number"
              min="0"
              max="50"
              value={technicalBackground.years_experience}
              onChange={(e) => handleChange('years_experience', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Primary Technologies */}
        <div className="space-y-4">
          <Label>Primary Technologies & Skills</Label>
          
          {/* Current Technologies */}
          {technicalBackground.primary_technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technicalBackground.primary_technologies.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeTechnology(tech)}
                    />
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Technology */}
          <div className="flex gap-2">
            <Input
              value={newTechnology}
              onChange={(e) => setNewTechnology(e.target.value)}
              placeholder="Add a technology or skill"
              onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
            />
            <Button type="button" variant="outline" onClick={addTechnology}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggested Technologies */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Suggested Technologies:</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTechnologies
                .filter(tech => !technicalBackground.primary_technologies.includes(tech))
                .slice(0, 12)
                .map(tech => (
                  <Badge 
                    key={tech}
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      setTechnicalBackground(prev => ({
                        ...prev,
                        primary_technologies: [...prev.primary_technologies, tech]
                      }));
                    }}
                  >
                    + {tech}
                  </Badge>
                ))
              }
            </div>
          </div>
        </div>

        {/* Previous Companies */}
        <div className="space-y-4">
          <Label>Previous Companies (Optional)</Label>
          
          {/* Current Companies */}
          {technicalBackground.previous_companies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technicalBackground.previous_companies.map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant="outline" className="flex items-center gap-1">
                    {company}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeCompany(company)}
                    />
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Company */}
          <div className="flex gap-2">
            <Input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Add a previous company"
              onKeyPress={(e) => e.key === 'Enter' && addCompany()}
            />
            <Button type="button" variant="outline" onClick={addCompany}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Education Background */}
        <div className="space-y-2">
          <Label>Education Background (Optional)</Label>
          <Textarea
            value={technicalBackground.education_background}
            onChange={(e) => handleChange('education_background', e.target.value)}
            placeholder="e.g., BS Computer Science from MIT, Self-taught, Coding Bootcamp, etc."
            rows={3}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 