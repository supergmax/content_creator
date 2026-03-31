# Skill : Générer un Tweet / Post X

## Ce que tu dois faire

1. **Lis** `lab/design.md` et `lab/content.md`
2. **Lis** `lab/prompts/tweet.md` (system prompt + format JSON attendu)
3. **Demande** à l'utilisateur si ces infos ne sont pas dans sa requête :
   - Sujet / message principal
   - Ton : percutant | informel / casual | éducatif | opinion forte | humour
   - Hashtags souhaités (optionnel)

4. **Génère** le contenu JSON :
   ```json
   {
     "text": "...",
     "hashtags": ["#...", "#..."],
     "image_prompt": "..."
   }
   ```

5. **Valide** la longueur : `text` + espace + hashtags joints ≤ 280 caractères.  
   Si dépassement, raccourcis le texte avant de continuer.

6. **Sauvegarde** dans `tweet/` :
   - Nom : `tweet_YYYY-MM-DD_[sujet-en-slug].txt`
   - Contenu : voir format ci-dessous

7. **Affiche** dans le terminal :
   - Le tweet complet prêt à copier-coller (encadré clairement)
   - Le compte exact de caractères / 280
   - Le prompt image si disponible
   - Le chemin du fichier sauvegardé

---

## Format du fichier de sortie

```
Tweet — [sujet]
Date : YYYY-MM-DD
Caractères : [N] / 280

---

[texte + hashtags]

---

Prompt illustration :
[image_prompt]
```
