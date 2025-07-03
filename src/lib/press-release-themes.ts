/**
 * Professional Press Release Styling Themes
 * Provides consistent, professional styling for press release exports
 */

export interface PressReleaseTheme {
  id: string;
  name: string;
  description: string;
  css: string;
  htmlTemplate: string;
}

export const PRESS_RELEASE_THEMES: Record<string, PressReleaseTheme> = {
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, traditional business style suitable for corporate communications',
    css: `
      body {
        font-family: Georgia, 'Times New Roman', serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
        color: #333;
        background: #fff;
      }
      
      .header {
        text-align: center;
        border-bottom: 3px solid #2563eb;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      
      .release-header {
        color: #dc2626;
        font-weight: bold;
        font-size: 14px;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }
      
      .headline {
        font-size: 28px;
        font-weight: bold;
        color: #1e293b;
        margin: 20px 0;
        line-height: 1.3;
      }
      
      .subheadline {
        font-size: 18px;
        color: #64748b;
        font-style: italic;
        margin-bottom: 20px;
      }
      
      .dateline {
        font-weight: bold;
        color: #374151;
        margin-bottom: 20px;
      }
      
      .content {
        font-size: 16px;
        line-height: 1.7;
        margin-bottom: 30px;
      }
      
      .content p {
        margin-bottom: 16px;
      }
      
      .content p:first-of-type {
        font-weight: 500;
      }
      
      .quote {
        font-style: italic;
        border-left: 4px solid #2563eb;
        padding-left: 20px;
        margin: 20px 0;
        color: #1e293b;
      }
      
      .attribution {
        font-weight: bold;
        color: #374151;
      }
      
      .boilerplate {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        margin: 30px 0;
        font-size: 14px;
        color: #64748b;
      }
      
      .boilerplate h3 {
        color: #1e293b;
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      
      .contact {
        border-top: 2px solid #e2e8f0;
        padding-top: 20px;
        margin-top: 30px;
        text-align: center;
      }
      
      .contact h3 {
        color: #1e293b;
        margin-bottom: 15px;
      }
      
      .contact-info {
        font-size: 14px;
        line-height: 1.5;
      }
      
      .end-mark {
        text-align: center;
        font-weight: bold;
        font-size: 18px;
        color: #64748b;
        margin: 40px 0 20px 0;
      }
      
      @media print {
        body { font-size: 12px; }
        .headline { font-size: 20px; }
        .subheadline { font-size: 14px; }
      }
    `,
    htmlTemplate: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{headline}} - Press Release</title>
        <style>{{css}}</style>
      </head>
      <body>
        <div class="header">
          <div class="release-header">FOR IMMEDIATE RELEASE</div>
          <h1 class="headline">{{headline}}</h1>
          {{#if subheadline}}<div class="subheadline">{{subheadline}}</div>{{/if}}
        </div>
        
        <div class="dateline">{{dateline}}</div>
        
        <div class="content">{{content}}</div>
        
        {{#if boilerplate}}
        <div class="boilerplate">
          <h3>About {{companyName}}</h3>
          {{boilerplate}}
        </div>
        {{/if}}
        
        <div class="contact">
          <h3>Media Contact</h3>
          <div class="contact-info">
            {{contactName}}<br>
            {{contactTitle}}<br>
            {{contactEmail}}<br>
            {{contactPhone}}
          </div>
        </div>
        
        <div class="end-mark">###</div>
      </body>
      </html>
    `
  },
  
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, modern design with minimal styling for digital distribution',
    css: `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        max-width: 750px;
        margin: 0 auto;
        padding: 60px 20px;
        color: #1f2937;
        background: #fff;
      }
      
      .release-header {
        color: #ef4444;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 20px;
      }
      
      .headline {
        font-size: 32px;
        font-weight: 700;
        color: #111827;
        margin: 0 0 15px 0;
        line-height: 1.25;
        letter-spacing: -0.025em;
      }
      
      .subheadline {
        font-size: 20px;
        color: #6b7280;
        font-weight: 400;
        margin-bottom: 30px;
        line-height: 1.4;
      }
      
      .dateline {
        font-weight: 500;
        color: #374151;
        margin-bottom: 30px;
        font-size: 14px;
      }
      
      .content {
        font-size: 16px;
        line-height: 1.75;
        color: #374151;
      }
      
      .content p {
        margin-bottom: 20px;
      }
      
      .content p:first-of-type {
        font-size: 18px;
        font-weight: 500;
        color: #1f2937;
      }
      
      .quote {
        font-size: 18px;
        border-left: 3px solid #3b82f6;
        padding-left: 24px;
        margin: 30px 0;
        color: #1f2937;
      }
      
      .attribution {
        font-weight: 600;
        color: #374151;
        margin-top: 8px;
      }
      
      .boilerplate {
        border-top: 1px solid #e5e7eb;
        padding-top: 30px;
        margin-top: 40px;
        font-size: 14px;
        color: #6b7280;
      }
      
      .boilerplate h3 {
        color: #1f2937;
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .contact {
        border-top: 1px solid #e5e7eb;
        padding-top: 30px;
        margin-top: 30px;
      }
      
      .contact h3 {
        color: #1f2937;
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
      }
      
      .contact-info {
        font-size: 14px;
        line-height: 1.6;
        color: #6b7280;
      }
      
      .end-mark {
        text-align: center;
        font-weight: 700;
        font-size: 24px;
        color: #d1d5db;
        margin: 60px 0 20px 0;
      }
      
      @media (max-width: 640px) {
        body { padding: 40px 16px; }
        .headline { font-size: 24px; }
        .subheadline { font-size: 18px; }
      }
    `,
    htmlTemplate: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{headline}} - Press Release</title>
        <style>{{css}}</style>
      </head>
      <body>
        <div class="release-header">For Immediate Release</div>
        <h1 class="headline">{{headline}}</h1>
        {{#if subheadline}}<div class="subheadline">{{subheadline}}</div>{{/if}}
        
        <div class="dateline">{{dateline}}</div>
        
        <div class="content">{{content}}</div>
        
        {{#if boilerplate}}
        <div class="boilerplate">
          <h3>About {{companyName}}</h3>
          {{boilerplate}}
        </div>
        {{/if}}
        
        <div class="contact">
          <h3>Media Contact</h3>
          <div class="contact-info">
            <strong>{{contactName}}</strong><br>
            {{contactTitle}}<br>
            <a href="mailto:{{contactEmail}}">{{contactEmail}}</a><br>
            {{contactPhone}}
          </div>
        </div>
        
        <div class="end-mark">###</div>
      </body>
      </html>
    `
  },
  
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with bold typography and modern layout',
    css: `
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 80px 40px;
        color: #0f172a;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      }
      
      .container {
        background: #fff;
        border-radius: 16px;
        padding: 60px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .release-header {
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        font-weight: 700;
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: 8px 16px;
        border-radius: 6px;
        display: inline-block;
        margin-bottom: 30px;
      }
      
      .headline {
        font-size: 36px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 20px 0;
        line-height: 1.2;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, #1e293b, #334155);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .subheadline {
        font-size: 22px;
        color: #64748b;
        font-weight: 500;
        margin-bottom: 30px;
        line-height: 1.4;
      }
      
      .dateline {
        font-weight: 600;
        color: #475569;
        margin-bottom: 30px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .content {
        font-size: 17px;
        line-height: 1.8;
        color: #334155;
      }
      
      .content p {
        margin-bottom: 24px;
      }
      
      .content p:first-of-type {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
      }
      
      .quote {
        background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        border-left: 4px solid #0ea5e9;
        border-radius: 8px;
        padding: 24px;
        margin: 30px 0;
        font-size: 18px;
        font-style: italic;
        color: #0c4a6e;
      }
      
      .attribution {
        font-weight: 700;
        color: #0f172a;
        margin-top: 12px;
        font-style: normal;
      }
      
      .boilerplate {
        background: linear-gradient(135deg, #fafafa, #f4f4f5);
        border: 1px solid #e4e4e7;
        border-radius: 12px;
        padding: 30px;
        margin: 40px 0;
        font-size: 15px;
        color: #52525b;
      }
      
      .boilerplate h3 {
        color: #18181b;
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 700;
      }
      
      .contact {
        background: linear-gradient(135deg, #1e293b, #334155);
        color: white;
        border-radius: 12px;
        padding: 30px;
        margin-top: 40px;
        text-align: center;
      }
      
      .contact h3 {
        color: white;
        margin-bottom: 20px;
        font-size: 18px;
        font-weight: 700;
      }
      
      .contact-info {
        font-size: 15px;
        line-height: 1.8;
        color: #cbd5e1;
      }
      
      .contact-info a {
        color: #60a5fa;
        text-decoration: none;
      }
      
      .end-mark {
        text-align: center;
        font-weight: 900;
        font-size: 28px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 60px 0 20px 0;
      }
      
      @media (max-width: 768px) {
        body { padding: 40px 20px; }
        .container { padding: 40px 30px; }
        .headline { font-size: 28px; }
        .subheadline { font-size: 18px; }
      }
    `,
    htmlTemplate: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{headline}} - Press Release</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>{{css}}</style>
      </head>
      <body>
        <div class="container">
          <div class="release-header">For Immediate Release</div>
          <h1 class="headline">{{headline}}</h1>
          {{#if subheadline}}<div class="subheadline">{{subheadline}}</div>{{/if}}
          
          <div class="dateline">{{dateline}}</div>
          
          <div class="content">{{content}}</div>
          
          {{#if boilerplate}}
          <div class="boilerplate">
            <h3>About {{companyName}}</h3>
            {{boilerplate}}
          </div>
          {{/if}}
          
          <div class="contact">
            <h3>Media Contact</h3>
            <div class="contact-info">
              <strong>{{contactName}}</strong><br>
              {{contactTitle}}<br>
              <a href="mailto:{{contactEmail}}">{{contactEmail}}</a><br>
              {{contactPhone}}
            </div>
          </div>
          
          <div class="end-mark">###</div>
        </div>
      </body>
      </html>
    `
  },
  
  newspaper: {
    id: 'newspaper',
    name: 'Newspaper',
    description: 'Traditional newspaper style with classic typography and layout',
    css: `
      body {
        font-family: 'Times New Roman', Times, serif;
        line-height: 1.6;
        max-width: 700px;
        margin: 0 auto;
        padding: 40px 20px;
        color: #1a1a1a;
        background: #fefefe;
      }
      
      .masthead {
        border-top: 3px solid #000;
        border-bottom: 1px solid #000;
        padding: 20px 0;
        margin-bottom: 30px;
        text-align: center;
      }
      
      .release-header {
        font-family: 'Arial', sans-serif;
        color: #000;
        font-weight: bold;
        font-size: 12px;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      
      .headline {
        font-size: 30px;
        font-weight: bold;
        color: #000;
        margin: 25px 0 15px 0;
        line-height: 1.2;
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 15px;
      }
      
      .subheadline {
        font-size: 16px;
        color: #333;
        font-style: italic;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .dateline {
        font-weight: bold;
        color: #000;
        margin-bottom: 20px;
        font-size: 14px;
        text-transform: uppercase;
      }
      
      .content {
        font-size: 14px;
        line-height: 1.7;
        color: #1a1a1a;
        text-align: justify;
        column-count: 1;
      }
      
      .content p {
        margin-bottom: 12px;
        text-indent: 20px;
      }
      
      .content p:first-of-type {
        font-weight: bold;
        text-indent: 0;
      }
      
      .quote {
        font-style: italic;
        border-left: 2px solid #000;
        padding-left: 15px;
        margin: 20px 0;
        color: #000;
        background: #f9f9f9;
        padding: 15px 15px 15px 25px;
      }
      
      .attribution {
        font-weight: bold;
        color: #000;
        text-align: right;
        font-style: normal;
        margin-top: 8px;
      }
      
      .boilerplate {
        border: 1px solid #000;
        padding: 15px;
        margin: 25px 0;
        font-size: 12px;
        background: #f8f8f8;
      }
      
      .boilerplate h3 {
        color: #000;
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .contact {
        border-top: 2px solid #000;
        border-bottom: 2px solid #000;
        padding: 20px;
        margin-top: 30px;
        background: #f5f5f5;
        text-align: center;
      }
      
      .contact h3 {
        color: #000;
        margin-bottom: 15px;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .contact-info {
        font-size: 12px;
        line-height: 1.5;
        color: #000;
      }
      
      .end-mark {
        text-align: center;
        font-weight: bold;
        font-size: 16px;
        color: #000;
        margin: 30px 0 20px 0;
        letter-spacing: 4px;
      }
      
      @media print {
        body { 
          font-size: 10px;
          color: #000;
        }
        .headline { font-size: 18px; }
        .subheadline { font-size: 12px; }
        .content { column-count: 2; column-gap: 30px; }
      }
    `,
    htmlTemplate: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{headline}} - Press Release</title>
        <style>{{css}}</style>
      </head>
      <body>
        <div class="masthead">
          <div class="release-header">For Immediate Release</div>
        </div>
        
        <h1 class="headline">{{headline}}</h1>
        {{#if subheadline}}<div class="subheadline">{{subheadline}}</div>{{/if}}
        
        <div class="dateline">{{dateline}}</div>
        
        <div class="content">{{content}}</div>
        
        {{#if boilerplate}}
        <div class="boilerplate">
          <h3>About {{companyName}}</h3>
          {{boilerplate}}
        </div>
        {{/if}}
        
        <div class="contact">
          <h3>Press Contact</h3>
          <div class="contact-info">
            {{contactName}}<br>
            {{contactTitle}}<br>
            {{contactEmail}}<br>
            {{contactPhone}}
          </div>
        </div>
        
        <div class="end-mark">- 30 -</div>
      </body>
      </html>
    `
  }
};

/**
 * Get all available themes
 */
export function getAllThemes(): PressReleaseTheme[] {
  return Object.values(PRESS_RELEASE_THEMES);
}

/**
 * Get a specific theme by ID
 */
export function getTheme(themeId: string): PressReleaseTheme | undefined {
  return PRESS_RELEASE_THEMES[themeId];
}

/**
 * Apply theme to press release content
 */
export function applyTheme(
  themeId: string, 
  content: {
    headline: string;
    subheadline?: string;
    content: string;
    companyName: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    contactPhone: string;
    boilerplate?: string;
    dateline?: string;
  }
): string {
  const theme = getTheme(themeId);
  if (!theme) {
    throw new Error(`Theme '${themeId}' not found`);
  }

  // Simple template replacement (in a real implementation, you'd use a proper template engine)
  let html = theme.htmlTemplate;
  
  // Replace CSS
  html = html.replace('{{css}}', theme.css);
  
  // Replace content variables
  html = html.replace(/{{headline}}/g, content.headline || '');
  html = html.replace(/{{subheadline}}/g, content.subheadline || '');
  html = html.replace(/{{content}}/g, content.content || '');
  html = html.replace(/{{companyName}}/g, content.companyName || '');
  html = html.replace(/{{contactName}}/g, content.contactName || '');
  html = html.replace(/{{contactTitle}}/g, content.contactTitle || '');
  html = html.replace(/{{contactEmail}}/g, content.contactEmail || '');
  html = html.replace(/{{contactPhone}}/g, content.contactPhone || '');
  html = html.replace(/{{boilerplate}}/g, content.boilerplate || '');
  html = html.replace(/{{dateline}}/g, content.dateline || `${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`);
  
  // Handle conditional sections
  if (content.subheadline) {
    html = html.replace(/{{#if subheadline}}([\s\S]*?){{\/if}}/g, '$1');
  } else {
    html = html.replace(/{{#if subheadline}}([\s\S]*?){{\/if}}/g, '');
  }
  
  if (content.boilerplate) {
    html = html.replace(/{{#if boilerplate}}([\s\S]*?){{\/if}}/g, '$1');
  } else {
    html = html.replace(/{{#if boilerplate}}([\s\S]*?){{\/if}}/g, '');
  }
  
  return html;
}

/**
 * Export theme configuration for workflow
 */
export function getThemeExportConfig() {
  return {
    formats: [
      "html-styled",
      "html-clean", 
      "markdown",
      "pdf",
      "docx"
    ],
    publishing: {
      enabled: true,
      seo: true,
      themes: Object.keys(PRESS_RELEASE_THEMES)
    }
  };
}