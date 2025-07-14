'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Code2, 
  TrendingUp, 
  Target, 
  Lightbulb,
  ArrowLeft,
  Loader2,
  Users,
  Star,
  CheckCircle,
  MapPin,
  BookOpen
} from 'lucide-react'
import EngineerTrendDashboardComponent from '@/components/engineer-trend-dashboard';
import Link from 'next/link';

interface EngineerProfile {
  engineer: {
    id: number;
    name: string;
    email: string;
    equipe_id?: number;
    adresse_residence?: string;
  };
  skills: {
    name: string;
    level: number;
    category: string;
    levelText: string;
  }[];
  assessment_data?: {
    ai_assessment: {
      summary: string;
      technical_skills: any[];
      soft_skills: string[];
      strengths: string[];
      improvement_areas: string[];
      recommendations: string[];
      industry_analysis: any;
      career_trajectory: any;
      skill_gap_analysis: any;
    };
    extracted_info: {
      name: string;
      role: string;
      experience_level: string;
    };
    processed_at: string;
  };
  profile_created: string;
}

export default function EngineerProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<EngineerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/engineer-profile/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Engineer profile not found');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-lg text-gray-600">Loading engineer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <p className="text-lg text-red-600 mb-4">{error || 'Profile not found'}</p>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getLevelColor = (levelText: string) => {
    switch (levelText) {
      case 'Expert': return 'bg-green-100 text-green-800 border-green-300';
      case 'Advanced': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Beginner': 
      case 'Basic': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const groupedSkills = profile.skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof profile.skills>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Engineer ID: {profile.engineer.id}
            </p>
          </div>
        </div>

        {/* Main Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          
          {/* Engineer Header */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10" />
              </div>
              <CardTitle className="text-3xl">{profile.engineer.name}</CardTitle>
              <CardDescription className="text-blue-100">
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Mail className="h-4 w-4" />
                  {profile.engineer.email}
                </div>
                {profile.engineer.adresse_residence && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {profile.engineer.adresse_residence}
                  </div>
                )}
                {profile.assessment_data?.extracted_info && (
                  <div className="mt-3 space-y-1">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {profile.assessment_data.extracted_info.role}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-2">
                      {profile.assessment_data.extracted_info.experience_level}
                    </Badge>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-blue-600" />
                  Technical Skills ({profile.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedSkills).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
                    <div className="grid gap-2">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                          <span className="font-medium">{skill.name}</span>
                          <Badge className={getLevelColor(skill.levelText)}>
                            {skill.levelText}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Assessment Summary */}
            {profile.assessment_data?.ai_assessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    AI Assessment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Summary</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile.assessment_data.ai_assessment.summary}
                    </p>
                  </div>

                  {profile.assessment_data.ai_assessment.soft_skills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.assessment_data.ai_assessment.soft_skills.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Strengths and Improvement Areas */}
          {profile.assessment_data?.ai_assessment && (
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Strengths */}
              {profile.assessment_data.ai_assessment.strengths?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profile.assessment_data.ai_assessment.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvement Areas */}
              {profile.assessment_data.ai_assessment.improvement_areas?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <TrendingUp className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profile.assessment_data.ai_assessment.improvement_areas.map((area, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recommendations */}
          {profile.assessment_data?.ai_assessment?.recommendations && profile.assessment_data.ai_assessment.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {profile.assessment_data.ai_assessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* IT Trends Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <BookOpen className="h-5 w-5" />
                IT Trends & Learning Dashboard
              </CardTitle>
              <CardDescription>
                Track focused trends, view recommendations, and monitor learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EngineerTrendDashboardComponent 
                engineerId={profile.engineer.id} 
                className="mt-4"
              />
            </CardContent>
          </Card>

        </motion.div>
      </div>
    </div>
  );
} 