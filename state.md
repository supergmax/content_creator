# État du projet — StellarPulse Content Creator

**Dernière mise à jour :** 2026-03-31  
**Version courante :** v1.0.0-dev  
**Statut :** 🟡 En développement

---

## État actuel

### Infrastructure
| Composant | Statut | Notes |
|-----------|--------|-------|
| `server.js` | ✅ Implémenté | Node.js stdlib, routes /api/* |
| `index.html` | ✅ Implémenté | SPA 4 tabs, dark mode |
| `lab/design.md` | ✅ Template créé | À personnaliser par le CM |
| `lab/content.md` | ✅ Template créé | À personnaliser par le CM |
| Prompts (5 fichiers) | ✅ Créés | carousel, story, linkedin, tweet, theme-extract |

### Fonctionnalités
| Feature | Statut | Notes |
|---------|--------|-------|
| Config provider/clé | ✅ Fonctionnel | localStorage + config.json |
| Instagram Carousel | ✅ Implémenté | JSON → slides HTML → PNG export |
| Instagram Story | ✅ Implémenté | JSON → div 9:16 → PNG export |
| LinkedIn Post | ✅ Implémenté | Texte + copy + illustration |
| Tweet | ✅ Implémenté | Texte + char counter + copy + illustration |
| Extraction thème | ✅ Implémenté | Modal + résultats structurés |
| Export PNG Carousel | ✅ Implémenté | html2canvas, 1080×1080 |
| Export PNG Story | ✅ Implémenté | html2canvas, 1080×1920 |
| Image DALL-E (OpenAI) | ✅ Implémenté | Fallback prompt si Claude |
| Image Claude | ⚠️ Fallback | Affiche le prompt pour usage manuel |

---

## Providers supportés

| Provider | Texte | Image |
|----------|-------|-------|
| Claude (Anthropic) | ✅ | ⚠️ Prompt uniquement (pas de génération) |
| OpenAI | ✅ | ✅ DALL-E 3 |

---

## Problèmes connus

- Les images DALL-E sont temporaires (URL expirante ~1h) — téléchargez rapidement
- html2canvas peut avoir du mal avec certaines polices Google Fonts si hors ligne
- Le serveur doit rester ouvert dans le terminal pendant l'utilisation

---

## Prochaine étape

Tester l'application avec de vraies clés API et valider les exports PNG.
Voir `todo.md` pour la liste complète des tests à effectuer.
