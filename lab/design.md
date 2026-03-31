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

---

## Style Instagram Carousel (référence validée)

> Design extrait du carousel StellarPulse existant — à réutiliser pour tous les futurs carousels.

### Format
- Ratio : **4:5 portrait** (1080×1350 px) — pas 1:1

### Typographies spécifiques Instagram
- Titres slides : **Rajdhani Bold 700** — géométrique, tech, légèrement condensé
- Corps slides : Inter Regular 400
- Numéros de slide : Rajdhani Bold, taille ~310px, semi-transparent

### Palette Instagram (dark tech)
- Fond base : `#020810` (quasi-noir)
- Accent cyan : `#00d4ff`
- Accent rose/magenta : `#ff2d78`
- Texte titre : `#ffffff`
- Texte corps : `rgba(255,255,255,0.76)`
- Ambiance "glow" : blobs radial-gradient cyan ou rose sur fond sombre

### Layout des slides — contenu en bas
- Background : gradient sombre + blob ambient light (radial-gradient accent)
- Overlay gradient : transparent jusqu'à 38%, puis fondu vers `rgba(2,8,16,0.97)` en bas
- Grand numéro : `top:36px; left:52px`, 310px, couleur accent à 18% opacité
- Badge tag : pill avec border accent, texte uppercase 14px — ex: `• COMMANDE 01`
- Tag commande : bloc 72px Rajdhani, background `rgba(255,255,255,0.07)`, border subtle
- Titre : Rajdhani Bold 78px, blanc pur, peut tenir sur 2 lignes
- Corps : Inter 31px, mots-clés colorés en `.c` (cyan) ou `.p` (pink)

### Pattern couleurs par slide (alternance)
- Slide intro : cyan
- Slide contenu impair : cyan (`#00d4ff`)
- Slide contenu pair : rose (`#ff2d78`)
- Slide CTA : gradient pink → violet → cyan (logo STELLARPULSE)

### Navigation (inside slide)
- Bottom-left : dots (inactif = `rgba(255,255,255,0.25)`, actif = couleur accent, elongated `28px × 5px`)
- Bottom-right : `SWIPE →` en uppercase 12px, opacity 38%, caché sur dernière slide

### Slide CTA (dernière)
- Titre : "Save ce post 💾" ou "Sauve ce post 💾"
- Séparateur : `52px × 2px` gradient pink→cyan
- Bouton : border `rgba(255,255,255,0.42)`, Rajdhani 32px, no fill
- Logo STELLARPULSE : gradient `#ff2d78 → #9333ea → #00d4ff`, Rajdhani 54px, letter-spacing 0.12em
- Handle : `@stellarpulse0 | stellarpulse.fr`, Inter 20px, opacity 40%

### Texture grain
- Pseudo-element `::after`, SVG feTurbulence fractalNoise, opacity 0.038
- Donne l'effet cinématique des photos sombres
