'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';

interface TeamPreferencesStepProps {
  onNext?: () => void;
  onComplete?: () => void;
  onPrevious: () => void;
  onDataChange: (data: any) => void;
  data: Partial<OnboardingProfile>;
}

export function TeamPreferencesStep({ onNext, onComplete, onPrevious, onDataChange, data }: TeamPreferencesStepProps) {
  const [teamPreferences, setTeamPreferences] = useState(data.team_preferences || {
    preferred_work_style: 'mixed',
    communication_style: 'direct',
    learning_style: 'mixed',
    availability_for_mentoring: false
  });

  useEffect(() => {
    onDataChange({ team_preferences: teamPreferences });
  }, [teamPreferences]);

  const handleChange = (field: string, value: string | boolean) => {
    setTeamPreferences(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Team Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Work Style */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Preferred Work Style</Label>
          <RadioGroup
            value={teamPreferences.preferred_work_style}
            onValueChange={(value) => handleChange('preferred_work_style', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="individual" id="individual" />
              <div className="flex-1">
                <Label htmlFor="individual" className="font-medium cursor-pointer">
                  Individual Work
                </Label>
                <p className="text-sm text-gray-600">I prefer working independently on focused tasks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="collaborative" id="collaborative" />
              <div className="flex-1">
                <Label htmlFor="collaborative" className="font-medium cursor-pointer">
                  Collaborative Work
                </Label>
                <p className="text-sm text-gray-600">I thrive in team environments and pair programming</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="mixed" id="mixed-work" />
              <div className="flex-1">
                <Label htmlFor="mixed-work" className="font-medium cursor-pointer">
                  Mixed Approach
                </Label>
                <p className="text-sm text-gray-600">I enjoy both individual focus time and collaborative work</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Communication Style */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Communication Style</Label>
          <RadioGroup
            value={teamPreferences.communication_style}
            onValueChange={(value) => handleChange('communication_style', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="direct" id="direct" />
              <div className="flex-1">
                <Label htmlFor="direct" className="font-medium cursor-pointer">
                  Direct & Straightforward
                </Label>
                <p className="text-sm text-gray-600">I prefer clear, concise communication</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="diplomatic" id="diplomatic" />
              <div className="flex-1">
                <Label htmlFor="diplomatic" className="font-medium cursor-pointer">
                  Diplomatic & Thoughtful
                </Label>
                <p className="text-sm text-gray-600">I like to consider different perspectives and be tactful</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="casual" id="casual" />
              <div className="flex-1">
                <Label htmlFor="casual" className="font-medium cursor-pointer">
                  Casual & Friendly
                </Label>
                <p className="text-sm text-gray-600">I prefer relaxed, informal communication</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Learning Style */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Learning Style</Label>
          <RadioGroup
            value={teamPreferences.learning_style}
            onValueChange={(value) => handleChange('learning_style', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="hands_on" id="hands_on" />
              <div className="flex-1">
                <Label htmlFor="hands_on" className="font-medium cursor-pointer">
                  Hands-On Learning
                </Label>
                <p className="text-sm text-gray-600">I learn best by doing and experimenting</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="documentation" id="documentation" />
              <div className="flex-1">
                <Label htmlFor="documentation" className="font-medium cursor-pointer">
                  Documentation & Research
                </Label>
                <p className="text-sm text-gray-600">I prefer reading docs, tutorials, and structured materials</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="mentorship" id="mentorship" />
              <div className="flex-1">
                <Label htmlFor="mentorship" className="font-medium cursor-pointer">
                  Mentorship & Guidance
                </Label>
                <p className="text-sm text-gray-600">I learn best with guidance from experienced team members</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="mixed" id="mixed-learning" />
              <div className="flex-1">
                <Label htmlFor="mixed-learning" className="font-medium cursor-pointer">
                  Mixed Approach
                </Label>
                <p className="text-sm text-gray-600">I use different learning methods depending on the topic</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Mentoring Availability */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Mentoring</Label>
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="mentoring"
              checked={teamPreferences.availability_for_mentoring}
              onCheckedChange={(checked) => handleChange('availability_for_mentoring', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="mentoring" className="font-medium cursor-pointer">
                I'm interested in mentoring others
              </Label>
              <p className="text-sm text-gray-600">
                I'd like to help onboard new team members or share my knowledge with junior developers
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onComplete || onNext}>
            {onComplete ? 'Complete Onboarding' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 