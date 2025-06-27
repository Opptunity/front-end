import { createClient } from '@supabase/supabase-js'

// Configuration pour la deuxième base Supabase dédiée aux ingénieurs
const engineerSupabaseUrl = process.env.NEXT_PUBLIC_ENGINEER_SUPABASE_URL || ''
const engineerSupabaseAnonKey = process.env.NEXT_PUBLIC_ENGINEER_SUPABASE_ANON_KEY || ''

if (!engineerSupabaseUrl || !engineerSupabaseAnonKey) {
  console.error('Missing Engineer Supabase environment variables')
  console.error('URL:', engineerSupabaseUrl ? 'OK' : 'MISSING')
  console.error('Key:', engineerSupabaseAnonKey ? 'OK' : 'MISSING')
}

// Client public pour les opérations courantes
export const engineerSupabase = createClient(engineerSupabaseUrl, engineerSupabaseAnonKey)

// Client admin utilisant la même clé anon
export const engineerSupabaseAdmin = createClient(engineerSupabaseUrl, engineerSupabaseAnonKey)

// Types ajustés selon votre schéma réel
export type IngenieurDB = {
  ingenieur_id: string
  nom: string
  prenom: string
  email: string
  equipe_id?: string
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

  return (data || []).map(item => ({
    projet_id: item.projets.projet_id,
    nom_projet: item.projets.nom_projet,
    priorite: item.projets.priorite,
    allocation_pourcentage: item.allocation_pourcentage,
    date_debut: item.projets.date_debut,
    date_fin_prevue: item.projets.date_fin_prevue
  }))
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