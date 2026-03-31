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
Design de référence : **dark tech 4:5 portrait** extrait de `lab/design.md` (section "Style Instagram Carousel").

### Format et palette

- **Dimensions** : 1080 × 1350 px (ratio 4:5 portrait Instagram)
- **Fond base** : `#020810`
- **Accent cyan** : `#00d4ff` (slides impaires) / **Accent rose** : `#ff2d78` (slides paires)
- **Alternance** : intro = cyan, contenu 1 = cyan, contenu 2 = rose, contenu 3 = cyan … CTA = dégradé
- **Titres** : Rajdhani Bold 700 — **Corps** : Inter Regular 400

### Structure de chaque slide

```
[ grand numéro de slide — top-left, 310px, accent 18% opacité ]
[ blob radial-gradient ambient light en background ]
[ overlay gradient : transparent 38% → rgba(2,8,16,0.97) 100% ]
[ contenu ancré en bas : badge · cmd-tag optionnel · titre · corps ]
[ nav-bar : dots + "SWIPE →" ]
```

### JSON étendu à générer

Adapte le JSON pour le design dark-tech :

```json
[
  {
    "slide": 1, "accent": "#00d4ff",
    "badge": "• INTRO",
    "cmd": null,
    "title": "Titre accroche",
    "body": "Corps avec <span class=\"c\">mots-clés cyan</span> ou <span class=\"p\">rose</span>.",
    "is_cta": false
  },
  {
    "slide": 2, "accent": "#00d4ff",
    "badge": "• COMMANDE 01",
    "cmd": "/commande",
    "title": "Titre slide",
    "body": "Explication avec highlights.",
    "is_cta": false
  },
  {
    "slide": 5, "accent": "#ff2d78",
    "badge": null, "cmd": null,
    "title": "Save ce post 💾",
    "body": "Sous-titre CTA court",
    "is_cta": true
  }
]
```

