# StellarPulse Content Creator — Design Spec

**Date:** 2026-03-31  
**Status:** Approved  
**Scope:** v1 — Génération de contenu social media assistée par IA, interface locale, zéro installation

---

## 1. Vue d'ensemble

Mini-plateforme web pour community managers permettant de générer des posts pour Instagram (carousel, story), LinkedIn et Twitter via IA. Fonctionne entièrement en local : un fichier HTML ouvert dans le navigateur + un serveur Node.js lancé avec `node server.js`. Aucune dépendance npm, aucun build step.

---

## 2. Architecture des fichiers

```
content_creator/
│
├── index.html                  # Dashboard principal (4 sections via onglets)
├── server.js                   # Backend Node.js (stdlib uniquement, http/fs/path)
├── config.json                 # Clé API + provider actif (exclu du git)
├── .gitignore
│
├── lab/
│   ├── design.md               # Identité visuelle / charte graphique (input IA)
│   ├── content.md              # Brief contenu (sujets, ton, audience, objectifs)
│   └── prompts/
│       ├── carousel.md         # System prompt carousel Instagram
│       ├── story.md            # System prompt story Instagram
│       ├── linkedin.md         # System prompt post LinkedIn + illustration
│       ├── tweet.md            # System prompt tweet + illustration
│       └── theme-extract.md    # Prompt extraction de thème visuel depuis un post
│
├── carousel/                   # Slides générés (HTML + PNG)
├── story/                      # Stories générées (HTML + PNG)
├── linkedin_post/              # Posts LinkedIn générés
├── tweet/                      # Tweets générés
│
├── docs/
│   └── superpowers/specs/      # Specs de design
│
├── README.md
├── roadmap.md
├── todo.md
└── state.md
```

---

## 3. Backend — `server.js`

- **Runtime :** Node.js, stdlib uniquement (`http`, `fs`, `path`, `https`)
- **Lancement :** `node server.js` → écoute sur `http://localhost:3000`
- **Routes :**

| Route | Méthode | Description |
|-------|---------|-------------|
| `GET /` | GET | Sert `index.html` |
| `GET /api/config` | GET | Retourne provider actif |
| `POST /api/config` | POST | Sauvegarde provider + clé API dans `config.json` |
| `POST /api/generate` | POST | Lit prompt `.md` + `design.md` + `content.md` → appelle IA → retourne JSON |
| `POST /api/image` | POST | Génère une image d'illustration via IA → retourne base64 ou URL |
| `GET /static/*` | GET | Sert les fichiers statiques (CSS, JS inline dans HTML) |

**Flux `POST /api/generate` :**
1. Reçoit `{ platform, userBrief, tone, hashtags }`
2. Lit `lab/prompts/{platform}.md` + `lab/design.md` + `lab/content.md`
3. Compose le prompt : system = prompts .md, user = brief saisi
4. Appelle l'API du provider configuré (Claude ou OpenAI)
5. Retourne `{ content: [...], raw: "..." }`

**Providers supportés :**
- **Claude** : `https://api.anthropic.com/v1/messages` — modèle `claude-sonnet-4-6`
- **OpenAI** : `https://api.openai.com/v1/chat/completions` — modèle `gpt-4o`
- Extensible : ajouter un provider = ajouter un bloc dans `server.js`

---

## 4. Frontend — `index.html`

**Stack :** HTML/CSS/JS vanilla. Librairies via CDN uniquement :
- `html2canvas` — capture HTML → PNG
- Inter ou Geist — police via Google Fonts CDN

**Layout global :**
- Header : logo StellarPulse, dropdown provider, champ clé API (masqué), bouton "Extraire thème visuel"
- 4 onglets : `Instagram Carousel` | `Instagram Story` | `LinkedIn` | `Tweet`

**Layout par onglet (3 colonnes) :**
```
┌─────────────────┬──────────────────────┬─────────────────┐
│   BRIEF INPUT   │      PREVIEW         │    ACTIONS      │
│ • Sujet/thème   │  Rendu HTML stylé    │ ▼ Télécharger   │
│ • Ton           │  (selon design.md)   │   PNG           │
│ • Hashtags      │                      │                 │
│ • Instructions  │  ← → navigation      │ ⧉ Copier texte  │
│   libres        │  slides (carousel)   │                 │
│                 │                      │ ↺ Régénérer     │
│ [Générer]       │                      │                 │
└─────────────────┴──────────────────────┴─────────────────┘
```

**Design de l'interface :**
- Dark mode, palette zinc/slate
- Accent couleur violet/indigo (outil professionnel CM)
- Police Inter via CDN
- États : loading spinner pendant génération, erreur si clé API manquante

---

## 5. Formats de sortie par plateforme

| Plateforme | Format preview | Export | Dimensions |
|------------|---------------|--------|------------|
| Instagram Carousel | Slides HTML stylés, navigation ← → | PNG par slide | 1080×1080px |
| Instagram Story | Div HTML 9:16 stylé | PNG unique | 1080×1920px |
| LinkedIn Post | Texte formaté + aperçu | Copier texte + PNG illustration | — |
| Tweet | Texte ≤280 chars | Copier texte + PNG illustration | — |

**PNG export :** html2canvas capture la div preview → `canvas.toBlob()` → `<a download>` déclenché programmatiquement.

---

## 6. Fichiers `lab/`

### `lab/design.md`
Template que le CM remplit une fois pour sa marque :
- Palette couleurs (hex)
- Typographies
- Ton visuel (minimaliste, bold, coloré…)
- Éléments de marque (logo description, icônes récurrents)
- Style visuel (photo réaliste, illustration, flat design…)
- Références de posts inspirants

### `lab/content.md`
Brief contenu permanent :
- Nom de la marque / projet
- Audience cible (persona)
- Piliers de contenu (éducation, inspiration, promotion, coulisses…)
- Ton éditorial
- Sujets à éviter
- CTA récurrents
- Exemples de bons posts passés

### `lab/prompts/carousel.md`
System prompt incluant :
- Rôle IA : expert contenu Instagram
- Contraintes format : N slides (configurable), slide 1 = accroche, slide finale = CTA
- Instruction de lire `design.md` et `content.md` (injectés dans le contexte)
- Format de sortie JSON strict : `[{ slide, title, body, bg_color, text_color, emoji }]`

### `lab/prompts/theme-extract.md`
Prompt d'analyse visuelle :
- Input : texte ou description d'un post existant
- Output structuré : palette hex, style typo, ambiance, mots-clés visuels, suggestions pour `design.md`

---

## 7. Gestion de la configuration

`config.json` (non versionné) :
```json
{
  "provider": "claude",
  "apiKey": "sk-ant-...",
  "model": "claude-sonnet-4-6"
}
```

La clé API est également sauvegardée en `localStorage` pour survie au rechargement sans redemander.

---

## 8. Ce qui est hors scope (v1)

- Auto-publication sur les réseaux (v2 — scripts Python)
- Authentification utilisateurs
- Historique des générations
- Scheduling / calendrier éditorial
- Support mobile (interface desktop uniquement)
- Génération d'images via Stable Diffusion local

---

## 9. Documentation à créer

- `README.md` — installation (juste `node server.js`), structure, usage
- `roadmap.md` — v1 → v2 → v3 features
- `todo.md` — tâches de développement v1
- `state.md` — état courant du projet (ce qui est fait / en cours / bloqué)
