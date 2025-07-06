'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trophy, User, Star, Building2, Target, Medal, Award, Calendar, Layers } from 'lucide-react';

interface TaskRanking {
  tache: {
    nom: string;
    description: string;
    complexite: number;
    priorite: number;
    competences_cles: string[];
    estimation_jours: number;
    type?: string;
    peut_commencer_immediatement?: boolean;
    dependances?: string[];
    workstream?: string;
    workstream_info?: {
      peut_demarrer_jour_1: boolean;
      equipe_recommandee: number;
      description_workstream: string;
    };
  };
  classements: any[];
}

interface ProjectRankingResult {
  projet_description: string;
  taches_identifiees: number;
  classements_par_tache: TaskRanking[];
  resume_global: string;
  workstreams_paralleles: any[];
  synchronisation_points: any[];
}

interface JobSpecificationResult {
  job_specification: string;
  job_analysis: {
    position_title: string;
    seniority_level: string;
    engagement_duration: string;
    start_urgency: string;
    location_requirements: {
      city?: string;
      country?: string;
      work_model?: string;
      office_days?: number;
      remote_days?: number;
      relocation_required?: boolean;
    };
    technical_requirements: {
      must_have: Array<{
        skill: string;
        importance: number;
        experience_level: string;
      }>;
      preferred: Array<{
        skill: string;
        importance: number;
        experience_level: string;
      }>;
    };
    domain_expertise?: string;
    key_technologies: string[];
    availability_requirements: {
      start_date: string;
      commitment_level: string;
      duration_months?: number;
    };
  };
  nombre_ingenieurs_evalues: number;
  classements: any[];
  resume_job_matching: string;
}

