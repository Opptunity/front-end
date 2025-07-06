'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, UserPlus, Brain, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CVOnboardingPage() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Results
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !email) return;

    setIsProcessing(true);
    setStep(2);

    try {
      // 1. Upload and parse CV
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload CV');
      }

      const uploadData = await uploadResponse.json();
      console.log('CV uploaded and parsed:', uploadData);

      // 2. Process CV with AI and create engineer
      const onboardingResponse = await fetch('/api/onboarding-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: uploadData,
          email: email,
        }),
      });

      if (!onboardingResponse.ok) {
        throw new Error('Failed to process onboarding');
      }

      const onboardingResults = await onboardingResponse.json();
      console.log('Onboarding results:', onboardingResults);

      setResults(onboardingResults);
      setStep(3);

    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Error processing your CV. Please try again.');
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        
        {/* Step 1: CV Upload */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <UserPlus className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Join Our Engineering Team
              </h1>
              <p className="text-xl text-gray-600">
                Upload your CV and let our AI find your perfect team match
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Your CV
                </CardTitle>
                <CardDescription>
                  Our AI will analyze your skills and experience to find the best team fit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cv">CV File (PDF) *</Label>
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                  {file && (
                    <p className="text-sm text-green-600">
                      ✓ {file.name} selected
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={!file || !email || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  Analyze CV & Find My Team
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <Brain className="mx-auto h-16 w-16 text-blue-600 animate-pulse" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI is Analyzing Your CV
              </h2>
              <div className="space-y-2 text-lg text-gray-600">
                <p>🔍 Extracting skills and experience...</p>
                <p>🧠 Analyzing technical competencies...</p>
                <p>👥 Finding your best team match...</p>
                <p>⚡ Creating your engineer profile...</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Users className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to the Team! 🎉
              </h2>
              <p className="text-xl text-gray-600">
                You've been successfully onboarded
              </p>
            </div>

            {/* Team Assignment Results */}
            {results.team_assignment?.team && (
              <Card className="max-w-2xl mx-auto bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    🎯 Assigned to: {results.team_assignment.team.nom_equipe}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-green-700">
                  <p><strong>Match Reasoning:</strong> {results.team_assignment.reasoning}</p>
                  {results.team_assignment.skill_overlap > 0 && (
                    <p><strong>Skill Overlap:</strong> {results.team_assignment.skill_overlap} matching skills</p>
                  )}
                  {results.team_assignment.new_skills?.length > 0 && (
                    <p><strong>New Skills You Bring:</strong> {results.team_assignment.new_skills.join(', ')}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Engineer Profile Created */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>👤 Engineer Profile Created</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.employee && (
                  <>
                    <div className="text-center pb-3 border-b">
                      <h3 className="text-xl font-semibold text-gray-900">{results.employee.name}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <p><strong>Email:</strong> {results.employee.email}</p>
                      <p><strong>Experience Level:</strong> {results.employee.experience_level}</p>
                      <p><strong>Primary Role:</strong> {results.employee.role}</p>
                      {results.employee.residence_address && (
                        <p><strong>Residence:</strong> {results.employee.residence_address}</p>
                      )}
                    </div>

                    {results.assessment_data?.technicalSkills && results.assessment_data.technicalSkills.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Technical Skills:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {results.assessment_data.technicalSkills.map((skill: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <span className="font-medium">{skill.skill}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                skill.level === 'Expert' ? 'bg-green-100 text-green-800' :
                                skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                                skill.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {skill.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 text-center pt-3 border-t">
                      Total Skills Analyzed: {results.employee.skills_count || 0}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}