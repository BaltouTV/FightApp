'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function FightersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['fighters', search, page],
    queryFn: () => api.searchFighters({ q: search || undefined, page, pageSize }),
  });

  const fighters = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Combattants</h1>
          <p className="text-gray-400 mt-1">
            {meta?.totalCount ?? 0} combattants au total
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Ajouter un combattant
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
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Rechercher un combattant..."
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
        ) : fighters.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Aucun combattant trouvé
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Pays</th>
                <th>Catégorie</th>
                <th>Record</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fighters.map((fighter) => (
                <tr key={fighter.id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">{fighter.fullName}</p>
                      {fighter.nickname && (
                        <p className="text-sm text-primary">"{fighter.nickname}"</p>
                      )}
                    </div>
                  </td>
                  <td className="text-gray-400">{fighter.country}</td>
                  <td>
                    <span className="px-2 py-1 bg-background-light rounded text-sm">
                      {fighter.weightClass}
                    </span>
                  </td>
                  <td>
                    <span className="text-green-500">{fighter.proWins}</span>
                    <span className="text-gray-500"> - </span>
                    <span className="text-red-500">{fighter.proLosses}</span>
                    {fighter.proDraws > 0 && (
                      <>
                        <span className="text-gray-500"> - </span>
                        <span className="text-yellow-500">{fighter.proDraws}</span>
                      </>
                    )}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        fighter.isPro
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {fighter.isPro ? 'Pro' : 'Amateur'}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/fighters/${fighter.id}`}
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

