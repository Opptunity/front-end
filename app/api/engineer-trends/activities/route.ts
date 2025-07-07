import { NextRequest, NextResponse } from 'next/server';
import { engineerSupabase, testConnection } from '@/lib/supabase-engineer';
import { LearningActivityRequest } from '@/lib/types/engineer-ranking';

// GET - Fetch engineer's learning activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const engineerId = searchParams.get('engineer_id');
    const trendId = searchParams.get('trend_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!engineerId) {
      return NextResponse.json(
        { error: 'Engineer ID is required' },
        { status: 400 }
      );
    }

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    let query = engineerSupabase
      .from('EngineerLearningActivities')
      .select('*')
      .eq('engineer_id', engineerId)
      .order('activity_date', { ascending: false })
      .limit(limit);

    if (trendId) {
      query = query.eq('trend_id', trendId);
    }

    const { data: activities, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    // Calculate statistics
    const stats = {
      total_activities: activities.length,
      total_hours: activities.reduce((sum, activity) => sum + (activity.time_spent_hours || 0), 0),
      by_type: activities.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent_skills_gained: activities
        .slice(0, 10)
        .flatMap(activity => activity.skills_gained)
        .filter((skill, index, arr) => arr.indexOf(skill) === index)
    };

    return NextResponse.json({
      success: true,
      activities,
      stats
    });

  } catch (error) {
    console.error('Error fetching learning activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning activities' },
      { status: 500 }
    );
  }
}

// POST - Add new learning activity
export async function POST(request: NextRequest) {
  try {
    const activityData: LearningActivityRequest = await request.json();

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Validate required fields
    if (!activityData.engineer_id || !activityData.activity_title || !activityData.activity_type) {
      return NextResponse.json(
        { error: 'Engineer ID, activity title, and activity type are required' },
        { status: 400 }
      );
    }

    const activityEntry = {
      engineer_id: activityData.engineer_id,
      trend_id: activityData.trend_id || null,
      activity_type: activityData.activity_type,
      activity_title: activityData.activity_title,
      activity_description: activityData.activity_description,
      activity_url: activityData.activity_url,
      provider: activityData.provider,
      completion_percentage: activityData.completion_percentage || 100,
      time_spent_hours: activityData.time_spent_hours || 0,
      skills_gained: activityData.skills_gained || [],
      achievement_proof_url: activityData.achievement_proof_url,
      activity_date: new Date().toISOString()
    };

    const { data: savedActivity, error } = await engineerSupabase
      .from('EngineerLearningActivities')
      .insert(activityEntry)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save activity: ${error.message}`);
    }

    // If this activity is related to a trend focus, update progress
    if (activityData.trend_id && activityData.skills_gained && activityData.skills_gained.length > 0) {
      await updateTrendProgress(
        activityData.engineer_id, 
        activityData.trend_id, 
        activityData.skills_gained, 
        activityData.time_spent_hours || 0
      );
    }

    return NextResponse.json({
      success: true,
      activity: savedActivity,
      message: 'Learning activity recorded successfully'
    });

  } catch (error) {
    console.error('Error adding learning activity:', error);
    return NextResponse.json(
      { error: 'Failed to add learning activity' },
      { status: 500 }
    );
  }
}

// PUT - Update existing learning activity
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    const { data: updatedActivity, error } = await engineerSupabase
      .from('EngineerLearningActivities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      activity: updatedActivity,
      message: 'Learning activity updated successfully'
    });

  } catch (error) {
    console.error('Error updating learning activity:', error);
    return NextResponse.json(
      { error: 'Failed to update learning activity' },
      { status: 500 }
    );
  }
}

// Helper function to update trend progress based on learning activities
async function updateTrendProgress(
  engineerId: number, 
  trendId: string, 
  skillsGained: string[], 
  hoursSpent: number
) {
  try {
    // Find the trend focus for this engineer and trend
    const { data: trendFocus } = await engineerSupabase
      .from('EngineerTrendFocus')
      .select('id')
      .eq('engineer_id', engineerId)
      .eq('trend_id', trendId)
      .eq('status', 'active')
      .single();

    if (!trendFocus) {
      return; // No active focus for this trend
    }

    // Update or create progress entries for gained skills
    for (const skill of skillsGained) {
      const { data: existingProgress } = await engineerSupabase
        .from('EngineerTrendProgress')
        .select('*')
        .eq('engineer_trend_focus_id', trendFocus.id)
        .eq('skill_name', skill)
        .single();

      if (existingProgress) {
        // Update existing progress
        const newHours = existingProgress.time_invested_hours + hoursSpent;
        const newLevel = Math.min(5, existingProgress.current_level + 0.1); // Incremental improvement

        await engineerSupabase
          .from('EngineerTrendProgress')
          .update({
            time_invested_hours: newHours,
            current_level: newLevel,
            last_practiced_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress entry
        await engineerSupabase
          .from('EngineerTrendProgress')
          .insert({
            engineer_trend_focus_id: trendFocus.id,
            skill_name: skill,
            current_level: 1,
            target_level: 3,
            learning_resources_completed: [],
            time_invested_hours: hoursSpent,
            last_practiced_at: new Date().toISOString()
          });
      }
    }

    // Update overall trend focus progress
    const { data: allProgress } = await engineerSupabase
      .from('EngineerTrendProgress')
      .select('current_level, target_level')
      .eq('engineer_trend_focus_id', trendFocus.id);

    if (allProgress && allProgress.length > 0) {
      const overallProgress = allProgress.reduce((sum, progress) => {
        return sum + (progress.current_level / progress.target_level) * 100;
      }, 0) / allProgress.length;

      await engineerSupabase
        .from('EngineerTrendFocus')
        .update({ current_progress: Math.round(overallProgress) })
        .eq('id', trendFocus.id);
    }

  } catch (error) {
    console.error('Error updating trend progress:', error);
    // Don't throw here as this is a secondary operation
  }
} 