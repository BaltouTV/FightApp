# FightApp - Global MMA Database & Companion App

FightApp est une application complète de base de données MMA couvrant le MMA professionnel et amateur, avec des événements, des profils de combattants, et des fonctionnalités de favoris.

## 🏗️ Architecture

Ce projet est un **monorepo TypeScript** composé de :

```
fightapp/
├── backend/        # API Node.js + Express + Prisma
├── mobile/         # Application React Native (Expo)
├── web-admin/      # Interface d'administration Next.js
└── shared/         # Types TypeScript partagés
```

## 🚀 Quick Start

### Prérequis

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+

### Installation

```bash
# Cloner le repo
git clone <repository-url>
cd fightapp

# Installer les dépendances
pnpm install

# Copier les fichiers d'environnement
cp backend/env.example backend/.env
cp mobile/env.example mobile/.env
cp web-admin/env.example web-admin/.env

# Configurer la base de données dans backend/.env
# DATABASE_URL="postgresql://user:password@localhost:5432/fightapp"

# Générer le client Prisma et appliquer les migrations
pnpm db:generate
pnpm db:push

# (Optionnel) Remplir avec des données de test
pnpm --filter @fightapp/backend db:seed
```

### Lancer le projet

```bash
# Backend (port 3000)
pnpm dev:backend

# Mobile (Expo)
pnpm dev:mobile

# Web Admin (port 3001)
pnpm dev:web-admin
```

## 📦 Packages

### Backend (`/backend`)

API REST Node.js avec Express et Prisma.

**Fonctionnalités :**
- Authentification JWT (register/login)
- Endpoints publics pour événements, combattants, organisations
- Endpoints protégés pour les favoris
- Abstraction pour les fournisseurs de données MMA
- Architecture en couches (domain/application/infrastructure/presentation)

**Commandes :**
```bash
pnpm --filter @fightapp/backend dev      # Démarrer en mode développement
pnpm --filter @fightapp/backend build    # Build production
pnpm --filter @fightapp/backend migrate  # Appliquer les migrations
pnpm --filter @fightapp/backend db:seed  # Remplir la BDD avec des données de test
```

### Mobile (`/mobile`)

Application React Native avec Expo et Expo Router.

**Écrans :**
- 🏠 Home - Liste des événements à venir
- 🔍 Search - Recherche de combattants
- ❤️ Favorites - Favoris (combattants, événements, organisations)
- 👤 Profile - Profil utilisateur
- 📅 Event Details - Détails d'un événement avec fight card
- 🥊 Fighter Details - Profil complet d'un combattant

**Commandes :**
```bash
pnpm --filter @fightapp/mobile start     # Démarrer Expo
pnpm --filter @fightapp/mobile android   # Lancer sur Android
pnpm --filter @fightapp/mobile ios       # Lancer sur iOS
```

### Web Admin (`/web-admin`)

Interface d'administration Next.js avec Tailwind CSS.

**Pages :**
- Dashboard avec statistiques
- Liste et détails des combattants
- Liste et détails des événements
- Authentification admin

**Commandes :**
```bash
pnpm --filter @fightapp/web-admin dev    # Démarrer en mode développement
pnpm --filter @fightapp/web-admin build  # Build production
```

### Shared (`/shared`)

Types TypeScript partagés entre tous les packages.

- DTOs (Fighter, Event, Organization, User, etc.)
- Enums (Stance, EventStatus, FightResultStatus, etc.)
- Types utilitaires (PaginatedResult, ApiResponse, etc.)

## 🗃️ Base de données

Le schéma Prisma inclut les entités suivantes :

- **Fighter** - Profil complet avec record et statistiques
- **Organization** - Organisations MMA (UFC, PFL, etc.)
- **Event** - Événements avec fight cards
- **Fight** - Combats individuels avec statistiques
- **User** - Utilisateurs de l'application
- **Favorites** - Tables de liaison pour les favoris
- **OrganizationAccount** - Comptes d'organisation (pour le portail futur)

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté

### Events
- `GET /api/events/upcoming` - Événements à venir (paginé, filtrable)
- `GET /api/events/:id` - Détails d'un événement

### Fighters
- `GET /api/fighters/search` - Recherche de combattants
- `GET /api/fighters/:id` - Détails d'un combattant

### Organizations
- `GET /api/organizations` - Liste des organisations
- `GET /api/organizations/:id` - Détails d'une organisation

### Favorites (authentifié)
- `GET /api/me/favorites` - Tous les favoris
- `POST/DELETE /api/me/favorites/fighters/:id`
- `POST/DELETE /api/me/favorites/events/:id`
- `POST/DELETE /api/me/favorites/organizations/:id`

## 🧪 Données de test

Après avoir exécuté le seed (`pnpm --filter @fightapp/backend db:seed`), vous pouvez utiliser :

- **Email:** `demo@fightapp.com`
- **Mot de passe:** `password123`

## 🛠️ Scripts utiles

```bash
# Linting
pnpm lint              # Linter tous les packages
pnpm lint:fix          # Corriger automatiquement

# Type checking
pnpm typecheck         # Vérifier les types

# Formatage
pnpm format            # Formater avec Prettier
pnpm format:check      # Vérifier le formatage

# Base de données
pnpm db:migrate        # Appliquer les migrations
pnpm db:generate       # Générer le client Prisma
pnpm db:studio         # Ouvrir Prisma Studio
```

## 📁 Structure du Backend

```
backend/src/
├── index.ts                          # Point d'entrée
├── domain/
│   └── errors/                       # Erreurs personnalisées
├── infrastructure/
│   ├── database/                     # Client Prisma
│   ├── middleware/                   # Middlewares Express
│   └── repositories/                 # Accès aux données
├── application/
│   ├── services/                     # Logique métier
│   ├── providers/                    # Abstraction fournisseurs MMA
│   └── sync/                         # Service de synchronisation
└── presentation/
    ├── routes/                       # Routes Express
    └── controllers/                  # Contrôleurs
```

## 🔮 Roadmap

- [ ] Portail pour organisations locales
- [ ] Statistiques avancées des combats
- [ ] Notifications push pour les événements
- [ ] Intégration de fournisseurs de données MMA réels
- [ ] Système de prédictions
- [ ] Live updates pendant les événements

## 📄 License

MIT