export function EngineerRankingTool() {
  const [mode, setMode] = useState<'project_decomposition' | 'job_specification'>('job_specification');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [jobSpecification, setJobSpecification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ProjectRankingResult | null>(null);
  const [jobResults, setJobResults] = useState<JobSpecificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parallelizationStrategy, setParallelizationStrategy] = useState<'auto' | 'technique' | 'fonctionnel' | 'temporel'>('auto');

  const handleAnalysis = async () => {
    if (mode === 'project_decomposition' && !projectDescription.trim()) {
      setError('Please describe your project');
      return;
    }
    
    if (mode === 'job_specification' && !jobSpecification.trim()) {
      setError('Please provide the job specification');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setJobResults(null);

    try {
      const requestBody: any = {
        mode,
        limite_resultats: mode === 'job_specification' ? 10 : 5
      };

      if (mode === 'project_decomposition') {
        requestBody.projet_description = projectDescription;
        requestBody.projet_nom = projectName;
      } else if (mode === 'job_specification') {
        requestBody.job_specification = jobSpecification;
      }

      const response = await fetch('/api/engineer-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error during analysis');
      }

      const data = await response.json();
      
      if (mode === 'project_decomposition') {
        setResults(data as ProjectRankingResult);
      } else if (mode === 'job_specification') {
        setJobResults(data as JobSpecificationResult);
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-gray-500 font-bold text-xs">#{rank}</span>;
    }
  };

  const getComplexityBadge = (complexity: number) => {
    if (complexity >= 4) return { variant: 'destructive' as const, label: 'Complex' };
    if (complexity >= 3) return { variant: 'secondary' as const, label: 'Medium' };
    return { variant: 'default' as const, label: 'Simple' };
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, { variant: any, color: string, icon: string }> = {
      'frontend': { variant: 'default' as const, color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🎨' },
      'backend': { variant: 'secondary' as const, color: 'bg-green-100 text-green-800 border-green-200', icon: '⚙️' },
      'devops': { variant: 'outline' as const, color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🚀' },
      'mobile': { variant: 'default' as const, color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '📱' },
      'database': { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🗄️' },
      'api': { variant: 'outline' as const, color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🔌' },
      'security': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-200', icon: '🔒' },
      'testing': { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🧪' }
    };
    
    const config = typeColors[type.toLowerCase()] || { variant: 'outline' as const, color: 'bg-gray-100 text-gray-600', icon: '📋' };
    return config;
  };

  const formatExecutiveSummary = (text: string) => {
    if (!text) return null;

    // Split text into lines and process each line
    const lines = text.split('\n').filter(line => line.trim());
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle headings (# ## ### #### etc.) - improved regex
      if (trimmedLine.startsWith('#')) {
        // More flexible regex that handles edge cases
        const headingMatch = trimmedLine.match(/^(#{1,6})\s*(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const heading = headingMatch[2].trim();
          
          if (heading) { // Only process if there's actual heading text
            // Style based on heading level
            let headingClass = '';
            if (level === 1) {
              headingClass = "text-xl font-bold text-yellow-900 mt-6 mb-3 first:mt-0";
            } else if (level === 2) {
              headingClass = "text-lg font-semibold text-yellow-900 mt-4 mb-2 first:mt-0";
            } else if (level === 3) {
              headingClass = "text-base font-semibold text-yellow-800 mt-3 mb-2 first:mt-0";
            } else {
              headingClass = "text-sm font-medium text-yellow-800 mt-2 mb-1 first:mt-0";
            }
            
            elements.push(
              <div key={`heading-${index}`} className={headingClass}>
                {heading}
              </div>
            );
          }
        }
      }
      // Handle bold text (**text**)
      else if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*[^*]+\*\*)/);
        const formattedParts = parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return <strong key={`bold-${index}-${partIndex}`} className="font-semibold">{boldText}</strong>;
          }
          return part;
        });
        elements.push(
          <p key={`paragraph-${index}`} className="leading-relaxed">
            {formattedParts}
          </p>
        );
      }
      // Handle bullet points (- text)
      else if (trimmedLine.startsWith('- ')) {
        const bulletText = trimmedLine.replace('- ', '').trim();
        elements.push(
          <div key={`bullet-${index}`} className="flex items-start gap-2">
            <span className="text-yellow-600 mt-1">•</span>
            <span className="leading-relaxed">{bulletText}</span>
          </div>
        );
      }
      // Handle numbered lists (1. text, 2. text, etc.)
      else if (trimmedLine.match(/^\d+\.\s/)) {
        const numberedText = trimmedLine.replace(/^\d+\.\s/, '').trim();
        const number = trimmedLine.match(/^(\d+)\./)?.[1];
        elements.push(
          <div key={`numbered-${index}`} className="flex items-start gap-2">
            <span className="text-yellow-600 font-medium min-w-[20px]">{number}.</span>
            <span className="leading-relaxed">{numberedText}</span>
          </div>
        );
      }
      // Handle regular paragraphs
      else if (trimmedLine) {
        elements.push(
          <p key={`paragraph-${index}`} className="leading-relaxed">
            {trimmedLine}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-6 w-6" />
            AI Engineer Ranking
          </CardTitle>
          <CardDescription>
            Choose between project decomposition or job specification analysis to rank engineers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Analysis Mode</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('job_specification')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  mode === 'job_specification' 
                    ? 'bg-blue-50 border-blue-300 text-blue-800' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5" />
                  <strong>Job Specification</strong>
                </div>
                <p className="text-sm text-gray-600">
                  Rank engineers for a specific job role with detailed requirements
                </p>
              </button>
              
              <button 
                onClick={() => setMode('project_decomposition')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  mode === 'project_decomposition' 
                    ? 'bg-blue-50 border-blue-300 text-blue-800' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5" />
                  <strong>Project Decomposition</strong>
                </div>
                <p className="text-sm text-gray-600">
                  Break down a project into tasks and rank engineers for each
                </p>
              </button>
            </div>
          </div>

          {/* Job Specification Mode */}
          {mode === 'job_specification' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Job Specification</h3>
              </div>
              
              <div>
                <Label htmlFor="job-specification">Complete job description and requirements </Label>
                <Textarea
                  id="job-specification"
                  placeholder="e.g. We require a senior engineer for a 4-6 month engagement to help build our new Real-Time Fraud Detection service, starting as soon as possible. The role is based out of our Warsaw, Poland office with a hybrid work model (3 days in-office, 2 days remote). The candidate must have strong, hands-on skills in Java, Spring Boot, microservices architecture, and AWS cloud services (specifically EC2, S3, Lambda, DynamoDB), with experience using Jenkins for CI/CD. Please let us know the availability of a suitable expert."
                  value={jobSpecification}
                  onChange={(e) => setJobSpecification(e.target.value)}
                  rows={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include position level, required skills, location, work model, duration, and any specific requirements. AI will analyze this to match engineers.
                </p>
              </div>
            </div>
          )}

          {/* Project Decomposition Mode */}
          {mode === 'project_decomposition' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Project Description</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="project-name">Project name (optional)</Label>
                  <Input
                    id="project-name"
                    placeholder="e.g. Mobile app redesign, Cloud migration..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Complete project description *</Label>
                  <Textarea
                    id="project-description"
                    placeholder="e.g. We are developing a new e-commerce platform to modernize our existing system. The project includes a microservices architecture with Docker, a React/TypeScript user interface, a Node.js REST API, payment system integration (Stripe, PayPal), a PostgreSQL database, JWT authentication system, automated testing, and AWS deployment. Features include product management, orders, users, payments, email notifications, and an admin dashboard..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be detailed about technologies, features, architecture, and objectives. AI will use this information to automatically identify required tasks and skills.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Parallelization strategy</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setParallelizationStrategy('auto')}
                    className={`p-3 border rounded text-sm ${parallelizationStrategy === 'auto' ? 'bg-blue-100 border-blue-300' : ''}`}
                  >
                    🤖 Automatic
                    <div className="text-xs text-gray-500">AI chooses best approach</div>
                  </button>
                  
                  <button 
                    onClick={() => setParallelizationStrategy('technique')}
                    className={`p-3 border rounded text-sm ${parallelizationStrategy === 'technique' ? 'bg-blue-100 border-blue-300' : ''}`}
                  >
                    ⚙️ By technical layers
                    <div className="text-xs text-gray-500">Frontend/Backend/DevOps</div>
                  </button>
                  
                  <button 
                    onClick={() => setParallelizationStrategy('fonctionnel')}
                    className={`p-3 border rounded text-sm ${parallelizationStrategy === 'fonctionnel' ? 'bg-blue-100 border-blue-300' : ''}`}
                  >
                    📋 By functional modules
                    <div className="text-xs text-gray-500">User/Product/Payment</div>
                  </button>
                  
                  <button 
                    onClick={() => setParallelizationStrategy('temporel')}
                    className={`p-3 border rounded text-sm ${parallelizationStrategy === 'temporel' ? 'bg-blue-100 border-blue-300' : ''}`}
                  >
                    📅 By temporal phases  
                    <div className="text-xs text-gray-500">Setup/Dev/Integration</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button 
            onClick={handleAnalysis} 
            disabled={isLoading || (mode === 'project_decomposition' && !projectDescription.trim()) || (mode === 'job_specification' && !jobSpecification.trim())}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'job_specification' ? 'Analyzing job specification...' : 'Analyzing project...'}
              </>
            ) : (
              mode === 'job_specification' ? 'Analyze job and rank engineers' : 'Analyze project and rank engineers'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Job Specification Results */}
      {jobResults && (
        <div className="space-y-6">
          {/* Job Analysis Results header */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <User className="h-6 w-6" />
                Job Analysis Results
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  {jobResults.job_analysis.position_title}
                </Badge>
              </CardTitle>
              <CardDescription className="text-green-700">
                Found {jobResults.nombre_ingenieurs_evalues} engineers. Analyzed {jobResults.classements.length} top candidates for this position.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Job Analysis Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Job Requirements Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Position Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Position Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{jobResults.job_analysis.seniority_level}</Badge>
                      <span className="text-gray-600">Seniority Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{jobResults.job_analysis.engagement_duration}</Badge>
                      <span className="text-gray-600">Duration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{jobResults.job_analysis.start_urgency}</Badge>
                      <span className="text-gray-600">Start Date</span>
                    </div>
                  </div>
                </div>

                {/* Location & Work Model */}
                {jobResults.job_analysis.location_requirements && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Location & Work Model</h4>
                    <div className="space-y-2 text-sm">
                      {jobResults.job_analysis.location_requirements.city && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {jobResults.job_analysis.location_requirements.city}, {jobResults.job_analysis.location_requirements.country}
                          </Badge>
                          <span className="text-gray-600">Location</span>
                        </div>
                      )}
                      {jobResults.job_analysis.location_requirements.work_model && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{jobResults.job_analysis.location_requirements.work_model}</Badge>
                          <span className="text-gray-600">Work Model</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Required Skills */}
              {jobResults.job_analysis.technical_requirements.must_have.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-700">Must-Have Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobResults.job_analysis.technical_requirements.must_have.map((skill, index) => (
                      <Badge key={index} variant="default" className="bg-red-100 text-red-800 border-red-200">
                        {skill.skill} ({skill.experience_level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Skills */}
              {jobResults.job_analysis.technical_requirements.preferred.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-medium text-gray-700">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobResults.job_analysis.technical_requirements.preferred.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {skill.skill} ({skill.experience_level})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Matching Summary */}
          {jobResults.resume_job_matching && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Hiring Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-800 space-y-3">
                    {formatExecutiveSummary(jobResults.resume_job_matching)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Candidate Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gold-500" />
                Top Candidates ({jobResults.classements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobResults.classements.map((candidate, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      {getRankIcon(candidate.rang)}
                      
                      <div className="flex-1">
                        <div className="font-medium">
                          {candidate.ingenieur ? 
                            `${candidate.ingenieur.prenom} ${candidate.ingenieur.nom}` :
                            `Engineer ${candidate.ingenieur_id.slice(0, 8)}...`
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {candidate.ingenieur?.email || 'Email not available'}
                        </div>
                        
                        {/* Availability info */}
                        {candidate.ingenieur?.disponibilite && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={
                                candidate.ingenieur.disponibilite.disponibilite_effective >= 80 ? "default" :
                                candidate.ingenieur.disponibilite.disponibilite_effective >= 50 ? "secondary" : "destructive"
                              }
                              className="text-xs"
                            >
                              {candidate.ingenieur.disponibilite.statut_disponibilite}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                candidate.ingenieur.disponibilite.disponibilite_effective >= 80 ? 'bg-green-50 border-green-200 text-green-700' :
                                candidate.ingenieur.disponibilite.disponibilite_effective >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                'bg-red-50 border-red-200 text-red-700'
                              }`}
                            >
                              {candidate.ingenieur.disponibilite.disponibilite_effective}% available
                            </Badge>
                          </div>
                        )}

                        {/* AI Justification */}
                        {candidate.justification_ai && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                            <strong>AI Analysis:</strong> {candidate.justification_ai}
                          </div>
                        )}

                        {/* Availability Impact */}
                        {candidate.disponibilite_impact && (
                          <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
                            <strong>Availability Impact:</strong> {candidate.disponibilite_impact}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={getScoreBadgeVariant(candidate.score_compatibilite)} className="text-lg px-3 py-1">
                        {candidate.score_compatibilite.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Decomposition Results */}
      {results && (
        <div className="space-y-6">
          {/* Results header */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Target className="h-6 w-6" />
                Analysis Results
                {projectName && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {projectName}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-blue-700">
                The project has been decomposed into {results.taches_identifiees} specific tasks. 
                Here is the ranking of engineers for each task.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Global summary */}
          {results.resume_global && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-800 space-y-3">
                    {formatExecutiveSummary(results.resume_global)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parallel workstreams */}
          {results.workstreams_paralleles && results.workstreams_paralleles.length > 0 && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Layers className="h-6 w-6" />
                  Identified Parallel Workstreams
                </CardTitle>
                <CardDescription className="text-green-700">
                  {results.workstreams_paralleles.length} teams can work simultaneously from day 1
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.workstreams_paralleles.map((workstream: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <h4 className="font-medium text-green-800">{workstream.nom_workstream}</h4>
                      </div>
                      <p className="text-xs text-green-600 mb-2">{workstream.description_workstream}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                          👥 {workstream.equipe_recommandee} people
                        </Badge>
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                          🚀 Day 1
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {workstream.taches_simultanees?.length || 0} parallel tasks
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Synchronization points */}
          {results.synchronisation_points && results.synchronisation_points.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Synchronization Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.synchronisation_points.map((point: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        Day {point.jour}
                      </Badge>
                      <p className="text-sm text-blue-800">{point.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks and rankings - Workstream version */}
          {results.classements_par_tache.map((taskData, taskIndex) => (
            <Card key={taskIndex} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {taskIndex + 1}
                    </div>
                    {taskData.tache.nom}
                    {/* Workstream badge */}
                    {taskData.tache.workstream && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        📋 {taskData.tache.workstream}
                      </Badge>
                    )}
                    {/* Parallelization indicator */}
                    {taskData.tache.peut_commencer_immediatement && (
                      <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
                        🚀 Day 1 Start
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {/* Type badge */}
                    {taskData.tache.type && (
                      <Badge 
                        variant={getTypeBadge(taskData.tache.type).variant}
                        className={getTypeBadge(taskData.tache.type).color}
                      >
                        {getTypeBadge(taskData.tache.type).icon} {taskData.tache.type}
                      </Badge>
                    )}
                    
                    <Badge variant={getComplexityBadge(taskData.tache.complexite).variant}>
                      {getComplexityBadge(taskData.tache.complexite).label}
                    </Badge>
                    <Badge variant="outline">
                      ~{taskData.tache.estimation_jours}d
                    </Badge>
                  </div>
                </div>
                
                {/* Workstream information */}
                {taskData.tache.workstream_info && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-medium text-purple-800 mb-1">
                      Workstream: {taskData.tache.workstream}
                    </h4>
                    <p className="text-xs text-purple-700">{taskData.tache.workstream_info.description_workstream}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        👥 {taskData.tache.workstream_info.equipe_recommandee} people
                      </Badge>
                      {taskData.tache.workstream_info.peut_demarrer_jour_1 && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                          ✓ Independent
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <CardDescription className="mt-2">
                  {taskData.tache.description}
                </CardDescription>
                
                {/* Parallelization information */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  {/* Dependencies */}
                  {taskData.tache.dependances && taskData.tache.dependances.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 font-medium">⚠️ Dependencies:</span>
                      <div className="flex gap-1">
                        {taskData.tache.dependances.map((dep, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-orange-200 text-orange-700">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="font-medium">✅ Independent</span>
                    </div>
                  )}
                  
                  {/* Start status */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Start:</span>
                    <Badge variant={taskData.tache.peut_commencer_immediatement ? "default" : "secondary"}>
                      {taskData.tache.peut_commencer_immediatement ? "Immediate" : "With dependencies"}
                    </Badge>
                  </div>
                </div>
                
                {/* Key skills */}
                {taskData.tache.competences_cles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs font-medium text-gray-600">Key skills:</span>
                    {taskData.tache.competences_cles.map((comp, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <h4 className="font-medium mb-4 text-gray-700 flex items-center gap-2">
                  👥 Recommended engineers for this task ({taskData.classements.length})
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    Parallel assignment
                  </Badge>
                </h4>
                
                <div className="space-y-3">
                  {taskData.classements.map((ranking, rankIndex) => (
                    <div key={rankIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {getRankIcon(ranking.rang)}
                        
                        <div>
                          <div className="font-medium">
                            {ranking.ingenieur ? 
                              `${ranking.ingenieur.prenom} ${ranking.ingenieur.nom}` :
                              `Engineer ${ranking.ingenieur_id.slice(0, 8)}...`
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {ranking.ingenieur?.email || 'Email not available'}
                          </div>
                          
                          {/* Enhanced availability for parallelism */}
                          {ranking.ingenieur?.disponibilite && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={
                                  ranking.ingenieur.disponibilite.disponibilite_effective >= 80 ? "default" :
                                  ranking.ingenieur.disponibilite.disponibilite_effective >= 50 ? "secondary" : "destructive"
                                }
                                className="text-xs"
                              >
                                {ranking.ingenieur.disponibilite.statut_disponibilite}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  ranking.ingenieur.disponibilite.disponibilite_effective >= 80 ? 'bg-green-50 border-green-200 text-green-700' :
                                  ranking.ingenieur.disponibilite.disponibilite_effective >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                  'bg-red-50 border-red-200 text-red-700'
                                }`}
                              >
                                {ranking.ingenieur.disponibilite.disponibilite_effective}% available
                              </Badge>
                              {ranking.ingenieur.disponibilite.disponibilite_effective >= 70 && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                                  ✓ Parallelizable
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={getScoreBadgeVariant(ranking.score_compatibilite)} className="text-lg px-3 py-1">
                          {ranking.score_compatibilite.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 