Create a professional press release following AP style.

**Company Details:**
{{basic-info.output.company}} | {{basic-info.output.location}}
{{basic-info.output.topic}}
{{basic-info.output.message}}
Website: {{basic-info.output.website}}

**Tone & Style:**
{{tone-analysis.output.tone}}
{{tone-analysis.output.style}}

**Content Elements:**
Headline: {{generate-headline.output.headline}}
Subheadline: {{generate-headline.output.subheadline}}
Key Points: {{generate-headline.output.keyPoints}}
Quotes: {{generate-headline.output.quotes}}
Statistics: {{generate-headline.output.statistics}}

**Research Context:**
{{company-research.output.background}}
{{company-research.output.industry}}
{{company-research.output.recent}}

**Media Contact:**
{{generate-contacts.output.name}}, {{generate-contacts.output.title}}
{{generate-contacts.output.email}} | {{generate-contacts.output.phone}}

**Fact-Check Status:** {{fact-check.output.status}}

CRITICAL: Write a complete press release with:
- FOR IMMEDIATE RELEASE header
- Dateline: {{basic-info.output.location}} - July 3, 2025
- Use EXACT headline: {{generate-headline.output.headline}}
- Use EXACT quotes: {{generate-headline.output.quotes}}
- Use EXACT contact: {{generate-contacts.output.name}}, {{generate-contacts.output.title}}, {{generate-contacts.output.email}}, {{generate-contacts.output.phone}}
- Body paragraphs with researched context
- About {{basic-info.output.company}} section

NO PLACEHOLDERS ALLOWED: Use only actual data from previous stages. NO [Current Date], NO [Placeholder Name], NO generic content. Every name, date, quote, and fact must come from the generated data above. 