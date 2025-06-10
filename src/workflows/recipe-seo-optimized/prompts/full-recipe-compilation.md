
Compile a full recipe blog post in Markdown format for '{{dish-name.output}}'.

Use the following components:
1.  **Title**: Use '{{dish-name.output}}' as the main H1 title.
2.  **Introduction**:
{{recipe-description-generation.output}}
3.  **Preparation & Cook Time, Servings**:
    *   Prep Time: {{preparation-details.output.prepTime}}
    *   Cook Time: {{preparation-details.output.cookTime}}
    *   Servings: {{preparation-details.output.servings}}
4.  **Ingredients**: List the ingredients clearly. Format them as a Markdown list.
{{ingredients-input.output}}
5.  **Instructions**: Provide clear, step-by-step instructions. Format them as a Markdown numbered list.
{{instructions-input.output}}
6.  **SEO Keywords (Optional - for reference, do not explicitly list in the post unless natural):**
{{seo-keywords-recipe.output.keywords}}
7.  **Tone**: {{recipe-tone-selection.userInput.tone}}
8.  **Target Audience Notes**: {{target-audience-recipe.output.audienceDescription}}, Dietary: {{target-audience-recipe.output.dietaryRestrictions}}


Structure the output as a complete Markdown document. Start with the H1 title.
Ensure proper Markdown formatting for headings, lists, bold text, etc.
Do not include any preamble like "Here is the recipe:". Output only the Markdown content.
