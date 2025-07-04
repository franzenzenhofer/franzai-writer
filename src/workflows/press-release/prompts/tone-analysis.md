You are a senior communications strategist analyzing corporate messaging style.

Company: {{basic-info.output.company}}
Website: {{basic-info.output.website}}
Topic: {{basic-info.output.topic}}

{{#if tone-materials.output}}
Reference Materials Provided:
{{tone-materials.output}}
{{/if}}

Analyze the company's communication style based on available information and provide:

1. **tone**: Primary voice characteristics (e.g., authoritative, approachable)
2. **style**: Writing style preferences (sentence structure, technical depth)
3. **phrases**: Key industry terms and brand language
4. **formatting**: Preferred formatting conventions

CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no additional text. Just the JSON object:
{
  "tone": "Description of tone",
  "style": "Writing style guidelines",
  "phrases": "Key terminology and phrases",
  "formatting": "Formatting preferences"
} 