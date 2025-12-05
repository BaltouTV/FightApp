import { Calendar, Users, Building2, Swords } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      name: 'Événements à venir',
      value: '12',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      name: 'Combattants',
      value: '1,234',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Organisations',
      value: '56',
      icon: Building2,
      color: 'bg-yellow-500',
    },
    {
      name: 'Combats cette semaine',
      value: '48',
      icon: Swords,
      color: 'bg-primary',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bienvenue dans l'administration FightApp</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-background-card rounded-lg p-6 border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-background-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium transition-colors">
            + Nouvel événement
          </button>
          <button className="bg-background-light hover:bg-background text-white px-4 py-3 rounded-lg font-medium border border-border transition-colors">
            + Nouveau combattant
          </button>
          <button className="bg-background-light hover:bg-background text-white px-4 py-3 rounded-lg font-medium border border-border transition-colors">
            Synchroniser les données
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="mt-8 bg-background-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
        <div className="text-gray-400 text-center py-8">
          <p>Les activités récentes apparaîtront ici</p>
        </div>
      </div>
    </div>
  );
}

