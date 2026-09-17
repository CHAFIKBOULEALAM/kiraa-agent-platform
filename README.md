# 🚗 Kiraa JS — Système Hybride de Location (LangGraph + TypeScript Déterministe)

**Kiraa** est un agent IA de location de véhicules conçu pour éliminer le risque d'hallucinations dans les opérations métier critiques. Il a été conçu avec une architecture "Zero-Trust" envers les LLMs, déléguant uniquement l'intention et l'extraction, tandis que 100% de la logique métier (calculs financiers, vérifications d'éligibilité) est exécutée en TypeScript pur et déterministe.

## 🌟 Caractéristiques Principales

- **Architecture Hybride (LLM + Code Déterministe) :**
  - **Moteur Déterministe** : Les prix, l'éligibilité du conducteur et les pénalités de kilométrage sont garantis sans erreur.
  - **Routeur LLM** : Groq (Qwen) + LangGraph gère l'extraction de données et détermine l'intention de l'utilisateur avec précision.
- **RAG avec pgvector :** Utilisation de Drizzle ORM et PostgreSQL pour répondre aux questions sur les politiques de location.
- **OCR Intégré :** Tesseract.js traite les images de permis de conduire, avec pdf-parse pour les documents numériques.
- **Interface Utilisateur Moderne :** Next.js 15, TailwindCSS, Framer Motion, et Lucide Icons (Dark Mode, Glassmorphism).
- **Prêt pour la Production :** Docker Compose incluant la base de données PostgreSQL + pgvector.

## 🛠️ Stack Technique

- **Framework :** Next.js 15 (App Router), React 19
- **Agent IA :** LangGraph.js, `@langchain/groq`, Groq Qwen-2.5
- **Base de données :** PostgreSQL, pgvector, Drizzle ORM
- **Tests :** Vitest (Parité stricte avec les assertions du prototype Python)

## 🚀 Installation & Lancement Rapide

### 1. Prérequis
- Node.js 18+
- Docker & Docker Compose
- Une clé API Groq

### 2. Configuration Environnement
Créez un fichier `.env` à la racine :
```env
DATABASE_URL=$DATABASE_URL
GROQ_API_KEY=$GROQ_API_KEY
GROQ_MODEL=qwen-qwq-32b
```

### 3. Démarrage avec Docker Compose
Le projet est packagé de manière isolée et reproductible.
```bash
# Lance PostgreSQL + pgvector et l'application Next.js
docker-compose up -d
```

### 4. Migration & Seed de la Base de Données
Si vous développez localement sans le conteneur Next.js, installez les dépendances et chargez la base :
```bash
npm install
npx drizzle-kit push
npm run seed
```

### 5. Lancer l'Application (Local)
```bash
npm run dev
```
Accédez à [http://localhost:3000](http://localhost:3000).

## 🧪 Tests Unitaires
Les tests garantissent la parité absolue avec le cahier des charges d'origine :
```bash
npx vitest run
```

## 🏗️ Topologie LangGraph (7 Nœuds)

1. **Ingestor** : Réception des documents (Images/OCR, PDFs, JSON/TXT).
2. **Extractor** : Le LLM extrait les structures Pydantic/Zod (nom, dates de validité).
3. **Intent** : Le LLM classifie l'intention parmi 7 choix stricts et extrait les paramètres.
4. **Validator** : Le code TypeScript déterministe vérifie l'âge et la validité du permis.
5. **Calculator** : Le code TypeScript déterministe calcule le prix total avec cautions et remises.
6. **Explainer** : Le LLM formule la réponse au client de manière naturelle.
7. **Reporter** : Un rapport Markdown structuré résume les résultats.

---
*Projet généré selon le Cahier des Charges Kiraa v2.0.*

## Testing

To run E2E tests, the E2E_TEST_MODE=true environment variable is used internally. **This variable is strictly for test-only deterministic intent routing and must NEVER be enabled in a production environment.**
