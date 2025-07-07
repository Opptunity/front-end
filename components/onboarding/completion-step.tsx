'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Code, 
  Target, 
  Users, 
  Star,
  Calendar,
  Mail,
  MapPin
} from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

interface CompletionStepProps {
  onComplete: () => void;
  onPrevious: () => void;
  data: Partial<OnboardingProfile>;
}

export function CompletionStep({ onComplete, onPrevious, data }: CompletionStepProps) {
  console.log('=== COMPLETION STEP DATA ===');
  console.log('Full data received:', JSON.stringify(data, null, 2));
  console.log('Engineer database info:', (data as any)?.engineer_database);
  
  const personalInfo = data.personal_info;
  const technicalBackground = data.technical_background;
  const currentSkills = data.current_skills || [];
  const learningGoals = data.learning_goals || [];
  const teamPreferences = data.team_preferences;

  const primarySkills = currentSkills.filter(skill => skill.is_primary);
  const highPriorityGoals = learningGoals.filter(goal => goal.priority === 'high');

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-2xl text-green-800">Onboarding Complete! 🎉</CardTitle>
          <p className="text-green-700 mt-2">
            Thank you for taking the time to complete your onboarding. 
            Here's a summary of what we've learned about you.
          </p>
          
          {(data as any)?.engineer_database?.saved && (
            <div className="space-y-3">
              <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Added to Engineering Team Database</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Engineer ID: {(data as any).engineer_database.engineer_id}
                </p>
              </div>
              
              {(data as any)?.engineer_database?.team_assignment?.team && (
                <div className="mt-3 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">
                      Assigned to Team: {(data as any).engineer_database.team_assignment.team.nom_equipe}
                    </span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p className="mb-1">
                      <strong>Match Reasoning:</strong> {(data as any).engineer_database.team_assignment.reasoning}
                    </p>
                    {(data as any).engineer_database.team_assignment.skill_overlap > 0 && (
                      <p className="mb-1">
                        <strong>Skill Overlap:</strong> {(data as any).engineer_database.team_assignment.skill_overlap} matching skills
                      </p>
                    )}
                    {(data as any).engineer_database.team_assignment.new_skills?.length > 0 && (
                      <p>
                        <strong>New Skills Added:</strong> {(data as any).engineer_database.team_assignment.new_skills.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{personalInfo?.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{personalInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{personalInfo?.role} • {personalInfo?.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{personalInfo?.location}</span>
            </div>
          </CardContent>
        </Card>

        {/* Technical Background Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5 text-blue-600" />
              Technical Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Experience Level:</span>{' '}
              <Badge variant="secondary" className="ml-1">
                {technicalBackground?.experience_level} ({technicalBackground?.years_experience} years)
              </Badge>
            </div>
            <div>
              <span className="font-medium">Technologies:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {technicalBackground?.primary_technologies?.slice(0, 6).map(tech => (
                  <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                ))}
                {(technicalBackground?.primary_technologies?.length || 0) > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{(technicalBackground?.primary_technologies?.length || 0) - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-blue-600" />
              Key Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Primary Skills ({primarySkills.length}):</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {primarySkills.slice(0, 4).map(skill => (
                  <Badge key={skill.skill_id} variant="default" className="text-xs">
                    {skill.skill_name} (L{skill.self_assessed_level})
                  </Badge>
                ))}
                {primarySkills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{primarySkills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">Total Skills Assessed:</span>{' '}
              <Badge variant="secondary">{currentSkills.length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">High Priority Goals ({highPriorityGoals.length}):</span>
              <div className="space-y-1 mt-1">
                {highPriorityGoals.slice(0, 3).map(goal => (
                  <div key={goal.goal_id} className="text-sm">
                    • {goal.skill_area} ({goal.timeline})
                  </div>
                ))}
                {highPriorityGoals.length > 3 && (
                  <div className="text-sm text-gray-600">
                    +{highPriorityGoals.length - 3} more goals
                  </div>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">Total Goals:</span>{' '}
              <Badge variant="secondary">{learningGoals.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Preferences Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            Team Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Work Style:</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {teamPreferences?.preferred_work_style?.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Communication:</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {teamPreferences?.communication_style}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Learning:</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {teamPreferences?.learning_style?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          {teamPreferences?.availability_for_mentoring && (
            <div className="mt-3">
              <Badge variant="default" className="bg-green-600">
                Available for Mentoring
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="space-y-2">
            <li>• You'll receive an email with your personalized learning plan</li>
            <li>• Your manager will be notified of your onboarding completion</li>
            <li>• You'll be matched with a mentor based on your preferences</li>
            <li>• Relevant resources and documentation will be shared with you</li>
            <li>• You can update your profile anytime from the dashboard</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={onComplete}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          Go to Dashboard
          <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 