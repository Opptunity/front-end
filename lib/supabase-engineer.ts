import { createClient } from '@supabase/supabase-js'

// Configuration pour la deuxième base Supabase dédiée aux ingénieurs
const engineerSupabaseUrl = process.env.NEXT_PUBLIC_ENGINEER_SUPABASE_URL || ''
const engineerSupabaseAnonKey = process.env.NEXT_PUBLIC_ENGINEER_SUPABASE_ANON_KEY || ''
const engineerSupabaseServiceKey = process.env.ENGINEER_SUPABASE_SERVICE_ROLE_KEY || ''

if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
  console.error('Missing Engineer Supabase environment variables')
  console.error('URL:', engineerSupabaseUrl ? 'OK' : 'MISSING')
  console.error('Anon Key:', engineerSupabaseAnonKey ? 'OK' : 'MISSING')
  console.error('Service Key:', engineerSupabaseServiceKey ? 'OK' : 'MISSING (will fallback to anon key)')
}

// Client public pour les opérations courantes (lectures)
export const engineerSupabase = createClient(engineerSupabaseUrl, engineerSupabaseAnonKey)

// Client admin utilisant la clé service role si disponible, sinon anon key
export const engineerSupabaseAdmin = createClient(
  engineerSupabaseUrl, 
  engineerSupabaseServiceKey || engineerSupabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Types ajustés selon votre schéma réel
export type IngenieurDB = {
  ingenieur_id: string
  nom: string
  prenom: string
  email: string
  equipe_id?: string
  adresse_residence?: string
  // Données enrichies
  competences?: IngenieurCompetenceDB[]
  projets_affectes?: ProjetAffecte[]
  taches_assignees?: TacheAssignee[]
}

export type IngenieurCompetenceDB = {
  ingenieur_id: string
  competence_id: string
  niveau: number
  competences?: CompetenceDB
}

export type CompetenceDB = {
  competence_id: string
  nom_competence: string
  categorie?: string
}

export type ProjetAffecte = {
  projet_id: string
  role_dans_projet?: string
  impact_description?: string
  projets?: {
    nom_projet: string
    description_projet?: string
    statut?: string
  }
}

export type TacheAssignee = {
  tache_id: string
  date_realisation?: string
  taches?: {
    nom_tache: string
    description_tache?: string
    statut_tache?: string
  }
}

// Nouveaux types pour la gestion de la disponibilité
export type IngenieurDisponibilite = {
  ingenieur_id: string
  allocation_totale: number // Pourcentage total d'allocation sur tous les projets actifs
  projets_actifs: ProjetActif[]
  absences_actuelles: Absence[]
  disponibilite_effective: number // Pourcentage de disponibilité réelle (100 - allocation - absences)
  statut_disponibilite: 'Disponible' | 'Partiellement occupé' | 'Très occupé' | 'Indisponible'
  projets_prioritaires: ProjetActif[] // Projets de priorité Critique ou Haute
}

export type ProjetActif = {
  projet_id: string
  nom_projet: string
  priorite: string
  allocation_pourcentage: number
  date_debut?: string
  date_fin_prevue?: string
}

export type Absence = {
  absence_id: string
  type_absence: string
  date_debut: string
  date_fin: string
  description?: string
}

// Fonction pour récupérer les ingénieurs avec TOUTES leurs données
export async function getIngenieurWithCompetences() {
  if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
    throw new Error('Configuration Supabase Engineer manquante')
  }

  console.log('Récupération des ingénieurs avec projets, tâches et compétences...')
  
  try {
    // 1. Récupérer tous les ingénieurs
    const { data: ingenieursData, error: ingenieursError } = await engineerSupabase
      .from('ingenieurs')
      .select('*')

    if (ingenieursError) {
      throw new Error(`Erreur ingénieurs: ${ingenieursError.message}`)
    }

    if (!ingenieursData || ingenieursData.length === 0) {
      throw new Error('Aucun ingénieur trouvé dans la base de données')
    }

    console.log(`${ingenieursData.length} ingénieurs trouvés, récupération des détails...`)

    // 2. Pour chaque ingénieur, récupérer ses compétences, projets et tâches
    const ingenieursEnrichis = await Promise.all(
      ingenieursData.map(async (ingenieur) => {
        const [competences, projetsAffectes, tachesAssignees] = await Promise.all([
          // Récupérer les compétences
          getCompetencesIngenieur(ingenieur.ingenieur_id),
          // Récupérer les projets affectés
          getProjetsAffectes(ingenieur.ingenieur_id),
          // Récupérer les tâches assignées
          getTachesAssignees(ingenieur.ingenieur_id)
        ])

        return {
          ...ingenieur,
          ingenieur_competences: competences,
          projets_affectes: projetsAffectes,
          taches_assignees: tachesAssignees
        }
      })
    )

    console.log('Ingénieurs enrichis avec succès:', ingenieursEnrichis.map(ing => ({
      nom: `${ing.prenom} ${ing.nom}`,
      competences: ing.ingenieur_competences?.length || 0,
      projets: ing.projets_affectes?.length || 0,
      taches: ing.taches_assignees?.length || 0
    })))

    return ingenieursEnrichis

  } catch (error) {
    console.error('Erreur lors de la récupération des ingénieurs:', error)
    throw new Error(`Impossible de récupérer les ingénieurs: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

// Fonction pour récupérer les compétences d'un ingénieur
async function getCompetencesIngenieur(ingenieurId: string) {
  const { data, error } = await engineerSupabase
    .from('ingenieur_competences')
    .select(`
      *,
      competences (*)
    `)
    .eq('ingenieur_id', ingenieurId)

  if (error) {
    console.warn(`Erreur récupération compétences pour ${ingenieurId}:`, error.message)
    return []
  }

  return data || []
}

// Fonction pour récupérer les projets affectés à un ingénieur
async function getProjetsAffectes(ingenieurId: string) {
  const { data, error } = await engineerSupabase
    .from('affectation_projets')
    .select(`
      *,
      projets (*)
    `)
    .eq('ingenieur_id', ingenieurId)

  if (error) {
    console.warn(`Erreur récupération projets pour ${ingenieurId}:`, error.message)
    return []
  }

  return data || []
}

// Fonction pour récupérer les tâches assignées à un ingénieur
async function getTachesAssignees(ingenieurId: string) {
  const { data, error } = await engineerSupabase
    .from('assignation_taches')
    .select(`
      *,
      taches (*)
    `)
    .eq('affectation_id', ingenieurId) // Selon votre schéma

  if (error) {
    console.warn(`Erreur récupération tâches pour ${ingenieurId}:`, error.message)
    return []
  }

  return data || []
}

// Fonction pour obtenir les compétences requises d'une tâche
export async function getCompetencesTache(tacheId: string) {
  const { data, error } = await engineerSupabase
    .from('competences_appliquees_tache')
    .select(`
      *,
      competences (*)
    `)
    .eq('tache_id', tacheId)

  if (error) {
    console.warn(`Erreur récupération compétences tâche ${tacheId}:`, error.message)
    return []
  }

  return data || []
}

// Fonction pour récupérer les projets actifs d'un ingénieur avec priorité et allocation
async function getProjetsActifs(ingenieurId: string): Promise<ProjetActif[]> {
  const { data, error } = await engineerSupabase
    .from('affectation_projets')
    .select(`
      allocation_pourcentage,
      projets!inner (
        projet_id,
        nom_projet,
        priorite,
        date_debut,
        date_fin_prevue,
        statut
      )
    `)
    .eq('ingenieur_id', ingenieurId)
    .eq('projets.statut', 'En cours') // Seulement les projets en cours

  if (error) {
    console.warn(`Erreur récupération projets actifs pour ${ingenieurId}:`, error.message)
    return []
  }

  return (data || []).map(item => {
    const projet = Array.isArray(item.projets) ? item.projets[0] : item.projets
    return {
      projet_id: projet?.projet_id || '',
      nom_projet: projet?.nom_projet || '',
      priorite: projet?.priorite || '',
      allocation_pourcentage: item.allocation_pourcentage || 0,
      date_debut: projet?.date_debut || '',
      date_fin_prevue: projet?.date_fin_prevue || ''
    }
  })
}

// Fonction pour récupérer les absences actuelles d'un ingénieur
async function getAbsencesActuelles(ingenieurId: string): Promise<Absence[]> {
  const aujourdhui = new Date().toISOString().split('T')[0]
  
  const { data, error } = await engineerSupabase
    .from('absences')
    .select('*')
    .eq('ingenieur_id', ingenieurId)
    .lte('date_debut', aujourdhui)
    .gte('date_fin', aujourdhui)

  if (error) {
    console.warn(`Erreur récupération absences pour ${ingenieurId}:`, error.message)
    return []
  }

  return data || []
}

// Fonction pour calculer la disponibilité d'un ingénieur
async function calculerDisponibilite(ingenieurId: string): Promise<IngenieurDisponibilite> {
  const [projetsActifs, absencesActuelles] = await Promise.all([
    getProjetsActifs(ingenieurId),
    getAbsencesActuelles(ingenieurId)
  ])

  // Calculer l'allocation totale sur tous les projets actifs
  const allocationTotale = projetsActifs.reduce((total, projet) => {
    return total + projet.allocation_pourcentage
  }, 0)

  // Identifier les projets prioritaires (Critique ou Haute)
  const projetsPrioritaires = projetsActifs.filter(projet => 
    projet.priorite === 'Critique' || projet.priorite === 'Haute'
  )

  // Calculer la pénalité d'absence (on considère qu'une absence = 100% indisponible)
  const penaliteAbsence = absencesActuelles.length > 0 ? 100 : 0

  // Disponibilité effective
  const disponibiliteEffective = Math.max(0, 100 - allocationTotale - penaliteAbsence)

  // Déterminer le statut de disponibilité
  let statutDisponibilite: 'Disponible' | 'Partiellement occupé' | 'Très occupé' | 'Indisponible'
  
  if (penaliteAbsence > 0) {
    statutDisponibilite = 'Indisponible'
  } else if (disponibiliteEffective >= 70) {
    statutDisponibilite = 'Disponible'
  } else if (disponibiliteEffective >= 30) {
    statutDisponibilite = 'Partiellement occupé'
  } else if (disponibiliteEffective > 0) {
    statutDisponibilite = 'Très occupé'
  } else {
    statutDisponibilite = 'Indisponible'
  }

  return {
    ingenieur_id: ingenieurId,
    allocation_totale: allocationTotale,
    projets_actifs: projetsActifs,
    absences_actuelles: absencesActuelles,
    disponibilite_effective: disponibiliteEffective,
    statut_disponibilite: statutDisponibilite,
    projets_prioritaires: projetsPrioritaires
  }
}

// Fonction modifiée pour inclure la disponibilité
export async function getIngenieurWithCompetencesEtDisponibilite() {
  if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
    throw new Error('Configuration Supabase Engineer manquante')
  }

  console.log('Récupération des ingénieurs avec projets, tâches, compétences et disponibilité...')
  
  try {
    // 1. Récupérer tous les ingénieurs
    const { data: ingenieursData, error: ingenieursError } = await engineerSupabase
      .from('ingenieurs')
      .select('*')

    if (ingenieursError) {
      throw new Error(`Erreur ingénieurs: ${ingenieursError.message}`)
    }

    if (!ingenieursData || ingenieursData.length === 0) {
      throw new Error('Aucun ingénieur trouvé dans la base de données')
    }

    console.log(`${ingenieursData.length} ingénieurs trouvés, récupération des détails avec disponibilité...`)

    // 2. Pour chaque ingénieur, récupérer ses données complètes + disponibilité
    const ingenieursEnrichis = await Promise.all(
      ingenieursData.map(async (ingenieur) => {
        const [competences, projetsAffectes, tachesAssignees, disponibilite] = await Promise.all([
          getCompetencesIngenieur(ingenieur.ingenieur_id),
          getProjetsAffectes(ingenieur.ingenieur_id),
          getTachesAssignees(ingenieur.ingenieur_id),
          calculerDisponibilite(ingenieur.ingenieur_id)
        ])

        return {
          ...ingenieur,
          ingenieur_competences: competences,
          projets_affectes: projetsAffectes,
          taches_assignees: tachesAssignees,
          disponibilite: disponibilite
        }
      })
    )

    console.log('Ingénieurs enrichis avec disponibilité:', ingenieursEnrichis.map(ing => ({
      nom: `${ing.prenom} ${ing.nom}`,
      competences: ing.ingenieur_competences?.length || 0,
      projets: ing.projets_affectes?.length || 0,
      taches: ing.taches_assignees?.length || 0,
      disponibilite: ing.disponibilite?.disponibilite_effective || 100,
      statut: ing.disponibilite?.statut_disponibilite || 'Disponible'
    })))

    return ingenieursEnrichis

  } catch (error) {
    console.error('Erreur lors de la récupération des ingénieurs avec disponibilité:', error)
    throw new Error(`Impossible de récupérer les ingénieurs: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

// Reste des fonctions inchangées...
export async function saveClassementAI(classement: any) {
  if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
    console.warn('Configuration Supabase Engineer manquante, impossible de sauvegarder le classement')
    return { id: crypto.randomUUID(), ...classement, created_at: new Date().toISOString() }
  }

  try {
    const { data, error } = await engineerSupabaseAdmin
      .from('classements_ai')
      .insert({
        ...classement,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.warn('Erreur sauvegarde classement en DB:', error)
      return { id: crypto.randomUUID(), ...classement, created_at: new Date().toISOString() }
    }

    console.log('Classement sauvegardé avec succès')
    return data
  } catch (error) {
    console.warn('Erreur connexion pour sauvegarde:', error)
    return { id: crypto.randomUUID(), ...classement, created_at: new Date().toISOString() }
  }
}

export async function getTacheById(tacheId: string) {
  if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
    throw new Error('Configuration Supabase Engineer manquante')
  }

  const { data, error } = await engineerSupabase
    .from('taches')
    .select(`
      *,
      competences_appliquees_tache (
        *,
        competences (*)
      )
    `)
    .eq('tache_id', tacheId)
    .single()

  if (error) {
    console.error('Erreur récupération tâche depuis DB:', error)
    throw new Error(`Tâche non trouvée: ${error.message}`)
  }

  return data
}

export async function testConnection() {
  try {
    if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
      console.log('Variables d\'environnement Engineer Supabase manquantes')
      return false
    }

    const { error } = await engineerSupabase
      .from('ingenieurs')
      .select('ingenieur_id')
      .limit(1)

    if (error) {
      console.log('Test connexion Engineer Supabase - Erreur:', error.message)
      return false
    }

    console.log('Test connexion Engineer Supabase - Succès')
    return true
  } catch (error) {
    console.log('Test connexion Engineer Supabase - Échec:', error)
    return false
  }
}

export async function checkTablesExist() {
  try {
    const checks = await Promise.allSettled([
      engineerSupabase.from('ingenieurs').select('count').limit(1),
      engineerSupabase.from('competences').select('count').limit(1),
      engineerSupabase.from('ingenieur_competences').select('count').limit(1),
      engineerSupabase.from('affectation_projets').select('count').limit(1),
      engineerSupabase.from('assignation_taches').select('count').limit(1)
    ])

    const results = {
      ingenieurs: checks[0].status === 'fulfilled',
      competences: checks[1].status === 'fulfilled', 
      ingenieur_competences: checks[2].status === 'fulfilled',
      affectation_projets: checks[3].status === 'fulfilled',
      assignation_taches: checks[4].status === 'fulfilled'
    }

    console.log('État des tables:', results)
    return results
  } catch (error) {
    console.error('Erreur vérification tables:', error)
    return { 
      ingenieurs: false, 
      competences: false, 
      ingenieur_competences: false,
      affectation_projets: false,
      assignation_taches: false
    }
  }
}

// ================================
// ONBOARDING FUNCTIONS
// ================================

export async function createNewEngineer(onboardingData: any) {
  if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
    throw new Error('Configuration Supabase Engineer manquante')
  }

  try {
    const { personal_info, technical_background, current_skills } = onboardingData

    // 1. Create the engineer record (let database auto-generate the ID)
    const { data: engineerData, error: engineerError } = await engineerSupabaseAdmin
      .from('ingenieurs')
      .insert({
        nom: personal_info.full_name.split(' ').slice(1).join(' ') || personal_info.full_name,
        prenom: personal_info.full_name.split(' ')[0] || personal_info.full_name,
        email: personal_info.email,
        equipe_id: personal_info.department || null,
        adresse_residence: personal_info.adresse_residence || personal_info.residence_address || null // Handle both field names
      })
      .select()
      .single()

    if (engineerError) {
      console.error('Error creating engineer:', engineerError)
      throw new Error(`Failed to create engineer: ${engineerError.message}`)
    }

    console.log('Engineer created successfully:', engineerData)

    // Get the generated engineer ID
    const ingenieurId = engineerData.ingenieur_id

    // 2. Add engineer's skills
    if (current_skills && current_skills.length > 0) {
      await addEngineerSkills(ingenieurId, current_skills)
    }

    // 3. Store onboarding profile data (optional - you could create a separate table for this)
    await storeOnboardingProfile(ingenieurId, onboardingData)

    return {
      engineer: engineerData,
      message: `Engineer ${personal_info.full_name} created successfully with ${current_skills?.length || 0} skills`
    }

  } catch (error) {
    console.error('Error in createNewEngineer:', error)
    throw error
  }
}

