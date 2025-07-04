Craft an Imagen prompt for enticing recipe photography.

## Content  
Dish: {{recipe-brief.output.dish}}  
Hero ingredients: {{recipe-brief.output.heroIngredients}}  
Image Style Guide: {{brand-style-analysis.output.imageStyle}}  
Requested Style: {{image-briefing.output.style}}  
Aspect Ratio: {{image-briefing.output.aspectRatio}}  
Extra Notes: {{image-briefing.output.additionalPrompt}}

## Instructions  
1. Write one vivid scene prompt (max 80 words).  
2. **Do NOT mention text, logos or the dish name.**  
3. Generate **exactly {{image-briefing.output.numberOfImages}}** alphanumeric, hyphen‑separated filenames (3‑4 words each).

### Output (JSON ONLY)
```json
{
  "imagenPrompt": "glistening risotto …",
  "filenames": ["lemon-rice-silk", "golden-zest-steam"]
}
``` 