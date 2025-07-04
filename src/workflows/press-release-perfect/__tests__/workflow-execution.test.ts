import workflowData from '../workflow.json';
import { Workflow, WorkflowStage } from '@/types';

describe('Press Release Perfect Workflow Execution', () => {
  const workflow = workflowData as Workflow;

  describe('Auto-Run Behavior', () => {
    it('should auto-run all stages except brief and export', () => {
      const autoRunStages = workflow.stages.filter(s => s.autoRun);
      const manualStages = workflow.stages.filter(s => !s.autoRun);
      
      expect(autoRunStages).toHaveLength(11);
      expect(manualStages).toHaveLength(2);
      expect(manualStages.map(s => s.id)).toEqual(['brief', 'export']);
    });

    it('should have proper cascade flow from brief stage', () => {
      const briefStage = workflow.stages[0];
      expect(briefStage.autoRun).toBe(false);
      
      const dependentStages = workflow.stages.filter(s => 
        s.activationDependencies?.includes('brief')
      );
      expect(dependentStages).toHaveLength(3); // style-corpus, research, contacts
    });

    it('should create proper execution sequence', () => {
      const executionOrder = [
        'brief', // manual
        'style-corpus', // auto (depends on brief)
        'style-profile', // auto (depends on style-corpus)
        'research', // auto (depends on brief)
        'headline-facts', // auto (depends on research + style-profile)
        'contacts', // auto (depends on brief)
        'fact-check', // auto (depends on headline-facts)
        'draft-release', // auto (depends on style-profile + headline-facts + contacts + fact-check)
        'press-photo-briefing', // auto (depends on draft-release)
        'create-press-image-prompt', // auto (depends on press-photo-briefing)
        'generate-press-photo', // auto (depends on create-press-image-prompt)
        'html-preview', // auto (depends on draft-release + generate-press-photo)
        'export' // manual (depends on html-preview)
      ];

      expect(workflow.stages.map(s => s.id)).toEqual(executionOrder);
    });
  });

  describe('Stage Dependencies and Activation', () => {
    it('should have correct activation dependencies', () => {
      const dependencyMap = {
        'brief': [],
        'style-corpus': ['brief'],
        'style-profile': ['style-corpus'],
        'research': ['brief'],
        'headline-facts': ['research', 'style-profile'],
        'contacts': ['brief'],
        'fact-check': ['headline-facts'],
        'draft-release': ['style-profile', 'headline-facts', 'contacts', 'fact-check'],
        'press-photo-briefing': ['draft-release'],
        'create-press-image-prompt': ['press-photo-briefing'],
        'generate-press-photo': ['create-press-image-prompt'],
        'html-preview': ['draft-release', 'generate-press-photo'],
        'export': ['html-preview']
      };

      workflow.stages.forEach(stage => {
        const expectedDeps = dependencyMap[stage.id as keyof typeof dependencyMap];
        expect(stage.activationDependencies || []).toEqual(expectedDeps);
      });
    });

    it('should enable parallel execution where possible', () => {
      // These stages can run in parallel after brief is complete
      const parallelStages = ['style-corpus', 'research', 'contacts'];
      parallelStages.forEach(stageId => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage?.activationDependencies).toEqual(['brief']);
      });
    });

    it('should ensure fact-check blocks downstream execution', () => {
      const factCheckStage = workflow.stages.find(s => s.id === 'fact-check');
      const draftStage = workflow.stages.find(s => s.id === 'draft-release');
      
      expect(factCheckStage?.outputType).toBe('json');
      expect(factCheckStage?.jsonFields?.find(f => f.key === 'verdict')).toBeDefined();
      expect(draftStage?.activationDependencies).toContain('fact-check');
    });
  });

  describe('Model Configuration', () => {
    it('should use appropriate models for different tasks', () => {
      const modelUsage = {
        'gemini-2.5-flash': [
          'style-corpus', 'style-profile', 'research', 'headline-facts',
          'contacts', 'fact-check', 'draft-release', 'press-photo-briefing',
          'create-press-image-prompt', 'html-preview'
        ],
        'imagen-3.0-generate-002': ['generate-press-photo']
      };

      Object.entries(modelUsage).forEach(([model, stageIds]) => {
        stageIds.forEach(stageId => {
          const stage = workflow.stages.find(s => s.id === stageId);
          expect(stage?.model).toBe(model);
        });
      });
    });

    it('should use optimized temperatures for different stage types', () => {
      const temperatureConfig = {
        'fact-check': 0.1, // Low for accuracy
        'contacts': 0.15, // Low for consistency
        'style-profile': 0.25, // Medium-low for analysis
        'html-preview': 0.25, // Medium-low for formatting
        'research': 0.3, // Medium for exploration
        'headline-facts': 0.3, // Medium for creativity
        'press-photo-briefing': 0.3, // Medium for description
        'draft-release': 0.35, // Medium-high for writing
        'create-press-image-prompt': 0.7 // High for creative prompts
      };

      Object.entries(temperatureConfig).forEach(([stageId, expectedTemp]) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage?.temperature).toBe(expectedTemp);
      });
    });
  });

  describe('Feature Configuration', () => {
    it('should enable grounding for research stages', () => {
      const groundingStages = [
        { id: 'style-corpus', grounding: { urlContext: true } },
        { id: 'research', grounding: { googleSearch: true, urlContext: true } },
        { id: 'fact-check', grounding: { googleSearch: true } }
      ];

      groundingStages.forEach(({ id, grounding }) => {
        const stage = workflow.stages.find(s => s.id === id);
        expect(stage?.grounding).toEqual(grounding);
      });
    });

    it('should enable editing for key content stages', () => {
      const editableStages = ['headline-facts', 'contacts', 'draft-release', 'html-preview'];
      editableStages.forEach(stageId => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage?.editEnabled).toBe(true);
      });
    });

    it('should enable AI redo for creative stages', () => {
      const aiRedoStages = ['headline-facts', 'draft-release', 'html-preview'];
      aiRedoStages.forEach(stageId => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage?.aiRedoEnabled).toBe(true);
      });
    });
  });

  describe('Prompt File References', () => {
    it('should reference correct prompt files', () => {
      const promptFileMap = {
        'style-corpus': 'prompts/01_style_corpus.md',
        'style-profile': 'prompts/02_style_profile.md',
        'research': 'prompts/03_research.md',
        'headline-facts': 'prompts/04_headline_facts.md',
        'contacts': 'prompts/05_contacts.md',
        'fact-check': 'prompts/06_fact_check.md',
        'draft-release': 'prompts/07_draft_release.md',
        'press-photo-briefing': 'prompts/08_press_photo_briefing.md',
        'create-press-image-prompt': 'prompts/09_create_press_image_prompt.md',
        'html-preview': 'prompts/11_html_preview.md'
      };

      Object.entries(promptFileMap).forEach(([stageId, expectedFile]) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage?.promptFile).toBe(expectedFile);
      });
    });

    it('should use prompt template for image generation', () => {
      const imageStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      expect(imageStage?.promptTemplate).toBe('{{create-press-image-prompt.output.prompt}}');
    });
  });

  describe('Output Types and Structure', () => {
    it('should have correct output types for each stage', () => {
      const outputTypes = {
        'brief': 'json',
        'style-corpus': 'context',
        'style-profile': 'json',
        'research': 'json',
        'headline-facts': 'json',
        'contacts': 'json',
        'fact-check': 'json',
        'draft-release': 'markdown',
        'press-photo-briefing': 'json',
        'create-press-image-prompt': 'json',
        'generate-press-photo': 'image',
        'html-preview': 'html',
        'export': 'export-interface'
      };

      Object.entries(outputTypes).forEach(([stageId, expectedType]) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage?.outputType).toBe(expectedType);
      });
    });

    it('should have JSON fields for structured output stages', () => {
      const jsonStages = workflow.stages.filter(s => s.outputType === 'json' && s.id !== 'brief');
      jsonStages.forEach(stage => {
        expect(stage.jsonFields).toBeDefined();
        expect(stage.jsonFields!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Image Generation Pipeline', () => {
    it('should execute three-step image generation', () => {
      const imageStages = [
        'press-photo-briefing',
        'create-press-image-prompt', 
        'generate-press-photo'
      ];

      imageStages.forEach((stageId, index) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        expect(stage).toBeDefined();
        
        if (index > 0) {
          expect(stage?.activationDependencies).toContain(imageStages[index - 1]);
        }
      });
    });

    it('should have dynamic image settings', () => {
      const generateStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      expect(generateStage?.imageGenerationSettings).toMatchObject({
        provider: 'imagen',
        aspectRatio: '{{press-photo-briefing.output.aspect}}',
        numberOfImages: '{{press-photo-briefing.output.numImages}}',
        filenames: '{{create-press-image-prompt.output.filenames}}'
      });
    });

    it('should hide image metadata for clean output', () => {
      const generateStage = workflow.stages.find(s => s.id === 'generate-press-photo');
      expect(generateStage?.hideImageMetadata).toBe(true);
    });
  });

  describe('Export Configuration', () => {
    it('should support multiple export formats', () => {
      const exportStage = workflow.stages.find(s => s.id === 'export');
      const formats = exportStage?.exportConfig?.formats;
      
      expect(formats).toHaveProperty('html-styled');
      expect(formats).toHaveProperty('html-clean');
      expect(formats).toHaveProperty('markdown');
      expect(formats).toHaveProperty('pdf');
      expect(formats).toHaveProperty('docx');
    });

    it('should have proper template references', () => {
      const exportStage = workflow.stages.find(s => s.id === 'export');
      const formats = exportStage?.exportConfig?.formats;
      
      expect(formats?.['html-styled']?.promptFile).toBe('prompts/12_html_styled_template.md');
      expect(formats?.['html-clean']?.promptFile).toBe('prompts/12_html_clean_template.md');
      expect(formats?.['markdown']?.deriveFrom).toBe('html-clean');
      expect(formats?.['pdf']?.deriveFrom).toBe('html-styled');
      expect(formats?.['docx']?.deriveFrom).toBe('html-styled');
    });

    it('should enable instant publishing', () => {
      const exportStage = workflow.stages.find(s => s.id === 'export');
      expect(exportStage?.exportConfig?.publishing).toMatchObject({
        enabled: true,
        instant: true,
        formats: ['html-styled', 'html-clean'],
        features: { seo: { openGraph: true, structuredData: true } }
      });
    });
  });

  describe('Error Handling and Validation', () => {
    it('should have proper form validation in brief stage', () => {
      const briefStage = workflow.stages[0];
      const requiredFields = briefStage.formFields?.filter(f => f.validation?.required) || [];
      const textareaFields = briefStage.formFields?.filter(f => f.type === 'textarea') || [];
      
      expect(requiredFields.length).toBeGreaterThan(0);
      textareaFields.forEach(field => {
        if (field.validation?.minLength) {
          expect(field.validation.minLength).toBeGreaterThan(10);
        }
      });
    });

    it('should have fact-check stage as quality gate', () => {
      const factCheckStage = workflow.stages.find(s => s.id === 'fact-check');
      const verdictField = factCheckStage?.jsonFields?.find(f => f.key === 'verdict');
      
      expect(verdictField).toBeDefined();
      expect(factCheckStage?.temperature).toBe(0.1); // High accuracy
      expect(factCheckStage?.grounding?.googleSearch).toBe(true);
    });
  });

  describe('Language Support', () => {
    it('should support multi-language generation', () => {
      const briefStage = workflow.stages[0];
      const languageField = briefStage.formFields?.find(f => f.name === 'language');
      
      expect(languageField?.options).toEqual([
        { value: 'en', label: 'English' },
        { value: 'de', label: 'Deutsch' },
        { value: 'fr', label: 'Français' }
      ]);
    });

    it('should pass language context through stages', () => {
      // Language should be available via {{brief.output.language}} in all prompts
      const stagesWithPrompts = workflow.stages.filter(s => s.promptFile);
      expect(stagesWithPrompts.length).toBeGreaterThan(5);
    });
  });
}); 