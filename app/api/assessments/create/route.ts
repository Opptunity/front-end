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

    // Log environment and configuration details for debugging
    console.log("=== ASSESSMENTS SUPABASE DEBUG INFO ===")
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Supabase URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Supabase Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log("Supabase URL domain:", process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0] || 'unknown')
    console.log("User ID:", userId)
    console.log("CV Text length:", cvText?.length || 0)
    console.log("Assessment object keys:", assessment ? Object.keys(assessment) : 'null')

    // Save to Supabase
    console.log("Attempting to insert into Assessments table...")
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

    console.log("=== ASSESSMENTS INSERT RESULT ===")
    console.log("Data returned:", data ? "YES" : "NO")
    console.log("Error occurred:", error ? "YES" : "NO")

    if (error) {
      console.error('=== DETAILED ASSESSMENTS ERROR ===');
      console.error("Full error object:", JSON.stringify(error, null, 2));
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      
      // Try to understand what type of error this is
      if (error.code === '42P01') {
        console.error("❌ ERROR TYPE: Table 'Assessments' does not exist in this database");
      } else if (error.code === '23505') {
        console.error("❌ ERROR TYPE: Duplicate key violation - record already exists");
      } else if (error.code === '42501') {
        console.error("❌ ERROR TYPE: Permission denied - insufficient privileges");
      } else if (error.code === '23502') {
        console.error("❌ ERROR TYPE: Not null violation - required field missing");
      } else if (error.code === '23503') {
        console.error("❌ ERROR TYPE: Foreign key violation");
      } else if (error.message?.includes('fetch')) {
        console.error("❌ ERROR TYPE: Network/connection error");
      } else if (error.message?.includes('column')) {
        console.error("❌ ERROR TYPE: Column doesn't exist - schema mismatch");
      } else {
        console.error("❌ ERROR TYPE: Unknown error");
      }
      
      return NextResponse.json(
        { error: 'Failed to save assessment to database' },
        { status: 500 }
      );
    }

    console.log('✅ Assessment saved to database successfully with ID:', data.id);
    console.log('✅ Returned data keys:', data ? Object.keys(data) : 'no data');

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