import fs from 'fs';
import path from 'path';

describe('Prompt Quality Assurance', () => {
  const promptsDir = path.join(__dirname, '..', 'prompts');
  const promptFiles = fs.readdirSync(promptsDir).filter(file => file.endsWith('.md'));

  it('should have created all expected prompt files', () => {
    const expectedFiles = [
      '01_style_corpus.md',
      '02_style_profile.md',
      '03_research.md',
      '04_headline_facts.md',
      '05_contacts.md',
      '06_fact_check.md',
      '07_draft_release.md',
      '08_press_photo_briefing.md',
      '09_create_press_image_prompt.md',
      '11_html_preview.md',
      '12_html_styled_template.md',
      '12_html_clean_template.md'
    ];

    expectedFiles.forEach(file => {
      expect(promptFiles).toContain(file);
    });
  });

  it('should ensure each prompt file is non-empty and meaningful', () => {
    promptFiles.forEach(file => {
      const content = fs.readFileSync(path.join(promptsDir, file), 'utf-8').trim();
      expect(content.length).toBeGreaterThan(30);
      // Basic sanity: should reference at least one mustache variable ({{ … }})
      expect(/\{\{[^}]+\}\}/.test(content)).toBe(true);
    });
  });
}); 