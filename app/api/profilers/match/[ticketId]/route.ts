import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateAIProfilerMatches } from '@/lib/ai-profiler-matching';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const { searchParams } = new URL(request.url);
    const minMatchScore = parseFloat(searchParams.get('min_match_score') || '0.3');
    const availabilityOnly = searchParams.get('availability_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // First, get the ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        position_title,
        client_company,
        required_skills,
        preferred_skills,
        seniority,
        work_location,
        work_arrangement,
        contract_type,
        start_date,
        budget_min,
        budget_max,
        project_description
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get all profilers
    let profilersQuery = supabase
      .from('profilers')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        location,
        availability_status,
        preferred_work_arrangement,
        skills,
        experience_level,
        years_of_experience,
        hourly_rate,
        daily_rate,
        currency,
        bio,
        linkedin_url,
        portfolio_url,
        contract_types,
        notice_period_days
      `);

    // Debug: Log the filters being applied
    console.log('Filters being applied:', {
      availabilityOnly,
      ticketContractType: ticket.contract_type,
      minMatchScore
    });

    // Filter by availability if requested (lenient - includes null values)
    if (availabilityOnly) {
      profilersQuery = profilersQuery.or('availability_status.eq.available,availability_status.is.null');
    }

    // TODO: Re-enable contract type filtering with proper JSONB array syntax later
    // For now, skip this filter to avoid PostgreSQL array syntax errors
    console.log('⚠️  Contract type filtering temporarily disabled to avoid array syntax errors');

    const { data: profilers, error: profilersError } = await profilersQuery;

    console.log('Raw profilers found:', profilers?.length || 0);
    if (profilers && profilers.length > 0) {
      console.log('Sample profiler data:', {
        id: profilers[0].id,
        availability_status: profilers[0].availability_status,
        contract_types: profilers[0].contract_types,
        skills: profilers[0].skills
      });
    }

    if (profilersError) {
      console.error('Error fetching profilers:', profilersError);
      return NextResponse.json({ error: profilersError.message }, { status: 500 });
    }

    // Use AI to calculate match scores for all profilers
    console.log(`Using AI to match ${profilers.length} profilers against ticket ${ticket.ticket_number}`);
    
    const aiMatchResults = await calculateAIProfilerMatches(ticket, profilers);

    // Convert AI results to the expected format and filter by minimum match score
    const scoredProfilers = [];

    for (const profiler of profilers) {
      const aiMatch = aiMatchResults.find(result => result.profiler_id === profiler.id);
      
      if (!aiMatch) {
        console.warn(`No AI match result found for profiler ${profiler.id}`);
        continue;
      }

      // Convert AI score (0-100) to decimal (0-1) for consistency
      const normalizedScore = aiMatch.match_score / 100;

      // Only include profilers above minimum match score
      console.log(`Profiler ${profiler.id} has AI score: ${normalizedScore} (min required: ${minMatchScore})`);
      if (normalizedScore >= minMatchScore) {
        // Check if profiler is already assigned to this ticket
        const { data: existingPlacement } = await supabase
          .from('placements')
          .select('id, status')
          .eq('ticket_id', ticketId)
          .eq('profiler_id', profiler.id)
          .single();

        scoredProfilers.push({
          ...profiler,
          match_score: parseFloat(normalizedScore.toFixed(2)),
          budget_compatible: aiMatch.budget_compatibility >= 70, // Consider 70+ as compatible
          existing_placement: existingPlacement || null,
          match_details: {
            skills_match: aiMatch.skills_match / 100,
            experience_match: aiMatch.experience_match / 100,
            location_match: aiMatch.location_match / 100,
            availability_match: aiMatch.availability_match / 100,
            budget_compatibility: aiMatch.budget_compatibility / 100
          },
          ai_analysis: {
            reasoning: aiMatch.reasoning,
            overall_fit: aiMatch.overall_fit,
            strengths: aiMatch.strengths,
            concerns: aiMatch.concerns
          }
        });
      }
    }

    // Sort by match score descending
    scoredProfilers.sort((a, b) => b.match_score - a.match_score);

    // Limit results
    const limitedResults = scoredProfilers.slice(0, limit);

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        position_title: ticket.position_title,
        company_name: ticket.client_company,
        required_skills: ticket.required_skills,
        preferred_skills: ticket.preferred_skills,
        project_description: ticket.project_description
      },
      matched_profilers: limitedResults,
      total_matches: scoredProfilers.length,
      filters_applied: {
        min_match_score: minMatchScore,
        availability_only: availabilityOnly,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 