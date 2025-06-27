import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import type { 
  Ingenieur, 
  Tache, 
  ClassementAI, 
  ClassementRequest,
  IngenieurCompetence,
  TacheCompetenceRequise 
} from "@/lib/types/engineer-ranking";

export class EngineerRankingAI {
  private model;

  constructor() {
    this.model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2");
  }

  /**
   * Classe les ingénieurs selon leur compatibilité avec une tâche ET leur disponibilité
   */
  async rankEngineersForTask(
    tacheDescription: string,
    ingenieurs: any[],
    competencesRequises?: any[]
  ): Promise<any[]> {
    try {
      console.log("Début du classement AI avec disponibilité pour", ingenieurs.length, "ingénieurs");

      const prompt = this.buildEnhancedRankingPromptWithAvailability(tacheDescription, ingenieurs, competencesRequises);
      
      const { text } = await generateText({
        model: this.model,
        prompt,
      });

      const rankings = this.parseRankingResponse(text, ingenieurs);
      
      console.log("Classement AI avec disponibilité terminé avec", rankings.length, "résultats");
      return rankings;

    } catch (error) {
      console.error("Erreur lors du classement AI:", error);
      throw new Error("Échec du classement par intelligence artificielle");
    }
  }

  /**
   * Construit le prompt pour l'AI avec informations de disponibilité
   */
  private buildEnhancedRankingPromptWithAvailability(
    tacheDescription: string,
    ingenieurs: any[],
    competencesRequises?: any[]
  ): string {
    return `
Tu es un expert en gestion de ressources humaines et en évaluation de compétences techniques.
Ton rôle est de classer des ingénieurs selon leur adéquation avec une tâche spécifique EN TENANT COMPTE DE LEUR DISPONIBILITÉ.

TÂCHE À ANALYSER:
${tacheDescription}

${competencesRequises && competencesRequises.length > 0 ? `
COMPÉTENCES REQUISES:
${competencesRequises.map(cr => 
  `- ${cr.competences?.nom_competence || 'Compétence ID: ' + cr.competence_id}: Niveau requis ${cr.niveau_requis || 'Non spécifié'}`
).join('\n')}
` : ''}

INGÉNIEURS À ÉVALUER (avec informations de disponibilité):
${ingenieurs.map((ing, index) => `
${index + 1}. ${ing.prenom} ${ing.nom} (ID: ${ing.ingenieur_id})
   Email: ${ing.email}
   
   🚦 DISPONIBILITÉ:
   - Statut: ${ing.disponibilite?.statut_disponibilite || 'Non calculé'}
   - Disponibilité effective: ${ing.disponibilite?.disponibilite_effective || 100}%
   - Allocation actuelle: ${ing.disponibilite?.allocation_totale || 0}%
   ${ing.disponibilite?.projets_prioritaires?.length > 0 ? `
   - ⚠️  PROJETS PRIORITAIRES EN COURS:
   ${ing.disponibilite.projets_prioritaires.map((p: any) => `     • ${p.nom_projet} (${p.priorite}, ${p.allocation_pourcentage}%)`).join('\n')}` : ''}
   ${ing.disponibilite?.absences_actuelles?.length > 0 ? `
   - 🚫 ABSENCES ACTUELLES:
   ${ing.disponibilite.absences_actuelles.map((a: any) => `     • ${a.type_absence}: ${a.date_debut} → ${a.date_fin}`).join('\n')}` : ''}
   
   COMPÉTENCES TECHNIQUES:
   ${ing.ingenieur_competences && ing.ingenieur_competences.length > 0 ? 
     ing.ingenieur_competences.map((comp: any) => 
       `   - ${comp.competences?.nom_competence || 'Compétence inconnue'}: Niveau ${comp.niveau}/5`
     ).join('\n') 
     : '   Aucune compétence technique renseignée'}
   
   PROJETS RÉALISÉS:
   ${ing.projets_affectes && ing.projets_affectes.length > 0 ? 
     ing.projets_affectes.map((projet: any) => 
       `   - ${projet.projets?.nom_projet || 'Projet sans nom'}: ${projet.role_dans_projet || 'Rôle non spécifié'}`
     ).join('\n')
     : '   Aucun projet renseigné'}
   
   TÂCHES RÉALISÉES:
   ${ing.taches_assignees && ing.taches_assignees.length > 0 ? 
     ing.taches_assignees.map((tache: any) => 
       `   - ${tache.taches?.nom_tache || 'Tâche sans nom'}: ${tache.taches?.statut_tache || 'Statut inconnu'}`
     ).join('\n')
     : '   Aucune tâche renseignée'}
`).join('\n')}

INSTRUCTIONS DE CLASSEMENT:
1. Analyse chaque ingénieur par rapport aux exigences de la tâche
2. Calcule un score de compatibilité de 0 à 100 pour chaque ingénieur en tenant compte de:

   FACTEURS PRINCIPAUX (70% du score):
   - Niveau de compétences techniques requises (30%)
   - Expérience sur des projets similaires (25%)
   - Tâches similaires déjà réalisées (15%)

   FACTEURS DE DISPONIBILITÉ (30% du score):
   - Disponibilité effective (20%): Favorise fortement les ingénieurs disponibles
   - Impact des projets prioritaires (10%): Pénalise les ingénieurs sur des projets Critiques/Hautes priorités

3. RÈGLES DE DISPONIBILITÉ:
   - Ingénieur "Indisponible" → Score maximum 40/100 (peut être mentionné mais pas recommandé)
   - Ingénieur "Très occupé" → Score maximum 60/100 
   - Ingénieur "Partiellement occupé" → Score maximum 85/100
   - Ingénieur "Disponible" → Aucune limite

4. BONUS/MALUS SPÉCIAUX:
   - +10 points si disponibilité > 80%
   - -15 points si sur projet prioritaire Critique
   - -10 points si sur projet prioritaire Haute
   - -25 points si en absence actuelle

5. Identifie les compétences manquantes et les points forts
6. Fournis des recommandations spécifiques incluant l'aspect disponibilité

Format de réponse OBLIGATOIRE (JSON valide uniquement):
{
  "rankings": [
    {
      "ingenieur_id": "uuid-de-l-ingenieur",
      "score_compatibilite": 85.5,
      "rang": 1,
      "justification_ai": "Explication détaillée incluant compétences ET disponibilité",
      "disponibilite_impact": "Explication de l'impact de la disponibilité sur le score",
      "competences_manquantes": [
        {
          "nom_competence": "nom",
          "niveau_requis": 4
        }
      ],
      "competences_adequates": [
        {
          "nom_competence": "nom",
          "niveau_actuel": 4
        }
      ],
      "recommandations": "Recommandations incluant gestion de la charge de travail et timeline"
    }
  ]
}

IMPORTANT: 
- Privilégie TOUJOURS les ingénieurs les plus disponibles à compétences égales
- Mentionne clairement les conflits de priorités si un ingénieur qualifié est sur un projet critique
- Suggère des alternatives (formation, support d'équipe) pour les moins disponibles
- Retourne UNIQUEMENT le JSON sans formatage markdown ni explications supplémentaires.
`;
  }

