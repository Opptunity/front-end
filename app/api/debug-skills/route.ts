import { NextResponse } from 'next/server';
import { engineerSupabase, testConnection } from '@/lib/supabase-engineer';

export async function POST() {
  try {
    console.log('=== DEBUG SKILLS INSERTION ===');

    // Check connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Sample skills data like what comes from CV analysis
    const testSkills = [
      { skill: 'Content Strategy', level: 'Expert' },
      { skill: 'Performance Marketing', level: 'Advanced' },
      { skill: 'Community Engineering', level: 'Advanced' },
      { skill: 'Product Marketing', level: 'Advanced' },
      { skill: 'Design Thinking', level: 'Intermediate' },
      { skill: 'Product Management', level: 'Intermediate' }
    ];

    console.log('Testing with skills:', JSON.stringify(testSkills, null, 2));

    const results = [];

    for (let i = 0; i < testSkills.length; i++) {
      const skill = testSkills[i];
      const skillName = skill.skill;
      
      console.log(`\n--- Processing skill ${i + 1}: ${skillName} ---`);

      try {
        // Check if competence exists
        const { data: existingCompetence, error: searchError } = await engineerSupabase
          .from('competences')
          .select('competence_id, nom_competence, categorie')
          .eq('nom_competence', skillName)
          .single();

        let competenceId = null;
        let action = '';

        if (searchError && searchError.code !== 'PGRST116') {
          console.error(`Error searching for competence ${skillName}:`, searchError);
          results.push({
            skill: skillName,
            success: false,
            error: 'Search error',
            details: searchError
          });
          continue;
        }

        if (existingCompetence) {
          competenceId = existingCompetence.competence_id;
          action = 'found_existing';
          console.log(`✅ Found existing competence: ${skillName} (ID: ${competenceId})`);
        } else {
          // Create new competence
          const category = categorizeSkill(skillName);
          console.log(`Creating new competence: ${skillName} with category: ${category}`);
          
          const { data: newCompetence, error: createError } = await engineerSupabase
            .from('competences')
            .insert({
              nom_competence: skillName,
              categorie: category
            })
            .select('competence_id, nom_competence, categorie')
            .single();

          if (createError) {
            console.error(`Error creating competence ${skillName}:`, createError);
            results.push({
              skill: skillName,
              success: false,
              error: 'Create error',
              details: createError
            });
            continue;
          }

          competenceId = newCompetence?.competence_id;
          action = 'created_new';
          console.log(`✅ Created new competence: ${skillName} (ID: ${competenceId})`);
        }

        results.push({
          skill: skillName,
          level: skill.level,
          success: true,
          action: action,
          competence_id: competenceId
        });

      } catch (error) {
        console.error(`Error processing skill ${skillName}:`, error);
        results.push({
          skill: skillName,
          success: false,
          error: 'Exception',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Check final state of competences table
    const { data: finalCompetences, error: finalError } = await engineerSupabase
      .from('competences')
      .select('*')
      .order('competence_id', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      message: 'Skills debug completed',
      processed_skills: results,
      successful_skills: results.filter(r => r.success).length,
      failed_skills: results.filter(r => !r.success).length,
      recent_competences: finalCompetences
    });

  } catch (error) {
    console.error('Debug skills error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to debug skills insertion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to categorize skills (copied from main file)
function categorizeSkill(skillName: string): string {
  const skill = skillName.toLowerCase();
  
  if (['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php'].some(lang => skill.includes(lang))) {
    return 'Programming Languages';
  }
  if (['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt'].some(fw => skill.includes(fw))) {
    return 'Frontend Frameworks';
  }
  if (['node.js', 'express', 'fastapi', 'spring', 'django', 'flask'].some(fw => skill.includes(fw))) {
    return 'Backend Frameworks';
  }
  if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'].some(tool => skill.includes(tool))) {
    return 'DevOps & Cloud';
  }
  if (['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch'].some(db => skill.includes(db))) {
    return 'Databases';
  }
  if (['marketing', 'content', 'strategy', 'management'].some(term => skill.includes(term))) {
    return 'Business & Marketing';
  }
  
  return 'Other';
} 