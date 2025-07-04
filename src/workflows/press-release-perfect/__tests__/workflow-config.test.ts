import workflowData from '../workflow.json';
import { Workflow, WorkflowStage } from '@/types';

describe('Press Release Perfect Workflow Configuration', () => {
  const workflow = workflowData as Workflow;

  describe('Workflow Metadata', () => {
    it('should have correct basic properties', () => {
      expect(workflow.id).toBe('press-release-perfect');
      expect(workflow.shortName).toBe('press-release');
      expect(workflow.name).toBe('Press Release Generator (Perfect)');
      expect(workflow.description).toContain('One‑form, auto‑cascade workflow');
    });

    it('should have proper configuration', () => {
      expect(workflow.config).toMatchObject({
        setTitleFromStageOutput: 'headline-facts',
        finalOutputStageId: 'html-preview',
        showThinking: false,
        autoScroll: { enabled: true, scrollToAutorun: true },
        progressAnimation: { dynamicSpeed: true, singleCycle: false }
      });
    });
  });

  describe('Workflow Stages', () => {
    it('should have exactly 13 stages', () => {
      expect(workflow.stages).toHaveLength(13);
    });

    it('should have all required stages with correct IDs', () => {
      const stageIds = workflow.stages.map(s => s.id);
      expect(stageIds).toEqual([
        'brief',
        'style-corpus',
        'style-profile',
        'research',
        'headline-facts',
        'contacts',
        'fact-check',
        'draft-release',
        'press-photo-briefing',
        'create-press-image-prompt',
        'generate-press-photo',
        'html-preview',
        'export'
      ]);
    });

    describe('Brief Stage (Manual Entry)', () => {
      const stage = workflow.stages[0];

      it('should be configured as form input', () => {
        expect(stage.id).toBe('brief');
        expect(stage.inputType).toBe('form');
        expect(stage.outputType).toBe('json');
        expect(stage.autoRun).toBe(false);
      });

      it('should have all required form fields', () => {
        expect(stage.formFields).toHaveLength(7);
        const fieldNames = stage.formFields?.map(f => f.name) || [];
        expect(fieldNames).toEqual([
          'company', 'website', 'announcement', 'why', 'location', 'releaseDate', 'language'
        ]);
      });

      it('should have language selector with EN/DE/FR options', () => {
        const languageField = stage.formFields?.find(f => f.name === 'language');
        expect(languageField?.type).toBe('select');
        expect(languageField?.defaultValue).toBe('en');
        expect(languageField?.options).toEqual([
          { value: 'en', label: 'English' },
          { value: 'de', label: 'Deutsch' },
          { value: 'fr', label: 'Français' }
        ]);
      });

      it('should have proper validation for required fields', () => {
        const requiredFields = stage.formFields?.filter(f => f.validation?.required) || [];
        expect(requiredFields).toHaveLength(5); // company, announcement, why, location, releaseDate
      });
    });

    describe('Style Corpus Stage', () => {
      const stage = workflow.stages[1];

      it('should be configured for web crawling', () => {
        expect(stage.id).toBe('style-corpus');
        expect(stage.inputType).toBe('none');
        expect(stage.outputType).toBe('context');
        expect(stage.autoRun).toBe(true);
        expect(stage.grounding).toEqual({ urlContext: true });
      });

      it('should depend only on brief stage', () => {
        expect(stage.activationDependencies).toEqual(['brief']);
      });

      it('should use appropriate model', () => {
        expect(stage.model).toBe('gemini-2.5-flash');
        expect(stage.promptFile).toBe('prompts/01_style_corpus.md');
      });
    });

    describe('Style Profile Stage', () => {
      const stage = workflow.stages[2];

      it('should output JSON with correct fields', () => {
        expect(stage.outputType).toBe('json');
        expect(stage.jsonFields).toHaveLength(3);
        const fieldKeys = stage.jsonFields?.map(f => f.key) || [];
        expect(fieldKeys).toEqual(['tone', 'style_rules', 'boilerplate']);
      });

      it('should depend on style-corpus', () => {
        expect(stage.activationDependencies).toEqual(['style-corpus']);
      });
    });

    describe('Research Stage', () => {
      const stage = workflow.stages[3];

      it('should have Google Search grounding enabled', () => {
        expect(stage.grounding).toEqual({ 
          googleSearch: true, 
          urlContext: true 
        });
      });

      it('should have proper JSON output fields', () => {
        const fieldKeys = stage.jsonFields?.map(f => f.key) || [];
        expect(fieldKeys).toEqual(['background', 'industry', 'recent', 'stats']);
      });
    });

    describe('Headline Facts Stage', () => {
      const stage = workflow.stages[4];

      it('should be editable with AI redo', () => {
        expect(stage.aiRedoEnabled).toBe(true);
        expect(stage.editEnabled).toBe(true);
        expect(stage.copyable).toBe(true);
      });

      it('should have comprehensive JSON fields', () => {
        const fieldKeys = stage.jsonFields?.map(f => f.key) || [];
        expect(fieldKeys).toEqual(['headline', 'subheadline', 'bullets', 'quotes', 'metrics']);
      });

      it('should depend on research and style-profile', () => {
        expect(stage.activationDependencies).toContain('research');
        expect(stage.activationDependencies).toContain('style-profile');
      });
    });

    describe('Fact Check Stage', () => {
      const stage = workflow.stages[6];

      it('should have low temperature for accuracy', () => {
        expect(stage.temperature).toBe(0.1);
      });

      it('should have verdict and fixes fields', () => {
        const fieldKeys = stage.jsonFields?.map(f => f.key) || [];
        expect(fieldKeys).toEqual(['verdict', 'fixes']);
      });

      it('should have Google Search grounding for verification', () => {
        expect(stage.grounding).toEqual({ googleSearch: true });
      });
    });

    describe('Three-Step Image Pipeline', () => {
      const briefingStage = workflow.stages[8];
      const promptStage = workflow.stages[9];
      const generationStage = workflow.stages[10];

      it('should have correct stage sequence', () => {
        expect(briefingStage.id).toBe('press-photo-briefing');
        expect(promptStage.id).toBe('create-press-image-prompt');
        expect(generationStage.id).toBe('generate-press-photo');
      });

      it('should have proper dependencies in sequence', () => {
        expect(briefingStage.activationDependencies).toEqual(['draft-release']);
        expect(promptStage.activationDependencies).toEqual(['press-photo-briefing']);
        expect(generationStage.activationDependencies).toEqual(['create-press-image-prompt']);
      });

      it('should use Imagen model for generation', () => {
        expect(generationStage.model).toBe('imagen-3.0-generate-002');
        expect(generationStage.provider).toBe('imagen');
        expect(generationStage.outputType).toBe('image');
      });

      it('should have dynamic image settings', () => {
        expect(generationStage.imageGenerationSettings).toMatchObject({
          provider: 'imagen',
          aspectRatio: '{{press-photo-briefing.output.aspect}}',
          numberOfImages: '{{press-photo-briefing.output.numImages}}',
          filenames: '{{create-press-image-prompt.output.filenames}}'
        });
      });
    });

    describe('Export Stage', () => {
      const stage = workflow.stages[12];

      it('should be configured as export stage', () => {
        expect(stage.stageType).toBe('export');
        expect(stage.outputType).toBe('export-interface');
      });

      it('should support all required export formats', () => {
        const formats = stage.exportConfig?.formats;
        expect(formats).toHaveProperty('html-styled');
        expect(formats).toHaveProperty('html-clean');
        expect(formats).toHaveProperty('markdown');
        expect(formats).toHaveProperty('pdf');
        expect(formats).toHaveProperty('docx');
      });

      it('should have publishing configuration', () => {
        expect(stage.exportConfig?.publishing).toMatchObject({
          enabled: true,
          instant: true,
          formats: ['html-styled', 'html-clean'],
          features: { seo: { openGraph: true, structuredData: true } }
        });
      });
    });
  });

  describe('Stage Dependencies', () => {
    it('should have valid dependency chain', () => {
      const stageMap = new Map(workflow.stages.map(s => [s.id, s]));
      
      workflow.stages.forEach(stage => {
        if (stage.activationDependencies) {
          stage.activationDependencies.forEach(depId => {
            expect(stageMap.has(depId)).toBe(true);
          });
        }
      });
    });

    it('should have no circular dependencies', () => {
      const visited = new Set<string>();
      const inStack = new Set<string>();
      
      const hasCycle = (stageId: string): boolean => {
        if (inStack.has(stageId)) return true;
        if (visited.has(stageId)) return false;
        
        visited.add(stageId);
        inStack.add(stageId);
        
        const stage = workflow.stages.find(s => s.id === stageId);
        if (stage?.activationDependencies) {
          for (const dep of stage.activationDependencies) {
            if (hasCycle(dep)) return true;
          }
        }
        
        inStack.delete(stageId);
        return false;
      };
      
      workflow.stages.forEach(stage => {
        expect(hasCycle(stage.id)).toBe(false);
      });
    });

    it('should have proper auto-run configuration', () => {
      const manualStages = workflow.stages.filter(s => !s.autoRun);
      const autoStages = workflow.stages.filter(s => s.autoRun);
      
      expect(manualStages).toHaveLength(2); // brief and export
      expect(autoStages).toHaveLength(11); // all others
      
      expect(manualStages.map(s => s.id)).toEqual(['brief', 'export']);
    });
  });

  describe('Model and Temperature Configuration', () => {
    it('should use gemini-2.5-flash for most stages', () => {
      const geminiStages = workflow.stages.filter(s => s.model === 'gemini-2.5-flash');
      expect(geminiStages).toHaveLength(10);
    });

    it('should use appropriate temperatures', () => {
      const factCheckStage = workflow.stages.find(s => s.id === 'fact-check');
      const contactsStage = workflow.stages.find(s => s.id === 'contacts');
      const imagePromptStage = workflow.stages.find(s => s.id === 'create-press-image-prompt');
      
      expect(factCheckStage?.temperature).toBe(0.1);
      expect(contactsStage?.temperature).toBe(0.15);
      expect(imagePromptStage?.temperature).toBe(0.7);
    });
  });

  describe('Prompt File References', () => {
    it('should have prompt files for all AI stages', () => {
      const aiStages = workflow.stages.filter(s => s.autoRun && s.id !== 'export');
      aiStages.forEach(stage => {
        if (stage.promptFile) {
          expect(stage.promptFile).toMatch(/^prompts\/\d{2}_.*\.md$/);
        } else if (stage.id === 'generate-press-photo') {
          expect(stage.promptTemplate).toBeDefined();
        }
      });
    });
  });
}); 