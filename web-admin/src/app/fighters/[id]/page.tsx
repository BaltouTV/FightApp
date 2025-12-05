'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trophy, Target, Hand } from 'lucide-react';
import { api } from '@/lib/api';

export default function FighterDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: fighter, isLoading } = useQuery({
    queryKey: ['fighter', id],
    queryFn: () => api.getFighterById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Combattant non trouvé</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/fighters"
          className="p-2 rounded-lg bg-background-light border border-border hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{fighter.fullName}</h1>
          {fighter.nickname && (
            <p className="text-primary text-lg">"{fighter.nickname}"</p>
          )}
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Edit className="w-4 h-4" />
          Modifier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-background-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Pays</p>
              <p className="font-medium">{fighter.country}</p>
            </div>
            {fighter.city && (
              <div>
                <p className="text-sm text-gray-400">Ville</p>
                <p className="font-medium">{fighter.city}</p>
              </div>
            )}
            {fighter.team && (
              <div>
                <p className="text-sm text-gray-400">Team</p>
                <p className="font-medium">{fighter.team}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-400">Catégorie</p>
              <p className="font-medium">{fighter.weightClass}</p>
            </div>
            {fighter.heightCm && (
              <div>
                <p className="text-sm text-gray-400">Taille</p>
                <p className="font-medium">{fighter.heightCm} cm</p>
              </div>
            )}
            {fighter.reachCm && (
              <div>
                <p className="text-sm text-gray-400">Allonge</p>
                <p className="font-medium">{fighter.reachCm} cm</p>
              </div>
            )}
            {fighter.stance && fighter.stance !== 'UNKNOWN' && (
              <div>
                <p className="text-sm text-gray-400">Garde</p>
                <p className="font-medium">{fighter.stance}</p>
              </div>
            )}
            {fighter.age && (
              <div>
                <p className="text-sm text-gray-400">Âge</p>
                <p className="font-medium">{fighter.age} ans</p>
              </div>
            )}
          </div>
        </div>

        {/* Record */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pro Record */}
          <div className="bg-background-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">Record Professionnel</h2>
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="text-4xl font-bold text-green-500">
                  {fighter.proWins}
                </p>
                <p className="text-sm text-gray-400">Victoires</p>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4">
                <p className="text-4xl font-bold text-red-500">
                  {fighter.proLosses}
                </p>
                <p className="text-sm text-gray-400">Défaites</p>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <p className="text-4xl font-bold text-yellow-500">
                  {fighter.proDraws}
                </p>
                <p className="text-sm text-gray-400">Nuls</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-background-light rounded-lg p-3">
                <Hand className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xl font-bold">{fighter.proWinsByKO}</p>
                  <p className="text-xs text-gray-400">KO/TKO</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background-light rounded-lg p-3">
                <Target className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xl font-bold">{fighter.proWinsBySubmission}</p>
                  <p className="text-xs text-gray-400">Soumissions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-background-light rounded-lg p-3">
                <Trophy className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{fighter.proWinsByDecision}</p>
                  <p className="text-xs text-gray-400">Décisions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Fights */}
          <div className="bg-background-card rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">Derniers combats</h2>
            {fighter.recentFights.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Aucun combat récent
              </p>
            ) : (
              <div className="space-y-3">
                {fighter.recentFights.map((fight) => (
                  <div
                    key={fight.fightId}
                    className="flex items-center gap-4 bg-background-light rounded-lg p-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        fight.isWinner === true
                          ? 'bg-green-500/20 text-green-500'
                          : fight.isWinner === false
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}
                    >
                      {fight.isWinner === true
                        ? 'V'
                        : fight.isWinner === false
                        ? 'D'
                        : 'N'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">vs {fight.opponent.fullName}</p>
                      <p className="text-sm text-gray-400">{fight.eventName}</p>
                    </div>
                    {fight.method && (
                      <div className="text-right">
                        <p className="text-sm">{fight.method}</p>
                        {fight.round && (
                          <p className="text-xs text-gray-400">
                            R{fight.round} {fight.time}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

