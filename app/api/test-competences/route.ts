import { NextResponse } from 'next/server';
import { engineerSupabase, testConnection } from '@/lib/supabase-engineer';

export async function GET() {
  try {
    console.log('=== TESTING COMPETENCES TABLE ACCESS ===');

    // Check connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Read existing competences
    const { data: existingCompetences, error: readError } = await engineerSupabase
      .from('competences')
      .select('*')
      .limit(10);

    if (readError) {
      console.error('Error reading competences:', readError);
      return NextResponse.json({
        success: false,
        error: 'Cannot read from competences table',
        details: readError
      });
    }

    // Try to insert a test competence
    const testSkillName = `Test Skill ${Date.now()}`;
    const { data: insertedCompetence, error: insertError } = await engineerSupabase
      .from('competences')
      .insert({
        nom_competence: testSkillName,
        categorie: 'Testing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting test competence:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Cannot insert into competences table',
        details: insertError,
        existingCompetences: existingCompetences
      });
    }

    // Clean up - delete the test competence
    await engineerSupabase
      .from('competences')
      .delete()
      .eq('competence_id', insertedCompetence.competence_id);

    return NextResponse.json({
      success: true,
      message: 'Competences table is accessible for read/write',
      existingCompetencesCount: existingCompetences?.length || 0,
      existingCompetences: existingCompetences,
      testInsertSuccess: true
    });

  } catch (error) {
    console.error('Test competences error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test competences table',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 