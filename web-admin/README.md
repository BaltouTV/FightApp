# FightApp Web Admin

Interface d'administration pour FightApp, construite avec Next.js 14, TypeScript et Tailwind CSS.

## 🚀 Getting Started

### Prérequis

- Node.js 20+
- pnpm

### Installation

```bash
# Depuis la racine du monorepo
pnpm install

# Copier le fichier d'environnement
cp env.example .env

# Éditer .env
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Lancer le serveur de développement

```bash
pnpm dev
```

L'application démarre sur `http://localhost:3001`.

## 📁 Structure

```
web-admin/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx       # Page de connexion
│   │   ├── events/
│   │   │   ├── page.tsx       # Liste des événements
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Détails événement
│   │   └── fighters/
│   │       ├── page.tsx       # Liste des combattants
│   │       └── [id]/
│   │           └── page.tsx   # Détails combattant
│   ├── components/
│   │   ├── Providers.tsx      # React Query Provider
│   │   └── Sidebar.tsx        # Navigation latérale
│   ├── lib/
│   │   └── api.ts             # Client API
│   └── store/
│       └── auth.ts            # État d'authentification (Zustand)
├── tailwind.config.ts          # Configuration Tailwind
└── package.json
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard avec statistiques et actions rapides |
| `/login` | Page de connexion admin |
| `/fighters` | Liste des combattants avec recherche et filtres |
| `/fighters/[id]` | Détails d'un combattant avec record et historique |
| `/events` | Liste des événements avec pagination |
| `/events/[id]` | Détails d'un événement avec fight card |
| `/organizations` | Liste des organisations (à implémenter) |

## 🎨 Thème

L'interface utilise un thème sombre défini dans `tailwind.config.ts` :

```typescript
colors: {
  primary: {
    DEFAULT: '#E63946',
    dark: '#C1121F',
    light: '#FF6B6B',
  },
  background: {
    DEFAULT: '#0F0F1A',
    light: '#1A1A2E',
    card: '#16213E',
  },
  // ...
}
```

## 📦 Dépendances principales

- **next** 14 - Framework React
- **@tanstack/react-query** - Gestion des données asynchrones
- **zustand** - State management
- **axios** - Client HTTP
- **tailwindcss** - Styling
- **lucide-react** - Icônes

## 🔐 Authentification

L'authentification utilise :
- **Zustand** pour l'état d'authentification
- **localStorage** pour persister le token JWT

Le token est automatiquement attaché aux requêtes API.

## 🧪 Compte de test

Utilisez les identifiants suivants après avoir seedé la base de données :

- **Email:** `demo@fightapp.com`
- **Mot de passe:** `password123`

## 📝 Variables d'environnement

```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔮 Fonctionnalités à venir

- [ ] CRUD complet pour les combattants
- [ ] CRUD complet pour les événements
- [ ] Gestion des organisations
- [ ] Tableau de bord avec graphiques
- [ ] Logs d'activité
- [ ] Gestion des utilisateurs
- [ ] Portail pour organisations locales

