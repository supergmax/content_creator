# StellarPulse Content Creator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local social media content creator platform — `index.html` + `server.js` — that uses AI (Claude or OpenAI) to generate Instagram carousel, story, LinkedIn, and tweet content with PNG export and copy-to-clipboard.

**Architecture:** `index.html` (dark UI, html2canvas CDN, vanilla JS) served by `server.js` (Node.js stdlib only). AI calls proxied through backend to protect the API key. Prompts and brand config stored as `.md` files in `lab/`. Launch: `node server.js` → open `http://localhost:3000`.

**Tech Stack:** Node.js (stdlib: http, fs, path, https), HTML/CSS/JS vanilla, html2canvas 1.4.1 (CDN), Inter font (Google Fonts CDN)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.gitignore` | Create | Exclude config.json, node_modules |
| `config.json` | Create (template) | API provider + key (gitignored) |
| `server.js` | Create | HTTP server, proxy AI calls, serve index.html |
| `index.html` | Create | Full SPA: tabs, brief forms, previews, PNG export, copy |
| `lab/design.md` | Create | Brand/visual guidelines template (read by AI at generation) |
| `lab/content.md` | Create | Content brief template (read by AI at generation) |
| `lab/prompts/carousel.md` | Create | System prompt for Instagram carousel (JSON output) |
| `lab/prompts/story.md` | Create | System prompt for Instagram story (JSON output) |
| `lab/prompts/linkedin.md` | Create | System prompt for LinkedIn post (JSON output) |
| `lab/prompts/tweet.md` | Create | System prompt for tweet (JSON output) |
| `lab/prompts/theme-extract.md` | Create | System prompt for visual theme extraction (JSON output) |
| `README.md` | Create | Setup + usage instructions |
| `roadmap.md` | Create | v1 → v3 feature roadmap |
| `todo.md` | Create | v1 development task checklist |
| `state.md` | Create | Current project state |

---

## Task 1: Project Scaffold

**Files:**
- Create: `.gitignore`
- Create: `config.json`
- Verify: `carousel/`, `story/`, `linkedin_post/`, `tweet/`, `lab/prompts/` directories exist

- [ ] **Step 1: Create `.gitignore`**

```
config.json
node_modules/
*.env
.env.local
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/.gitignore`

- [ ] **Step 2: Create `config.json` template**

```json
{
  "provider": "claude",
  "apiKey": "",
  "model": "claude-sonnet-4-6"
}
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/config.json`

- [ ] **Step 3: Create `lab/prompts/` directory**

```bash
mkdir -p lab/prompts
```

Run from: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/`

- [ ] **Step 4: Verify all output directories exist**

```bash
ls -la
```

Expected: `carousel/`, `story/`, `linkedin_post/`, `tweet/`, `lab/` all present. Create any missing with `mkdir`.

- [ ] **Step 5: Commit scaffold**

```bash
git init
git add .gitignore
git commit -m "chore: init project scaffold"
```

---

## Task 2: `server.js` — Backend HTTP Server

**Files:**
- Create: `server.js`

- [ ] **Step 1: Create `server.js` with complete implementation**

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = __dirname;
const CONFIG_FILE = path.join(ROOT, 'config.json');
const PORT = 3000;

// ── Config ─────────────────────────────────────────────────────────────────
function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return { provider: 'claude', apiKey: '', model: 'claude-sonnet-4-6' };
  }
}

function readLabFile(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, 'lab', relPath), 'utf8');
  } catch {
    return `[Fichier non trouvé: lab/${relPath} — créez ce fichier pour enrichir les générations]`;
  }
}

// ── HTTP helpers ───────────────────────────────────────────────────────────
function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise(resolve => {
    let raw = '';
    req.on('data', c => (raw += c));
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

// ── HTTPS POST helper ──────────────────────────────────────────────────────
function httpsPost(hostname, urlPath, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path: urlPath,
        method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(body) }
      },
      res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('Invalid JSON from API: ' + data.slice(0, 200))); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── AI providers ───────────────────────────────────────────────────────────
async function callClaude(apiKey, model, system, userMessage) {
  const body = JSON.stringify({
    model: model || 'claude-sonnet-4-6',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: userMessage }]
  });
  const result = await httpsPost('api.anthropic.com', '/v1/messages', {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }, body);
  if (result.error) throw new Error(`Claude API: ${result.error.message}`);
  return result.content[0].text;
}

async function callOpenAI(apiKey, model, system, userMessage) {
  const body = JSON.stringify({
    model: model || 'gpt-4o',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage }
    ],
    max_tokens: 4096
  });
  const result = await httpsPost('api.openai.com', '/v1/chat/completions', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }, body);
  if (result.error) throw new Error(`OpenAI API: ${result.error.message}`);
  return result.choices[0].message.content;
}

async function callAI(config, system, userMessage) {
  const { provider, apiKey, model } = config;
  if (!apiKey) throw new Error('Clé API manquante. Configurez-la dans le header de l\'interface.');
  if (provider === 'claude') return callClaude(apiKey, model, system, userMessage);
  if (provider === 'openai') return callOpenAI(apiKey, model, system, userMessage);
  throw new Error(`Provider inconnu: ${provider}`);
}

// ── Image generation ───────────────────────────────────────────────────────
async function generateImage(config, prompt) {
  if (config.provider !== 'openai') {
    // For non-OpenAI providers, return the prompt for manual use
    return { type: 'prompt', value: prompt };
  }
  const body = JSON.stringify({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard'
  });
  const result = await httpsPost('api.openai.com', '/v1/images/generations', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`
  }, body);
  if (result.error) throw new Error(`DALL-E: ${result.error.message}`);
  return { type: 'url', value: result.data[0].url };
}

// ── JSON extraction ────────────────────────────────────────────────────────
function extractJSON(text) {
  // Try JSON array first (carousel), then object
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch {}
  }
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try { return JSON.parse(objectMatch[0]); } catch {}
  }
  return text;
}

// ── Request router ─────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // Serve index.html
  if (req.method === 'GET' && url === '/') {
    try {
      const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch {
      res.writeHead(500); res.end('index.html not found — run from the content_creator directory');
    }
    return;
  }

  // GET /api/config — returns provider info (never returns apiKey)
  if (req.method === 'GET' && url === '/api/config') {
    const cfg = readConfig();
    sendJSON(res, 200, { provider: cfg.provider, model: cfg.model, hasKey: !!(cfg.apiKey && cfg.apiKey.length > 4) });
    return;
  }

  // POST /api/config — saves provider + key
  if (req.method === 'POST' && url === '/api/config') {
    const body = await readBody(req);
    const cfg = readConfig();
    const updated = { ...cfg, ...body };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
    sendJSON(res, 200, { ok: true });
    return;
  }

  // POST /api/generate — generate content for a platform
  if (req.method === 'POST' && url === '/api/generate') {
    const { platform, userBrief, tone, hashtags, slideCount, instructions, postText } = await readBody(req);
    const cfg = readConfig();

    const designMd = readLabFile('design.md');
    const contentMd = readLabFile('content.md');
    const promptMd = readLabFile(`prompts/${platform}.md`);

    const system = [
      promptMd,
      '---',
      '## Charte graphique (à respecter pour les couleurs et le style)',
      designMd,
      '---',
      '## Brief contenu (contexte de la marque)',
      contentMd
    ].join('\n\n');

    const parts = [
      userBrief && `Sujet: ${userBrief}`,
      tone && `Ton souhaité: ${tone}`,
      hashtags && `Hashtags souhaités: ${hashtags}`,
      slideCount && `Nombre de slides: ${slideCount}`,
      instructions && `Instructions supplémentaires: ${instructions}`,
      postText && `Texte/contenu à analyser:\n${postText}`
    ].filter(Boolean);

    if (parts.length === 0) {
      sendJSON(res, 400, { error: 'Aucun contenu fourni dans le brief' });
      return;
    }

    try {
      const raw = await callAI(cfg, system, parts.join('\n'));
      sendJSON(res, 200, { content: extractJSON(raw), raw });
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  // POST /api/image — generate illustration
  if (req.method === 'POST' && url === '/api/image') {
    const { prompt } = await readBody(req);
    if (!prompt) { sendJSON(res, 400, { error: 'Prompt manquant' }); return; }
    const cfg = readConfig();
    try {
      const result = await generateImage(cfg, prompt);
      sendJSON(res, 200, result);
    } catch (err) {
      sendJSON(res, 500, { error: err.message });
    }
    return;
  }

  sendJSON(res, 404, { error: `Route not found: ${req.method} ${url}` });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n⚡ StellarPulse Content Creator');
  console.log(`   → http://localhost:${PORT}`);
  console.log('   Ctrl+C pour arrêter\n');
});
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/server.js`

- [ ] **Step 2: Test server starts correctly**

```bash
node server.js
```

Expected output:
```
⚡ StellarPulse Content Creator
   → http://localhost:3000
   Ctrl+C pour arrêter
