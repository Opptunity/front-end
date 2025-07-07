'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Code, 
  Target, 
  Users, 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Briefcase,
  GraduationCap,
  Star,
  Clock
} from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';
import { WelcomeStep } from './onboarding/welcome-step';
import { PersonalInfoStep } from './onboarding/personal-info-step';
import { TechnicalBackgroundStep } from './onboarding/technical-background-step';
import { SkillsAssessmentStep } from './onboarding/skills-assessment-step';
import { GoalsSettingStep } from './onboarding/goals-setting-step';
import { TeamPreferencesStep } from './onboarding/team-preferences-step';
import { CompletionStep } from './onboarding/completion-step';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Introduction to the team and process',
    icon: User,
    estimatedTime: 5
  },
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic details about you and your role',
    icon: User,
    estimatedTime: 10
  },
  {
    id: 'technical-background',
    title: 'Technical Background',
    description: 'Your experience and expertise',
    icon: Code,
    estimatedTime: 15
  },
  {
    id: 'skills-assessment',
    title: 'Skills Assessment',
    description: 'Current skills and competencies',
    icon: Star,
    estimatedTime: 20
  },
  {
    id: 'goals-setting',
    title: 'Learning Goals',
    description: 'What you want to achieve',
    icon: Target,
    estimatedTime: 15
  },
  {
    id: 'team-preferences',
    title: 'Team Preferences',
    description: 'How you like to work and communicate',
    icon: Users,
    estimatedTime: 10
  },
  {
    id: 'completion',
    title: 'All Set!',
    description: 'Review and complete your onboarding',
    icon: CheckCircle,
    estimatedTime: 5
  }
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingProfile>>({
    personal_info: {
      full_name: '',
      email: '',
      role: '',
      department: '',
      start_date: '',
      location: '',
      manager_email: ''
    },
    technical_background: {
      experience_level: 'mid',
      years_experience: 0,
      primary_technologies: [],
      previous_companies: [],
      education_background: ''
    },
    current_skills: [],
    learning_goals: [],
    team_preferences: {
      preferred_work_style: 'mixed',
      communication_style: 'direct',
      learning_style: 'mixed',
      availability_for_mentoring: false
    },
    onboarding_status: {
      current_step: 0,
      completed_steps: [],
      started_at: new Date().toISOString(),
      is_completed: false
    }
  });

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setOnboardingData(prev => ({
        ...prev,
        onboarding_status: {
          ...prev.onboarding_status!,
          current_step: currentStep + 1,
          completed_steps: [...(prev.onboarding_status?.completed_steps || []), currentStep]
        }
      }));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = useCallback((stepData: any) => {
    setOnboardingData(prev => ({
      ...prev,
      ...stepData
    }));
  }, []);

  const handleComplete = async () => {
    try {
      console.log('=== HANDLE COMPLETE CALLED ===');
      console.log('Sending data to API:', {
        ...onboardingData,
        onboarding_status: {
          ...onboardingData.onboarding_status,
          is_completed: true,
          completed_at: new Date().toISOString()
        }
      });
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...onboardingData,
          onboarding_status: {
            ...onboardingData.onboarding_status,
            is_completed: true,
            completed_at: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      const result = await response.json();
      console.log('=== API RESPONSE ===');
      console.log('Response from API:', result);
      setApiResponse(result);

      // Move to completion step
      console.log('Moving to completion step (step 6)');
      setCurrentStep(6);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleFinalComplete = () => {
    // Final redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <currentStepData.icon className="h-5 w-5 text-blue-600" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </div>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                ~{currentStepData.estimatedTime} min
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 0 && (
            <WelcomeStep 
              onNext={handleNext}
              data={onboardingData}
            />
          )}
          {currentStep === 1 && (
            <PersonalInfoStep 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onDataChange={handleStepData}
              data={onboardingData}
            />
          )}
          {currentStep === 2 && (
            <TechnicalBackgroundStep 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onDataChange={handleStepData}
              data={onboardingData}
            />
          )}
          {currentStep === 3 && (
            <SkillsAssessmentStep 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onDataChange={handleStepData}
              data={onboardingData}
            />
          )}
          {currentStep === 4 && (
            <GoalsSettingStep 
              onNext={handleNext}
              onPrevious={handlePrevious}
              onDataChange={handleStepData}
              data={onboardingData}
            />
          )}
          {currentStep === 5 && (
            <TeamPreferencesStep 
              onComplete={handleComplete}
              onPrevious={handlePrevious}
              onDataChange={handleStepData}
              data={onboardingData}
            />
          )}
          {currentStep === 6 && (
            <CompletionStep 
              onComplete={handleFinalComplete}
              onPrevious={handlePrevious}
              data={{...onboardingData, ...apiResponse}}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                  ${index <= currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2 transition-colors
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 