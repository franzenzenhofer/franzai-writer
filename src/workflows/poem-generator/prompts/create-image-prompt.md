Based on the poem and image customization settings, create optimized imagen prompts and unique filenames.

Poem Title: {{generate-poem-with-title.output.title}}
Poem Content:
{{generate-poem-with-title.output.poem}}

Image Customization:
- Style: {{image-briefing.output.style}}
- Aspect Ratio: {{image-briefing.output.aspectRatio}}
- Number of Images: {{image-briefing.output.numberOfImages}}
{{#if image-briefing.output.additionalPrompt}}- Additional Instructions: {{image-briefing.output.additionalPrompt}}{{/if}}

Create a response with:
1. An optimized imagen prompt that captures the poem's essence and mood while incorporating the specified style
2. Generate EXACTLY {{image-briefing.output.numberOfImages}} unique filenames (3-4 words each, highly unique)

Format as JSON:
{
  "imagenPrompt": "Your optimized prompt here",
  "filenames": ["unique-filename-one", "unique-filename-two", "etc..."]
}

IMPORTANT:
- The imagen prompt should be detailed and evocative, capturing the poem's themes and emotions
- Include the specified artistic style in the prompt
- You MUST generate exactly {{image-briefing.output.numberOfImages}} filenames in the array
- Each filename must be 3-4 words, descriptive, and highly unique (avoid generic terms)
- Do NOT include any text, words, letters, or writing in the image prompt description
- Make the prompt visually focused and artistic
- If numberOfImages is 2, provide exactly 2 filenames. If 3, provide exactly 3 filenames, etc. 