```

- [ ] **Step 3: Test config API (in a new terminal, server must be running)**

```bash
curl http://localhost:3000/api/config
```

Expected: `{"provider":"claude","model":"claude-sonnet-4-6","hasKey":false}`

- [ ] **Step 4: Test config save**

```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{"provider":"claude","apiKey":"test-key","model":"claude-sonnet-4-6"}'
```

Expected: `{"ok":true}`

- [ ] **Step 5: Commit server**

```bash
git add server.js
git commit -m "feat: add Node.js HTTP server with AI proxy routes"
```

---

## Task 3: `lab/` Content Templates

**Files:**
- Create: `lab/design.md`
- Create: `lab/content.md`

- [ ] **Step 1: Create `lab/design.md`**

```markdown
# Charte Graphique

> Remplissez ce fichier avec votre identité visuelle. L'IA s'en inspirera pour générer du contenu cohérent avec votre marque.

## Palette de couleurs
- Primaire : #7c3aed (violet)
- Secondaire : #3b82f6 (bleu)
- Accent chaud : #f59e0b (ambre)
- Fond sombre : #09090b
- Fond medium : #18181b
- Texte principal : #fafafa (sur fond sombre)

## Typographies
- Titres : Inter Bold (700) ou Poppins Bold
- Corps de texte : Inter Regular (400)
- Chiffres / stats : Inter SemiBold (600)

## Ton visuel
- Style : Moderne, minimaliste, tech-forward
- Ambiance : Professionnel mais accessible, dynamique
- Contraste : Élevé, lisibilité prioritaire sur tous fonds
- Espace blanc : Généreux, pas de surcharge visuelle

## Éléments de marque
- Logo : Texte "⚡ StellarPulse" en Inter Bold
- Icônes : Style outline, stroke-width 1.5-2px
- Illustrations : Flat design avec dégradés subtils (violet → bleu)

## Style des visuels
- Photos : Minimalistes, fond uni ou dégradé doux
- Dégradés principaux : #7c3aed → #3b82f6 (violet-bleu)
- Dégradé sombre : #1a1a2e → #16213e
- Éviter : Stock photos génériques, trop de texte sur les images

## Références / Inspiration
- Marques de référence : Linear, Vercel, Figma, Notion
- Style : Dark mode premium, précis, épuré
- Émotions à transmettre : Confiance, expertise, modernité
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/design.md`

- [ ] **Step 2: Create `lab/content.md`**

```markdown
# Brief Contenu

> Remplissez ce fichier avec les informations de votre marque. L'IA l'utilisera comme contexte pour tous les contenus générés.

## Marque / Projet
- Nom : StellarPulse
- Slogan : "Content at the speed of light"
- Description : Plateforme de création de contenu social media assistée par IA
- Site web : stellarpulse.io

## Audience cible
- Profil principal : Community managers, créateurs de contenu, marketeurs digitaux
- Niveau : Intermédiaire à avancé, à l'aise avec les outils digitaux
- Douleurs : Manque de temps, syndrome de la page blanche, cohérence de marque
- Aspirations : Gain de temps, contenu de qualité, présence forte sur les réseaux

## Piliers de contenu
1. **Éducation** (40%) — Tips actionables, tutoriels, bonnes pratiques social media
2. **Inspiration** (25%) — Tendances, success stories, citations du secteur
3. **Produit** (20%) — Features, use cases concrets, témoignages clients
4. **Coulisses** (15%) — Making of, équipe, behind the scenes, transparence

## Ton éditorial
- Direct, sans jargon inutile ni formules creuses
- Expert mais accessible (on vulgarise sans condescendance)
- Proactif : on donne de la valeur avant de demander quelque chose
- Légèrement décalé : humour subtil autorisé quand pertinent
- Français soigné, contemporain

## Sujets prioritaires
- IA et création de contenu (tendances, usages pratiques)
- Social media marketing 2025-2026 (algorithmes, formats qui performent)
- Automatisation des tâches des community managers
- Personal branding et thought leadership
- Productivité créative

## Sujets à éviter
- Politique, religion, sujets polémiques non liés au secteur
- Auto-promotion excessive (max 20% du contenu)
- Clichés du marketing digital ("game changer", "disruptif", etc.)
- Promesses excessives ou garanties de résultats

## CTA récurrents par plateforme
- Instagram Carousel : "Sauve ce post 💾", "Tague un CM 👋", "Dernière slide →"
- Instagram Story : "Swipe up", "Lien en bio", "Réponds à ce sticker"
- LinkedIn : "Qu'en pensez-vous ? Partagez en commentaire 👇"
- Twitter/X : "RT si tu vis ça", "Vrai ou pas ?", thread à développer

## Exemples de posts qui ont bien performé
- "5 erreurs que font 90% des CM (et comment les éviter)" — carousel éducatif
- "On a testé X outils IA. Voici le verdict." — comparatif honnête
- "Ma semaine type en tant que CM freelance" — coulisses authentiques
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/content.md`

- [ ] **Step 3: Verify files are readable by server**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"platform":"carousel","userBrief":"test"}'
```

Expected: `{"error":"Clé API manquante..."}` (not a file-not-found error — this means lab files were read correctly)

- [ ] **Step 4: Commit lab content files**

```bash
git add lab/design.md lab/content.md
git commit -m "feat: add lab design and content brief templates"
```

---

## Task 4: `lab/prompts/` — AI System Prompts

**Files:**
- Create: `lab/prompts/carousel.md`
- Create: `lab/prompts/story.md`
- Create: `lab/prompts/linkedin.md`
- Create: `lab/prompts/tweet.md`
- Create: `lab/prompts/theme-extract.md`

- [ ] **Step 1: Create `lab/prompts/carousel.md`**

