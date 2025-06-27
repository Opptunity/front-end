'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Trophy, User, Star, Building2, Target, Medal, Award, Calendar } from 'lucide-react';
import type { ClassementAI, ClassementResponse } from '@/lib/types/engineer-ranking';

export function EngineerRankingTool() {
  const [projetDescription, setProjetDescription] = useState('');
  const [projetNom, setProjetNom] = useState('');
  const [tacheDescription, setTacheDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classements, setClassements] = useState<ClassementAI[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRanking = async () => {
    if (!tacheDescription.trim()) {
      setError('Veuillez décrire la tâche spécifique');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construire le contexte complet avec projet + tâche
      const contexteComplet = `
${projetNom ? `PROJET: ${projetNom}` : ''}
${projetDescription ? `DESCRIPTION DU PROJET: ${projetDescription}` : ''}

TÂCHE SPÉCIFIQUE: ${tacheDescription}
      `.trim();

      const response = await fetch('/api/engineer-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tache_description: contexteComplet,
          projet_nom: projetNom,
          projet_description: projetDescription,
          limite_resultats: 10
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du classement');
      }

      const data: ClassementResponse = await response.json();
      setClassements(data.classements);

    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getRankIcon = (rang: number) => {
    switch (rang) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center text-gray-500 font-bold">#{rang}</span>;
    }
  };

  const getDisponibiliteBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'Disponible': return 'default';
      case 'Partiellement occupé': return 'secondary';
      case 'Très occupé': return 'destructive';
      case 'Indisponible': return 'destructive';
      default: return 'outline';
    }
  };

  const getDisponibiliteIcon = (statut: string) => {
    switch (statut) {
      case 'Disponible': return '✅ ';
      case 'Partiellement occupé': return '🟡 ';
      case 'Très occupé': return '🟠 ';
      case 'Indisponible': return '🔴 ';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Classement IA des Ingénieurs
          </CardTitle>
          <CardDescription>
            Décrivez votre projet d'entreprise et la tâche spécifique pour obtenir un classement intelligent des ingénieurs les plus adaptés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Projet */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Contexte du Projet</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="projet-nom">Nom du projet (optionnel)</Label>
                <Input
                  id="projet-nom"
                  placeholder="Ex: Refonte de l'application mobile, Migration vers le cloud..."
                  value={projetNom}
                  onChange={(e) => setProjetNom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="projet-description">Description du projet d'entreprise</Label>
                <Textarea
                  id="projet-description"
                  placeholder="Ex: Nous développons une nouvelle plateforme e-commerce pour moderniser notre système existant. Le projet inclut une architecture microservices, une interface utilisateur moderne, et l'intégration de systèmes de paiement..."
                  value={projetDescription}
                  onChange={(e) => setProjetDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Décrivez le contexte général, les objectifs, la technologie envisagée, etc.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section Tâche Spécifique */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Tâche Spécifique</h3>
            </div>
            
            <div>
              <Label htmlFor="tache">Description de la tâche à assigner *</Label>
              <Textarea
                id="tache"
                placeholder="Ex: Développer l'API REST pour la gestion des commandes avec authentification JWT, validation des données, et intégration avec la base de données PostgreSQL..."
                value={tacheDescription}
                onChange={(e) => setTacheDescription(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Soyez précis sur les compétences techniques requises, le niveau d'expérience, etc.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <Button 
            onClick={handleRanking} 
            disabled={isLoading || !tacheDescription.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              'Classer les ingénieurs pour cette tâche'
            )}
          </Button>
        </CardContent>
      </Card>

      {classements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Résultats du classement ({classements.length} ingénieurs)
            </h3>
            {projetNom && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Projet: {projetNom}
              </Badge>
            )}
          </div>
          
          {classements.map((classement, index) => (
            <Card key={classement.id} className="relative border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icône de rang */}
                    <div className="flex items-center justify-center">
                      {getRankIcon(classement.rang)}
                    </div>
                    
                    {/* Nom de l'ingénieur avec disponibilité */}
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        {classement.ingenieur ? 
                          `${classement.ingenieur.prenom} ${classement.ingenieur.nom}` :
                          `Ingénieur ${classement.ingenieur_id.slice(0, 8)}...`
                        }
                        {/* Badge de disponibilité */}
                        {classement.ingenieur?.disponibilite && (
                          <Badge 
                            variant={getDisponibiliteBadgeVariant(classement.ingenieur.disponibilite.statut_disponibilite)}
                            className="text-xs"
                          >
                            {getDisponibiliteIcon(classement.ingenieur.disponibilite.statut_disponibilite)}
                            {classement.ingenieur.disponibilite.statut_disponibilite}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-base mt-1">
                        <User className="h-4 w-4" />
                        {classement.ingenieur?.email || 'Email non disponible'}
                        <Badge variant="outline" className="text-xs">
                          Rang #{classement.rang}
                        </Badge>
                        {/* Pourcentage de disponibilité */}
                        {classement.ingenieur?.disponibilite && (
                          <Badge variant="outline" className="text-xs bg-blue-50">
                            {classement.ingenieur.disponibilite.disponibilite_effective}% libre
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Score de compatibilité */}
                  <div className="text-right">
                    <Badge variant={getScoreBadgeVariant(classement.score_compatibilite)} className="text-xl px-4 py-2 font-bold">
                      {classement.score_compatibilite.toFixed(1)}%
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Score de compatibilité</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informations de disponibilité détaillées */}
                {classement.ingenieur?.disponibilite && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Statut de disponibilité
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Allocation actuelle:</span> 
                        <span className="ml-2">{classement.ingenieur.disponibilite.allocation_totale}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Disponibilité effective:</span> 
                        <span className="ml-2 font-bold text-green-600">
                          {classement.ingenieur.disponibilite.disponibilite_effective}%
                        </span>
                      </div>
                    </div>

                    {/* Projets prioritaires en cours */}
                    {classement.ingenieur.disponibilite.projets_prioritaires.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-1">
                          ⚠️ Projets prioritaires en cours
                        </h5>
                        <div className="space-y-1">
                          {classement.ingenieur.disponibilite.projets_prioritaires.map((projet, i) => (
                            <div key={i} className="text-xs text-yellow-700">
                              • {projet.nom_projet} ({projet.priorite}, {projet.allocation_pourcentage}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Absences actuelles */}
                    {classement.ingenieur.disponibilite.absences_actuelles.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <h5 className="font-medium text-red-800 mb-2 flex items-center gap-1">
                          🚫 Indisponibilité actuelle
                        </h5>
                        <div className="space-y-1">
                          {classement.ingenieur.disponibilite.absences_actuelles.map((absence, i) => (
                            <div key={i} className="text-xs text-red-700">
                              • {absence.type_absence}: {absence.date_debut} → {absence.date_fin}
                              {absence.description && <span className="ml-2">({absence.description})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Barre de progression du score */}
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${getScoreColor(classement.score_compatibilite)}`}
                      style={{ width: `${classement.score_compatibilite}%` }}
                    />
                  </div>
                </div>

                {/* Justification avec impact disponibilité */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-500" />
                    Analyse IA
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
                    {classement.justification_ai}
                  </p>
                  {/* Impact de la disponibilité si disponible */}
                  {classement.disponibilite_impact && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <h5 className="font-medium text-blue-800 mb-1">Impact de la disponibilité:</h5>
                      <p className="text-xs text-blue-700">{classement.disponibilite_impact}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Compétences adéquates */}
                  {classement.competences_adequates.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-green-700 flex items-center gap-1">
                        ✅ Compétences adéquates ({classement.competences_adequates.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {classement.competences_adequates.map((comp, i) => {
                          console.log('Debug compétence:', comp);
                          return (
                            <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              {comp.competence?.nom_competence || comp.nom_competence || 'Compétence inconnue'} 
                              <span className="ml-1 font-bold">({comp.niveau_actuel || comp.niveau || comp.score || 0}/5)</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Compétences manquantes */}
                  {classement.competences_manquantes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-orange-700 flex items-center gap-1">
                        📚 À développer ({classement.competences_manquantes.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {classement.competences_manquantes.map((comp, i) => (
                          <Badge key={i} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                            {comp.nom_competence || comp.competence || 'Compétence inconnue'}
                            <span className="ml-1 text-xs">(requis)</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommandations */}
                {classement.recommandations && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-2 text-blue-800">💡 Recommandations</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">{classement.recommandations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 