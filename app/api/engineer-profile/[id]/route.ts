import { NextRequest, NextResponse } from 'next/server';
import { 
  engineerSupabase, 
  testConnection 
} from '@/lib/supabase-engineer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const engineerId = params.id;

    console.log('Fetching engineer profile for ID:', engineerId);

    // Check if Engineer Supabase is available
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Fetch engineer basic data
    const { data: engineerData, error: engineerError } = await engineerSupabase
      .from('ingenieurs')
      .select('*')
      .eq('ingenieur_id', engineerId)
      .single();

    if (engineerError || !engineerData) {
      // Try fetching by email if ID doesn't work
      const { data: engineerByEmail, error: emailError } = await engineerSupabase
        .from('ingenieurs')
        .select('*')
        .eq('email', engineerId)
        .single();

      if (emailError || !engineerByEmail) {
        return NextResponse.json(
          { error: 'Engineer not found' },
          { status: 404 }
        );
      }
      
      // Use engineer found by email
      const engineerProfile = engineerByEmail;
      const actualEngineerId = engineerProfile.ingenieur_id;

      // Fetch engineer's skills
      const { data: skillsData, error: skillsError } = await engineerSupabase
        .from('ingenieur_competences')
        .select(`
          niveau,
          competences (
            competence_id,
            nom_competence,
            categorie
          )
        `)
        .eq('ingenieur_id', actualEngineerId);

      if (skillsError) {
        console.warn('Error fetching skills:', skillsError);
      }

      // Prepare response
      const profileResponse = {
        engineer: {
          id: engineerProfile.ingenieur_id,
          name: `${engineerProfile.prenom} ${engineerProfile.nom}`.trim(),
          email: engineerProfile.email,
          equipe_id: engineerProfile.equipe_id,
          adresse_residence: engineerProfile.adresse_residence
        },
        skills: skillsData?.map(skill => ({
          name: (skill.competences as any)?.nom_competence || 'Unknown Skill',
          level: skill.niveau,
          category: (skill.competences as any)?.categorie || 'Other',
          levelText: mapStringToSkillLevel(skill.niveau)
        })) || [],
        assessment_data: (engineerProfile as any).cv_assessment_data || null,
        profile_created: null
      };

      return NextResponse.json(profileResponse);
    }

    // If found by ID, proceed with that data
    const actualEngineerId = engineerData.ingenieur_id;

    // Fetch engineer's skills
    const { data: skillsData, error: skillsError } = await engineerSupabase
      .from('ingenieur_competences')
      .select(`
        niveau,
        competences (
          competence_id,
          nom_competence,
          categorie
        )
      `)
      .eq('ingenieur_id', actualEngineerId);

    if (skillsError) {
      console.warn('Error fetching skills:', skillsError);
    }

    // Prepare response
    const profileResponse = {
      engineer: {
        id: engineerData.ingenieur_id,
        name: `${engineerData.prenom} ${engineerData.nom}`.trim(),
        email: engineerData.email,
        equipe_id: engineerData.equipe_id,
        adresse_residence: engineerData.adresse_residence
      },
      skills: skillsData?.map(skill => ({
        name: (skill.competences as any)?.nom_competence || 'Unknown Skill',
        level: skill.niveau,
        category: (skill.competences as any)?.categorie || 'Other',
        levelText: mapStringToSkillLevel(skill.niveau)
      })) || [],
      assessment_data: (engineerData as any).cv_assessment_data || null,
      profile_created: null
    };

    return NextResponse.json(profileResponse);

  } catch (error) {
    console.error('Error fetching engineer profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch engineer profile', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Helper function to convert string level to display text
// Database stores: 'Débutant', 'Intermédiaire', 'Confirmé', 'Expert'
function mapStringToSkillLevel(level: string): string {
  const levelStr = level?.toString() || '';
  
  switch (levelStr) {
    case 'Expert': return 'Expert';
    case 'Confirmé': return 'Advanced';
    case 'Intermédiaire': return 'Intermediate';
    case 'Débutant': return 'Beginner';
    default: return 'Intermediate';
  }
} 