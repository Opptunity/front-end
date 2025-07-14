import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id.trim();
  console.log(`Assessment report requested for ID: ${id}`);

  try {
    // Try direct query first
    console.log(`Querying Assessments table with id = '${id}'`);
    const { data: assessment, error } = await supabase
      .from('Assessments')
      .select('assessmentData, cvText, id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching assessment:', error.message);
      
      // Try text search as fallback
      console.log('Trying text search as fallback');
      const { data: textData, error: textError } = await supabase
        .from('Assessments')
        .select('assessmentData, cvText, id')
        .filter('id', 'ilike', `%${id}%`)
        .limit(1)
        .single();
      
      if (textError) {
        console.error('Text search also failed:', textError.message);
        
        // If the assessment doesn't exist or there's another error, return a demo report
        console.log('Returning demo assessment as fallback');
        return NextResponse.json(getDemoAssessment(id));
      }
      
      // Found with text search
      console.log('Found assessment using text search');
      return processAssessmentData(textData);
    }

    // Found with direct query
    console.log('Found assessment using direct query');
    return processAssessmentData(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to process the assessment data
function processAssessmentData(assessment: any) {
  if (!assessment || !assessment.assessmentData) {
    console.log('No assessmentData found in record');
    return NextResponse.json(
      { error: 'Assessment data not available' },
      { status: 404 }
    );
  }

  console.log('Successfully processed assessmentData, keys:',
    Object.keys(assessment.assessmentData),
    'cvText length:', assessment.cvText ? assessment.cvText.length : 0);

  // Create the result object with the ID and CV text
  const result = {
    ...assessment.assessmentData,
    id: assessment.id,
    cvText: assessment.cvText || '',
    isRealAssessment: true
  };

  return NextResponse.json(result);
}

// Helper function to create a demo assessment if none exists
function getDemoAssessment(id: string) {
  return {
    id: id,
    title: 'Skills Assessment Report',
    summary: 'Your personalized skills assessment report',
    createdAt: new Date().toISOString(),
    cvText: '', // Add empty cvText field to match the real assessment structure
    skills: [
      { name: 'JavaScript', score: 85, level: 'Advanced' },
      { name: 'React', score: 82, level: 'Advanced' },
      { name: 'Node.js', score: 78, level: 'Intermediate' },
      { name: 'CSS', score: 80, level: 'Advanced' },
      { name: 'Database Management', score: 75, level: 'Intermediate' }
    ],
    insights: [
      'Strong frontend development capabilities',
      'Good understanding of modern JavaScript frameworks',
      'Opportunity to strengthen backend development skills',
      'Consider focusing on database optimization techniques'
    ],
    overallScore: 80,
    isRealAssessment: false
  };
} 