Create default image specifications for a press release photo.

Press Release Context:
Company: {{basic-info.output.company}}
Topic: {{basic-info.output.topic}}
Headline: {{generate-headline.output.headline}}

Return ONLY this JSON:
{
  "imageType": "concept",
  "description": "Professional corporate concept illustration representing {{basic-info.output.topic}} announcement for {{basic-info.output.company}}",
  "aspectRatio": "16:9",
  "numberOfImages": "2"
} 