# Plan complet développement Front-end --- HAVAS Factory Platform

## 1. Vision du Front-end

Construire une interface SaaS professionnelle permettant :

-   gestion des QR Codes
-   gestion des clients
-   gestion utilisateurs
-   génération massive
-   personnalisation QR
-   tracking analytics
-   dashboard statistiques

Deux espaces utilisateurs :

    HAVAS FACTORY PLATFORM

            |
            |
     ----------------------
     |                    |
    SUPER ADMIN       COLLABORATEUR

    HAVAS Factory      Client

------------------------------------------------------------------------

# 2. Architecture technique

## Stack principale

-   React + Vite
-   React Router DOM
-   Tailwind CSS
-   Shadcn UI
-   Zustand
-   Axios
-   TanStack Query
-   React Hook Form
-   Zod
-   Recharts
-   Framer Motion
-   qrcode.react
-   date-fns
-   Lucide React
-   React Hot Toast

------------------------------------------------------------------------

# 3. Architecture dossier finale

    src/

    ├── assets/

    ├── components/
    │   ├── ui/
    │   ├── auth/
    │   ├── shared/
    │   ├── admin/
    │   └── client/

    ├── layouts/
    │   ├── AuthLayout.jsx
    │   ├── AdminLayout.jsx
    │   └── ClientLayout.jsx

    ├── pages/
    │   ├── auth/
    │   ├── admin/
    │   └── client/

    ├── routes/
    │   ├── index.jsx
    │   ├── adminRoutes.jsx
    │   └── clientRoutes.jsx

    ├── services/
    │   ├── api.js
    │   ├── auth.service.js
    │   └── qr.service.js

    ├── hooks/

    ├── store/
    │   ├── auth.store.js
    │   └── ui.store.js

    ├── schemas/

    ├── lib/

    └── main.jsx

------------------------------------------------------------------------

# 4. Design System

Style :

Premium SaaS + Marketing Technology + Corporate

Couleurs :

-   Primary : #111827
-   Accent : #FF6B00
-   Background : #F8FAFC

Outils :

-   Tailwind CSS
-   Shadcn UI
-   Lucide React
-   Framer Motion

------------------------------------------------------------------------

# 5. Authentification

Fonctionnalités :

-   Login
-   JWT
-   Refresh Token
-   ProtectedRoute
-   RoleGuard
-   Zustand Auth Store

Flux :

    Login
     ↓
    API /auth/login
     ↓
    Stockage Zustand
     ↓
    Vérification rôle
     ↓
    Redirection

Routes :

    /login

    /admin/*
    /client/*

------------------------------------------------------------------------

# 6. Module Super Admin

## Dashboard Admin

Route :

    /admin/dashboard

Widgets :

-   QR Codes
-   Clients actifs
-   Utilisateurs
-   Scans
-   Campagnes

Graphiques :

-   Recharts

------------------------------------------------------------------------

## Gestion utilisateurs

Route :

    /admin/users

Fonctions :

-   liste utilisateurs
-   création
-   modification
-   suppression
-   activation/désactivation

Formulaires :

-   React Hook Form
-   Zod

------------------------------------------------------------------------

## Gestion clients

Route :

    /admin/clients

Fonctions :

-   CRUD client
-   statistiques
-   dossiers

------------------------------------------------------------------------

## Gestion QR Codes

Route :

    /admin/qrcodes

Fonctions :

-   création
-   modification
-   suppression
-   duplication
-   téléchargement

------------------------------------------------------------------------

# 7. Module Collaborateur

## Dashboard

Route :

    /client/dashboard

Fonctions :

-   mes QR Codes
-   mes scans
-   performances

------------------------------------------------------------------------

# 8. Générateur QR Code

Technologie :

qrcode.react

Fonctions :

-   génération QR
-   preview temps réel
-   téléchargement

------------------------------------------------------------------------

# 9. QR Designer

Options :

-   logo
-   couleur
-   forme
-   texte
-   cadre

Gestion état :

-   Zustand

------------------------------------------------------------------------

# 10. Tracking Analytics

Route :

    /client/tracking

Données :

-   scans
-   pays
-   navigateur
-   appareil
-   date

Visualisation :

-   Recharts

------------------------------------------------------------------------

# 11. Gestion API

Axios :

-   baseURL
-   token automatique
-   refresh token
-   gestion erreurs

TanStack Query :

-   fetch
-   cache
-   loading
-   synchronisation données

------------------------------------------------------------------------

# 12. Formulaires

Tous les formulaires utilisent :

React Hook Form + Zod

Concernés :

-   login
-   utilisateurs
-   clients
-   QR Codes
-   paramètres

------------------------------------------------------------------------

# 13. Notifications

React Hot Toast :

Exemples :

-   succès création QR
-   erreur API
-   confirmation action

------------------------------------------------------------------------

# 14. Animations UX

Framer Motion :

-   transitions pages
-   modals
-   cartes dashboard
-   loaders

------------------------------------------------------------------------

# 15. Roadmap développement

## Phase 1 --- Initialisation

-   création projet Vite React
-   installation dépendances
-   Tailwind
-   Shadcn
-   thème global
-   architecture dossiers

------------------------------------------------------------------------

## Phase 2 --- Navigation

-   React Router
-   layouts
-   routes
-   ProtectedRoute

------------------------------------------------------------------------

## Phase 3 --- Authentification

-   interface Login
-   validation Zod
-   connexion API
-   Zustand auth
-   gestion rôle

------------------------------------------------------------------------

## Phase 4 --- Interface Admin

-   Sidebar
-   Header
-   Dashboard
-   Statistiques

------------------------------------------------------------------------

## Phase 5 --- Gestion utilisateurs

-   Tables
-   Formulaires
-   CRUD

------------------------------------------------------------------------

## Phase 6 --- Gestion clients

-   Liste clients
-   Détails
-   Statistiques

------------------------------------------------------------------------

## Phase 7 --- Gestion QR Codes

-   Listing
-   Recherche
-   Filtres
-   Création
-   Preview

------------------------------------------------------------------------

## Phase 8 --- QR Designer

-   Personnalisation
-   Preview temps réel
-   Sauvegarde

------------------------------------------------------------------------

## Phase 9 --- Génération massive Excel

Workflow :

    Upload Excel
     ↓
    Mapping colonnes
     ↓
    Validation
     ↓
    Génération QR
     ↓
    Association client

------------------------------------------------------------------------

## Phase 10 --- Analytics

-   Tracking
-   Graphiques
-   Rapports

------------------------------------------------------------------------

## Phase 11 --- Optimisation

-   Responsive
-   Loading states
-   Empty states
-   Gestion erreurs
-   Performance
