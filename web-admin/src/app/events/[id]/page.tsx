'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Calendar, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.getEventById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Événement non trouvé</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/events"
          className="p-2 rounded-lg bg-background-light border border-border hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm font-medium">
              {event.organization.shortName || event.organization.name}
            </span>
            {event.isAmateurEvent && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm font-medium">
                Amateur
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Edit className="w-4 h-4" />
          Modifier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Info */}
        <div className="bg-background-card rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Date & Heure</p>
                <p className="font-medium">{formatDate(event.dateTimeUtc)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Lieu</p>
                <p className="font-medium">
                  {[event.venue, event.city, event.country]
                    .filter(Boolean)
                    .join(', ') || 'Non défini'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Organisation</p>
                <p className="font-medium">{event.organization.name}</p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-gray-400 mb-2">Description</p>
              <p className="text-gray-300">{event.description}</p>
            </div>
          )}
        </div>

        {/* Fight Card */}
        <div className="lg:col-span-2">
          <div className="bg-background-card rounded-lg p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Fight Card</h2>
              <span className="text-sm text-gray-400">
                {event.fights.length} combats
              </span>
            </div>

            {event.fights.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Aucun combat programmé</p>
                <button className="mt-4 text-primary hover:text-primary-light font-medium">
                  + Ajouter un combat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {event.fights.map((fight) => (
                  <div
                    key={fight.id}
                    className="bg-background-light rounded-lg p-4"
                  >
                    {/* Fight Header */}
                    <div className="flex items-center gap-2 mb-3">
                      {fight.isMainEvent && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium">
                          Main Event
                        </span>
                      )}
                      {fight.isCoMainEvent && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                          Co-Main
                        </span>
                      )}
                      {fight.isTitleFight && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                          🏆 Title
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {fight.weightClass}
                      </span>
                    </div>

                    {/* Fighters */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/fighters/${fight.fighterA.id}`}
                          className={`font-medium hover:text-primary ${
                            fight.winnerId === fight.fighterA.id
                              ? 'text-green-500'
                              : ''
                          }`}
                        >
                          {fight.fighterA.lastName.toUpperCase()}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {fight.fighterA.proWins}-{fight.fighterA.proLosses}
                        </p>
                      </div>

                      <div className="px-4 text-center">
                        <span className="text-gray-500 font-bold">VS</span>
                      </div>

                      <div className="flex-1 text-right">
                        <Link
                          href={`/fighters/${fight.fighterB.id}`}
                          className={`font-medium hover:text-primary ${
                            fight.winnerId === fight.fighterB.id
                              ? 'text-green-500'
                              : ''
                          }`}
                        >
                          {fight.fighterB.lastName.toUpperCase()}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {fight.fighterB.proWins}-{fight.fighterB.proLosses}
                        </p>
                      </div>
                    </div>

                    {/* Result */}
                    {fight.resultStatus !== 'SCHEDULED' && fight.method && (
                      <div className="mt-3 pt-3 border-t border-border text-center">
                        <p className="text-sm text-gray-400">
                          {fight.method}
                          {fight.round && ` - R${fight.round}`}
                          {fight.time && ` ${fight.time}`}
                        </p>
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

