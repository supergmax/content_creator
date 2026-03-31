# ⚡ StellarPulse Content Creator

Plateforme locale de création de contenu social media assistée par IA.  
Générez des carousels Instagram, stories, posts LinkedIn et tweets en quelques secondes.

## Prérequis

- [Node.js](https://nodejs.org) 18+ installé
- Une clé API Claude (Anthropic) ou OpenAI

## Lancement

```bash
# Dans le dossier content_creator/
node server.js
```

Puis ouvrir **http://localhost:3000** dans votre navigateur.

## Configuration

1. Sélectionnez votre provider (Claude ou OpenAI) dans le header
2. Entrez votre clé API (elle sera sauvegardée localement dans `config.json`)
3. Cliquez sur **Sauvegarder**
4. Le point vert indique que la clé est configurée

## Personnalisation

Avant de générer du contenu, remplissez ces deux fichiers avec les informations de votre marque :

- **`lab/design.md`** — Charte graphique : couleurs, typographies, style visuel
- **`lab/content.md`** — Brief contenu : marque, audience, ton éditorial, piliers

### Modifier les prompts

Les prompts système de chaque plateforme sont dans `lab/prompts/` :

| Fichier | Usage |
|---------|-------|
| `carousel.md` | Instagram Carousel |
| `story.md` | Instagram Story |
| `linkedin.md` | Post LinkedIn |
| `tweet.md` | Tweet / X |
| `theme-extract.md` | Extraction de thème visuel |

## Formats d'export

| Plateforme | Format | Dimensions |
|------------|--------|------------|
| Instagram Carousel | PNG par slide | 1080×1080 px |
| Instagram Story | PNG | 1080×1920 px |
| LinkedIn | Copier-coller + PNG illustration | — |
| Tweet | Copier-coller + PNG illustration | — |

## Extraction de thème visuel

Cliquez sur **🎨 Extraire thème** dans le header pour analyser un post existant et extraire sa palette de couleurs, son style typographique et son ambiance. Copiez la suggestion pour enrichir votre `lab/design.md`.

## Structure du projet

```
content_creator/
├── index.html          # Interface principale
├── server.js           # Serveur Node.js (port 3000)
├── config.json         # Clé API (non versionné)
├── lab/
│   ├── design.md       # Charte graphique
│   ├── content.md      # Brief contenu
│   └── prompts/        # Prompts système par plateforme
├── carousel/           # Exports carousel
├── story/              # Exports story
├── linkedin_post/      # Exports LinkedIn
└── tweet/              # Exports tweet
```

## Notes de sécurité

- `config.json` est dans `.gitignore` — ne le commitez pas
- La clé API n'est jamais exposée dans le frontend
- Le serveur écoute uniquement sur `127.0.0.1` (local uniquement)
