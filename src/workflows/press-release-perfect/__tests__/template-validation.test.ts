import workflowData from '../workflow.json';
import { Workflow, WorkflowStage } from '@/types';

describe('Press Release Perfect Template Validation', () => {
  const workflow = workflowData as Workflow;

  describe('Export Template Configuration', () => {
    const exportStage = workflow.stages.find(stage => stage.id === 'export');

    it('should have all required export formats', () => {
      expect(exportStage).toBeDefined();
      const formats = exportStage!.exportConfig!.formats;
      
      expect(formats).toHaveProperty('html-styled');
      expect(formats).toHaveProperty('html-clean');
      expect(formats).toHaveProperty('markdown');
      expect(formats).toHaveProperty('pdf');
      expect(formats).toHaveProperty('docx');
    });

    it('should have correct template file references', () => {
      const formats = exportStage!.exportConfig!.formats;
      
      expect(formats['html-styled'].promptFile).toBe('prompts/12_html_styled_template.md');
      expect(formats['html-clean'].promptFile).toBe('prompts/12_html_clean_template.md');
      
      // Derived formats should not have prompt files
      expect(formats['markdown'].promptFile).toBeUndefined();
      expect(formats['pdf'].promptFile).toBeUndefined();
      expect(formats['docx'].promptFile).toBeUndefined();
    });

    it('should have correct derivation settings', () => {
      const formats = exportStage!.exportConfig!.formats;
      
      expect(formats['markdown'].deriveFrom).toBe('html-clean');
      expect(formats['pdf'].deriveFrom).toBe('html-styled');
      expect(formats['docx'].deriveFrom).toBe('html-styled');
    });

    it('should have correct enabled settings', () => {
      const formats = exportStage!.exportConfig!.formats;
      
      Object.values(formats).forEach(format => {
        expect(format.enabled).toBe(true);
      });
    });
  });

  describe('Prompt File Structure', () => {
    const promptFileStages = workflow.stages.filter(s => s.promptFile);

    it('should have all required prompt files', () => {
      const expectedPromptFiles = [
        'prompts/01_style_corpus.md',
        'prompts/02_style_profile.md',
        'prompts/03_research.md',
        'prompts/04_headline_facts.md',
        'prompts/05_contacts.md',
        'prompts/06_fact_check.md',
        'prompts/07_draft_release.md',
        'prompts/08_press_photo_briefing.md',
        'prompts/09_create_press_image_prompt.md',
        'prompts/11_html_preview.md',
        'prompts/12_html_styled_template.md',
        'prompts/12_html_clean_template.md'
      ];

      const actualPromptFiles = promptFileStages.map(s => s.promptFile);
      
      // Add export template files
      const exportFormats = workflow.stages.find(s => s.id === 'export')!.exportConfig!.formats;
      actualPromptFiles.push(exportFormats['html-styled'].promptFile!);
      actualPromptFiles.push(exportFormats['html-clean'].promptFile!);

      expectedPromptFiles.forEach(file => {
        expect(actualPromptFiles).toContain(file);
      });
    });

    it('should have consecutive numbering for main workflow prompts', () => {
      const mainPrompts = promptFileStages
        .filter(s => s.id !== 'export')
        .map(s => s.promptFile)
        .filter(f => f?.startsWith('prompts/'))
        .sort();

      // Check for consecutive numbering (note: no 10 because that's image generation)
      const expectedNumbers = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '11'];
      expectedNumbers.forEach(num => {
        const hasFile = mainPrompts.some(file => file?.includes(`/${num}_`));
        expect(hasFile).toBe(true);
      });
    });
  });

  describe('JSON Output Validation', () => {
    const jsonStages = workflow.stages.filter(s => s.outputType === 'json');

    it('should define all expected output fields', () => {
      jsonStages.forEach(stage => {
        if (stage.id !== 'brief') { // Brief uses form fields instead
          expect(stage.jsonFields).toBeDefined();
          expect(stage.jsonFields!.length).toBeGreaterThan(0);
          
          stage.jsonFields!.forEach(field => {
            expect(field).toMatchObject({
              key: expect.any(String),
              label: expect.any(String),
              type: expect.any(String)
            });
          });
        }
      });
    });

    it('should have correct JSON field definitions', () => {
      // Style profile fields
      const styleProfile = workflow.stages.find(s => s.id === 'style-profile');
      const styleFields = styleProfile!.jsonFields!.map(f => f.key);
      expect(styleFields).toEqual(['tone', 'style_rules', 'boilerplate']);

      // Research fields
      const research = workflow.stages.find(s => s.id === 'research');
      const researchFields = research!.jsonFields!.map(f => f.key);
      expect(researchFields).toEqual(['background', 'industry', 'recent', 'stats']);

      // Headline facts fields
      const headlineFacts = workflow.stages.find(s => s.id === 'headline-facts');
      const headlineFields = headlineFacts!.jsonFields!.map(f => f.key);
      expect(headlineFields).toEqual(['headline', 'subheadline', 'bullets', 'quotes', 'metrics']);

      // Contacts fields
      const contacts = workflow.stages.find(s => s.id === 'contacts');
      const contactFields = contacts!.jsonFields!.map(f => f.key);
      expect(contactFields).toEqual(['name', 'title', 'email', 'phone']);

      // Fact check fields
      const factCheck = workflow.stages.find(s => s.id === 'fact-check');
      const factFields = factCheck!.jsonFields!.map(f => f.key);
      expect(factFields).toEqual(['verdict', 'fixes']);
    });
  });

  describe('Image Generation Templates', () => {
    it('should have correct image generation settings', () => {
      const generateStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      
      expect(generateStage!.imageGenerationSettings).toBeDefined();
      expect(generateStage!.imageGenerationSettings!.provider).toBe('imagen');
      expect(generateStage!.imageGenerationSettings!.aspectRatio).toBe('{{press-photo-briefing.output.aspect}}');
      expect(generateStage!.imageGenerationSettings!.numberOfImages).toBe('{{press-photo-briefing.output.numImages}}');
      expect(generateStage!.imageGenerationSettings!.filenames).toBe('{{create-press-image-prompt.output.filenames}}');
    });

    it('should have correct prompt template for image generation', () => {
      const generateStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      expect(generateStage!.promptTemplate).toBe('{{create-press-image-prompt.output.prompt}}');
    });

    it('should hide image metadata', () => {
      const generateStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      expect(generateStage!.hideImageMetadata).toBe(true);
    });
  });

  describe('Language Support', () => {
    it('should support required languages in brief form', () => {
      const briefStage = workflow.stages.find(s => s.id === 'brief');
      const languageField = briefStage!.formFields!.find(f => f.name === 'language');
      
      expect(languageField!.options).toEqual([
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' },
        { value: 'fr', label: 'Français' }
      ]);
    });

    it('should have language-aware prompt templates', () => {
      // Check that prompt files should reference language
      const languageAwareStages = [
        'style-profile',
        'research',
        'headline-facts',
        'contacts',
        'draft-release',
        'html-preview'
      ];

      languageAwareStages.forEach(stageId => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage!.promptFile).toBeDefined();
      });
    });
  });

  describe('Publishing Configuration', () => {
    const exportStage = workflow.stages.find(s => s.id === 'export');

    it('should have correct publishing settings', () => {
      const publishing = exportStage!.exportConfig!.publishing;
      
      expect(publishing.enabled).toBe(true);
      expect(publishing.instant).toBe(true);
      expect(publishing.formats).toEqual(['html-styled', 'html-clean']);
    });

    it('should have SEO features enabled', () => {
      const seoFeatures = exportStage!.exportConfig!.publishing.features.seo;
      
      expect(seoFeatures.openGraph).toBe(true);
      expect(seoFeatures.structuredData).toBe(true);
    });
  });

  describe('Fact-Check Integration', () => {
    it('should have fact-check stage with blocking capability', () => {
      const factCheckStage = workflow.stages.find(s => s.id === 'fact-check');
      
      expect(factCheckStage).toBeDefined();
      expect(factCheckStage!.autoRun).toBe(true);
      expect(factCheckStage!.activationDependencies).toEqual(['headline-facts']);
      
      // Should have verdict field for blocking
      const verdictField = factCheckStage!.jsonFields!.find(f => f.key === 'verdict');
      expect(verdictField).toBeDefined();
    });

    it('should have stages that depend on fact-check', () => {
      const draftStage = workflow.stages.find(s => s.id === 'draft-release');
      expect(draftStage!.activationDependencies).toContain('fact-check');
    });
  });

  describe('Three-Step Image Chain', () => {
    it('should have exactly three consecutive image stages', () => {
      const imageStageIds = [
        'press-photo-briefing',
        'create-press-image-prompt',
        'generate-press-photo'
      ];

      imageStageIds.forEach(stageId => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage).toBeDefined();
      });

      // Check they are consecutive in workflow
      const stageIds = workflow.stages.map(s => s.id);
      const briefingIndex = stageIds.indexOf('press-photo-briefing');
      const promptIndex = stageIds.indexOf('create-press-image-prompt');
      const generateIndex = stageIds.indexOf('generate-press-photo');

      expect(promptIndex).toBe(briefingIndex + 1);
      expect(generateIndex).toBe(promptIndex + 1);
    });

    it('should have correct dependencies in image chain', () => {
      const briefingStage = workflow.stages.find(s => s.id === 'press-photo-briefing');
      expect(briefingStage!.activationDependencies).toEqual(['draft-release']);

      const promptStage = workflow.stages.find(s => s.id === 'create-press-image-prompt');
      expect(promptStage!.activationDependencies).toEqual(['press-photo-briefing']);

      const generateStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      expect(generateStage!.activationDependencies).toEqual(['create-press-image-prompt']);
    });
  });
}); 