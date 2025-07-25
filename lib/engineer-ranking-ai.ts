import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { z } from "zod";
import type { 
  Ingenieur, 
  Tache, 
  ClassementAI, 
  ClassementRequest,
  IngenieurCompetence,
  TacheCompetenceRequise 
} from "@/lib/types/engineer-ranking";

// Définir les schemas Zod pour la validation
const TacheSchema = z.object({
  nom: z.string(),
  description: z.string(),
  type: z.string(),
  complexite: z.number().min(1).max(5),
  peut_commencer_immediatement: z.boolean(),
  dependances: z.array(z.string()),
  competences_cles: z.array(z.string()),
  estimation_jours: z.number(),
  assignable_en_parallele: z.boolean().default(true)
});

const WorkstreamSchema = z.object({
  nom_workstream: z.string(),
  peut_demarrer_jour_1: z.boolean(),
  equipe_recommandee: z.number(),
  description_workstream: z.string(),
  taches_simultanees: z.array(TacheSchema)
});

const ProjectDecompositionSchema = z.object({
  workstreams_paralleles: z.array(WorkstreamSchema),
  synchronisation_points: z.array(z.object({
    jour: z.number(),
    description: z.string()
  })).optional()
});

export class EngineerRankingAI {
  private model;

  constructor() {
    this.model = process.env.OPENAI_API_KEY ? openai("gpt-4o") : xai("grok-2");
  }

  /**
   * Ranks engineers according to their compatibility with a task AND their availability
   */
  async rankEngineersForTask(
    taskDescription: string,
    engineers: any[],
    requiredSkills?: any[]
  ): Promise<any[]> {
    try {
      console.log("Starting AI ranking with availability for", engineers.length, "engineers");

      const prompt = this.buildEnhancedRankingPromptWithAvailability(taskDescription, engineers, requiredSkills);
      
      const { text } = await generateText({
        model: this.model,
        prompt,
      });

      const rankings = this.parseRankingResponse(text, engineers);
      
      console.log("AI ranking with availability completed with", rankings.length, "results");
      return rankings;

    } catch (error) {
      console.error("Error during AI ranking:", error);
      throw new Error("AI ranking failed");
    }
  }

