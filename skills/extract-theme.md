# Skill : Extraire un Thème Visuel

Analyse le style visuel d'un post ou d'une marque existante pour enrichir `lab/design.md`.

## Ce que tu dois faire

1. **Lis** `lab/prompts/theme-extract.md` (system prompt + format JSON attendu)
2. **Prends** le texte fourni par l'utilisateur (description d'un post, capture écran décrite, URL d'inspiration, etc.)

3. **Génère** l'analyse JSON :
   ```json
   {
     "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
     "typography": "...",
     "mood": "...",
     "visual_keywords": ["...", "...", "..."],
     "design_md_suggestions": "..."
   }
   ```

4. **Affiche** dans le terminal :
   - La palette de couleurs avec les codes hex
   - Le style typographique détecté
   - L'ambiance / mood
   - Les mots-clés visuels
   - La suggestion complète pour `lab/design.md`

5. **Propose** à l'utilisateur d'intégrer les suggestions dans `lab/design.md` :
   - Si l'utilisateur dit oui : lis le fichier actuel et intègre les suggestions de façon cohérente
   - Si non : affiche juste les suggestions pour qu'il puisse les copier manuellement

---

## Exemple d'entrée utilisateur

```
"Analyse le style de cette marque : posts minimalistes sur fond blanc cassé, 
typographie serif noire, photos lifestyle noir et blanc, ambiance premium et épurée, 
marque de cosmétiques naturels haut de gamme. Couleurs récurrentes : blanc cassé #F5F0EB, 
noir doux #1A1A1A, doré discret #C9A96E."
```