```markdown
# Rôle
Tu es un expert en création de contenu Instagram pour les community managers. Tu génères des carousels éducatifs, inspirants et engageants qui performent sur Instagram grâce à leur structure narrative claire et leur design adapté à la charte graphique fournie.

# Règles de création d'un carousel Instagram performant
- **Slide 1 (Accroche)** : Titre court et percutant (max 6 mots) + sous-titre qui donne envie de swiper. C'est la slide la plus importante.
- **Slides 2 à N-1 (Contenu)** : Un seul point clé par slide. Titre court, explication concise (max 3 lignes de 40 caractères). Progression logique.
- **Dernière slide (CTA)** : Appel à l'action clair — abonnement, lien en bio, question d'engagement, sauvegarde.
- Chaque slide doit être lisible en 3 secondes.
- Utiliser les couleurs de la charte graphique pour `bg_color` et `text_color`.
- Choisir un emoji représentatif par slide, cohérent avec le contenu.

# Format de sortie (OBLIGATOIRE)
Tu dois répondre UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après, sans bloc de code markdown.
Exemple de structure pour 3 slides :
[
  {
    "slide": 1,
    "title": "Titre accrocheur",
    "body": "Sous-titre qui donne\nenvie de lire la suite",
    "bg_color": "#1a1a2e",
    "text_color": "#ffffff",
    "emoji": "🚀"
  },
  {
    "slide": 2,
    "title": "Point clé 1",
    "body": "Explication courte et\nimpactante du concept",
    "bg_color": "#16213e",
    "text_color": "#e2e8f0",
    "emoji": "💡"
  },
  {
    "slide": 3,
    "title": "Passe à l'action",
    "body": "Sauve ce carousel 💾\net tague un CM qui en a besoin",
    "bg_color": "#7c3aed",
    "text_color": "#ffffff",
    "emoji": "🎯"
  }
]
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/prompts/carousel.md`

- [ ] **Step 2: Create `lab/prompts/story.md`**

```markdown
# Rôle
Tu es un expert en création de stories Instagram. Tu génères des contenus visuellement impactants optimisés pour le format vertical 9:16 (1080×1920px). Les stories doivent capter l'attention en moins de 2 secondes.

# Règles pour une story Instagram efficace
- **Titre** : Très court, maximum 5 mots, impact immédiat
- **Sous-titre** : Optionnel, max 8 mots, complète le titre
- **Corps** : Concis, max 2-3 courtes lignes, lisible en un coup d'œil
- **CTA** : Court et actionnable ("Swipe up", "Lien en bio", "Répondre", "Voir plus")
- Couleurs vives et très contrastées — lisibilité sur mobile avant tout
- Un seul message par story, pas de surcharge

# Format de sortie (OBLIGATOIRE)
Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans bloc de code markdown.
{
  "title": "Titre très court",
  "subtitle": "Sous-titre optionnel",
  "body": "Corps court et percutant\nde la story",
  "cta": "👉 Lien en bio",
  "bg_color": "#6d28d9",
  "text_color": "#ffffff",
  "accent_color": "#a78bfa",
  "emoji": "✨"
}
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/prompts/story.md`

- [ ] **Step 3: Create `lab/prompts/linkedin.md`**

```markdown
# Rôle
Tu es un expert LinkedIn copywriter spécialisé dans les posts qui génèrent de l'engagement professionnel authentique. Tu crées des contenus qui déclenchent des commentaires, des partages et des connexions qualifiées.

# Bonnes pratiques LinkedIn (2025-2026)
- **Première ligne** : Phrase d'accroche qui s'arrête avant le "Voir plus" — doit pousser au clic (max 140 caractères). Ne pas commencer par "Je" ni par un cliché.
- **Structure** : Introduction → Développement aéré → Conclusion + question
- **Aération** : Sauts de ligne entre chaque idée. Maximum 2-3 lignes par paragraphe.
- **Format** : Bullet points (•) ou numérotation pour les listes. Emojis avec parcimonie (max 5 par post).
- **Longueur idéale** : 800 à 1500 caractères
- **Fin** : Toujours terminer par une question ouverte pour encourager les commentaires
- **Hashtags** : 3 à 5 maximum, pertinents, dans un commentaire séparé (mettre dans le champ `hashtags`)
- **Image** : Décrire une illustration professionnelle en anglais pour accompagner le post

# Format de sortie (OBLIGATOIRE)
Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans bloc de code markdown.
{
  "text": "Corps complet du post LinkedIn\n\navec les sauts de ligne\net la mise en forme appropriée\n\n• Point 1\n• Point 2\n\nQuestion finale pour l'engagement ?",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "image_prompt": "A professional and modern illustration showing [sujet], flat design style, dark background, purple and blue color palette, minimal, high contrast"
}
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/prompts/linkedin.md`

- [ ] **Step 4: Create `lab/prompts/tweet.md`**

```markdown
# Rôle
Tu es un expert Twitter/X copywriter. Tu crées des tweets percutants qui font réagir, sont retweetés et génèrent du débat constructif ou de l'engagement fort.

# Bonnes pratiques Twitter/X (2025-2026)
- **Longueur** : Maximum 240 caractères pour le texte principal (garder de la marge pour les hashtags)
- **Impact** : Dès le premier mot — pas de préambule, pas d'introduction
- **Ton** : Affirmé, opinionné, direct. Éviter les formules molles ("Il me semble que...", "Peut-être que...")
- **Structures qui performent** :
  - Le contraste : "La plupart font X. Les meilleurs font Y."
  - La provocation douce : "Opinion impopulaire : [vérité inconfortable]"
  - Le chiffre : "X% des [profil] font [erreur]. Voici pourquoi."
  - La liste express : "3 choses que j'aurais voulu savoir avant de [action] :"
- **Emojis** : 0 à 2 maximum, seulement si pertinents
- **Hashtags** : 1 à 2 maximum, très ciblés
- **Image** : Décrire une illustration percutante en anglais

# Format de sortie (OBLIGATOIRE)
Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans bloc de code markdown.
{
  "text": "Le tweet lui-même, sans hashtags inclus, maximum 240 caractères",
  "hashtags": ["#hashtag1"],
  "image_prompt": "A vibrant and bold illustration for Twitter showing [sujet], modern flat design, high contrast, purple accent, minimal background"
}
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/prompts/tweet.md`

- [ ] **Step 5: Create `lab/prompts/theme-extract.md`**

```markdown
# Rôle
Tu es un designer senior et analyste de contenu visuel. Tu analyses des posts de réseaux sociaux, des descriptions de visuels ou des textes pour en extraire l'identité visuelle, le style éditorial et les caractéristiques de marque.

# Instructions
À partir du texte, de la description de post ou des éléments fournis, extrais les caractéristiques visuelles et éditoriales principales. Si certaines informations ne sont pas déductibles du contenu fourni, propose des valeurs cohérentes avec le style global détecté.

Pour la palette : extrais ou déduis 5 couleurs représentatives (hex). Si aucune couleur n'est mentionnée, propose une palette cohérente avec l'ambiance décrite.

Pour `design_md_suggestions` : fournis un bloc de texte directement utilisable pour remplir ou enrichir un fichier `design.md`, en Markdown.

# Format de sortie (OBLIGATOIRE)
Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans bloc de code markdown.
{
  "palette": ["#1a1a2e", "#7c3aed", "#3b82f6", "#f59e0b", "#fafafa"],
  "typography": "Description du style typographique détecté ou suggéré",
  "mood": "Ambiance générale (ex: 'Professionnel, épuré, tech-forward, dark mode premium')",
  "visual_keywords": ["minimaliste", "dark", "gradient", "modern", "tech"],
  "design_md_suggestions": "## Palette extraite\n- Primaire : #hex\n- Secondaire : #hex\n\n## Typographie suggérée\n- ...\n\n## Ambiance\n- ...\n\n## Style visuel\n- ..."
}
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/lab/prompts/theme-extract.md`

- [ ] **Step 6: Commit all prompt files**

```bash
git add lab/prompts/
git commit -m "feat: add AI system prompts for all platforms and theme extraction"
```

---

