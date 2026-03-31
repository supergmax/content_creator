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

## Utilisation avec Claude Code (sans clé API)

Si vous avez [Claude Code](https://claude.ai/code) installé, vous pouvez générer du contenu directement depuis le terminal — sans lancer `server.js`, sans clé API séparée.

### Prérequis

```bash
npm install -g @anthropic-ai/claude-code   # ou : claude (si déjà installé)
```

### Lancement

```bash
# Dans le dossier content_creator/
claude
```

Claude Code lit automatiquement `CLAUDE.md` au démarrage : il connaît la structure du projet et sait lire `lab/design.md` + `lab/content.md` avant chaque génération.

### Exemples de commandes

```
"génère un carousel Instagram sur les 5 erreurs marketing à éviter"
"génère une story Instagram pour annoncer notre nouveau produit, ton dynamique"
"génère un post LinkedIn sur le leadership à distance, ton authentique"
"génère un tweet percutant sur l'IA dans le marketing, avec hashtags"
"analyse le thème visuel de : fond sombre, typographie bold, couleurs violet et blanc"
```

### Workflows disponibles (`skills/`)

| Fichier | Ce que Claude Code fait |
|---------|------------------------|
| `skills/carousel.md` | JSON + fichier HTML avec navigation slides → `carousel/` |
| `skills/story.md` | JSON + fichier HTML format 9:16 → `story/` |
| `skills/linkedin.md` | Texte + prompt illustration → `linkedin_post/` |
| `skills/tweet.md` | Tweet avec compteur de caractères → `tweet/` |
| `skills/extract-theme.md` | Palette + style + suggestion pour `lab/design.md` |

### Export PNG (carousel / story)

Claude Code génère un fichier HTML standalone dans le dossier correspondant.  
Pour l'exporter en image :
1. Ouvrir le fichier `.html` dans Chrome
2. **Ctrl+Shift+P** → "Capture screenshot" (DevTools)  
   ou **Ctrl+P** → "Enregistrer en PDF"

---

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

## Notes importantes

- Le bouton **⬇ Tous** du carousel télécharge chaque slide individuellement (pas de ZIP)
- Les URLs d'images DALL-E expirent après ~1h — téléchargez vos illustrations rapidement
- html2canvas peut avoir du mal avec les polices Google Fonts si vous êtes hors ligne
- Le terminal doit rester ouvert pendant l'utilisation (il fait tourner le serveur)

## Notes de sécurité

- `config.json` est dans `.gitignore` — ne le commitez pas
- La clé API n'est jamais exposée dans le frontend
- Le serveur écoute uniquement sur `127.0.0.1` (local uniquement)
