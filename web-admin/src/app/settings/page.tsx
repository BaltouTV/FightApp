'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-gray-400 mt-1">Configuration de l'administration</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-background-card rounded-lg border border-border p-12 text-center">
        <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Bientôt disponible</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Les paramètres de l'application seront disponibles dans une prochaine version.
        </p>
      </div>
    </div>
  );
}