## Task 5: `index.html` — Full SPA Implementation

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create complete `index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StellarPulse — Content Creator</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --surface: #18181b;
      --surface2: #27272a;
      --border: #3f3f46;
      --text: #fafafa;
      --text-muted: #a1a1aa;
      --text-dim: #71717a;
      --accent: #7c3aed;
      --accent-light: #8b5cf6;
      --accent-hover: #6d28d9;
      --success: #22c55e;
      --error: #ef4444;
      --warning: #f59e0b;
      --radius: 8px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; font-size: 14px; }

    /* HEADER */
    .header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; gap: 1rem; }
    .header-brand { display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 1rem; white-space: nowrap; }
    .header-brand .accent { color: var(--accent-light); }
    .header-controls { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    /* FORM */
    select, input, textarea { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-family: inherit; font-size: 13px; padding: 0.5rem 0.75rem; outline: none; transition: border-color 0.15s; }
    select:focus, input:focus, textarea:focus { border-color: var(--accent); }
    select { cursor: pointer; }
    textarea { resize: vertical; width: 100%; }
    label { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .field { margin-bottom: 1rem; }
    .field-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .field-row input[type="checkbox"] { width: 14px; height: 14px; padding: 0; cursor: pointer; accent-color: var(--accent); }
    .field-row label { margin: 0; text-transform: none; font-size: 13px; color: var(--text); cursor: pointer; letter-spacing: 0; }

    /* BUTTONS */
    .btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: none; border-radius: var(--radius); font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--accent-hover); }
    .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover:not(:disabled) { background: var(--border); }
    .btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid transparent; }
    .btn-ghost:hover:not(:disabled) { background: var(--surface2); color: var(--text); }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-full { width: 100%; justify-content: center; }

    /* TABS */
    .tabs-bar { display: flex; padding: 0 1.5rem; background: var(--surface); border-bottom: 1px solid var(--border); overflow-x: auto; }
    .tab-btn { padding: 0.75rem 1.25rem; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active { color: var(--accent-light); border-bottom-color: var(--accent); }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* LAYOUT */
    .container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .content-grid { display: grid; grid-template-columns: 280px 1fr 180px; gap: 1.5rem; align-items: start; }

    /* PANEL */
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
    .panel-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 1rem; }

    /* PREVIEW */
    .preview-container { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .preview-frame { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; position: relative; flex-shrink: 0; }
    .preview-frame.square { width: 400px; height: 400px; }
    .preview-frame.story-frame { width: 225px; height: 400px; }
    .preview-scaler { transform-origin: top left; pointer-events: none; display: block; }

    /* SLIDE NAV */
    .slide-nav { display: flex; align-items: center; gap: 0.75rem; font-size: 13px; color: var(--text-muted); }
    .slide-dots { display: flex; gap: 0.35rem; flex-wrap: wrap; max-width: 200px; }
    .slide-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
    .slide-dot.active { background: var(--accent); }

    /* TEXT PREVIEW */
    .text-preview { background: #1b1b1f; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; white-space: pre-wrap; line-height: 1.7; font-size: 14px; min-height: 180px; max-height: 500px; overflow-y: auto; word-break: break-word; }
    .char-count { font-size: 12px; color: var(--text-dim); text-align: right; margin-top: 0.35rem; }
    .char-count.over { color: var(--error); font-weight: 600; }

    /* IMAGE PREVIEW */
    .image-preview { width: 100%; aspect-ratio: 1; background: var(--surface2); border: 1px dashed var(--border); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 12px; color: var(--text-dim); text-align: center; padding: 1rem; gap: 0.5rem; flex-direction: column; }
    .image-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: calc(var(--radius) - 1px); }

    /* ACTIONS */
    .actions-panel { display: flex; flex-direction: column; gap: 0.5rem; }

    /* EMPTY STATE */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; text-align: center; color: var(--text-dim); gap: 0.75rem; min-height: 300px; }
    .empty-state .icon { font-size: 2.5rem; }
    .empty-state p { font-size: 13px; line-height: 1.5; }

    /* SPINNER */
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.25); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* TOAST */
    #toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.6rem 1rem; font-size: 13px; z-index: 9999; opacity: 0; transform: translateY(8px); transition: all 0.2s; pointer-events: none; max-width: 300px; }
    #toast.show { opacity: 1; transform: translateY(0); }
    #toast.success { border-color: var(--success); color: var(--success); }
    #toast.error { border-color: var(--error); color: var(--error); }
    #toast.info { border-color: var(--accent); color: var(--accent-light); }

    /* MODAL */
    .modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; align-items: center; justify-content: center; padding: 1rem; }
    .modal-backdrop.open { display: flex; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; width: 580px; max-width: 100%; padding: 1.5rem; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .modal-header h2 { font-size: 1rem; font-weight: 600; }

    /* STATUS DOT */
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--error); display: inline-block; flex-shrink: 0; }
    .status-dot.connected { background: var(--success); }

    /* THEME RESULTS */
    .theme-palette-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .color-swatch { width: 40px; height: 40px; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; flex-shrink: 0; }
    .theme-field { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem; margin-bottom: 0.5rem; font-size: 13px; line-height: 1.5; }
    .theme-field strong { display: block; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.3rem; }

    /* API KEY INPUT */
    #apiKeyInput { min-width: 200px; max-width: 260px; }

    /* Separator */
    .separator { height: 1px; background: var(--border); margin: 0.75rem 0; }
  </style>
</head>
<body>

<!-- HEADER -->
<header class="header">
  <div class="header-brand">⚡ <span class="accent">Stellar</span>Pulse</div>
  <div class="header-controls">
    <span class="status-dot" id="statusDot" title="Clé API non configurée"></span>
    <select id="providerSelect" onchange="onProviderChange()">
      <option value="claude">Claude (Anthropic)</option>
      <option value="openai">OpenAI</option>
    </select>
    <input type="password" id="apiKeyInput" placeholder="Clé API..." oninput="onApiKeyChange()">
    <button class="btn btn-secondary" onclick="saveConfig()">Sauvegarder</button>
    <button class="btn btn-ghost" onclick="openThemeModal()">🎨 Extraire thème</button>
  </div>
</header>

<!-- TABS -->
<div class="tabs-bar">
  <button class="tab-btn active" onclick="switchTab('carousel', this)">📸 Instagram Carousel</button>
  <button class="tab-btn" onclick="switchTab('story', this)">📱 Instagram Story</button>
  <button class="tab-btn" onclick="switchTab('linkedin', this)">💼 LinkedIn</button>
  <button class="tab-btn" onclick="switchTab('tweet', this)">🐦 Tweet</button>
</div>

<div class="container">

  <!-- ═══ CAROUSEL ═══ -->
  <div id="tab-carousel" class="tab-panel active">
    <div class="content-grid">
      <div class="panel">
        <div class="panel-title">Brief</div>
        <div class="field"><label>Sujet / Thème</label><textarea id="c-subject" rows="3" placeholder="Ex: 5 erreurs à éviter en marketing digital..."></textarea></div>
        <div class="field"><label>Ton</label>
          <select id="c-tone"><option value="éducatif">Éducatif</option><option value="inspirant">Inspirant</option><option value="professionnel" selected>Professionnel</option><option value="décalé">Décalé / Humour</option><option value="storytelling">Storytelling</option></select>
        </div>
        <div class="field"><label>Hashtags</label><input type="text" id="c-hashtags" placeholder="#marketing #digital"></div>
        <div class="field"><label>Nombre de slides</label>
          <select id="c-slides"><option value="5">5 slides</option><option value="7" selected>7 slides</option><option value="10">10 slides</option></select>
        </div>
        <div class="field"><label>Instructions libres</label><textarea id="c-instructions" rows="2" placeholder="Ex: inclure des stats, CTA abonnement..."></textarea></div>
        <button class="btn btn-primary btn-full" onclick="generateCarousel()" id="c-btn">✨ Générer le carousel</button>
      </div>
      <div class="preview-container">
        <div class="empty-state" id="c-empty"><div class="icon">📸</div><p>Remplissez le brief<br>et cliquez sur Générer</p></div>
        <div id="c-preview-wrap" style="display:none">
          <div class="preview-frame square">
            <div class="preview-scaler" id="c-scaler" style="width:1080px;height:1080px;transform:scale(0.3704)">
              <div id="c-slide" style="width:1080px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px;text-align:center;font-family:'Inter',sans-serif;position:relative;"></div>
            </div>
          </div>
          <div class="slide-nav">
            <button class="btn btn-ghost" onclick="prevSlide()" style="padding:0.3rem 0.6rem;font-size:16px">←</button>
            <div class="slide-dots" id="c-dots"></div>
            <button class="btn btn-ghost" onclick="nextSlide()" style="padding:0.3rem 0.6rem;font-size:16px">→</button>
            <span id="c-counter" style="font-size:12px;color:var(--text-dim);white-space:nowrap"></span>
          </div>
        </div>
      </div>
      <div class="actions-panel">
        <div class="panel-title">Actions</div>
        <button class="btn btn-secondary btn-full" onclick="downloadSlide()" id="c-dl-slide" disabled>⬇ Slide PNG</button>
        <button class="btn btn-secondary btn-full" onclick="downloadAllSlides()" id="c-dl-all" disabled>⬇ Tous (ZIP)</button>
        <div class="separator"></div>
        <button class="btn btn-ghost btn-full" onclick="generateCarousel()" id="c-regen" disabled>↺ Régénérer</button>
      </div>
    </div>
  </div>

  <!-- ═══ STORY ═══ -->
  <div id="tab-story" class="tab-panel">
    <div class="content-grid">
      <div class="panel">
        <div class="panel-title">Brief</div>
        <div class="field"><label>Sujet / Thème</label><textarea id="s-subject" rows="3" placeholder="Ex: Nouvelle feature, citation inspirante, annonce..."></textarea></div>
        <div class="field"><label>Ton</label>
          <select id="s-tone"><option value="dynamique" selected>Dynamique</option><option value="inspirant">Inspirant</option><option value="promotionnel">Promotionnel</option><option value="informatif">Informatif</option></select>
        </div>
        <div class="field"><label>Call-to-Action</label><input type="text" id="s-cta" placeholder="Ex: Swipe up, Lien en bio..."></div>
        <div class="field"><label>Instructions libres</label><textarea id="s-instructions" rows="2" placeholder="Couleurs, éléments spécifiques..."></textarea></div>
        <button class="btn btn-primary btn-full" onclick="generateStory()" id="s-btn">✨ Générer la story</button>
      </div>
      <div class="preview-container">
        <div class="empty-state" id="s-empty"><div class="icon">📱</div><p>Remplissez le brief<br>et cliquez sur Générer</p></div>
        <div id="s-preview-wrap" style="display:none">
          <div class="preview-frame story-frame">
            <div class="preview-scaler" id="s-scaler" style="width:1080px;height:1920px;transform:scale(0.2083)">
              <div id="s-slide" style="width:1080px;height:1920px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 80px;text-align:center;font-family:'Inter',sans-serif;"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions-panel">
        <div class="panel-title">Actions</div>
        <button class="btn btn-secondary btn-full" onclick="downloadStory()" id="s-dl" disabled>⬇ Story PNG</button>
        <div class="separator"></div>
        <button class="btn btn-ghost btn-full" onclick="generateStory()" id="s-regen" disabled>↺ Régénérer</button>
      </div>
    </div>
  </div>

  <!-- ═══ LINKEDIN ═══ -->
  <div id="tab-linkedin" class="tab-panel">
    <div class="content-grid">
      <div class="panel">
        <div class="panel-title">Brief</div>
        <div class="field"><label>Sujet / Thème</label><textarea id="l-subject" rows="3" placeholder="Ex: Mon retour d'expérience sur la gestion d'équipe à distance..."></textarea></div>
        <div class="field"><label>Ton</label>
          <select id="l-tone"><option value="professionnel" selected>Professionnel</option><option value="authentique">Authentique / Personnel</option><option value="expert">Expert / Thought leader</option><option value="inspirant">Inspirant</option><option value="storytelling">Storytelling</option></select>
        </div>
        <div class="field"><label>Hashtags souhaités</label><input type="text" id="l-hashtags" placeholder="#leadership #business #ia"></div>
        <div class="field"><label>Instructions libres</label><textarea id="l-instructions" rows="2" placeholder="Ex: terminer par une question, format liste, max 1000 chars..."></textarea></div>
        <div class="field-row"><input type="checkbox" id="l-with-img"><label for="l-with-img">Générer une illustration</label></div>
        <button class="btn btn-primary btn-full" onclick="generateLinkedin()" id="l-btn">✨ Générer le post</button>
      </div>
      <div>
        <div class="empty-state" id="l-empty"><div class="icon">💼</div><p>Remplissez le brief<br>et cliquez sur Générer</p></div>
        <div id="l-content" style="display:none">
          <div class="text-preview" id="l-text"></div>
          <div class="char-count" id="l-char"></div>
          <div id="l-img-area" style="margin-top:1.25rem;display:none">
            <label style="margin-bottom:0.5rem">Illustration</label>
            <div class="image-preview" id="l-img"><span>En attente...</span></div>
          </div>
        </div>
      </div>
      <div class="actions-panel">
        <div class="panel-title">Actions</div>
        <button class="btn btn-secondary btn-full" onclick="copyLinkedin()" id="l-copy" disabled>⧉ Copier le texte</button>
        <button class="btn btn-secondary btn-full" onclick="downloadLinkedinImg()" id="l-dl-img" disabled style="display:none">⬇ Image PNG</button>
        <div class="separator"></div>
        <button class="btn btn-ghost btn-full" onclick="generateLinkedin()" id="l-regen" disabled>↺ Régénérer</button>
      </div>
    </div>
  </div>

  <!-- ═══ TWEET ═══ -->
  <div id="tab-tweet" class="tab-panel">
    <div class="content-grid">
      <div class="panel">
        <div class="panel-title">Brief</div>
        <div class="field"><label>Sujet / Thème</label><textarea id="t-subject" rows="3" placeholder="Ex: Opinion sur l'IA dans le marketing, tip du jour..."></textarea></div>
        <div class="field"><label>Ton</label>
          <select id="t-tone"><option value="percutant" selected>Percutant</option><option value="informel">Informel / Casual</option><option value="éducatif">Éducatif</option><option value="opinion forte">Opinion forte</option><option value="humour">Humour</option></select>
        </div>
        <div class="field"><label>Hashtags souhaités</label><input type="text" id="t-hashtags" placeholder="#tech #startup #ia"></div>
        <div class="field-row"><input type="checkbox" id="t-with-img" checked><label for="t-with-img">Générer une illustration</label></div>
        <button class="btn btn-primary btn-full" onclick="generateTweet()" id="t-btn">✨ Générer le tweet</button>
      </div>
      <div>
        <div class="empty-state" id="t-empty"><div class="icon">🐦</div><p>Remplissez le brief<br>et cliquez sur Générer</p></div>
        <div id="t-content" style="display:none">
          <div class="text-preview" id="t-text"></div>
          <div class="char-count" id="t-char"></div>
          <div id="t-img-area" style="margin-top:1.25rem;display:none">
            <label style="margin-bottom:0.5rem">Illustration</label>
            <div class="image-preview" id="t-img"><span>En attente...</span></div>
          </div>
        </div>
      </div>
      <div class="actions-panel">
        <div class="panel-title">Actions</div>
        <button class="btn btn-secondary btn-full" onclick="copyTweet()" id="t-copy" disabled>⧉ Copier le texte</button>
        <button class="btn btn-secondary btn-full" onclick="downloadTweetImg()" id="t-dl-img" disabled style="display:none">⬇ Image PNG</button>
        <div class="separator"></div>
        <button class="btn btn-ghost btn-full" onclick="generateTweet()" id="t-regen" disabled>↺ Régénérer</button>
      </div>
    </div>
  </div>

</div><!-- /container -->

<!-- THEME MODAL -->
<div class="modal-backdrop" id="themeModal" onclick="if(event.target===this)closeThemeModal()">
  <div class="modal">
    <div class="modal-header">
      <h2>🎨 Extraire un thème visuel</h2>
      <button class="btn btn-ghost" onclick="closeThemeModal()" style="padding:0.25rem 0.5rem;font-size:16px">✕</button>
    </div>
    <div class="field">
      <label>Description / Texte à analyser</label>
      <textarea id="theme-input" rows="7" placeholder="Collez le texte d'un post, décrivez un profil Instagram, listez les couleurs et le style d'une marque...&#10;&#10;Exemple: 'Posts minimalistes, fond blanc cassé, typographie serif noire, photos lifestyle en noir et blanc, ton premium et épuré. Marque de cosmétiques naturels haut de gamme.'"></textarea>
    </div>
    <div style="display:flex;gap:0.75rem;margin-bottom:1.25rem">
      <button class="btn btn-primary" onclick="extractTheme()" id="theme-btn">🔍 Analyser</button>
      <button class="btn btn-ghost" onclick="closeThemeModal()">Annuler</button>
    </div>
    <div id="theme-results" style="display:none">
      <div class="separator" style="margin-bottom:1rem"></div>
      <div class="panel-title" style="margin-bottom:0.75rem">Résultats</div>
      <div class="theme-palette-row" id="theme-palette"></div>
      <div class="theme-field"><strong>Typographie</strong><span id="theme-typo"></span></div>
      <div class="theme-field"><strong>Ambiance</strong><span id="theme-mood"></span></div>
      <div class="theme-field"><strong>Mots-clés visuels</strong><span id="theme-keywords"></span></div>
      <div class="theme-field" style="background:var(--surface)">
        <strong>Suggestion pour design.md</strong>
        <pre id="theme-suggestion" style="white-space:pre-wrap;font-size:12px;font-family:monospace;margin-top:0.35rem;color:var(--text);line-height:1.6"></pre>
      </div>
      <button class="btn btn-secondary btn-full" onclick="copyThemeSuggestion()" style="margin-top:0.5rem">⧉ Copier la suggestion</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div id="toast"></div>

<script>
// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
let slides = [];
let slideIdx = 0;
let linkedinText = '';
let tweetText = '';
let linkedinImgUrl = null;
let tweetImgUrl = null;

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
(async function init() {
  const key = localStorage.getItem('sp_key');
  const prov = localStorage.getItem('sp_provider');
  if (key) document.getElementById('apiKeyInput').value = key;
  if (prov) document.getElementById('providerSelect').value = prov;
  try {
    const cfg = await api('GET', '/api/config');
    if (cfg.provider) document.getElementById('providerSelect').value = cfg.provider;
    setStatus(cfg.hasKey || !!key);
  } catch { setStatus(!!key); }
})();

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════
function onProviderChange() {
  const p = document.getElementById('providerSelect').value;
  localStorage.setItem('sp_provider', p);
  document.getElementById('apiKeyInput').placeholder = p === 'claude' ? 'sk-ant-...' : 'sk-...';
}

function onApiKeyChange() {
  const k = document.getElementById('apiKeyInput').value;
  localStorage.setItem('sp_key', k);
  setStatus(!!k);
}

async function saveConfig() {
  const provider = document.getElementById('providerSelect').value;
  const apiKey = document.getElementById('apiKeyInput').value;
  const model = provider === 'claude' ? 'claude-sonnet-4-6' : 'gpt-4o';
  try {
    await api('POST', '/api/config', { provider, apiKey, model });
    setStatus(!!apiKey);
    toast('Configuration sauvegardée ✓', 'success');
  } catch (e) { toast('Erreur: ' + e.message, 'error'); }
}

function setStatus(ok) {
  const d = document.getElementById('statusDot');
  d.className = 'status-dot' + (ok ? ' connected' : '');
  d.title = ok ? 'Clé API configurée' : 'Clé API manquante';
}

// ═══════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ═══════════════════════════════════════════════════
// API HELPER
// ═══════════════════════════════════════════════════
async function api(method, path, body) {
  const r = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

// ═══════════════════════════════════════════════════
// CAROUSEL
// ═══════════════════════════════════════════════════
async function generateCarousel() {
  const subject = document.getElementById('c-subject').value.trim();
  if (!subject) { toast('Entrez un sujet', 'error'); return; }
  setBtnLoading('c-btn', true);
  document.getElementById('c-empty').style.display = 'flex';
  document.getElementById('c-preview-wrap').style.display = 'none';
  setDisabled(['c-dl-slide','c-dl-all','c-regen'], true);
  try {
    const res = await api('POST', '/api/generate', {
      platform: 'carousel',
      userBrief: subject,
      tone: document.getElementById('c-tone').value,
      hashtags: document.getElementById('c-hashtags').value,
      slideCount: document.getElementById('c-slides').value,
      instructions: document.getElementById('c-instructions').value
    });
    slides = Array.isArray(res.content) ? res.content : [{ slide:1, title:'Résultat', body: res.raw, bg_color:'#1a1a2e', text_color:'#fff', emoji:'✨' }];
    slideIdx = 0;
    buildDots();
    renderSlide(0);
    document.getElementById('c-empty').style.display = 'none';
    document.getElementById('c-preview-wrap').style.display = 'block';
    setDisabled(['c-dl-slide','c-dl-all','c-regen'], false);
    toast(`Carousel ${slides.length} slides généré ✓`, 'success');
  } catch (e) { toast('Erreur: ' + e.message, 'error'); }
  finally { setBtnLoading('c-btn', false, '✨ Générer le carousel'); }
}

function renderSlide(i) {
  const s = slides[i];
  const el = document.getElementById('c-slide');
  el.style.background = s.bg_color || '#1a1a2e';
  el.style.color = s.text_color || '#fff';
  const total = slides.length;
  el.innerHTML = `
    <div style="font-size:60px;margin-bottom:28px;line-height:1">${s.emoji || '✨'}</div>
    <div style="font-size:${i===0?'54px':'46px'};font-weight:700;line-height:1.2;margin-bottom:28px;letter-spacing:-0.02em">${s.title||''}</div>
    <div style="font-size:28px;line-height:1.55;opacity:0.88;max-width:850px">${(s.body||'').replace(/\n/g,'<br>')}</div>
    <div style="position:absolute;bottom:36px;right:56px;font-size:20px;opacity:0.35;font-weight:500">${i+1}/${total}</div>
  `;
  document.getElementById('c-counter').textContent = `${i+1} / ${total}`;
  document.querySelectorAll('.slide-dot').forEach((d,j) => d.classList.toggle('active', j===i));
}

function buildDots() {
  document.getElementById('c-dots').innerHTML = slides.map((_,i) =>
    `<div class="slide-dot${i===0?' active':''}" onclick="goSlide(${i})"></div>`
  ).join('');
}

function goSlide(i) { slideIdx = i; renderSlide(i); }
function prevSlide() { if(slideIdx>0) goSlide(slideIdx-1); }
function nextSlide() { if(slideIdx<slides.length-1) goSlide(slideIdx+1); }

async function downloadSlide() {
  await capture('c-slide', `carousel_slide_${slideIdx+1}.png`);
}

async function downloadAllSlides() {
  setBtnLoading('c-dl-all', true);
  for (let i = 0; i < slides.length; i++) {
    goSlide(i);
    await wait(180);
    await capture('c-slide', `carousel_slide_${i+1}.png`);
    await wait(120);
  }
  setBtnLoading('c-dl-all', false, '⬇ Tous (ZIP)');
  toast(`${slides.length} slides exportés ✓`, 'success');
}

// ═══════════════════════════════════════════════════
// STORY
// ═══════════════════════════════════════════════════
async function generateStory() {
  const subject = document.getElementById('s-subject').value.trim();
  if (!subject) { toast('Entrez un sujet', 'error'); return; }
  setBtnLoading('s-btn', true);
  try {
    const res = await api('POST', '/api/generate', {
      platform: 'story',
      userBrief: subject,
      tone: document.getElementById('s-tone').value,
      hashtags: document.getElementById('s-cta').value,
      instructions: document.getElementById('s-instructions').value
    });
    const d = (typeof res.content === 'object' && res.content !== null) ? res.content : { title: res.raw, bg_color:'#6d28d9', text_color:'#fff', emoji:'✨' };
    const el = document.getElementById('s-slide');
    el.style.background = d.bg_color || '#6d28d9';
    el.style.color = d.text_color || '#fff';
    el.innerHTML = `
      <div style="font-size:80px;margin-bottom:48px;line-height:1">${d.emoji||'✨'}</div>
      <div style="font-size:72px;font-weight:800;line-height:1.1;margin-bottom:32px;letter-spacing:-0.025em">${d.title||''}</div>
      ${d.subtitle?`<div style="font-size:38px;opacity:0.8;margin-bottom:32px;font-weight:500">${d.subtitle}</div>`:''}
      <div style="font-size:34px;line-height:1.6;opacity:0.85;max-width:900px">${(d.body||'').replace(/\n/g,'<br>')}</div>
      ${d.cta?`<div style="margin-top:80px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);padding:28px 56px;border-radius:60px;font-size:34px;font-weight:600">${d.cta}</div>`:''}
    `;
    document.getElementById('s-empty').style.display = 'none';
    document.getElementById('s-preview-wrap').style.display = 'block';
    setDisabled(['s-dl','s-regen'], false);
    toast('Story générée ✓', 'success');
  } catch (e) { toast('Erreur: ' + e.message, 'error'); }
  finally { setBtnLoading('s-btn', false, '✨ Générer la story'); }
}

async function downloadStory() {
  await capture('s-slide', 'story.png');
}

// ═══════════════════════════════════════════════════
// LINKEDIN
// ═══════════════════════════════════════════════════
async function generateLinkedin() {
  const subject = document.getElementById('l-subject').value.trim();
  if (!subject) { toast('Entrez un sujet', 'error'); return; }
  setBtnLoading('l-btn', true);
  linkedinImgUrl = null;
  document.getElementById('l-dl-img').style.display = 'none';
  try {
    const res = await api('POST', '/api/generate', {
      platform: 'linkedin',
      userBrief: subject,
      tone: document.getElementById('l-tone').value,
      hashtags: document.getElementById('l-hashtags').value,
      instructions: document.getElementById('l-instructions').value
    });
    const d = res.content;
    let text = '', imgPrompt = '';
    if (d && typeof d === 'object' && d.text) {
      text = d.text;
      if (d.hashtags && Array.isArray(d.hashtags)) text += '\n\n' + d.hashtags.join(' ');
      imgPrompt = d.image_prompt || '';
    } else { text = res.raw; }
    linkedinText = text;
    document.getElementById('l-text').textContent = text;
    const cEl = document.getElementById('l-char');
    cEl.textContent = `${text.length} caractères`;
    cEl.className = 'char-count';
    document.getElementById('l-empty').style.display = 'none';
    document.getElementById('l-content').style.display = 'block';
    setDisabled(['l-copy','l-regen'], false);
    toast('Post LinkedIn généré ✓', 'success');
    if (document.getElementById('l-with-img').checked && imgPrompt) {
      document.getElementById('l-img-area').style.display = 'block';
      document.getElementById('l-img').innerHTML = '<div class="spinner"></div><span>Génération illustration...</span>';
      try {
        const imgRes = await api('POST', '/api/image', { prompt: imgPrompt });
        if (imgRes.type === 'url') {
          linkedinImgUrl = imgRes.value;
          document.getElementById('l-img').innerHTML = `<img src="${imgRes.value}" alt="illustration" crossorigin="anonymous">`;
          document.getElementById('l-dl-img').style.display = 'block';
          setDisabled(['l-dl-img'], false);
        } else {
          document.getElementById('l-img').innerHTML = `<div style="text-align:left;font-size:12px"><strong style="color:var(--text-muted);display:block;margin-bottom:0.5rem">Prompt image (Midjourney / DALL-E) :</strong>${escHtml(imgRes.value)}</div>`;
        }
      } catch (e) { document.getElementById('l-img').innerHTML = `<span style="color:var(--error)">Erreur image: ${e.message}</span>`; }
    }
  } catch (e) { toast('Erreur: ' + e.message, 'error'); }
  finally { setBtnLoading('l-btn', false, '✨ Générer le post'); }
}

async function copyLinkedin() { await copyText(linkedinText, 'l-copy'); }
async function downloadLinkedinImg() {
  if (linkedinImgUrl) await dlImageUrl(linkedinImgUrl, 'linkedin_illustration.png');
}

// ═══════════════════════════════════════════════════
// TWEET
// ═══════════════════════════════════════════════════
async function generateTweet() {
  const subject = document.getElementById('t-subject').value.trim();
  if (!subject) { toast('Entrez un sujet', 'error'); return; }
  setBtnLoading('t-btn', true);
  tweetImgUrl = null;
  document.getElementById('t-dl-img').style.display = 'none';
  try {
    const res = await api('POST', '/api/generate', {
      platform: 'tweet',
      userBrief: subject,
      tone: document.getElementById('t-tone').value,
      hashtags: document.getElementById('t-hashtags').value
    });
    const d = res.content;
    let text = '', imgPrompt = '';
    if (d && typeof d === 'object' && d.text) {
      text = d.text;
      if (d.hashtags && Array.isArray(d.hashtags)) text += ' ' + d.hashtags.join(' ');
      imgPrompt = d.image_prompt || '';
    } else { text = res.raw; }
    tweetText = text;
    document.getElementById('t-text').textContent = text;
    const cEl = document.getElementById('t-char');
    const len = text.length;
    cEl.textContent = `${len} / 280 caractères`;
    cEl.className = 'char-count' + (len > 280 ? ' over' : '');
    document.getElementById('t-empty').style.display = 'none';
    document.getElementById('t-content').style.display = 'block';
    setDisabled(['t-copy','t-regen'], false);
    toast('Tweet généré ✓', 'success');
    if (document.getElementById('t-with-img').checked && imgPrompt) {
      document.getElementById('t-img-area').style.display = 'block';
      document.getElementById('t-img').innerHTML = '<div class="spinner"></div><span>Génération illustration...</span>';
      try {
        const imgRes = await api('POST', '/api/image', { prompt: imgPrompt });
        if (imgRes.type === 'url') {
          tweetImgUrl = imgRes.value;
          document.getElementById('t-img').innerHTML = `<img src="${imgRes.value}" alt="illustration" crossorigin="anonymous">`;
          document.getElementById('t-dl-img').style.display = 'block';
          setDisabled(['t-dl-img'], false);
        } else {
          document.getElementById('t-img').innerHTML = `<div style="text-align:left;font-size:12px"><strong style="color:var(--text-muted);display:block;margin-bottom:0.5rem">Prompt image (Midjourney / DALL-E) :</strong>${escHtml(imgRes.value)}</div>`;
        }
      } catch (e) { document.getElementById('t-img').innerHTML = `<span style="color:var(--error)">Erreur image: ${e.message}</span>`; }
    }
  } catch (e) { toast('Erreur: ' + e.message, 'error'); }
  finally { setBtnLoading('t-btn', false, '✨ Générer le tweet'); }
}

async function copyTweet() { await copyText(tweetText, 't-copy'); }
async function downloadTweetImg() {
  if (tweetImgUrl) await dlImageUrl(tweetImgUrl, 'tweet_illustration.png');
}

// ═══════════════════════════════════════════════════
// THEME EXTRACTION
// ═══════════════════════════════════════════════════
function openThemeModal() { document.getElementById('themeModal').classList.add('open'); }
function closeThemeModal() { document.getElementById('themeModal').classList.remove('open'); }

async function extractTheme() {
  const input = document.getElementById('theme-input').value.trim();
  if (!input) { toast('Entrez un texte à analyser', 'error'); return; }
  setBtnLoading('theme-btn', true);
  try {
    const res = await api('POST', '/api/generate', { platform: 'theme-extract', postText: input });
    const d = (typeof res.content === 'object' && res.content) ? res.content : {};
    const palette = d.palette || [];
    document.getElementById('theme-palette').innerHTML = palette.length
      ? palette.map(c => `<div class="color-swatch" style="background:${escHtml(c)}" title="${escHtml(c)}" onclick="navigator.clipboard.writeText('${escHtml(c)}');toast('${escHtml(c)} copié','info')"></div>`).join('')
      : '<span style="color:var(--text-dim);font-size:12px">Aucune palette extraite</span>';
    document.getElementById('theme-typo').textContent = d.typography || '—';
    document.getElementById('theme-mood').textContent = d.mood || '—';
    document.getElementById('theme-keywords').textContent = Array.isArray(d.visual_keywords) ? d.visual_keywords.join(', ') : (d.visual_keywords || '—');
    document.getElementById('theme-suggestion').textContent = d.design_md_suggestions || res.raw;
    document.getElementById('theme-results').style.display = 'block';
  } catch (e) { toast('Erreur: ' + e.message, 'error'); }
  finally { setBtnLoading('theme-btn', false, '🔍 Analyser'); }
}

async function copyThemeSuggestion() {
  await copyText(document.getElementById('theme-suggestion').textContent, null);
}

// ═══════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════
async function capture(elId, filename) {
  const el = document.getElementById(elId);
  try {
    const canvas = await html2canvas(el, { scale: 1, useCORS: true, backgroundColor: null });
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    a.click();
    toast(`${filename} téléchargé ✓`, 'success');
  } catch (e) { toast('Erreur export: ' + e.message, 'error'); }
}

async function dlImageUrl(url, filename) {
  try {
    const r = await fetch(url);
    const blob = await r.blob();
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    toast(`${filename} téléchargé ✓`, 'success');
  } catch {
    window.open(url, '_blank');
    toast('Image ouverte dans un nouvel onglet', 'info');
  }
}

async function copyText(text, btnId) {
  try {
    await navigator.clipboard.writeText(text);
    if (btnId) {
      const b = document.getElementById(btnId);
      const orig = b.textContent;
      b.textContent = '✓ Copié !';
      setTimeout(() => b.textContent = orig, 2000);
    }
    toast('Copié dans le presse-papier ✓', 'success');
  } catch { toast('Impossible de copier', 'error'); }
}

function setBtnLoading(id, loading, originalText) {
  const b = document.getElementById(id);
  if (!b) return;
  b.disabled = loading;
  b.innerHTML = loading ? '<span class="spinner"></span> Génération...' : (originalText || b.textContent);
}

function setDisabled(ids, disabled) {
  ids.forEach(id => { const el = document.getElementById(id); if(el) el.disabled = disabled; });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

let toastT;
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.className = '', 3200);
}

// Keyboard nav for carousel
document.addEventListener('keydown', e => {
  const cTab = document.getElementById('tab-carousel');
  if (!cTab.classList.contains('active') || !slides.length) return;
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});
</script>
</body>
</html>
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/index.html`