export async function addEngineerSkills(ingenieurId: string | number, skills: any[]) {
  try {
    // First, ensure all competences exist
    const competencePromises = skills.map(async (skill) => {
      await ensureCompetenceExists(skill.skill_name, skill.category)
    })
    
    await Promise.all(competencePromises)

    // Then, add engineer competences
    const engineerCompetences = skills.map(skill => ({
      ingenieur_id: ingenieurId,
      competence_id: generateCompetenceId(skill.skill_name),
      niveau: skill.self_assessed_level
    }))

    const { data, error } = await engineerSupabaseAdmin
      .from('ingenieur_competences')
      .insert(engineerCompetences)
      .select()

    if (error) {
      console.error('Error adding engineer skills:', error)
      throw new Error(`Failed to add skills: ${error.message}`)
    }

    console.log(`Added ${data.length} skills for engineer ${ingenieurId}`)
    return data

  } catch (error) {
    console.error('Error in addEngineerSkills:', error)
    throw error
  }
}

export async function ensureCompetenceExists(skillName: string, category: string) {
  const competenceId = generateCompetenceId(skillName)

  try {
    // Check if competence already exists
    const { data: existingCompetence, error: checkError } = await engineerSupabase
      .from('competences')
      .select('competence_id')
      .eq('competence_id', competenceId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // If competence doesn't exist, create it
    if (!existingCompetence) {
      const { data, error } = await engineerSupabaseAdmin
        .from('competences')
        .insert({
          competence_id: competenceId,
          nom_competence: skillName,
          categorie: category
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating competence:', error)
        throw new Error(`Failed to create competence: ${error.message}`)
      }

      console.log('Created new competence:', data)
      return data
    }

    return existingCompetence

  } catch (error) {
    console.error('Error in ensureCompetenceExists:', error)
    throw error
  }
}

export async function storeOnboardingProfile(ingenieurId: string | number, onboardingData: any) {
  try {
    // You could create a separate onboarding_profiles table to store the full onboarding data
    // For now, we'll just log it as the main engineer data is already stored
    console.log(`Onboarding data for engineer ${ingenieurId}:`, {
      technical_background: onboardingData.technical_background,
      learning_goals: onboardingData.learning_goals,
      team_preferences: onboardingData.team_preferences,
      onboarding_status: onboardingData.onboarding_status
    })

    // TODO: If you want to store the full onboarding profile data, 
    // create an onboarding_profiles table and insert the data here
    
    return true

  } catch (error) {
    console.error('Error storing onboarding profile:', error)
    throw error
  }
}

// Helper function to generate consistent competence IDs
function generateCompetenceId(skillName: string): number {
  // Create a simple hash of the skill name to get consistent integer ID
  let hash = 0;
  const cleanName = skillName.toLowerCase().trim();
  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Ensure positive integer and reasonable range
  return Math.abs(hash) % 999999 + 1; // Range: 1-999999
}

// Function to get engineer by email (useful for checking if engineer already exists)
export async function getEngineerByEmail(email: string) {
  try {
    const { data, error } = await engineerSupabase
      .from('ingenieurs')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data

  } catch (error) {
    console.error('Error getting engineer by email:', error)
    return null
  }
} 