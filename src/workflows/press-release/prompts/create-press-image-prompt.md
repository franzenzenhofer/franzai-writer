Create optimized imagen prompts for press release images.

Press Release Context:
Company: {{basic-info.output.company}}
Announcement: {{basic-info.output.topic}}
Headline: {{generate-headline.output.headline}}

Image Requirements:
- Type: {{press-photo-briefing.output.imageType}}
- Description: {{press-photo-briefing.output.description}}
- Aspect Ratio: {{press-photo-briefing.output.aspectRatio}}
- Number of Images: {{press-photo-briefing.output.numberOfImages}}

Create a response with:
1. An optimized imagen prompt for professional press release imagery
2. Generate EXACTLY {{press-photo-briefing.output.numberOfImages}} unique filenames (3-4 words each)

Format as JSON:
{
  "imagenPrompt": "Your optimized prompt here",
  "filenames": ["unique-filename-one", "unique-filename-two", "etc..."]
}

IMPORTANT:
- The imagen prompt should be professional and corporate-appropriate
- Include the specified image type in the prompt
- You MUST generate exactly {{press-photo-briefing.output.numberOfImages}} filenames in the array
- Each filename must be 3-4 words, descriptive, and highly unique
- Do NOT include any text, logos, or writing in the image prompt description
- Make the prompt visually focused and professional 