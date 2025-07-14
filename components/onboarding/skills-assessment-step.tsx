'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Star, Plus, X } from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

interface SkillsAssessmentStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: any) => void;
  data: Partial<OnboardingProfile>;
}

export function SkillsAssessmentStep({ onNext, onPrevious, onDataChange, data }: SkillsAssessmentStepProps) {
  const [currentSkills, setCurrentSkills] = useState(data.current_skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('3');
  const [newSkillCategory, setNewSkillCategory] = useState('');

  useEffect(() => {
    onDataChange({ current_skills: currentSkills });
  }, [currentSkills]);

  const skillCategories = [
    'Programming Languages',
    'Frontend Frameworks',
    'Backend Frameworks',
    'Databases',
    'DevOps & Infrastructure',
    'Testing',
    'Tools & Platforms',
    'Soft Skills',
    'Other'
  ];

  const predefinedSkills = {
    'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'C++'],
    'Frontend Frameworks': ['React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'],
    'Backend Frameworks': ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET'],
    'Databases': ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB'],
    'DevOps & Infrastructure': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Jenkins'],
    'Testing': ['Jest', 'Cypress', 'Selenium', 'JUnit', 'PyTest', 'TDD', 'BDD'],
    'Tools & Platforms': ['Git', 'GitHub', 'GitLab', 'Jira', 'Slack', 'Figma', 'VS Code'],
    'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Mentoring', 'Project Management']
  };

  const addSkill = () => {
    if (newSkillName.trim() && newSkillCategory) {
      const newSkill = {
        skill_id: `skill_${Date.now()}`,
        skill_name: newSkillName.trim(),
        self_assessed_level: parseInt(newSkillLevel),
        category: newSkillCategory,
        is_primary: false
      };

      setCurrentSkills(prev => [...prev, newSkill]);
      setNewSkillName('');
      setNewSkillLevel('3');
      setNewSkillCategory('');
    }
  };

  const removeSkill = (skillId: string) => {
    setCurrentSkills(prev => prev.filter(skill => skill.skill_id !== skillId));
  };

  const updateSkillLevel = (skillId: string, level: number) => {
    setCurrentSkills(prev => 
      prev.map(skill => 
        skill.skill_id === skillId 
          ? { ...skill, self_assessed_level: level }
          : skill
      )
    );
  };

  const togglePrimarySkill = (skillId: string) => {
    setCurrentSkills(prev => 
      prev.map(skill => 
        skill.skill_id === skillId 
          ? { ...skill, is_primary: !skill.is_primary }
          : skill
      )
    );
  };

  const addPredefinedSkill = (skillName: string, category: string) => {
    const newSkill = {
      skill_id: `skill_${Date.now()}`,
      skill_name: skillName,
      self_assessed_level: 3,
      category: category,
      is_primary: false
    };

    setCurrentSkills(prev => [...prev, newSkill]);
  };

  const getLevelDescription = (level: number) => {
    const descriptions = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return descriptions[level as keyof typeof descriptions] || 'Intermediate';
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-blue-600" />
          Assess Your Current Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Skill */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Enter skill name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Skill Level</Label>
                <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Basic</SelectItem>
                    <SelectItem value="3">3 - Intermediate</SelectItem>
                    <SelectItem value="4">4 - Advanced</SelectItem>
                    <SelectItem value="5">5 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={addSkill} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Skills */}
        {currentSkills.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Your Skills</Label>
            
            {skillCategories.map(category => {
              const categorySkills = currentSkills.filter(skill => skill.category === category);
              if (categorySkills.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-gray-700 border-b pb-1">{category}</h4>
                  <div className="space-y-2">
                    {categorySkills.map((skill) => (
                      <motion.div
                        key={skill.skill_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{skill.skill_name}</span>
                              {skill.is_primary && (
                                <Badge variant="default" className="text-xs">Primary</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {renderStars(skill.self_assessed_level)}
                              </div>
                              <span className="text-sm text-gray-600">
                                {getLevelDescription(skill.self_assessed_level)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={skill.self_assessed_level.toString()}
                            onValueChange={(value) => updateSkillLevel(skill.skill_id, parseInt(value))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePrimarySkill(skill.skill_id)}
                          >
                            {skill.is_primary ? 'Remove Primary' : 'Mark Primary'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSkill(skill.skill_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Add Predefined Skills */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Quick Add Common Skills</Label>
          {Object.entries(predefinedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {skills
                  .filter(skill => !currentSkills.some(cs => cs.skill_name === skill))
                  .map(skill => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => addPredefinedSkill(skill, category)}
                    >
                      + {skill}
                    </Badge>
                  ))
                }
              </div>
            </div>
          ))}
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