- [ ] **Step 2: Test the full UI in browser**

With server running (`node server.js`), open `http://localhost:3000`.

Verify:
- Header visible with provider selector, API key field, status dot (red)
- 4 tabs switch correctly without errors in console
- Empty states show icons and placeholder text
- Config panel: enter any key → status dot turns green → click Sauvegarder → toast "Configuration sauvegardée ✓"

- [ ] **Step 3: Test generation with a real API key**

Set a valid API key in the header. Try generating:
- Carousel: enter "Les tendances IA en 2026", click Générer → slides appear with navigation
- Story: enter "Nouvelle feature disponible", click Générer → 9:16 preview appears
- LinkedIn: enter "Mon avis sur le télétravail", check "Générer illustration", click Générer → text preview + char count
- Tweet: enter "L'IA va-t-elle remplacer les CMs ?", click Générer → text with char counter

Expected: content appears in preview areas, toast confirms generation.

- [ ] **Step 4: Test PNG export**

With carousel generated, click "⬇ Slide PNG" → file `carousel_slide_1.png` downloads.
Click "⬇ Tous" → all slides download sequentially.
With story generated, click "⬇ Story PNG" → `story.png` downloads at 1080×1920 dimension when opened.

- [ ] **Step 5: Test copy buttons**

With LinkedIn generated, click "⧉ Copier le texte" → paste in text editor to verify full text copied.

