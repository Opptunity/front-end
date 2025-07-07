import { NextRequest, NextResponse } from 'next/server';
import { OnboardingProfile } from '@/lib/types/engineer-ranking';
import { 
  createNewEngineer, 
  getEngineerByEmail, 
  testConnection 
} from '@/lib/supabase-engineer';

export async function POST(request: NextRequest) {
  try {
    const onboardingData: Partial<OnboardingProfile> = await request.json();

    console.log('Received onboarding data:', onboardingData);

    // Check if Engineer Supabase is available
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.warn('Engineer Supabase not available, storing locally only');
    }

    // Build the onboarding profile
    const savedProfile: OnboardingProfile = {
      id: `onboarding_${Date.now()}`,
      engineer_id: `engineer_${Date.now()}`,
      personal_info: onboardingData.personal_info || {
        full_name: '',
        email: '',
        role: '',
        department: '',
        start_date: '',
        location: '',
        manager_email: ''
      },
      technical_background: onboardingData.technical_background || {
        experience_level: 'mid',
        years_experience: 0,
        primary_technologies: [],
        previous_companies: [],
        education_background: ''
      },
      current_skills: onboardingData.current_skills || [],
      learning_goals: onboardingData.learning_goals || [],
      team_preferences: onboardingData.team_preferences || {
        preferred_work_style: 'mixed',
        communication_style: 'direct',
        learning_style: 'mixed',
        availability_for_mentoring: false
      },
      onboarding_status: {
        current_step: 6,
        completed_steps: [0, 1, 2, 3, 4, 5],
        started_at: onboardingData.onboarding_status?.started_at || new Date().toISOString(),
        completed_at: new Date().toISOString(),
        is_completed: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save engineer to Engineer Supabase database if onboarding is completed
    let engineerResult = null;
    
    console.log('=== ENGINEER DATABASE SAVE ATTEMPT ===');
    console.log('Connection OK:', connectionOk);
    console.log('Onboarding completed:', savedProfile.onboarding_status.is_completed);
    console.log('Email provided:', savedProfile.personal_info.email);
    console.log('Full profile data:', JSON.stringify(savedProfile, null, 2));
    
    if (connectionOk && savedProfile.onboarding_status.is_completed && savedProfile.personal_info.email) {
      try {
        console.log('Attempting to save engineer to database...');
        
        // Check if engineer already exists
        const existingEngineer = await getEngineerByEmail(savedProfile.personal_info.email);
        console.log('Existing engineer check result:', existingEngineer);
        
        if (existingEngineer) {
          console.log(`Engineer with email ${savedProfile.personal_info.email} already exists`);
          engineerResult = {
            engineer: existingEngineer,
            message: 'Engineer already exists in database'
          };
        } else {
          console.log('Creating new engineer...');
          // Create new engineer
          engineerResult = await createNewEngineer(savedProfile);
          console.log('Successfully created engineer in database:', engineerResult);
        }
      } catch (error) {
        console.error('Error saving engineer to database:', error);
        engineerResult = {
          engineer: null,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
        // Continue with the flow even if database save fails
      }
    } else {
      console.log('Skipping engineer database save:');
      console.log('- Connection OK:', connectionOk);
      console.log('- Is completed:', savedProfile.onboarding_status.is_completed);
      console.log('- Has email:', !!savedProfile.personal_info.email);
    }

    // TODO: Send notification email to manager if provided
    if (savedProfile.personal_info.manager_email) {
      console.log(`Would send notification to manager: ${savedProfile.personal_info.manager_email}`);
      // Implement email notification here
    }

    // TODO: Generate learning recommendations
    const learningRecommendations = generateLearningRecommendations(savedProfile);
    
    // TODO: Find potential mentors
    const potentialMentors = findPotentialMentors(savedProfile);

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully!',
      profile: savedProfile,
      recommendations: learningRecommendations,
      mentors: potentialMentors,
      engineer_database: engineerResult ? {
        saved: true,
        engineer_id: engineerResult.engineer?.ingenieur_id,
        message: engineerResult.message
      } : {
        saved: false,
        message: connectionOk ? 'Onboarding not completed or email missing' : 'Engineer database not available'
      }
    });

  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save onboarding data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const engineerId = searchParams.get('engineer_id');

    if (!engineerId) {
      return NextResponse.json(
        { error: 'Engineer ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database
    // For now, return a mock response
    const mockProfile: OnboardingProfile = {
      id: `onboarding_${engineerId}`,
      engineer_id: engineerId,
      personal_info: {
        full_name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Software Engineer',
        department: 'Engineering',
        start_date: new Date().toISOString().split('T')[0],
        location: 'Remote',
        manager_email: 'manager@example.com'
      },
      technical_background: {
        experience_level: 'mid',
        years_experience: 3,
        primary_technologies: ['JavaScript', 'React', 'Node.js'],
        previous_companies: ['Previous Company Inc.'],
        education_background: 'BS Computer Science'
      },
      current_skills: [
        {
          skill_id: 'skill_1',
          skill_name: 'React',
          self_assessed_level: 4,
          category: 'Frontend Frameworks',
          is_primary: true
        }
      ],
      learning_goals: [
        {
          goal_id: 'goal_1',
          skill_area: 'TypeScript',
          target_level: 4,
          priority: 'high',
          timeline: '3 months',
          reason: 'Required for upcoming project'
        }
      ],
      team_preferences: {
        preferred_work_style: 'mixed',
        communication_style: 'direct',
        learning_style: 'hands_on',
        availability_for_mentoring: false
      },
      onboarding_status: {
        current_step: 6,
        completed_steps: [0, 1, 2, 3, 4, 5],
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        is_completed: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(mockProfile);

  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    );
  }
}

// Helper functions for processing onboarding data
function generateLearningRecommendations(profile: OnboardingProfile) {
  const recommendations = [];
  
  // Generate recommendations based on learning goals
  for (const goal of profile.learning_goals) {
    recommendations.push({
      type: 'course',
      title: `Advanced ${goal.skill_area} Course`,
      description: `Learn ${goal.skill_area} to reach level ${goal.target_level}`,
      priority: goal.priority,
      estimated_time: goal.timeline
    });
  }

  // Generate recommendations based on role and experience level
  if (profile.technical_background.experience_level === 'junior') {
    recommendations.push({
      type: 'mentorship',
      title: 'Junior Developer Mentorship Program',
      description: 'Get paired with a senior developer for guidance',
      priority: 'high',
      estimated_time: 'Ongoing'
    });
  }

  return recommendations;
}

function findPotentialMentors(profile: OnboardingProfile) {
  // This would query your database for potential mentors
  // based on skills overlap, experience level, and availability
  
  return [
    {
      id: 'mentor_1',
      name: 'Sarah Johnson',
      role: 'Senior Software Engineer',
      experience_level: 'senior',
      skills_overlap: profile.current_skills.slice(0, 3).map(s => s.skill_name),
      availability: true,
      rating: 4.8
    },
    {
      id: 'mentor_2',
      name: 'Mike Chen',
      role: 'Tech Lead',
      experience_level: 'lead',
      skills_overlap: profile.current_skills.slice(0, 2).map(s => s.skill_name),
      availability: true,
      rating: 4.9
    }
  ];
} 