'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Users, 
  Target, 
  Book, 
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

interface WelcomeStepProps {
  onNext: () => void;
  data: Partial<OnboardingProfile>;
}

export function WelcomeStep({ onNext, data }: WelcomeStepProps) {
  const benefits = [
    {
      icon: Target,
      title: 'Personalized Learning Path',
      description: 'Get a customized roadmap based on your goals and current skills'
    },
    {
      icon: Users,
      title: 'Team Integration',
      description: 'Connect with teammates and find your mentor'
    },
    {
      icon: Book,
      title: 'Resource Access',
      description: 'Access curated learning materials and documentation'
    },
    {
      icon: Rocket,
      title: 'Fast Track to Productivity',
      description: 'Get up to speed quickly with structured guidance'
    }
  ];

  const processSteps = [
    'Share your background and experience',
    'Assess your current skills',
    'Set learning goals and priorities',
    'Configure team preferences',
    'Get matched with resources and mentors'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4"
          >
            <Rocket className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-2xl">Ready to get started?</CardTitle>
          <CardDescription className="text-lg">
            This onboarding process will help us understand your skills, goals, and preferences 
            so we can provide you with the best possible experience on our team.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* What You'll Get */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              What You'll Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* The Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              The Process
            </CardTitle>
            <CardDescription>
              Takes about 15-20 minutes total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{step}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Pro Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be honest about your current skill level - it helps us provide better recommendations</li>
                <li>• Think about both short-term and long-term learning goals</li>
                <li>• Don't worry if you're not sure about something - you can always update it later</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Let's Begin
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 