### Template HTML complet

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Carousel — [sujet]</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #020810;
      display: flex; flex-direction: column; align-items: center;
      padding: 2.5rem; gap: 2rem;
    }

    /* ── Slide base ── */
    .slide {
      width: 1080px; height: 1350px;
      position: relative; overflow: hidden;
      display: none; flex-shrink: 0;
      background: #020810;
    }
    .slide.active { display: flex; }

    /* Background blob */
    .bg-blob {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 70% 55% at 72% 28%, ACCENT_BLOB 0%, transparent 68%);
    }
    /* Gradient overlay */
    .overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 38%, rgba(2,8,16,0.97) 100%);
    }
    /* Grain texture */
    .slide::after {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.038; pointer-events: none; z-index: 10;
    }

    /* Big slide number */
    .big-num {
      position: absolute; top: 36px; left: 52px;
      font-family: 'Rajdhani', sans-serif; font-weight: 700;
      font-size: 310px; line-height: 1;
      color: ACCENT_COLOR; opacity: 0.18;
      z-index: 1; user-select: none;
    }

    /* Content zone — anchored to bottom */
    .content {
      position: absolute; bottom: 112px; left: 72px; right: 72px;
      z-index: 5; display: flex; flex-direction: column; gap: 22px;
    }
    .badge {
      display: inline-flex; align-items: center;
      border: 1px solid ACCENT_COLOR; border-radius: 999px;
      padding: 6px 20px; width: fit-content;
      font-family: 'Inter', sans-serif; font-size: 14px;
      font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
      color: ACCENT_COLOR;
    }
    .cmd-tag {
      display: inline-flex; align-items: center;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px; padding: 14px 28px; width: fit-content;
      font-family: 'Rajdhani', sans-serif; font-size: 72px; font-weight: 700;
      color: #ffffff; letter-spacing: 0.01em; line-height: 1;
    }
    .slide-title {
      font-family: 'Rajdhani', sans-serif; font-weight: 700;
      font-size: 78px; line-height: 1.1; color: #ffffff;
    }
    .slide-body {
      font-family: 'Inter', sans-serif; font-size: 31px;
      line-height: 1.55; color: rgba(255,255,255,0.76);
    }
    .slide-body .c { color: #00d4ff; }
    .slide-body .p { color: #ff2d78; }

    /* Navigation bar */
    .nav-bar {
      position: absolute; bottom: 52px; left: 72px; right: 72px;
      z-index: 5; display: flex; justify-content: space-between; align-items: center;
    }
    .dots { display: flex; gap: 8px; align-items: center; }
    .dot {
      width: 5px; height: 5px; border-radius: 999px;
      background: rgba(255,255,255,0.25); cursor: pointer;
      transition: width 0.2s, background 0.2s;
    }
    .dot.active { width: 28px; }
    .swipe-hint {
      font-family: 'Inter', sans-serif; font-size: 12px;
      font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
      color: rgba(255,255,255,0.38);
    }
    .swipe-hint.hide { visibility: hidden; }

    /* CTA slide */
    .cta-zone {
      position: absolute; bottom: 112px; left: 72px; right: 72px;
      z-index: 5; display: flex; flex-direction: column;
      align-items: center; text-align: center; gap: 28px;
    }
    .cta-title {
      font-family: 'Rajdhani', sans-serif; font-weight: 700;
      font-size: 84px; line-height: 1.05; color: #ffffff;
    }
    .cta-sep {
      width: 52px; height: 2px;
      background: linear-gradient(to right, #ff2d78, #00d4ff);
    }
    .cta-btn {
      border: 1px solid rgba(255,255,255,0.42); border-radius: 12px;
      padding: 18px 48px;
      font-family: 'Rajdhani', sans-serif; font-size: 32px;
      font-weight: 600; color: #ffffff; letter-spacing: 0.06em;
    }
    .brand {
      font-family: 'Rajdhani', sans-serif; font-weight: 700;
      font-size: 54px; letter-spacing: 0.12em;
      background: linear-gradient(to right, #ff2d78, #9333ea, #00d4ff);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .brand-handle {
      font-family: 'Inter', sans-serif; font-size: 20px;
      color: rgba(255,255,255,0.4); letter-spacing: 0.04em;
    }
    .brand-handle span { margin: 0 8px; }

    /* Controls */
    .controls {
      display: flex; gap: 1rem; align-items: center;
    }
    .controls button {
      background: #18181b; border: 1px solid #3f3f46; color: #fafafa;
      padding: 0.5rem 1.25rem; border-radius: 8px;
      font-size: 18px; cursor: pointer; font-family: inherit;
      transition: background 0.15s;
    }
    .controls button:hover { background: #27272a; }
    .ctrl-ctr { color: #52525b; font-size: 13px; min-width: 48px; text-align: center; }
    .hint { color: #3f3f46; font-size: 11px; }

    /* Export bar */
    .export-bar { display: flex; gap: 0.75rem; align-items: center; }
    .export-bar button {
      background: #18181b; border: 1px solid #3f3f46; color: #a1a1aa;
      padding: 0.45rem 1.1rem; border-radius: 8px;
      font-size: 12px; cursor: pointer; font-family: 'Inter', sans-serif;
      display: flex; align-items: center; gap: 0.4rem;
      transition: background 0.15s, color 0.15s;
    }
    .export-bar button:hover { background: #27272a; color: #fafafa; }
    .export-bar button:disabled { opacity: 0.45; cursor: not-allowed; }
    .export-bar .spin {
      width: 12px; height: 12px;
      border: 2px solid currentColor; border-top-color: transparent;
      border-radius: 50%; display: none;
      animation: spin 0.6s linear infinite;
    }
    .export-bar button.loading .spin { display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media print {
      .controls, .export-bar, .hint { display: none; }
      body { padding: 0; gap: 0; background: #000; }
      .slide { display: block !important; page-break-after: always; }
    }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════
     Générer un .slide par entrée JSON.
     Remplacer ACCENT_COLOR et ACCENT_BLOB par la couleur de la slide.
     ACCENT_BLOB = même couleur avec ~20% opacité pour le radial-gradient.
     Slide CTA : utiliser .cta-zone au lieu de .content.
     Ajouter class="active" sur la slide 1 seulement.
     Adapter les dots et le "SWIPE →" (caché sur la dernière slide).
═══════════════════════════════════════════════════════ -->

<!-- SLIDE 1 — INTRO (cyan, active) -->
<div class="slide active">
  <div class="bg-blob" style="background:radial-gradient(ellipse 70% 55% at 72% 28%,rgba(0,212,255,0.22) 0%,transparent 68%)"></div>
  <div class="overlay"></div>
  <div class="big-num" style="color:#00d4ff">1</div>
  <div class="content">
    <div class="badge" style="border-color:#00d4ff;color:#00d4ff">• INTRO</div>
    <div class="slide-title">Titre accroche forte</div>
    <div class="slide-body">Corps avec <span class="c">mots-clés</span> mis en avant.</div>
  </div>
  <div class="nav-bar">
    <div class="dots" id="dots-0"></div>
    <div class="swipe-hint">Swipe →</div>
  </div>
</div>

<!-- SLIDE 2 — COMMANDE (cyan) -->
<div class="slide">
  <div class="bg-blob" style="background:radial-gradient(ellipse 70% 55% at 72% 28%,rgba(0,212,255,0.22) 0%,transparent 68%)"></div>
  <div class="overlay"></div>
  <div class="big-num" style="color:#00d4ff">2</div>
  <div class="content">
    <div class="badge" style="border-color:#00d4ff;color:#00d4ff">• COMMANDE 01</div>
    <div class="cmd-tag">/commande</div>
    <div class="slide-title">Titre slide</div>
    <div class="slide-body">Corps de la slide avec <span class="c">highlights cyan</span>.</div>
  </div>
  <div class="nav-bar">
    <div class="dots" id="dots-1"></div>
    <div class="swipe-hint">Swipe →</div>
  </div>
</div>

<!-- SLIDE N — CTA (dégradé, dernière) -->
<div class="slide">
  <div class="bg-blob" style="background:radial-gradient(ellipse 70% 55% at 50% 25%,rgba(255,45,120,0.18) 0%,rgba(147,51,234,0.14) 50%,transparent 70%)"></div>
  <div class="overlay"></div>
  <div class="cta-zone">
    <div class="cta-title">Save ce post 💾</div>
    <div class="cta-sep"></div>
    <div class="cta-btn">🚀 Sous-titre CTA</div>
    <div class="brand">STELLARPULSE</div>
    <div class="brand-handle">@stellarpulse0<span>|</span>stellarpulse.fr</div>
  </div>
  <div class="nav-bar">
    <div class="dots" id="dots-N"></div>
    <div class="swipe-hint hide">Swipe →</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     CONTRÔLES PREVIEW
═══════════════════════════════════════════════════════ -->
<div class="controls">
  <button onclick="prev()">←</button>
  <span class="ctrl-ctr" id="ctr">1 / N</span>
  <button onclick="next()">→</button>
</div>
<div class="export-bar">
  <button id="btn-slide" onclick="exportCurrent()"><span class="spin"></span>⬇ Slide PNG</button>
  <button id="btn-all" onclick="exportAll()"><span class="spin"></span>⬇ Toutes (PNG)</button>
</div>
<p class="hint">← → pour naviguer · PNG via html2canvas</p>

<script>
  const SLIDES = document.querySelectorAll('.slide');
  // Tableau des couleurs accent par slide (remplacer par les vraies couleurs)
  const ACCENT = ['#00d4ff', '#00d4ff', /* ... */ '#ff2d78'];
  let idx = 0;

  // Construire les dot-bars dans chaque slide
  SLIDES.forEach((_, i) => {
    const bar = document.getElementById('dots-' + i);
    SLIDES.forEach((__, j) => {
      const d = document.createElement('div');
      d.className = 'dot' + (j === i ? ' active' : '');
      d.style.background = j === i ? ACCENT[i] : 'rgba(255,255,255,0.25)';
      d.onclick = () => show(j);
      bar.appendChild(d);
    });
  });

  function show(i) {
    SLIDES.forEach((s, j) => s.classList.toggle('active', j === i));
    document.getElementById('ctr').textContent = `${i + 1} / ${SLIDES.length}`;
    idx = i;
  }
  function next() { if (idx < SLIDES.length - 1) show(idx + 1); }
  function prev() { if (idx > 0) show(idx - 1); }
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // ── PNG Export ──────────────────────────────────────────
  async function exportSlide(i) {
    const slide = SLIDES[i];
    const hidden = !slide.classList.contains('active');
    if (hidden) {
      slide.style.display = 'flex';
      await new Promise(r => requestAnimationFrame(r));
    }
    const canvas = await html2canvas(slide, {
      scale: 1, useCORS: true, allowTaint: true,
      backgroundColor: null, width: 1080, height: 1350
    });
    if (hidden) slide.style.display = '';
    const link = document.createElement('a');
    link.download = `slide-${i + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function exportCurrent() {
    const btn = document.getElementById('btn-slide');
    btn.classList.add('loading'); btn.disabled = true;
    try { await exportSlide(idx); }
    finally { btn.classList.remove('loading'); btn.disabled = false; }
  }

  async function exportAll() {
    const btn = document.getElementById('btn-all');
    btn.classList.add('loading'); btn.disabled = true;
    try {
      for (let i = 0; i < SLIDES.length; i++) {
        await exportSlide(i);
        await new Promise(r => setTimeout(r, 300));
      }
    } finally { btn.classList.remove('loading'); btn.disabled = false; }
  }
</script>
</body>
</html>
```

**Important :** Injecte le contenu réel des slides généré — remplace les placeholders, adapte les `dots-N` et le tableau `ACCENT`, supprime les commentaires dans le HTML final.