  /**
   * Parse la réponse de l'AI et crée les objets ClassementAI
   */
  private parseRankingResponse(response: string, ingenieurs: any[]): any[] {
    try {
      // Nettoie la réponse pour extraire le JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Aucun JSON valide trouvé dans la réponse AI");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      if (!parsedResponse.rankings || !Array.isArray(parsedResponse.rankings)) {
        throw new Error("Format de réponse AI invalide");
      }

      return parsedResponse.rankings.map((ranking: any) => ({
        id: crypto.randomUUID(),
        tache_id: '', // Sera rempli lors de la sauvegarde
        ingenieur_id: ranking.ingenieur_id,
        score_compatibilite: ranking.score_compatibilite,
        rang: ranking.rang,
        justification_ai: ranking.justification_ai,
        disponibilite_impact: ranking.disponibilite_impact,
        competences_manquantes: (ranking.competences_manquantes || []).map((comp: any) => ({
          nom_competence: comp.nom_competence || comp.competence || 'Compétence inconnue',
          niveau_requis: comp.niveau_requis || comp.niveau || 0
        })),
        competences_adequates: (ranking.competences_adequates || []).map((comp: any) => ({
          nom_competence: comp.nom_competence || 'Compétence inconnue',
          niveau_actuel: comp.niveau_actuel || comp.niveau || 0,
          niveau: comp.niveau_actuel || comp.niveau || 0,
          competence: {
            nom_competence: comp.nom_competence || 'Compétence inconnue'
          }
        })),
        recommandations: ranking.recommandations,
        created_at: new Date().toISOString()
      }));

    } catch (error) {
      console.error("Erreur lors du parsing de la réponse AI:", error);
      throw new Error("Impossible de parser la réponse de l'intelligence artificielle");
    }
  }

  /**
   * Génère des recommandations d'amélioration pour un ingénieur
   */
  async generateImprovementRecommendations(
    ingenieur: Ingenieur,
    competencesManquantes: any[]
  ): Promise<string> {
    const prompt = `
Génère des recommandations spécifiques d'amélioration pour cet ingénieur:

INGÉNIEUR: ${ingenieur.prenom} ${ingenieur.nom}
COMPÉTENCES ACTUELLES:
${ingenieur.competences?.map(c => `- ${c.competence?.nom_competence}: ${c.niveau}/5`).join('\n')}

COMPÉTENCES À DÉVELOPPER:
${competencesManquantes.map(c => `- ${c.nom_competence}: niveau requis ${c.niveau_requis}/5`).join('\n')}

Fournis des recommandations concrètes incluant:
1. Formations recommandées
2. Projets ou expériences à acquérir
3. Certifications utiles
4. Timeline suggérée

Réponse en français, format texte simple.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }
} 