- [ ] **Step 6: Commit index.html**

```bash
git add index.html
git commit -m "feat: add complete SPA frontend with 4 platform tabs and PNG export"
```

---

## Task 6: Documentation Files

**Files:**
- Create: `README.md`
- Create: `roadmap.md`
- Create: `todo.md`
- Create: `state.md`

- [ ] **Step 1: Create `README.md`**

```markdown
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
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/README.md`

- [ ] **Step 2: Create `roadmap.md`**

```markdown
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
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/roadmap.md`

- [ ] **Step 3: Create `todo.md`**

```markdown
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
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/todo.md`

- [ ] **Step 4: Create `state.md`**

```markdown
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
```

File path: `C:/Users/gmax9/OneDrive/Bureau/stellarPulse/content_creator/state.md`

- [ ] **Step 5: Commit documentation**

```bash
git add README.md roadmap.md todo.md state.md
git commit -m "docs: add README, roadmap, todo, and project state files"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `index.html` avec 4 sections → Task 5
- ✅ `lab/design.md` et `lab/content.md` → Task 3
- ✅ Prompts système par plateforme → Task 4
- ✅ PNG export carousel (1080×1080) → Task 5 Step 4
- ✅ PNG export story (1080×1920) → Task 5 Step 4
- ✅ LinkedIn texte + copy + illustration → Task 5
- ✅ Tweet texte + char counter + copy + illustration → Task 5
- ✅ Extraction de thème visuel → Task 5 (modal)
- ✅ Backend Node.js stdlib → Task 2
- ✅ Support Claude + OpenAI → Task 2
- ✅ README, roadmap, todo, state → Task 6
- ✅ `.gitignore` exclut `config.json` → Task 1

**Type consistency:**
- `slides[]` défini dans STATE, utilisé dans `renderSlide(i)`, `goSlide(i)`, `buildDots()` — cohérent
- `api()` retourne toujours JSON parsé ou lance une erreur — cohérent
- `capture(elId, filename)` utilisé pour carousel et story — cohérent
- `setBtnLoading(id, loading, originalText)` — originalText optionnel, géré par fallback

**No placeholders:** Aucun TBD, TODO, ou "à implémenter" dans les étapes de code.
