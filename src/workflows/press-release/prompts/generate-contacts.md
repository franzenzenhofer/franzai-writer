Generate REAL contact information based on company research.

Company: {{basic-info.output.company}}
Location: {{basic-info.output.location}}
Website: {{basic-info.output.website}}

Research Background:
{{company-research.output.background}}

{{#if contact-preferences.output}}
Preferences:
- Department: {{contact-preferences.output.department}}
- Include Agency: {{contact-preferences.output.includeAgency}}
{{/if}}

Create REALISTIC contact details based on the company location and industry:
1. **name**: Real Austrian/European business name (as a STRING)
2. **title**: Appropriate executive title (as a STRING) 
3. **email**: Professional email using company domain (as a STRING)
4. **phone**: Austrian/European phone format +43 for Austria (as a STRING)
5. **additional**: Additional realistic contact if needed (as a STRING)

Return ONLY JSON:
{
  "name": "Real Austrian/European name",
  "title": "Specific executive title",
  "email": "name@franzai.com",
  "phone": "+43-1-XXX-XXXX",
  "additional": "Additional contact info"
} 