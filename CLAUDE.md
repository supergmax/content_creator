# StellarPulse Content Creator — Claude Code

Ce projet génère du contenu social media via IA pour community managers.

## Deux modes d'utilisation

| Mode | Comment | Quand |
|------|---------|-------|
| **Claude Code** (ce mode) | `claude` dans ce dossier — pas de clé API, pas de serveur | Génération rapide en terminal |
| **Interface web** | `node server.js` → http://localhost:3000 | Prévisualisation visuelle + export PNG |

## Avant de générer

Remplis ces deux fichiers une fois pour ta marque :

- **`lab/design.md`** — Charte graphique (couleurs hex, typographies, style visuel)
- **`lab/content.md`** — Brief contenu (marque, audience, ton éditorial, piliers, CTA)

## Commandes de génération

Dis simplement ce que tu veux générer :

```
"génère un carousel Instagram sur [sujet]"
"génère une story Instagram pour [sujet]"
"génère un post LinkedIn sur [sujet]"
"génère un tweet sur [sujet]"
"analyse le thème visuel de : [description d'un post]"
```

Claude Code lit automatiquement `lab/design.md` et `lab/content.md` pour respecter ta charte.

## Skills disponibles

Les workflows de génération sont dans `skills/` :

| Skill | Usage | Sortie |
|-------|-------|--------|
| `skills/carousel.md` | Instagram Carousel | HTML standalone dans `carousel/` |
| `skills/story.md` | Instagram Story | HTML standalone dans `story/` |
| `skills/linkedin.md` | Post LinkedIn | Fichier `.md` dans `linkedin_post/` |
| `skills/tweet.md` | Tweet / X | Fichier `.txt` dans `tweet/` |
| `skills/extract-theme.md` | Extraction de thème visuel | Suggestions pour `lab/design.md` |

## Export PNG (carousel / story)

Claude Code génère un fichier HTML standalone.  
Pour l'exporter en PNG :
1. Ouvre le fichier HTML dans Chrome
2. Ctrl+Shift+P → "Capture screenshot" ou installe l'extension "Full Page Screenshot"
3. Ou : Ctrl+P → "Enregistrer en PDF" si PNG non disponible

## Structure du projet

```
content_creator/
├── CLAUDE.md           ← ce fichier (contexte pour Claude Code)
├── skills/             ← workflows de génération
├── lab/
│   ├── design.md       ← REMPLIR : charte graphique
│   ├── content.md      ← REMPLIR : brief contenu
│   └── prompts/        ← prompts système (ne pas modifier)
├── carousel/           ← sorties carousel (HTML)
├── story/              ← sorties story (HTML)
├── linkedin_post/      ← sorties LinkedIn (.md)
└── tweet/              ← sorties tweet (.txt)
```
