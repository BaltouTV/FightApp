# FightApp Backend

API REST pour FightApp, construite avec Node.js, Express, TypeScript et Prisma.

## 🚀 Getting Started

### Prérequis

- Node.js 20+
- PostgreSQL 14+
- pnpm

### Installation

```bash
# Depuis la racine du monorepo
pnpm install

# Copier le fichier d'environnement
cp env.example .env

# Éditer .env avec vos configurations
# DATABASE_URL="postgresql://user:password@localhost:5432/fightapp"

# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations
pnpm db:push

# (Optionnel) Seed la base de données
pnpm db:seed
```

### Lancer le serveur

```bash
pnpm dev
```

Le serveur démarre sur `http://localhost:3000`.

## 📁 Architecture

```
src/
├── index.ts                    # Point d'entrée
├── domain/
│   └── errors/                 # Erreurs personnalisées (AppError, etc.)
├── infrastructure/
│   ├── database/
│   │   └── prisma.ts          # Client Prisma singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts  # Authentification JWT
│   │   ├── error-handler.ts    # Gestion des erreurs
│   │   └── not-found-handler.ts
│   └── repositories/           # Accès aux données
│       ├── fighter.repository.ts
│       ├── event.repository.ts
│       ├── organization.repository.ts
│       ├── user.repository.ts
│       └── favorites.repository.ts
├── application/
│   ├── services/               # Logique métier
│   │   ├── auth.service.ts
│   │   ├── fighter.service.ts
│   │   ├── event.service.ts
│   │   ├── organization.service.ts
│   │   └── favorites.service.ts
│   ├── providers/              # Abstraction fournisseurs de données
│   │   ├── mma-data-provider.ts
│   │   └── sportsdataio.provider.ts
│   └── sync/
│       └── mma-sync.service.ts # Synchronisation des données
└── presentation/
    ├── routes/                 # Définition des routes
    │   ├── index.ts
    │   ├── auth.routes.ts
    │   ├── events.routes.ts
    │   ├── fighters.routes.ts
    │   ├── organizations.routes.ts
    │   └── favorites.routes.ts
    └── controllers/            # Contrôleurs
        ├── auth.controller.ts
        ├── events.controller.ts
        ├── fighters.controller.ts
        ├── organizations.controller.ts
        └── favorites.controller.ts
```

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Utilisateur connecté (auth requise) |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/upcoming` | Événements à venir |
| GET | `/api/events/:id` | Détails d'un événement |

**Query params pour `/events/upcoming`:**
- `page` (default: 1)
- `pageSize` (default: 20, max: 50)
- `organizationId`
- `country`
- `level` (MAJOR/REGIONAL/AMATEUR)
- `fromDate`, `toDate` (ISO dates)

### Fighters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fighters/search` | Recherche de combattants |
| GET | `/api/fighters/:id` | Détails d'un combattant |

**Query params pour `/fighters/search`:**
- `q` (nom du combattant)
- `country`
- `organizationId`
- `weightClass`
- `page`, `pageSize`

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Liste des organisations |
| GET | `/api/organizations/:id` | Détails d'une organisation |

### Favorites (Auth requise)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/me/favorites` | Tous les favoris |
| POST | `/api/me/favorites/fighters/:id` | Ajouter combattant |
| DELETE | `/api/me/favorites/fighters/:id` | Retirer combattant |
| POST | `/api/me/favorites/events/:id` | Ajouter événement |
| DELETE | `/api/me/favorites/events/:id` | Retirer événement |
| POST | `/api/me/favorites/organizations/:id` | Ajouter organisation |
| DELETE | `/api/me/favorites/organizations/:id` | Retirer organisation |

## 🗃️ Base de données

### Schéma Prisma

Les principales entités :

- **Fighter** - Combattants avec record complet
- **Organization** - Organisations (UFC, PFL, etc.)
- **Event** - Événements MMA
- **Fight** - Combats individuels
- **User** - Utilisateurs
- **FavoriteFighter/Event/Organization** - Tables de favoris
- **OrganizationAccount** - Comptes d'organisation

### Commandes Prisma

```bash
pnpm db:generate   # Générer le client
pnpm db:push       # Push le schéma (dev)
pnpm migrate       # Créer une migration
pnpm db:studio     # Ouvrir Prisma Studio
pnpm db:seed       # Seed la base de données
```

## 🔐 Authentification

L'API utilise JWT (HS256) pour l'authentification.

**Headers requis pour les routes protégées :**
```
Authorization: Bearer <token>
```

## 🔄 MMA Data Provider

L'interface `MmaDataProvider` permet d'abstraire les fournisseurs de données MMA externes.

```typescript
interface MmaDataProvider {
  fetchUpcomingEvents(): Promise<ExternalEventDTO[]>;
  fetchEventDetails(id: string): Promise<ExternalEventDetailsDTO>;
  fetchFighterByExternalId(id: string): Promise<ExternalFighterDTO | null>;
  healthCheck(): Promise<boolean>;
}
```

Une implémentation stub pour SportsData.io est fournie.

## 📝 Variables d'environnement

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fightapp"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MMA Provider (optional)
MMA_API_PROVIDER=sportsdataio
MMA_API_KEY=your-api-key
MMA_API_BASE_URL=https://api.sportsdata.io/v3/mma

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:8081
```

## 🧪 Données de test

Exécutez `pnpm db:seed` pour créer :

- 3 organisations (UFC, PFL, Bellator)
- 4 combattants (Islam Makhachev, Charles Oliveira, Alex Pereira, Jon Jones)
- 3 événements avec combats
- 1 utilisateur demo (`demo@fightapp.com` / `password123`)

