import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assessSkills } from '@/lib/skills-assessment';

// Fixed UUID for visitor user (matches the one we created in the database)
const VISITOR_USER_ID = 'aaaaaaaa-bbbb-cccc-dddd-000000000001';

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

    // Determine the effective user ID - use fixed UUID for visitors
    const effectiveUserId = userId && userId.trim() !== '' ? userId : VISITOR_USER_ID;
    const isVisitor = effectiveUserId === VISITOR_USER_ID;

    console.log("=== ASSESSMENT CREATION ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Supabase URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Supabase Anon Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log("Effective User ID:", effectiveUserId);
    console.log("Is Visitor:", isVisitor);
    console.log("CV Text length:", cvText?.length || 0);
    console.log("Assessment object keys:", assessment ? Object.keys(assessment) : 'null');

    // Save to Supabase with the visitor user ID
    console.log("Attempting to insert into Assessments table...");
    const { data, error } = await supabase
      .from('Assessments')
      .insert({
        userId: effectiveUserId,
        cvText,
        assessmentData: assessment,
        title: 'Skills Assessment',
        summary: assessment.summary?.substring(0, 200) || 'Skills assessment'
      })
      .select()
      .single();

    console.log("=== ASSESSMENTS INSERT RESULT ===");
    console.log("Data returned:", data ? "YES" : "NO");
    console.log("Error occurred:", error ? "YES" : "NO");

    if (error) {
      console.error('=== DETAILED ASSESSMENTS ERROR ===');
      console.error("Full error object:", JSON.stringify(error, null, 2));
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
      
      // Fallback to memory storage if database fails
      console.error("❌ Database error - using fallback storage");
      
      const { assessmentStorage } = await import('@/lib/storage');
      const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      assessmentStorage.set(fallbackId, { text: cvText, assessment });
      
      return NextResponse.json({
        id: fallbackId,
        assessment,
        message: isVisitor 
          ? 'Assessment created (visitor - stored in memory)' 
          : 'Assessment created (database error - stored in memory)',
        saved: false,
        fallback: true
      });
    }

    console.log('✅ Assessment saved to database successfully with ID:', data.id);
    
    // Return the assessment with its database ID
    return NextResponse.json({
      id: data.id,
      assessment,
      message: isVisitor 
        ? 'Assessment created successfully (visitor)' 
        : 'Assessment created and saved successfully',
      saved: true,
      isVisitor: isVisitor
    });
  } catch (error) {
    console.error('Unexpected error in assessment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 