  /**
   * Builds the prompt for AI with availability information
   */
  private buildEnhancedRankingPromptWithAvailability(
    taskDescription: string,
    engineers: any[],
    requiredSkills?: any[]
  ): string {
    return `
You are an expert in human resources management and technical skills evaluation.
Your role is to rank engineers according to their suitability for a specific task TAKING INTO ACCOUNT THEIR AVAILABILITY.

TASK TO ANALYZE:
${taskDescription}

${requiredSkills && requiredSkills.length > 0 ? `
REQUIRED SKILLS:
${requiredSkills.map(cr => 
  `- ${cr.competences?.nom_competence || 'Skill ID: ' + cr.competence_id}: Required level ${cr.niveau_requis || 'Not specified'}`
).join('\n')}
` : ''}

ENGINEERS TO EVALUATE (with availability information):
${engineers.map((eng, index) => `
${index + 1}. ${eng.prenom} ${eng.nom} (ID: ${eng.ingenieur_id})
   Email: ${eng.email}
   
   🚦 AVAILABILITY:
   - Status: ${eng.disponibilite?.statut_disponibilite || 'Not calculated'}
   - Effective availability: ${eng.disponibilite?.disponibilite_effective || 100}%
   - Current allocation: ${eng.disponibilite?.allocation_totale || 0}%
   ${eng.disponibilite?.projets_prioritaires?.length > 0 ? `
   - ⚠️  PRIORITY PROJECTS IN PROGRESS:
   ${eng.disponibilite.projets_prioritaires.map((p: any) => `     • ${p.nom_projet} (${p.priorite}, ${p.allocation_pourcentage}%)`).join('\n')}` : ''}
   ${eng.disponibilite?.absences_actuelles?.length > 0 ? `
   - 🚫 CURRENT ABSENCES:
   ${eng.disponibilite.absences_actuelles.map((a: any) => `     • ${a.type_absence}: ${a.date_debut} → ${a.date_fin}`).join('\n')}` : ''}
   
   TECHNICAL SKILLS:
   ${eng.ingenieur_competences && eng.ingenieur_competences.length > 0 ? 
     eng.ingenieur_competences.map((comp: any) => 
       `   - ${comp.competences?.nom_competence || 'Unknown skill'}: Level ${comp.niveau}/5`
     ).join('\n') 
     : '   No technical skills recorded'}
   
   COMPLETED PROJECTS:
   ${eng.projets_affectes && eng.projets_affectes.length > 0 ? 
     eng.projets_affectes.map((projet: any) => 
       `   - ${projet.projets?.nom_projet || 'Unnamed project'}: ${projet.role_dans_projet || 'Role not specified'}`
     ).join('\n')
     : '   No projects recorded'}
   
   COMPLETED TASKS:
   ${eng.taches_assignees && eng.taches_assignees.length > 0 ? 
     eng.taches_assignees.map((tache: any) => 
       `   - ${tache.taches?.nom_tache || 'Unnamed task'}: ${tache.taches?.statut_tache || 'Unknown status'}`
     ).join('\n')
     : '   No tasks recorded'}
`).join('\n')}

RANKING INSTRUCTIONS:
1. Analyze each engineer against the task requirements
2. Calculate a compatibility score from 0 to 100 for each engineer considering:

   MAIN FACTORS (70% of score):
   - Required technical skills level (30%)
   - Experience on similar projects (25%)
   - Similar tasks already completed (15%)

   AVAILABILITY FACTORS (30% of score):
   - Effective availability (20%): Strongly favors available engineers
   - Impact of priority projects (10%): Penalizes engineers on Critical/High priority projects

3. AVAILABILITY RULES:
   - "Unavailable" engineer → Maximum score 40/100 (may be mentioned but not recommended)
   - "Very busy" engineer → Maximum score 60/100 
   - "Partially busy" engineer → Maximum score 85/100
   - "Available" engineer → No limit

4. SPECIAL BONUSES/PENALTIES:
   - +10 points if availability > 80%
   - -15 points if on Critical priority project
   - -10 points if on High priority project
   - -25 points if currently absent

5. Identify missing skills and strengths
6. Provide specific recommendations including availability aspect

MANDATORY response format (JSON only):
{
  "rankings": [
    {
      "ingenieur_id": ${engineers[0]?.ingenieur_id || 33},
      "score_compatibilite": 85.5,
      "rang": 1,
      "justification_ai": "Detailed explanation including skills AND availability",
      "disponibilite_impact": "Explanation of availability impact on score",
      "competences_manquantes": [
        {
          "nom_competence": "name",
          "niveau_requis": 4
        }
      ],
      "competences_adequates": [
        {
          "nom_competence": "name",
          "niveau_actuel": 4
        }
      ],
      "recommandations": "Recommendations including workload management and timeline"
    }
  ]
}

CRITICAL: 
- ALWAYS use the EXACT engineer IDs provided above (e.g., ${engineers.map(e => e.ingenieur_id).join(', ')})
- DO NOT make up or generate new IDs
- Each ranking must reference one of these specific engineer IDs: ${engineers.map(e => `ID ${e.ingenieur_id} = ${e.prenom} ${e.nom}`).join(', ')}
- ALWAYS prioritize most available engineers with equal skills
- Clearly mention priority conflicts if a qualified engineer is on a critical project
- Suggest alternatives (training, team support) for less available ones
- Return ONLY the JSON without markdown formatting or additional explanations.
`;
  }

