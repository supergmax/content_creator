# Skill : Générer une Story Instagram

## Ce que tu dois faire

1. **Lis** `lab/design.md` et `lab/content.md`
2. **Lis** `lab/prompts/story.md` (system prompt + format JSON attendu)
3. **Demande** à l'utilisateur si ces infos ne sont pas dans sa requête :
   - Sujet / contenu principal de la story
   - Ton : dynamique | inspirant | promotionnel | informatif
   - Call-to-action (ex: "Lien en bio 👆", "Voir le sticker lien 👆")
   - Instructions libres (optionnel)

4. **Génère** le contenu JSON en respectant le format du prompt :
   ```json
   {
     "title": "...",
     "subtitle": "...",
     "body": "...",
     "cta": "...",
     "bg_color": "#...",
     "text_color": "#...",
     "accent_color": "#...",
     "emoji": "..."
   }
   ```

5. **Génère** un fichier HTML standalone et sauvegarde-le dans `story/` :
   - Nom du fichier : `story_YYYY-MM-DD_[sujet-en-slug].html`
   - Voir la section "Template HTML" ci-dessous

6. **Affiche** dans le terminal :
   - Le contenu généré (titre, sous-titre, corps, CTA)
   - Le chemin du fichier HTML créé

---

## Template HTML à générer

Format 9:16 — ratio Instagram Story (1080×1920px).

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Story — [sujet]</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #09090b; display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 1rem; }
    .story {
      width: 1080px; height: 1920px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 120px 80px; text-align: center;
      /* background et color du JSON injectés en style inline */
    }
    .emoji { font-size: 80px; margin-bottom: 48px; line-height: 1; }
    .title { font-size: 72px; font-weight: 800; line-height: 1.1; margin-bottom: 32px; letter-spacing: -0.025em; }
    .subtitle { font-size: 38px; opacity: 0.8; margin-bottom: 32px; font-weight: 500; }
    .body-text { font-size: 34px; line-height: 1.6; opacity: 0.85; max-width: 900px; }
    .cta {
      margin-top: 80px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
      padding: 28px 56px;
      border-radius: 60px;
      font-size: 34px; font-weight: 600;
    }
    .hint { color: #71717a; font-size: 12px; }
    @media print { .hint { display: none; } body { padding: 0; background: white; } }
  </style>
</head>
<body>

<!-- Générer la div .story avec les valeurs du JSON injectées -->
<!-- style="background:[bg_color];color:[text_color]" -->
<!--
<div class="story" style="background:#6d28d9;color:#ffffff;">
  <div class="emoji">🚀</div>
  <div class="title">Titre principal</div>
  <div class="subtitle">Sous-titre optionnel</div>
  <div class="body-text">Corps du message</div>
  <div class="cta">Lien en bio 👆</div>
</div>
-->

<p class="hint">Ctrl+P pour exporter en PDF / screenshot</p>
</body>
</html>
```

**Important :** Injecte le contenu réel généré — ne laisse pas les commentaires placeholder dans le fichier final. Si `subtitle` est vide, n'ajoute pas la div `.subtitle`. Si `cta` est vide, n'ajoute pas la div `.cta`.
