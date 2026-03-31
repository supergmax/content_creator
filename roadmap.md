# Roadmap — StellarPulse Content Creator

## v1 — MVP Local (actuel)

**Objectif :** Interface fonctionnelle en local, génération de contenu pour 4 plateformes.

- [x] Interface HTML/CSS/JS dark mode avec 4 onglets
- [x] Backend Node.js sans dépendances (stdlib uniquement)
- [x] Support Claude (Anthropic) + OpenAI
- [x] Instagram Carousel — génération JSON + preview + export PNG 1080×1080
- [x] Instagram Story — génération JSON + preview 9:16 + export PNG 1080×1920
- [x] Post LinkedIn — texte formaté + copier-coller + illustration (OpenAI)
- [x] Tweet — texte ≤280 chars + copier-coller + illustration (OpenAI)
- [x] Extraction de thème visuel depuis un post existant
- [x] Fichiers `lab/design.md` et `lab/content.md` comme contexte de marque
- [x] Système de prompts modulaires dans `lab/prompts/`
- [x] Config provider/clé API via header + localStorage + config.json

## v2 — Améliorations UX + Multi-images

**Objectif :** Expérience plus fluide, plus de contrôle sur les visuels.

- [ ] Galerie des générations passées (localStorage ou fichiers JSON)
- [ ] Éditeur de slide en place (modifier titre/corps sans régénérer)
- [ ] Choix du template visuel par slide (3-4 layouts prédéfinis)
- [ ] Upload d'une image de fond pour les slides
- [ ] Export ZIP automatique pour le carousel (au lieu de slides séparés)
- [ ] Support Mistral AI comme provider supplémentaire
- [ ] Mode "fil Twitter" (thread de 4-6 tweets liés)
- [ ] Prévisualisation mobile responsive dans l'UI
- [ ] Raccourcis clavier pour toutes les actions

## v3 — Auto-publication + Scheduling

**Objectif :** Publication directe depuis la plateforme.

- [ ] Script Python `publish_instagram.py` (Instagrapi)
- [ ] Script Python `publish_linkedin.py` (API LinkedIn)
- [ ] Script Python `publish_twitter.py` (API X/Twitter)
- [ ] Calendrier éditorial visuel (vue semaine/mois)
- [ ] Scheduling : programmer une publication à une date/heure précise
- [ ] Tableau de bord multi-comptes
- [ ] Intégration Canva API pour templates professionnels
- [ ] Analytics basiques (performances des posts publiés)

## v4 — Plateforme SaaS

**Objectif :** Version multi-utilisateurs déployée en ligne.

- [ ] Authentification utilisateurs
- [ ] Workspaces par marque/client
- [ ] Gestion des membres de l'équipe
- [ ] Plans et facturation
- [ ] Déploiement Vercel / cloud
- [ ] API publique pour intégrations tierces
