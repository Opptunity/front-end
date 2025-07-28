import { NextRequest, NextResponse } from 'next/server';
import { 
  engineerSupabase, 
  engineerSupabaseAdmin,
  getIngenieurWithCompetencesEtDisponibilite,
  saveClassementAI,
  getTacheById,
  testConnection,
  checkTablesExist
} from '@/lib/supabase-engineer';
import { EngineerRankingAI } from '@/lib/engineer-ranking-ai';
import type { ClassementRequest, ClassementResponse } from '@/lib/types/engineer-ranking';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("Starting analysis for:", body);
  
    // Verify connection to Engineer database
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { 
          error: 'Unable to connect to Engineer database. Check your NEXT_PUBLIC_ENGINEER_SUPABASE_URL and NEXT_PUBLIC_ENGINEER_SUPABASE_ANON_KEY environment variables' 
        },
        { status: 503 }
      );
    }
  
    // Verify that tables exist
    const tablesStatus = await checkTablesExist();
    if (!tablesStatus.ingenieurs) {
      return NextResponse.json(
        { 
          error: 'The "ingenieurs" table does not exist in your Engineer Supabase database. Please run the table creation script.' 
        },
        { status: 503 }
      );
    }

    // Retrieve all available engineers with their skills AND availability
    let engineersData;
    try {
      engineersData = await getIngenieurWithCompetencesEtDisponibilite();
    } catch (error) {
      console.error('Engineer retrieval error:', error);
      return NextResponse.json(
        { error: `Error retrieving engineers: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    console.log(`Evaluating ${engineersData.length} engineers with availability analysis`);

    // Initialize AI service
    const rankingAI = new EngineerRankingAI();
    
    // Job specification mode (new)
    if (body.mode === 'job_specification') {
      if (!body.job_specification) {
        return NextResponse.json(
          { error: 'Job specification is required' },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      
      // Perform job specification analysis
      const results = await rankingAI.rankEngineersForJobSpecification(
        body.job_specification,
        engineersData
      );

      // Enrich results with complete engineer data
      const enrichedClassements = results.classements.map((ranking: any) => {
        // Convert AI ID to number to compare with database
        const engineerIdNumber = parseInt(ranking.ingenieur_id);
        const engineerData = engineersData.find((eng: any) => eng.ingenieur_id === engineerIdNumber);
        
        return {
          ...ranking,
          ingenieur_id: engineerData ? engineerData.ingenieur_id : ranking.ingenieur_id,
          ingenieur: engineerData || {
            ingenieur_id: ranking.ingenieur_id,
            nom: 'Unknown',
            prenom: 'Engineer', 
            email: 'email@unknown.com',
            equipe_id: null
          }
        };
      });
  
      // Generate summary with enriched engineer data
      const jobMatchingSummary = await rankingAI.generateJobMatchingSummary(
        results.job_analysis, 
        enrichedClassements
      );

      const enrichedResults = {
        ...results,
        classements: enrichedClassements,
        resume_job_matching: jobMatchingSummary
      };

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      
      console.log(`Job specification analysis finished in ${processingTime}s`);

      return NextResponse.json(enrichedResults);
    }

    // Project decomposition mode (new)
    if (body.mode === 'project_decomposition') {
      if (!body.projet_description) {
        return NextResponse.json(
          { error: 'Project description is required' },
          { status: 400 }
        );
      }

      const startTime = Date.now();
      
      // Perform complete project analysis
      const results = await rankingAI.rankEngineersForProject(
        body.projet_description,
        engineersData
      );

      // Enrich results with complete engineer data
      const enrichedResults = {
        ...results,
        classements_par_tache: results.classements_par_tache.map((taskData: any) => ({
          ...taskData,
          classements: taskData.classements.map((ranking: any) => {
            // Convert AI ID to number to compare with database
            const engineerIdNumber = parseInt(ranking.ingenieur_id);
            const engineerData = engineersData.find((eng: any) => eng.ingenieur_id === engineerIdNumber);
            
            return {
              ...ranking,
              ingenieur_id: engineerData ? engineerData.ingenieur_id : ranking.ingenieur_id,
              ingenieur: engineerData || {
                ingenieur_id: ranking.ingenieur_id,
                nom: 'Unknown',
                prenom: 'Engineer', 
                email: 'email@unknown.com',
                equipe_id: null
              }
            };
          })
        }))
      };
    
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
       
      console.log(`Complete project analysis finished in ${processingTime}s`);

      return NextResponse.json(enrichedResults);
    }

    // Classic mode (specific task) - keep existing code
    if (!body.tache_id && !body.tache_description) {
      return NextResponse.json(
        { error: 'Either tache_id or tache_description is required for classic mode' },
        { status: 400 }
      );
    }

    // Retrieve task data if tache_id is provided
    let task = null;
    if (body.tache_id) {
      try {
        task = await getTacheById(body.tache_id);
      } catch (error) {
        console.error('Task retrieval error:', error);
        return NextResponse.json(
          { error: `Task not found: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 404 }
        );
      }
    }

    // Perform ranking
    const startTime = Date.now();
    
    // Build complete description with project context
    let completeDescription = '';
    if (body.projet_nom) {
      completeDescription += `PROJECT: ${body.projet_nom}\n`;
    }
    if (body.projet_description) {
      completeDescription += `CONTEXT: ${body.projet_description}\n`;
    }
    completeDescription += `TASK: ${task?.description_tache || body.tache_description || ''}`;
    
    const requiredSkills = task?.competences_appliquees_tache || body.competences_requises || [];
    
    const rankings = await rankingAI.rankEngineersForTask(
      completeDescription,
      engineersData,
      requiredSkills
    );

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    // Sort by descending score and assign ranks
    const sortedRankings = rankings
      .sort((a, b) => b.score_compatibilite - a.score_compatibilite)
      .map((ranking, index) => {
        // Convert AI ID to number to compare with database
        const engineerIdNumber = parseInt(ranking.ingenieur_id);
        const engineerData = engineersData.find(eng => eng.ingenieur_id === engineerIdNumber);
        
        console.log(`=== ENGINEER ID MATCHING DEBUG ===`);
        console.log(`AI returned ID: '${ranking.ingenieur_id}' (type: ${typeof ranking.ingenieur_id})`);
        console.log(`Converted to number: ${engineerIdNumber} (type: ${typeof engineerIdNumber})`);
        console.log(`Database engineer IDs: [${engineersData.map(e => `${e.ingenieur_id}(${typeof e.ingenieur_id})`).join(', ')}]`);
        console.log(`Match found: ${engineerData ? `${engineerData.prenom} ${engineerData.nom}` : 'NOT FOUND'}`);
        console.log(`=============================`);
        
        return {
          ...ranking,
          rang: index + 1,
          tache_id: body.tache_id || null,
          ingenieur_id: engineerData ? engineerData.ingenieur_id : ranking.ingenieur_id,
          ingenieur: engineerData ? {
            ingenieur_id: engineerData.ingenieur_id,
            nom: engineerData.nom,
            prenom: engineerData.prenom,
            email: engineerData.email,
            equipe_id: engineerData.equipe_id
          } : {
            ingenieur_id: ranking.ingenieur_id,
            nom: 'Engineer',
            prenom: 'Unknown', 
            email: 'email@unknown.com',
            equipe_id: null
          }
        };
      });

    // Debug to verify
    console.log('Engineer IDs in database:', engineersData.map(eng => eng.ingenieur_id));
    console.log('IDs returned by AI:', rankings.map(c => c.ingenieur_id));
    console.log('Matches found:', sortedRankings.map(c => ({
      id: c.ingenieur_id,
      nom: c.ingenieur ? `${c.ingenieur.prenom} ${c.ingenieur.nom}` : 'NOT FOUND',
      score: c.score_compatibilite
    })));

    // Limit results if requested
    const limit = body.limite_resultats || sortedRankings.length;
    const finalRankings = sortedRankings.slice(0, limit);

    // Save results to database if specific task
    if (body.tache_id) {
      try {
        await saveClassementAI(finalRankings);
        console.log(`Saved ${finalRankings.length} rankings to database`);
      } catch (error) {
        console.error('Error saving rankings:', error);
        // Continue without blocking the response
      }
    }

    return NextResponse.json({
      classements: finalRankings,
      tache_analysee: task,
      nombre_ingenieurs_evalues: engineersData.length,
      temps_traitement: processingTime
    });

  } catch (error) {
    console.error('General error in engineer ranking:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An error occurred during engineer ranking',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}

// Endpoint to retrieve existing rankings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tacheId = searchParams.get('tache_id');
    
    if (!tacheId) {
      return NextResponse.json(
        { error: 'tache_id requis' },
        { status: 400 }
      );
    }

    const { data, error } = await engineerSupabase
      .from('classements_ai')
      .select(`
        *,
        ingenieurs (*),
        taches (*)
      `)
      .eq('tache_id', tacheId)
      .order('rang', { ascending: true });

    if (error) {
      console.error('Erreur récupération classements:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des classements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ classements: data || [] });

  } catch (error) {
    console.error('Erreur GET classements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 