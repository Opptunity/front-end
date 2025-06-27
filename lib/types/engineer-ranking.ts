// Types pour le système de classement d'ingénieurs

export interface Competence {
  competence_id: string;
  nom_competence: string;
  categorie?: string;
}

export interface Ingenieur {
  ingenieur_id: string;
  nom: string;
  prenom: string;
  email: string;
  equipe_id?: string;
  competences?: IngenieurCompetence[];
}

export interface IngenieurCompetence {
  ingenieur_id: string;
  competence_id: string;
  competence?: Competence;
  niveau: number; // 1-5
}

export interface Tache {
  tache_id: string;
  projet_id?: string;
  nom_tache: string;
  description_tache?: string;
  statut_tache?: string;
  priorite?: number;
  competences_requises?: TacheCompetenceRequise[];
}

export interface TacheCompetenceRequise {
  tache_id: string;
  competence_id: string;
  competence?: Competence;
  niveau_requis: number; // 1-5
  importance: number; // 1-5
}

export interface ClassementAI {
  id: string;
  tache_id: string;
  ingenieur_id: string;
  ingenieur?: Ingenieur;
  tache?: Tache;
  score_compatibilite: number; // 0-100
  rang: number;
  justification_ai: string;
  competences_manquantes: Competence[];
  competences_adequates: IngenieurCompetence[];
  recommandations: string;
  created_at: string;
}

export interface ClassementRequest {
  tache_id?: string;
  tache_description?: string;
  projet_nom?: string;
  projet_description?: string;
  competences_requises?: {
    competence_id?: string;
    nom_competence?: string;
    niveau_requis: number;
    importance: number;
  }[];
  limite_resultats?: number;
}

export interface ClassementResponse {
  classements: ClassementAI[];
  tache_analysee: Tache;
  nombre_ingenieurs_evalues: number;
  temps_traitement: number;
} 