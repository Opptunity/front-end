import { NextResponse } from 'next/server';
import { engineerSupabase, testConnection } from '@/lib/supabase-engineer';

export async function POST() {
  try {
    console.log('=== TESTING NIVEAU VALUES ===');

    // Check connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // First, create a test competence
    const testSkillName = `Test Skill ${Date.now()}`;
    const { data: testCompetence, error: competenceError } = await engineerSupabase
      .from('competences')
      .insert({
        nom_competence: testSkillName,
        categorie: 'Testing'
      })
      .select('competence_id')
      .single();

    if (competenceError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create test competence',
        details: competenceError
      });
    }

    const competenceId = testCompetence.competence_id;
    console.log(`Created test competence with ID: ${competenceId}`);

    // Test different niveau values to see which ones are allowed
    const testValues = [
      // Numbers
      1, 2, 3, 4, 5,
      // English strings
      'beginner', 'intermediate', 'advanced', 'expert',
      'basic', 'proficient', 'experienced',
      // French strings (common in French databases)
      'debutant', 'intermediaire', 'avance', 'expert',
      'faible', 'moyen', 'bon', 'excellent',
      // Other possible values
      'junior', 'senior', 'master'
    ];
    const results = [];

    for (const testValue of testValues) {
      console.log(`Testing niveau value: ${testValue}`);
      
      // Try to insert with engineer ID 1 (assuming it exists)
      const { data: relationData, error: relationError } = await engineerSupabase
        .from('ingenieur_competences')
        .insert({
          ingenieur_id: 1,  // Using a low ID that likely exists
          competence_id: competenceId,
          niveau: testValue
        })
        .select();

      if (relationError) {
        console.log(`❌ Value ${testValue} failed:`, relationError.message);
        results.push({
          value: testValue,
          allowed: false,
          error: relationError.message,
          error_code: relationError.code
        });
      } else {
        console.log(`✅ Value ${testValue} succeeded`);
        results.push({
          value: testValue,
          allowed: true
        });
        
        // Clean up - delete the test relationship
        await engineerSupabase
          .from('ingenieur_competences')
          .delete()
          .eq('ingenieur_id', 1)
          .eq('competence_id', competenceId)
          .eq('niveau', testValue);
      }
    }

    // Clean up - delete the test competence
    await engineerSupabase
      .from('competences')
      .delete()
      .eq('competence_id', competenceId);

    const allowedValues = results.filter(r => r.allowed).map(r => r.value);
    const disallowedValues = results.filter(r => !r.allowed).map(r => r.value);

    return NextResponse.json({
      success: true,
      message: 'Niveau testing completed',
      allowed_values: allowedValues,
      disallowed_values: disallowedValues,
      all_results: results,
      recommendation: `Use values: ${allowedValues.join(', ')}`
    });

  } catch (error) {
    console.error('Test niveau error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test niveau values',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 