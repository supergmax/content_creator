# Skill : Générer un Post LinkedIn

## Ce que tu dois faire

1. **Lis** `lab/design.md` et `lab/content.md`
2. **Lis** `lab/prompts/linkedin.md` (system prompt + format JSON attendu)
3. **Demande** à l'utilisateur si ces infos ne sont pas dans sa requête :
   - Sujet / thème du post
   - Ton : professionnel | authentique / personnel | expert / thought leader | inspirant | storytelling
   - Hashtags souhaités (optionnel)
   - Instructions libres (ex: terminer par une question, format liste, longueur cible)

4. **Génère** le contenu JSON :
   ```json
   {
     "text": "...",
     "hashtags": ["#...", "#...", "..."],
     "image_prompt": "..."
   }
   ```

5. **Assemble** le texte final : `text` + saut de ligne + hashtags joints par espace

6. **Sauvegarde** dans `linkedin_post/` :
   - Nom : `linkedin_YYYY-MM-DD_[sujet-en-slug].md`
   - Contenu : voir format ci-dessous

7. **Affiche** dans le terminal :
   - Le texte complet prêt à copier-coller (encadré clairement)
   - Le compte de caractères
   - Le prompt image (pour générer une illustration avec Midjourney ou DALL-E)
   - Le chemin du fichier sauvegardé

---

## Format du fichier de sortie

```markdown
# Post LinkedIn — [sujet]
**Date :** YYYY-MM-DD

---

[texte complet du post avec hashtags]

---

**Prompt illustration (Midjourney / DALL-E) :**
[image_prompt du JSON]

**Caractères :** [nombre]
```