  /**
   * Parse la réponse de l'AI et crée les objets ClassementAI
   */
  private parseRankingResponse(response: string, engineers: any[]): any[] {
    try {
      console.log('=== AI RANKING RESPONSE DEBUG ===');
      console.log('Raw AI response:', response.substring(0, 500) + '...');
      
      // Nettoie la réponse pour extraire le JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Aucun JSON valide trouvé dans la réponse AI");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      console.log('Parsed AI response:', JSON.stringify(parsedResponse, null, 2));
      console.log('AI returned rankings count:', parsedResponse.rankings?.length || 0);
      
      if (parsedResponse.rankings && Array.isArray(parsedResponse.rankings)) {
        console.log('AI returned engineer IDs:', parsedResponse.rankings.map((r: any) => r.ingenieur_id));
        console.log('Expected engineer IDs:', engineers.map(e => e.ingenieur_id));
      }
      
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
    engineer: Ingenieur,
    missingSkills: any[]
  ): Promise<string> {
    const prompt = `
Generate specific recommendations to help this engineer improve their skills for better task compatibility:

ENGINEER: ${engineer.prenom} ${engineer.nom}
EMAIL: ${engineer.email}

MISSING SKILLS IDENTIFIED:
${missingSkills.map(skill => 
  `- ${skill.nom_competence}: Current level unknown, Required level ${skill.niveau_requis}/5`
).join('\n')}

Provide:
1. 🎯 PRIORITY TRAINING (which skills to focus on first)
2. 📚 SPECIFIC RESOURCES (courses, certifications, documentation)
3. 🏆 PRACTICE PROJECTS (hands-on exercises)
4. ⏱️ ESTIMATED TIMELINE (realistic timeframe for each skill)
5. 💡 LEARNING PATH (step-by-step progression)

Response in English, practical and actionable format.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }

  /**
   * NEW VERSION: Uses Structured Outputs to force parallelization
   */
  async decomposeProjectIntoParallelWorkstreams(projectDescription: string): Promise<any> {
    try {
      console.log("Decomposing project into parallel workstreams...");

      const exampleOutput = {
  "workstreams_paralleles": [
    {
      "nom_workstream": "Frontend Development Team",
      "peut_demarrer_jour_1": true,
      "equipe_recommandee": 2,
      "description_workstream": "Complete user interface with React",
      "taches_simultanees": [
        {
          "nom": "React Core Interface",
          "description": "Develop main UI components with React, TypeScript, state management Redux, design system, responsive design...",
          "type": "frontend",
          "complexite": 4,
          "peut_commencer_immediatement": true,
          "dependances": [],
          "competences_cles": [
            "React",
            "TypeScript",
            "CSS/SCSS",
            "Redux"
          ],
          "estimation_jours": 12,
          "assignable_en_parallele": true
        },
        {
          "nom": "State Management & API Integration",
          "description": "Implement Redux/Zustand, REST API integration, error handling, loading states...",
          "type": "frontend",
          "complexite": 3,
          "peut_commencer_immediatement": true,
          "dependances": [],
          "competences_cles": [
            "Redux",
            "API Integration",
            "JavaScript"
          ],
          "estimation_jours": 8,
          "assignable_en_parallele": true
        }
      ]
    },
    {
      "nom_workstream": "Backend API Team",
      "peut_demarrer_jour_1": true,
      "equipe_recommandee": 2,
      "description_workstream": "Complete REST API and database",
      "taches_simultanees": [
        {
          "nom": "API Core & Authentication",
          "description": "Develop REST API with Node.js/Express, JWT authentication, security middleware, data validation...",
          "type": "backend",
          "complexite": 4,
          "peut_commencer_immediatement": true,
          "dependances": [],
          "competences_cles": [
            "Node.js",
            "Express",
            "JWT",
            "REST API"
          ],
          "estimation_jours": 15,
          "assignable_en_parallele": true
        }
      ]
    }
  ],
  "synchronisation_points": [
    {
      "jour": 7,
      "description": "API contract synchronization between Frontend and Backend"
    },
    {
      "jour": 14,
      "description": "Component integration and integration testing"
    }
        ]
      };

      const getProjectDecompositionPrompt = (projectDescription: string) => `
You are an expert in agile project management and software engineering with 15 years of experience.
Your role is to decompose complex projects into EXACTLY 3-5 parallel workstreams that can all start simultaneously.

PROJECT DESCRIPTION:
${projectDescription}

## STRICT DECOMPOSITION RULES

1. WORKSTREAM SELECTION (CHOOSE EXACTLY 3-5 FROM THESE OPTIONS):
   - Frontend Development (React/Angular/Vue)
   - Backend API Development (Node.js/Java/Python)
   - Mobile Development (React Native/Flutter)
   - DevOps/Cloud Infrastructure (AWS/Azure/GCP)
   - Database/Data Engineering (SQL/NoSQL/ETL)
   - Authentication/Security Team
   - UI/UX Design System
   - Payment/Order Processing
   - Admin/Management Interface
   - Analytics/Reporting Module

2. TECHNOLOGIES (USE THESE EXACT TERMS):
   - Frontend: React, Angular, Vue, TypeScript, Redux, CSS/SCSS
   - Backend: Node.js, Express, Spring Boot, Django, Flask, .NET Core
   - Mobile: React Native, Flutter, Swift, Kotlin
   - DevOps: AWS, Azure, Docker, Kubernetes, CI/CD
   - Database: PostgreSQL, MongoDB, Firebase, MySQL

3. TEAM SIZING (FIXED OPTIONS):
   - Solo developer: 1
   - Small team: 2
   - Medium team: 3
   - Only use 1-2 for each workstream

4. TASK COMPLEXITY SCALE (1-5 ONLY):
   1 = Trivial (1-2 days)
   2 = Simple (3-5 days)
   3 = Moderate (1 week)
   4 = Complex (2 weeks)
   5 = Very Complex (3+ weeks)

## MANDATORY STRUCTURE

{
  "workstreams_paralleles": [
    {
      "nom_workstream": "[EXACTLY ONE OF THE WORKSTREAM SELECTION OPTIONS]",
      "peut_demarrer_jour_1": true,
      "equipe_recommandee": [1 OR 2],
      "description_workstream": "[CONCISE DESCRIPTION USING TECHNOLOGIES FROM APPROVED LIST]",
      "taches_simultanees": [
        {
          "nom": "[SPECIFIC TASK NAME]",
          "description": "[DETAILED DESCRIPTION USING APPROVED TECHNOLOGIES]",
          "type": "[frontend|backend|mobile|devops|database|other]",
          "complexite": [1-5],
          "peut_commencer_immediatement": true,
          "dependances": [],
          "competences_cles": ["ONLY FROM APPROVED TECHNOLOGIES LIST"],
          "estimation_jours": [WHOLE NUMBER BETWEEN 1-30],
          "assignable_en_parallele": true
        }
        // 1-3 tasks per workstream
      ]
    }
    // EXACTLY 3-5 workstreams
  ],
  "synchronisation_points": [
    {
      "jour": [7, 14, 21, OR 28],
      "description": "[SPECIFIC INTEGRATION POINT]"
    }
    // 1-3 sync points
  ]
}

## ABSOLUTE CONSTRAINTS

1. ALL workstreams MUST:
   - Start on day 1 ("peut_demarrer_jour_1": true)
   - Have 1-3 tasks
   - Use only approved technologies
   - Have empty dependencies array

2. NO variations allowed in:
   - Field names (use exact JSON keys shown)
   - Boolean values (all true/false as specified)
   - Array structures (never null, always empty array if no items)

3. OUTPUT CONTROL:
   - Return ONLY the JSON
   - No markdown formatting
   - No explanatory text
   - No comments in JSON
   - No trailing commas

EXAMPLE OUTPUT FOR REFERENCE:
${JSON.stringify(exampleOutput, null, 2)}

NOW PROCESS THIS PROJECT DESCRIPTION AND RETURN THE EXACT REQUIRED FORMAT:
`;

      // Use the new prompt
      const prompt = getProjectDecompositionPrompt(projectDescription);

      const { text } = await generateText({
        model: this.model,
        prompt,
      });

      // Parse the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      if (!parsedResponse.workstreams_paralleles || !Array.isArray(parsedResponse.workstreams_paralleles)) {
        throw new Error("Invalid AI response format");
      }

      console.log(`Project decomposed into ${parsedResponse.workstreams_paralleles.length} parallel workstreams`);
      return parsedResponse;

    } catch (error) {
      console.error("Error during workstream decomposition:", error);
      throw new Error("Parallel workstream decomposition failed");
    }
  }

  /**
   * Ranks engineers for a specific job specification
   */
  async rankEngineersForJobSpecification(
    jobSpecification: string,
    engineers: any[]
  ): Promise<any> {
    try {
      console.log("Job specification ranking - Start");

      // Analyze the job specification and extract requirements
      const jobAnalysis = await this.analyzeJobSpecification(jobSpecification);

      // Rank engineers for the job
      console.log(`Ranking engineers for job: ${jobAnalysis.position_title}`);
      
      const rankings = await this.rankEngineersForTask(
        jobSpecification,
        engineers,
        [] // No predefined skills, AI will extract them from job specification
      );

      console.log(`Job specification ranking finished for ${rankings.length} engineers`);

      return {
        job_specification: jobSpecification,
        job_analysis: jobAnalysis,
        nombre_ingenieurs_evalues: engineers.length,
        classements: rankings.slice(0, 10), // Top 10 for job specification
        // Summary will be generated later with enriched data
        resume_job_matching: null
      };

    } catch (error) {
      console.error("Error during job specification ranking:", error);
      throw new Error("Job specification ranking failed");
    }
  }

  /**
   * Analyzes a job specification to extract key requirements
   */
  private async analyzeJobSpecification(jobSpecification: string): Promise<any> {
    const prompt = `
You are an expert in technical recruitment and job analysis.
Analyze the following job specification and extract key requirements in a structured format.

JOB SPECIFICATION:
${jobSpecification}

Extract and analyze:
1. Position title and seniority level
2. Required technical skills with importance levels
3. Location requirements and work model
4. Duration and availability requirements
5. Industry/domain expertise needed
6. Must-have vs nice-to-have requirements

MANDATORY response format (JSON only):
{
  "position_title": "Senior Java Developer",
  "seniority_level": "senior",
  "engagement_duration": "4-6 months",
  "start_urgency": "as soon as possible",
  "location_requirements": {
    "city": "Warsaw",
    "country": "Poland",
    "work_model": "hybrid",
    "office_days": 3,
    "remote_days": 2,
    "relocation_required": false
  },
  "technical_requirements": {
    "must_have": [
      {
        "skill": "Java",
        "importance": 5,
        "experience_level": "strong hands-on"
      },
      {
        "skill": "Spring Boot",
        "importance": 5,
        "experience_level": "strong hands-on"
      },
      {
        "skill": "Microservices Architecture",
        "importance": 5,
        "experience_level": "experienced"
      }
    ],
    "preferred": [
      {
        "skill": "AWS EC2",
        "importance": 4,
        "experience_level": "practical experience"
      }
    ]
  },
  "domain_expertise": "Real-Time Fraud Detection",
  "key_technologies": ["Java", "Spring Boot", "Microservices", "AWS", "Jenkins"],
  "availability_requirements": {
    "start_date": "immediate",
    "commitment_level": "full-time",
    "duration_months": 5
  }
}

Return ONLY the JSON without markdown formatting or additional explanations.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in job analysis response");
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Generates a job matching summary with focus on fit analysis
   */
  public async generateJobMatchingSummary(jobAnalysis: any, rankings: any[]): Promise<string> {
    const prompt = `
Analyze these engineer rankings for a specific job position and generate an executive hiring summary:

JOB POSITION: ${jobAnalysis.position_title}
LOCATION: ${jobAnalysis.location_requirements?.city}, ${jobAnalysis.location_requirements?.country}
WORK MODEL: ${jobAnalysis.location_requirements?.work_model}
DURATION: ${jobAnalysis.engagement_duration}
START: ${jobAnalysis.start_urgency}

REQUIRED SKILLS:
${jobAnalysis.technical_requirements?.must_have?.map((req: any) => 
  `- ${req.skill} (${req.experience_level}, importance: ${req.importance}/5)`
).join('\n') || 'Not specified'}

TOP 5 CANDIDATE ANALYSIS:
${rankings.slice(0, 5).map((ranking: any, index: number) => 
  `${index + 1}. ${ranking.ingenieur?.prenom || 'Engineer'} ${ranking.ingenieur?.nom || 'Unknown'} (${ranking.score_compatibilite.toFixed(1)}%)
   Availability: ${ranking.ingenieur?.disponibilite?.disponibilite_effective || 'N/A'}%
   Status: ${ranking.ingenieur?.disponibilite?.statut_disponibilite || 'Unknown'}
   Location: ${ranking.ingenieur?.adresse_residence || 'Not specified'}
   AI Justification: ${ranking.justification_ai}`
).join('\n\n')}

Generate an executive hiring summary including:
1. 🎯 BEST CANDIDATE RECOMMENDATION
   - Start with "Top candidature: [Full Name of Engineer]" format
   - Provide specific reasoning for the recommendation
   - Immediate availability and location fit
   - Skills match percentage and gaps

2. 👥 CANDIDATE POOL ANALYSIS
   - How many qualified candidates available
   - Availability timeline for top candidates
   - Location/relocation considerations

3. ⚠️ HIRING CHALLENGES & RISKS
   - Skills gaps in candidate pool
   - Availability conflicts with other projects
   - Location/work model constraints

4. 📅 RECOMMENDED HIRING STRATEGY
   - Priority order for interviews
   - Skills assessment focus areas
   - Timeline to secure candidate

5. 💡 OPTIMIZATION RECOMMENDATIONS
   - Adjustments to job requirements if needed
   - Alternative candidates to consider
   - Backup hiring strategies

Response in English, structured format with emojis and clear sections.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }

  /**
   * Ranks engineers for a complete project (decomposes into tasks then ranks for each task)
   */
  async rankEngineersForProject(
    projectDescription: string,
    engineers: any[]
  ): Promise<any> {
    try {
      console.log("Complete project ranking - Start");

      // 1. Decompose the project into parallel workstreams
      const workstreamsData = await this.decomposeProjectIntoParallelWorkstreams(projectDescription);

      // 2. Rank engineers for each task in the workstreams
      const rankingsPerTask = [];

      // Extract all tasks from all workstreams
      for (const workstream of workstreamsData.workstreams_paralleles || []) {
        for (const task of workstream.taches_simultanees || []) {
          console.log(`Ranking for task: ${task.nom} (Workstream: ${workstream.nom_workstream})`);
          
          const rankings = await this.rankEngineersForTask(
            task.description,
            engineers,
            [] // No predefined skills, AI will extract them from description
          );

          rankingsPerTask.push({
            tache: {
              ...task,
              workstream: workstream.nom_workstream,
              workstream_info: {
                peut_demarrer_jour_1: workstream.peut_demarrer_jour_1,
                equipe_recommandee: workstream.equipe_recommandee,
                description_workstream: workstream.description_workstream
              }
            },
            classements: rankings.slice(0, 5) // Top 5 for each task
          });
        }
      }

      console.log(`Complete ranking finished for ${rankingsPerTask.length} tasks`);

      return {
        projet_description: projectDescription,
        taches_identifiees: rankingsPerTask.length,
        workstreams_paralleles: workstreamsData.workstreams_paralleles,
        synchronisation_points: workstreamsData.synchronisation_points,
        classements_par_tache: rankingsPerTask,
        resume_global: await this.generateProjectSummary(rankingsPerTask)
      };

    } catch (error) {
      console.error("Error during complete ranking:", error);
      throw new Error("Complete project ranking failed");
    }
  }

  /**
   * Generates a global project ranking summary with focus on parallelization
   */
  private async generateProjectSummary(rankingsPerTask: any[]): Promise<string> {
    const prompt = `
Analyze these engineer rankings per SIMULTANEOUS task and generate an executive summary for a parallel development project:

${rankingsPerTask.map((item, index) => `
SIMULTANEOUS TASK ${index + 1}: ${item.tache.nom} (${item.tache.type || 'Type not specified'})
Description: ${item.tache.description}
Complexity: ${item.tache.complexite}/5
Estimate: ${item.tache.estimation_jours || 'Not estimated'} days
Can start immediately: ${item.tache.peut_commencer_immediatement ? 'YES' : 'NO'}
Dependencies: ${item.tache.dependances?.length > 0 ? item.tache.dependances.join(', ') : 'None'}

Top 3 recommended engineers:
${item.classements.slice(0, 3).map((c: any, i: number) => 
  `${i + 1}. ${c.ingenieur?.prenom || 'Engineer'} ${c.ingenieur?.nom || 'Unknown'} (${c.score_compatibilite.toFixed(1)}%) - Availability: ${c.ingenieur?.disponibilite?.disponibilite_effective || 'N/A'}%`
).join('\n')}
`).join('\n')}

Generate an executive summary including:
1. 🚀 SIMULTANEOUS START STRATEGY
   - Which tasks can start immediately in parallel
   - Priority order for engineer assignment

2. 👥 OPTIMAL TEAM DISTRIBUTION
   - Recommended assignment (who on what)
   - Most versatile engineers for flexibility
   - Avoid resource conflicts

3. ⚠️  RISKS AND BOTTLENECKS
   - Critical dependencies to monitor
   - Overbooked or unavailable engineers
   - Missing skills in the team

4. 📅 PARALLEL TIMELINE
   - Global project estimate with simultaneous development
   - Necessary synchronization points
   - Critical milestones

5. 💡 OPTIMIZATION RECOMMENDATIONS
   - Suggestions to maximize parallelization
   - Urgent training if needed
   - Staffing alternatives

Response in English, structured format with emojis and clear sections.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }

  /**
   * STRATEGY: Multiple specialized prompts to force parallelization
   */
  async rankEngineersForProjectEnhanced(
    projectDescription: string,
    engineers: any[]
  ): Promise<any> {
    try {
      // Step 1: Analyze parallelizable domains
      const domains = await this.identifyParallelDomains(projectDescription);
      
      // Step 2: Create workstreams for each domain
      const workstreams = await this.createWorkstreamsFromDomains(domains, projectDescription);
      
      // Step 3: Validate parallelization
      const validatedWorkstreams = await this.validateParallelization(workstreams);
      
      // Step 4: Rank engineers for each workstream
      const rankings = await this.rankEngineersForWorkstreams(validatedWorkstreams, engineers);
      
      return {
        projet_description: projectDescription,
        workstreams_paralleles: validatedWorkstreams,
        classements_par_workstream: rankings,
        resume_parallelisation: await this.generateParallelizationSummary(rankings)
      };

    } catch (error) {
      console.error("Error during enhanced ranking:", error);
      throw new Error("Enhanced parallelization ranking failed");
    }
  }

  /**
   * Specialized prompt: Identify parallelizable domains
   */
  private async identifyParallelDomains(projectDescription: string): Promise<string[]> {
    const prompt = `
ANALYSIS: What are the INDEPENDENT TECHNICAL DOMAINS in this project?

PROJECT: ${projectDescription}

RETURN only a JSON list of domains that can be developed IN PARALLEL:
["Frontend Web", "Backend API", "Mobile App", "DevOps Infrastructure", "Database Design"]

RULE: Each domain must be INDEPENDENT from others.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  }

  /**
   * Specialized prompt: Create workstreams per domain
   */
  private async createWorkstreamsFromDomains(domains: string[], projectDescription: string): Promise<any[]> {
    const workstreams = [];
    
    for (const domain of domains) {
      const prompt = `
CREATE a workstream for the domain: ${domain}

PROJECT CONTEXT: ${projectDescription}

CONSTRAINT: This workstream must be able to start IMMEDIATELY without depending on other workstreams.

RETURN this JSON:
{
  "nom_workstream": "${domain} Team",
  "peut_demarrer_jour_1": true,
  "taches_simultanees": [...]
}
`;

      const { text } = await generateText({
        model: this.model,
        prompt,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workstreams.push(JSON.parse(jsonMatch[0]));
      }
    }
    
    return workstreams;
  }

  /**
   * Specialized prompt: Validate parallelization
   */
  private async validateParallelization(workstreams: any[]): Promise<any[]> {
    const prompt = `
VALIDATE: Verify that each workstream is independent and can start on DAY 1 without depending on other workstreams.

WORKSTREAMS:
${workstreams.map((ws, index) => `
Workstream ${index + 1}: ${ws.nom_workstream}
Can start DAY 1: ${ws.peut_demarrer_jour_1 ? 'YES' : 'NO'}
Recommended team: ${ws.equipe_recommandee}
Description: ${ws.description_workstream}
Simultaneous tasks:
${ws.taches_simultanees.map((tache: any) => `- ${tache.nom} (${tache.type})`).join('\n')}
`).join('\n')}

PARALLELIZATION RULES:
1. ALL workstreams MUST have "peut_demarrer_jour_1": true
2. NO blocking dependencies between workstreams
3. Each workstream = distinct team working in parallel
4. 3-5 workstreams maximum to avoid over-fragmentation

RESULT:
${workstreams.map((ws, index) => `
Workstream ${index + 1}: ${ws.nom_workstream} - ${ws.peut_demarrer_jour_1 ? 'VALIDATED' : 'FAILED'}`).join('\n')}
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  }

  /**
   * Specialized prompt: Rank engineers for each workstream
   */
  private async rankEngineersForWorkstreams(workstreams: any[], engineers: any[]): Promise<any[]> {
    const rankings = [];
    
    for (const workstream of workstreams) {
      console.log(`Ranking for workstream: ${workstream.nom_workstream}`);
      
      const workstreamRankings = await this.rankEngineersForTask(
        workstream.description_workstream,
        engineers,
        workstream.taches_simultanees.map((tache: any) => ({
          nom_competence: tache.nom,
          niveau_requis: tache.complexite
        }))
      );

      rankings.push({
        workstream: workstream,
        classements: workstreamRankings.slice(0, 5) // Top 5 for each workstream
      });
    }
    
    return rankings;
  }

  /**
   * Specialized prompt: Generate parallelization summary
   */
  private async generateParallelizationSummary(rankings: any[]): Promise<string> {
    const prompt = `
ANALYSIS: Generate a project parallelization summary based on workstream rankings.

RANKINGS:
${rankings.map((item, index) => `
Workstream ${index + 1}: ${item.workstream.nom_workstream}
Rankings:
${item.classements.map((c: any, i: number) => 
  `${i + 1}. ${c.ingenieur?.prenom || 'Engineer'} ${c.ingenieur?.nom || 'Unknown'} (${c.score_compatibilite.toFixed(1)}%)`
).join('\n')}`).join('\n')}

RESULT:
Generate an executive summary including:
1. 🚀 SIMULTANEOUS START STRATEGY
   - Which workstreams can start immediately in parallel
   - Priority order for engineer assignment

2. 👥 OPTIMAL TEAM DISTRIBUTION
   - Recommended assignment (who on what)
   - Most versatile engineers for flexibility
   - Avoid resource conflicts

3. ⚠️  RISKS AND BOTTLENECKS
   - Critical dependencies to monitor
   - Overbooked or unavailable engineers
   - Missing skills in the team

4. 📅 PARALLEL TIMELINE
   - Global project estimate with simultaneous development
   - Necessary synchronization points
   - Critical milestones

5. 💡 OPTIMIZATION RECOMMENDATIONS
   - Suggestions to maximize parallelization
   - Urgent training if needed
   - Staffing alternatives

Response in English, structured format with emojis and clear sections.
`;

    const { text } = await generateText({
      model: this.model,
      prompt,
    });

    return text;
  }
} 