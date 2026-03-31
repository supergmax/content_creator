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
  if (!result.content?.[0]?.text) throw new Error('Claude API a retourné une réponse vide');
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
  if (!result.choices?.[0]?.message?.content) throw new Error('OpenAI API a retourné une réponse vide');
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
  try {
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
    const updated = {
      ...cfg,
      ...(body.provider !== undefined && { provider: body.provider }),
      ...(body.apiKey !== undefined && { apiKey: body.apiKey }),
      ...(body.model !== undefined && { model: body.model })
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2));
    sendJSON(res, 200, { ok: true });
    return;
  }

  // POST /api/generate — generate content for a platform
  if (req.method === 'POST' && url === '/api/generate') {
    const { platform, userBrief, tone, hashtags, slideCount, instructions, postText } = await readBody(req);
    const cfg = readConfig();

    const ALLOWED_PLATFORMS = ['carousel', 'story', 'linkedin', 'tweet', 'theme-extract'];
    if (!ALLOWED_PLATFORMS.includes(platform)) {
      sendJSON(res, 400, { error: `Plateforme inconnue: ${platform}` });
      return;
    }

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
  } catch (err) {
    if (!res.headersSent) sendJSON(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n⚡ StellarPulse Content Creator');
  console.log(`   → http://localhost:${PORT}`);
  console.log('   Ctrl+C pour arrêter\n');
});
