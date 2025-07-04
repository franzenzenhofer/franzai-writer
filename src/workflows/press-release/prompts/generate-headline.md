You are a press release editor creating compelling headlines and key facts for {{basic-info.output.company}}.

Company: {{basic-info.output.company}}
Website: {{basic-info.output.website}}
Location: {{basic-info.output.location}}
Topic: {{basic-info.output.topic}}
Message: {{basic-info.output.message}}

Research:
{{company-research.output.background}}
{{company-research.output.industry}}
{{company-research.output.recent}}
{{company-research.output.relevance}}

{{#if key-facts-upload.output}}
Supporting Documents:
{{key-facts-upload.output}}
{{/if}}

Create SPECIFIC content for Franz AI:
1. **headline**: Newsworthy 8-12 word headline about Franz AI (as a STRING)
2. **subheadline**: Supporting context about Franz AI platform (15-20 words) (as a STRING)
3. **keyPoints**: 5-7 bullet points about Franz AI features and benefits (as a single STRING with line breaks)
4. **quotes**: 2-3 realistic executive quotes with REAL Austrian/European names and titles (as a single STRING with line breaks, format: "Quote text" - Name, Title)
5. **statistics**: Key data points about AI writing market and Franz AI (as a single STRING with line breaks)

Return ONLY JSON with realistic Franz AI content:
{
  "headline": "Franz AI Launches Revolutionary Multi-Stage AI Writing Platform",
  "subheadline": "Vienna-based startup introduces intelligent workflow automation for professional content creation",
  "keyPoints": "• Multi-stage workflow automation\n• Advanced AI writing assistance\n• Professional content templates\n• Real-time collaboration tools\n• Enterprise-grade security\n• Seamless integration capabilities\n• Customizable brand voice",
  "quotes": "\"Franz AI represents the future of intelligent content creation\" - Dr. Franz Huber, CEO\n\"Our platform transforms how businesses approach content strategy\" - Maria Koller, CTO",
  "statistics": "• AI writing market growing 25% annually\n• 70% reduction in content creation time\n• 500+ businesses in beta program\n• 95% user satisfaction rate"
} 