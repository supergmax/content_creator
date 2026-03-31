# Skill : Générer un Carousel Instagram

## Ce que tu dois faire

1. **Lis** `lab/design.md` et `lab/content.md`
2. **Lis** `lab/prompts/carousel.md` (system prompt + format JSON attendu)
3. **Demande** à l'utilisateur si ces infos ne sont pas dans sa requête :
   - Sujet / thème principal
   - Ton : éducatif | inspirant | professionnel | décalé | storytelling
   - Nombre de slides : 5 | 7 | 10 (défaut : 7)
   - Hashtags souhaités (optionnel)
   - Instructions libres (optionnel)

4. **Génère** le contenu JSON en respectant scrupuleusement le format du prompt :
   ```json
   [
     { "slide": 1, "title": "...", "body": "...", "bg_color": "#...", "text_color": "#...", "emoji": "..." },
     ...
   ]
   ```
   Génère EXACTEMENT le nombre de slides demandé. Slide 1 = accroche forte. Dernière slide = CTA.

5. **Génère** un fichier HTML standalone et sauvegarde-le dans `carousel/` :
   - Nom du fichier : `carousel_YYYY-MM-DD_[sujet-en-slug].html`
   - Voir la section "Template HTML" ci-dessous

6. **Affiche** dans le terminal :
   - Le texte de chaque slide (titre + corps)
   - Le chemin du fichier HTML créé
   - Les hashtags suggérés

---

## Template HTML à générer

Le fichier HTML doit être standalone (tout inline), utilisable sans serveur.

Structure :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Carousel — [sujet]</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #09090b; display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 1.5rem; }
    .slide {
      width: 1080px; height: 1080px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px; text-align: center;
      position: relative;
      /* bg_color et text_color du JSON injectés en style inline */
    }
    .slide-num { position: absolute; bottom: 36px; right: 56px; font-size: 20px; opacity: 0.35; font-weight: 500; }
    .emoji { font-size: 60px; margin-bottom: 28px; line-height: 1; }
    .title { font-size: 54px; font-weight: 700; line-height: 1.2; margin-bottom: 28px; letter-spacing: -0.02em; }
    .title.small { font-size: 46px; }
    .body { font-size: 28px; line-height: 1.55; opacity: 0.88; max-width: 850px; }
    .nav { display: flex; gap: 1rem; align-items: center; }
    .nav button { background: #27272a; border: 1px solid #3f3f46; color: #fafafa; padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 18px; cursor: pointer; font-family: inherit; }
    .nav button:hover { background: #3f3f46; }
    .counter { color: #a1a1aa; font-size: 14px; min-width: 60px; text-align: center; }
    .hint { color: #71717a; font-size: 12px; margin-top: 0.5rem; }
    @media print { .nav, .hint { display: none; } body { padding: 0; gap: 0; background: white; } .slide { page-break-after: always; } }
  </style>
</head>
<body>

<!-- Générer un div .slide par entrée du JSON, avec style="background:[bg_color];color:[text_color]" -->
<!-- Exemple pour slide index i : -->
<!--
<div class="slide" id="slide-0" style="background:#1a1a2e;color:#ffffff;" [display:none si i>0]>
  <div class="emoji">✨</div>
  <div class="title">Titre de la slide</div>
  <div class="body">Corps du texte de la slide</div>
  <div class="slide-num">1/7</div>
</div>
-->

<div class="nav">
  <button onclick="prev()">←</button>
  <span class="counter" id="ctr">1 / N</span>
  <button onclick="next()">→</button>
</div>
<p class="hint">Touches ← → pour naviguer • Ctrl+P pour exporter en PDF</p>

<script>
  const slides = document.querySelectorAll('.slide');
  let idx = 0;
  function show(i) {
    slides.forEach((s, j) => s.style.display = j === i ? 'flex' : 'none');
    document.getElementById('ctr').textContent = `${i+1} / ${slides.length}`;
    idx = i;
  }
  function next() { if (idx < slides.length - 1) show(idx + 1); }
  function prev() { if (idx > 0) show(idx - 1); }
  document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
  show(0);
</script>
</body>
</html>
```

**Important :** Injecte le contenu réel des slides généré — ne laisse pas les commentaires placeholder dans le fichier final.
