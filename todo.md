# Todo — v1 Development

## ✅ Complété

- [x] Spec de design validée
- [x] Plan d'implémentation rédigé
- [x] Scaffold projet (.gitignore, config.json, structure dossiers)
- [x] server.js — serveur HTTP Node.js stdlib
- [x] server.js — route GET /api/config
- [x] server.js — route POST /api/config
- [x] server.js — route POST /api/generate (Claude + OpenAI)
- [x] server.js — route POST /api/image (DALL-E 3 / prompt fallback)
- [x] lab/design.md — template charte graphique
- [x] lab/content.md — template brief contenu
- [x] lab/prompts/carousel.md
- [x] lab/prompts/story.md
- [x] lab/prompts/linkedin.md
- [x] lab/prompts/tweet.md
- [x] lab/prompts/theme-extract.md
- [x] index.html — layout dark mode + CSS variables
- [x] index.html — header config (provider, clé API, status dot)
- [x] index.html — système d'onglets (4 tabs)
- [x] index.html — tab Carousel (brief + preview + navigation + PNG export)
- [x] index.html — tab Story (brief + preview 9:16 + PNG export)
- [x] index.html — tab LinkedIn (brief + text preview + copy + illustration)
- [x] index.html — tab Tweet (brief + char counter + copy + illustration)
- [x] index.html — modal extraction de thème visuel
- [x] README.md
- [x] roadmap.md
- [x] todo.md
- [x] state.md

## 🔄 En cours / À tester

- [ ] Test end-to-end avec clé Claude réelle
- [ ] Test end-to-end avec clé OpenAI réelle
- [ ] Vérifier export PNG carousel à 1080×1080
- [ ] Vérifier export PNG story à 1080×1920
- [ ] Vérifier génération image DALL-E + download

## 📋 Backlog v1 (nice to have)

- [ ] Améliorer le rendu des slides (background gradient option)
- [ ] Ajouter un bouton "Copier le prompt image" pour Claude users
- [ ] Message d'erreur plus détaillé si la clé API est invalide
- [ ] Validation du format JSON retourné par l'IA avec fallback propre
