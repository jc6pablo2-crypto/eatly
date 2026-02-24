# SNAP & EAT 🥗📸

SNAP & EAT est une PWA premium permettant de prendre ses repas en photo, de recevoir une analyse IA (via Anthropic Vision) et, 1 à 4 heures plus tard, de renseigner son niveau d'énergie, de satiété et de digestion.

## Fonctionnalités Principales (MVP)

1. **Authentification** : Inscription classique / lien magique via Supabase.
2. **Onboarding** : Sélection de l'objectif wellness (énergie, poids, etc.).
3. **Capture** : Prise de photo du repas avec contexte -> Analyse IA (FeelScore, Cravings, Micro-Swap).
4. **Historique & Feedback** : Liste des repas, détail avec scores décomposés, popup de feedback post-repas.
5. **Insights** : Statistiques basées sur l'état de forme sur 7 jours.

---

## Architecture

- **Frontend** : React.js + Vite + Tailwind CSS v4 + React Router.
- **Backend** : Supabase (PostgreSQL, Auth, Storage).
- **IA** : Edge Function (Deno) connectée à l'API Anthropic (Modèle Vision : Claude 3.5 Sonnet).
- **Hébergement** : App optimisée pour Vercel (avec `vercel.json`).

---

## 🚀 Setup Local

### 1. Cloner ou initialiser depuis ce dossier

Si vous venez de générer le code :
```bash
git init
git add .
git commit -m "Init SNAP & EAT"
```

### 2. Variables d'Environnement

Créez un fichier `.env` à la racine (ne pas le commiter) basé sur `.env.example` :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_publique_anon

# Dans Supabase (pour l'Edge Function) :
# Vous devrez configurer les secrets avec la CLI: supabase secrets set ANTHROPIC_API_KEY=sk-ant...
```

### 3. Installer et Lancer (Front)

```bash
npm install
npm run dev
```

---

## 🗄️ Backend Supabase (Instructions)

Les migrations et les fonctions sont prêtes.

1. Allez sur le Dashboard Supabase, créez un un nouveau projet.
2. Dans le SQL Editor, exécutez le script présent dans `supabase/migrations/20240101000000_init.sql`. Cela créera les tables `profiles`, `meals`, `meal_analysis`, `meal_feedback`, les politiques **RLS**, et activera le bucket `meal_photos`.
3. Ajoutez votre **`ANTHROPIC_API_KEY`** dans les Edge Function secrets (via la CLI Supabase ou via le dashboard de Supabase -> section Edge Functions -> Secrets).
4. Déployez la fonction `analyzeMeal` :
```bash
supabase functions deploy analyzeMeal --no-verify-jwt
```
_Note:_ Le JWT est vérifié manuellement à l'intérieur de la fonction Deno.

---

## 🎨 Design System

Le design (iOS style) est entièrement géré dans `src/index.css`. L'application est `mobile-first` (et possède un manifest PWA complet dans `public/manifest.json`).
