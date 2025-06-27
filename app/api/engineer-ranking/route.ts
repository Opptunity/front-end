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
    const body: ClassementRequest = await req.json();
    
    // Validation des données d'entrée
    if (!body.tache_id && !body.tache_description) {
      return NextResponse.json(
        { error: 'Soit tache_id soit tache_description est requis' },
        { status: 400 }
      );
    }

    console.log("Début du classement pour:", body);

    // Vérifier la connexion à la base Engineer
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { 
          error: 'Impossible de se connecter à la base de données Engineer. Vérifiez vos variables d\'environnement NEXT_PUBLIC_ENGINEER_SUPABASE_URL et NEXT_PUBLIC_ENGINEER_SUPABASE_ANON_KEY' 
        },
        { status: 503 }
      );
    }

    // Vérifier que les tables existent
    const tablesStatus = await checkTablesExist();
    if (!tablesStatus.ingenieurs) {
      return NextResponse.json(
        { 
          error: 'La table "ingenieurs" n\'existe pas dans votre base Supabase Engineer. Veuillez exécuter le script de création des tables.' 
        },
        { status: 503 }
      );
    }

    // Récupérer les données de la tâche si tache_id est fourni
    let tache = null;
    if (body.tache_id) {
      try {
        tache = await getTacheById(body.tache_id);
      } catch (error) {
        console.error('Erreur récupération tâche:', error);
        return NextResponse.json(
          { error: `Tâche non trouvée: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
          { status: 404 }
        );
      }
    }

    // Récupérer tous les ingénieurs disponibles avec leurs compétences ET disponibilité
    let ingenieursData;
    try {
      ingenieursData = await getIngenieurWithCompetencesEtDisponibilite();
    } catch (error) {
      console.error('Erreur récupération ingénieurs:', error);
      return NextResponse.json(
        { error: `Erreur lors de la récupération des ingénieurs: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
        { status: 500 }
      );
    }

    console.log(`Évaluation de ${ingenieursData.length} ingénieurs avec analyse de disponibilité`);

    // Initialiser le service AI
    const rankingAI = new EngineerRankingAI();
    
    // Effectuer le classement
    const startTime = Date.now();
    
    // Construire la description complète avec contexte projet
    let descriptionComplete = '';
    if (body.projet_nom) {
      descriptionComplete += `PROJET: ${body.projet_nom}\n`;
    }
    if (body.projet_description) {
      descriptionComplete += `CONTEXTE: ${body.projet_description}\n`;
    }
    descriptionComplete += `TÂCHE: ${tache?.description_tache || body.tache_description || ''}`;
    
    const competencesRequises = tache?.competences_appliquees_tache || body.competences_requises || [];
    
    const classements = await rankingAI.rankEngineersForTask(
      descriptionComplete,
      ingenieursData,
      competencesRequises
    );

    const endTime = Date.now();
    const tempsTraitement = (endTime - startTime) / 1000;

    // Trier par score décroissant et assigner les rangs
    const classementsTries = classements
      .sort((a, b) => b.score_compatibilite - a.score_compatibilite)
      .map((classement, index) => {
        // Convertir l'ID de l'IA en nombre pour comparer avec la base
        const ingenieurIdNumber = parseInt(classement.ingenieur_id);
        const ingenieurData = ingenieursData.find(ing => ing.ingenieur_id === ingenieurIdNumber);
        
        console.log(`ID IA: '${classement.ingenieur_id}' -> Converti: ${ingenieurIdNumber} -> Ingénieur: ${ingenieurData ? `${ingenieurData.prenom} ${ingenieurData.nom}` : 'NON TROUVÉ'}`);
        
        return {
          ...classement,
          rang: index + 1,
          tache_id: body.tache_id || null,
          ingenieur_id: ingenieurData ? ingenieurData.ingenieur_id : classement.ingenieur_id,
          ingenieur: ingenieurData ? {
            ingenieur_id: ingenieurData.ingenieur_id,
            nom: ingenieurData.nom,
            prenom: ingenieurData.prenom,
            email: ingenieurData.email,
            equipe_id: ingenieurData.equipe_id
          } : {
            ingenieur_id: classement.ingenieur_id,
            nom: 'Ingénieur',
            prenom: 'Inconnu', 
            email: 'email@inconnu.com',
            equipe_id: null
          }
        };
      });

    // Debug pour vérifier
    console.log('IDs des ingénieurs en base:', ingenieursData.map(ing => ing.ingenieur_id));
    console.log('IDs retournés par l\'IA:', classements.map(c => c.ingenieur_id));
    console.log('Correspondances trouvées:', classementsTries.map(c => ({
      id: c.ingenieur_id,
      nom: c.ingenieur ? `${c.ingenieur.prenom} ${c.ingenieur.nom}` : 'NON TROUVÉ',
      score: c.score_compatibilite
    })));

    // Limiter les résultats si demandé
    const limite = body.limite_resultats || classementsTries.length;
    const classementsFinaux = classementsTries.slice(0, limite);

    // Sauvegarder les résultats en base si une tâche spécifique
    if (body.tache_id) {
      for (const classement of classementsFinaux) {
        try {
          await saveClassementAI({
            tache_id: classement.tache_id,
            ingenieur_id: classement.ingenieur_id,
            score_compatibilite: classement.score_compatibilite,
            rang: classement.rang,
            justification_ai: classement.justification_ai,
            competences_manquantes: classement.competences_manquantes,
            competences_adequates: classement.competences_adequates,
            recommandations: classement.recommandations
          });
        } catch (saveError) {
          console.warn('Erreur sauvegarde classement:', saveError);
        }
      }
    }

    // Préparer la réponse
    const response: ClassementResponse = {
      classements: classementsFinaux,
      tache_analysee: tache || {
        tache_id: 'temp',
        nom_tache: body.projet_nom || 'Tâche temporaire',
        description_tache: descriptionComplete,
        statut_tache: 'en_attente',
        priorite: 3,
        created_at: new Date().toISOString()
      },
      nombre_ingenieurs_evalues: ingenieursData.length,
      temps_traitement: tempsTraitement
    };

    console.log(`Classement terminé en ${tempsTraitement}s pour ${ingenieursData.length} ingénieurs réels`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors du classement:', error);
    return NextResponse.json(
      { error: `Erreur interne du serveur lors du classement: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer les classements existants
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