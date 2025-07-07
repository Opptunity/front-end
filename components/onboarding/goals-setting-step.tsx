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
import { ArrowLeft, ArrowRight, Target, Plus, X } from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

interface GoalsSettingStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onDataChange: (data: any) => void;
  data: Partial<OnboardingProfile>;
}

export function GoalsSettingStep({ onNext, onPrevious, onDataChange, data }: GoalsSettingStepProps) {
  const [learningGoals, setLearningGoals] = useState(data.learning_goals || []);
  const [newGoal, setNewGoal] = useState({
    skill_area: '',
    target_level: 3,
    priority: 'medium' as 'high' | 'medium' | 'low',
    timeline: '',
    reason: ''
  });

  useEffect(() => {
    onDataChange({ learning_goals: learningGoals });
  }, [learningGoals]);

  const addGoal = () => {
    if (newGoal.skill_area.trim() && newGoal.timeline.trim()) {
      const goal = {
        goal_id: `goal_${Date.now()}`,
        ...newGoal,
        skill_area: newGoal.skill_area.trim(),
        reason: newGoal.reason.trim()
      };

      setLearningGoals(prev => [...prev, goal]);
      setNewGoal({
        skill_area: '',
        target_level: 3,
        priority: 'medium',
        timeline: '',
        reason: ''
      });
    }
  };

  const removeGoal = (goalId: string) => {
    setLearningGoals(prev => prev.filter(goal => goal.goal_id !== goalId));
  };

  const suggestedSkillAreas = [
    'React Advanced Patterns',
    'System Design',
    'Kubernetes',
    'Machine Learning',
    'GraphQL',
    'Microservices Architecture',
    'TypeScript',
    'Cloud Architecture',
    'Leadership Skills',
    'DevOps Practices',
    'Mobile Development',
    'Database Optimization'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Set Your Learning Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Goal */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Skill/Technology Area *</Label>
                <Input
                  value={newGoal.skill_area}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, skill_area: e.target.value }))}
                  placeholder="e.g., React, Machine Learning, Leadership"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Level</Label>
                <Select 
                  value={newGoal.target_level.toString()} 
                  onValueChange={(value) => setNewGoal(prev => ({ ...prev, target_level: parseInt(value) }))}
                >
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

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={newGoal.priority} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => setNewGoal(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timeline *</Label>
                <Select 
                  value={newGoal.timeline} 
                  onValueChange={(value) => setNewGoal(prev => ({ ...prev, timeline: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 month">1 Month</SelectItem>
                    <SelectItem value="3 months">3 Months</SelectItem>
                    <SelectItem value="6 months">6 Months</SelectItem>
                    <SelectItem value="1 year">1 Year</SelectItem>
                    <SelectItem value="2+ years">2+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Why is this important to you? (Optional)</Label>
              <Textarea
                value={newGoal.reason}
                onChange={(e) => setNewGoal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Required for upcoming project, career advancement, personal interest..."
                rows={2}
              />
            </div>

            <Button onClick={addGoal} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Learning Goal
            </Button>
          </CardContent>
        </Card>

        {/* Suggested Skill Areas */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Quick Add Popular Skills</Label>
          <div className="flex flex-wrap gap-2">
            {suggestedSkillAreas.map(skill => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => setNewGoal(prev => ({ ...prev, skill_area: skill }))}
              >
                + {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Current Goals */}
        {learningGoals.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">Your Learning Goals</Label>
            <div className="space-y-3">
              {learningGoals.map((goal, index) => (
                <motion.div
                  key={goal.goal_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-white border rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{goal.skill_area}</h4>
                        <Badge className={getPriorityColor(goal.priority)}>
                          {goal.priority} priority
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Target Level:</span> Level {goal.target_level}
                        </div>
                        <div>
                          <span className="font-medium">Timeline:</span> {goal.timeline}
                        </div>
                      </div>
                      
                      {goal.reason && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Why:</span> {goal.reason}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeGoal(goal.goal_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {learningGoals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Add your first learning goal to get started!</p>
          </div>
        )}

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