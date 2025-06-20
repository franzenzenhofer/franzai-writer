import workflowData from '../workflow.json';
import { Workflow, WorkflowStage } from '@/types';

describe('Press Release Workflow Configuration', () => {
  const workflow = workflowData as Workflow;

  describe('Workflow Metadata', () => {
    it('should have correct basic properties', () => {
      expect(workflow.id).toBe('press-release');
      expect(workflow.shortName).toBe('press-release');
      expect(workflow.name).toBe('Press Release Generator');
      expect(workflow.description).toContain('AI-powered research');
    });

    it('should have proper configuration', () => {
      expect(workflow.config).toMatchObject({
        setTitleFromStageOutput: 'basic-info',
        finalOutputStageId: 'final-press-release',
        autoScroll: true,
        progressAnimation: true
      });
    });
  });

  describe('Workflow Stages', () => {
    it('should have 8 stages', () => {
      expect(workflow.stages).toHaveLength(8);
    });

    it('should have all required stages with correct IDs', () => {
      const stageIds = workflow.stages.map(s => s.id);
      expect(stageIds).toEqual([
        'basic-info',
        'tone-briefing',
        'research',
        'key-facts',
        'contact-info',
        'final-press-release',
        'press-photo',
        'export'
      ]);
    });

    describe('Basic Info Stage', () => {
      const stage = workflow.stages[0];

      it('should be configured as form input', () => {
        expect(stage.inputType).toBe('form');
        expect(stage.outputType).toBe('json');
      });

      it('should have all required form fields', () => {
        expect(stage.formFields).toHaveLength(4);
        const fieldNames = stage.formFields?.map(f => f.name) || [];
        expect(fieldNames).toEqual(['topic', 'message', 'company', 'website']);
      });

      it('should have required validation for mandatory fields', () => {
        const requiredFields = stage.formFields?.filter(f => f.validation?.required) || [];
        expect(requiredFields).toHaveLength(3); // topic, message, company
      });
    });

    describe('Tone Briefing Stage', () => {
      const stage = workflow.stages[1];

      it('should be configured for AI analysis', () => {
        expect(stage.inputType).toBe('context');
        expect(stage.outputType).toBe('json');
        expect(stage.autoRun).toBe(true);
      });

      it('should have proper dependencies', () => {
        expect(stage.dependencies).toEqual(['basic-info']);
      });

      it('should have JSON output fields', () => {
        expect(stage.outputFields).toHaveLength(4);
        const fieldIds = stage.outputFields?.map(f => f.id) || [];
        expect(fieldIds).toEqual(['tone', 'style_guidelines', 'key_phrases', 'formatting_notes']);
      });

      it('should have promptTemplate with JSON-only instructions', () => {
        expect(stage.promptTemplate).toContain('IMPORTANT: Return ONLY a valid JSON object');
        expect(stage.promptTemplate).toContain('{{basic-info.output.company}}');
      });
    });

    describe('Research Stage', () => {
      const stage = workflow.stages[2];

      it('should have Google Search grounding enabled', () => {
        expect(stage.grounding).toEqual({ googleSearch: true });
      });

      it('should depend on tone-briefing', () => {
        expect(stage.dependencies).toContain('basic-info');
        expect(stage.dependencies).toContain('tone-briefing');
      });

      it('should use appropriate model and temperature', () => {
        expect(stage.model).toBe('gemini-2.0-flash');
        expect(stage.temperature).toBe(0.3);
      });
    });

    describe('Key Facts Stage', () => {
      const stage = workflow.stages[3];

      it('should be a form stage with AI generation', () => {
        expect(stage.inputType).toBe('form');
        expect(stage.outputType).toBe('json');
        expect(stage.promptTemplate).toBeDefined();
        expect(stage.autoRun).toBe(true);
      });

      it('should have all key facts form fields', () => {
        const fieldNames = stage.formFields?.map(f => f.name) || [];
        expect(fieldNames).toEqual([
          'headline',
          'subheadline',
          'key_points',
          'quotes',
          'statistics'
        ]);
      });
    });

    describe('Final Press Release Stage', () => {
      const stage = workflow.stages[5];

      it('should output markdown', () => {
        expect(stage.outputType).toBe('markdown');
      });

      it('should depend on all content stages', () => {
        expect(stage.dependencies).toContain('key-facts');
        expect(stage.dependencies).toContain('contact-info');
        expect(stage.dependencies).toContain('tone-briefing');
      });

      it('should have comprehensive promptTemplate', () => {
        expect(stage.promptTemplate).toContain('FOR IMMEDIATE RELEASE');
        expect(stage.promptTemplate).toContain('{{key-facts.output.headline}}');
        expect(stage.promptTemplate).toContain('{{contact-info.output.contact_name}}');
      });
    });

    describe('Press Photo Stage', () => {
      const stage = workflow.stages[6];

      it('should be optional', () => {
        expect(stage.isOptional).toBe(true);
      });

      it('should use Imagen model', () => {
        expect(stage.model).toBe('imagen-3.0-generate-002');
        expect(stage.provider).toBe('imagen');
      });

      it('should have image settings', () => {
        expect(stage.imageSettings).toEqual({
          numberOfImages: 2,
          aspectRatio: '16:9'
        });
      });
    });

    describe('Export Stage', () => {
      const stage = workflow.stages[7];

      it('should be configured as export stage', () => {
        expect(stage.stageType).toBe('export');
        expect(stage.outputType).toBe('export-interface');
      });

      it('should support multiple export formats', () => {
        expect(stage.exportConfig?.formats).toContain('html-styled');
        expect(stage.exportConfig?.formats).toContain('markdown');
        expect(stage.exportConfig?.formats).toContain('pdf');
        expect(stage.exportConfig?.formats).toContain('docx');
      });
    });
  });

  describe('Stage Dependencies', () => {
    it('should have valid dependency chain', () => {
      const stageMap = new Map(workflow.stages.map(s => [s.id, s]));
      
      workflow.stages.forEach(stage => {
        if (stage.dependencies) {
          stage.dependencies.forEach(depId => {
            expect(stageMap.has(depId)).toBe(true);
          });
        }
      });
    });

    it('should have no circular dependencies', () => {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      
      const hasCycle = (stageId: string): boolean => {
        visited.add(stageId);
        recursionStack.add(stageId);
        
        const stage = workflow.stages.find(s => s.id === stageId);
        const deps = stage?.dependencies || [];
        
        for (const dep of deps) {
          if (!visited.has(dep)) {
            if (hasCycle(dep)) return true;
          } else if (recursionStack.has(dep)) {
            return true;
          }
        }
        
        recursionStack.delete(stageId);
        return false;
      };
      
      const hasCycles = workflow.stages.some(stage => {
        if (!visited.has(stage.id)) {
          return hasCycle(stage.id);
        }
        return false;
      });
      
      expect(hasCycles).toBe(false);
    });
  });

  describe('Template Variables', () => {
    it('should use correct variable format in prompts', () => {
      workflow.stages.forEach(stage => {
        if (stage.promptTemplate) {
          // Check for correct variable format
          const variables = stage.promptTemplate.match(/\{\{[\w.-]+\}\}/g) || [];
          variables.forEach(variable => {
            // Should be in format {{stage-id.output.field}}
            expect(variable).toMatch(/\{\{[\w-]+\.output\.[\w_]+\}\}/);
          });
        }
      });
    });

    it('should reference existing stages in templates', () => {
      const stageIds = new Set(workflow.stages.map(s => s.id));
      
      workflow.stages.forEach(stage => {
        if (stage.promptTemplate) {
          const variables = stage.promptTemplate.match(/\{\{([\w-]+)\.output\.[\w_]+\}\}/g) || [];
          variables.forEach(variable => {
            const match = variable.match(/\{\{([\w-]+)\.output\.[\w_]+\}\}/);
            if (match) {
              const referencedStageId = match[1];
              expect(stageIds.has(referencedStageId)).toBe(true);
            }
          });
        }
      });
    });
  });
});