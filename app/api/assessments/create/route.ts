import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assessSkills } from '@/lib/skills-assessment';

export async function POST(req: NextRequest) {
  try {
    // Extract data from request
    const { cvText, userId } = await req.json();

    // Validate required fields
    if (!cvText) {
      return NextResponse.json(
        { error: 'CV text is required' },
        { status: 400 }
      );
    }

    // Generate assessment using AI
    console.log('Generating assessment with AI...');
    const assessment = await assessSkills(cvText);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Failed to generate assessment' },
        { status: 500 }
      );
    }

    console.log('Assessment generated successfully');

    // Save to Supabase
    const { data, error } = await supabase
      .from('Assessments')
      .insert({
        userId: userId || null, // Allow anonymous assessments
        cvText,
        assessmentData: assessment,
        title: 'Skills Assessment',
        summary: assessment.summary?.substring(0, 200) || 'Skills assessment'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to save assessment to database' },
        { status: 500 }
      );
    }

    console.log('Assessment saved to database with ID:', data.id);

    // Return the assessment with its database ID
    return NextResponse.json({
      id: data.id,
      assessment,
      message: 'Assessment created and saved successfully'
    });
  } catch (error) {
    console.error('Unexpected error in assessment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 