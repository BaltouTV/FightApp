'use client';

import { Building2 } from 'lucide-react';

export default function OrganizationsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organisations</h1>
          <p className="text-gray-400 mt-1">Gérer les organisations MMA</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Nouvelle organisation
        </button>
      </div>

      {/* Coming Soon */}
      <div className="bg-background-card rounded-lg border border-border p-12 text-center">
        <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bientôt disponible</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          La gestion complète des organisations sera disponible dans une prochaine version.
          Vous pourrez créer, modifier et gérer les organisations MMA.
        </p>
      </div>
    </div>
  );
}

