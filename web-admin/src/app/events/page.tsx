'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['events', page],
    queryFn: () => api.getUpcomingEvents({ page, pageSize }),
  });

  const events = data?.data ?? [];
  const meta = data?.meta;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500/20 text-blue-400';
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programmé';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Événements</h1>
          <p className="text-gray-400 mt-1">
            {meta?.totalCount ?? 0} événements à venir
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Nouvel événement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-background-card rounded-lg p-4 mb-6 border border-border">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                className="w-full bg-background-light border border-border rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-background-light border border-border rounded-lg text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-background-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Aucun événement trouvé
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Organisation</th>
                <th>Date</th>
                <th>Lieu</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{event.name}</p>
                        {event.isAmateurEvent && (
                          <span className="text-xs text-yellow-500">Amateur</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="px-2 py-1 bg-background-light rounded text-sm">
                      {event.organization.shortName || event.organization.name}
                    </span>
                  </td>
                  <td className="text-gray-400">{formatDate(event.dateTimeUtc)}</td>
                  <td className="text-gray-400">
                    {[event.city, event.country].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                        event.status
                      )}`}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-primary hover:text-primary-light text-sm font-medium"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-gray-400">
              Page {meta.page} sur {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPreviousPage}
                className="p-2 rounded-lg bg-background-light border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="p-2 rounded-lg bg-background-light border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

