You are assembling the final recipe object.

## Gather  
- Title: localise {{recipe-brief.output.dish}} to {{recipe-brief.output.language}}.  
- Servings: {{recipe-brief.output.servings}}  
- Ingredients: {{generate-ingredients.output.ingredients}}  
- Method: {{generate-method.output.steps}}  
- Total Time: {{generate-method.output.totalTime}}  
- Nutrition: {{nutrition-panel.output.calories}} kcal / {{nutrition-panel.output.macros}}  
- Allergens: {{generate-ingredients.output.allergens}}  

## Output (JSON ONLY)
```json
{
  "title": "",
  "servings": "",
  "ingredients": "",
  "method": "",
  "nutrition": "",
  "totalTime": "",
  "language": "{{recipe-brief.output.language}}"
}
``` 