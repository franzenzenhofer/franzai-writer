import workflowData from '../workflow.json';
import { Workflow, WorkflowStage } from '@/types';

describe('Press Release Workflow Execution', () => {
  const workflow = workflowData as Workflow;

  describe('Auto-Run Behavior', () => {
    it('should have correct auto-run configuration', () => {
      const autoRunStages = workflow.stages.filter(s => s.autoRun);
      const expectedAutoRun = [
        'tone-briefing',
        'research', 
        'key-facts',
        'contact-info',
        'final-press-release'
      ];
      
      const autoRunIds = autoRunStages.map(s => s.id);
      expect(autoRunIds).toEqual(expect.arrayContaining(expectedAutoRun));
    });

    it('should not auto-run optional stages', () => {
      const optionalStages = workflow.stages.filter(s => s.isOptional);
      optionalStages.forEach(stage => {
        expect(stage.autoRun).not.toBe(true);
      });
    });

    it('should have dependencies for all auto-run stages', () => {
      const autoRunStages = workflow.stages.filter(s => s.autoRun);
      autoRunStages.forEach(stage => {
        expect(stage.dependencies).toBeDefined();
        expect(stage.dependencies!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Stage Execution Order', () => {
    function getExecutionOrder(stages: WorkflowStage[]): string[] {
      const executed = new Set<string>();
      const order: string[] = [];
      
      function canExecute(stage: WorkflowStage): boolean {
        if (!stage.dependencies) return true;
        return stage.dependencies.every(dep => executed.has(dep));
      }
      
      while (executed.size < stages.filter(s => !s.isOptional).length) {
        const executableStages = stages.filter(s => 
          !executed.has(s.id) && 
          !s.isOptional && 
          canExecute(s)
        );
        
        if (executableStages.length === 0) break;
        
        executableStages.forEach(stage => {
          executed.add(stage.id);
          order.push(stage.id);
        });
      }
      
      return order;
    }

    it('should execute in valid dependency order', () => {
      const order = getExecutionOrder(workflow.stages);
      
      // Verify basic-info is first
      expect(order[0]).toBe('basic-info');
      
      // Verify dependencies are respected
      order.forEach((stageId, index) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        if (stage?.dependencies) {
          stage.dependencies.forEach(dep => {
            const depIndex = order.indexOf(dep);
            expect(depIndex).toBeLessThan(index);
          });
        }
      });
    });

    it('should complete all non-optional stages', () => {
      const order = getExecutionOrder(workflow.stages);
      const nonOptionalStages = workflow.stages.filter(s => !s.isOptional);
      
      expect(order.length).toBe(nonOptionalStages.length);
    });
  });

  describe('Model Configuration', () => {
    it('should use appropriate models for each stage', () => {
      const aiStages = workflow.stages.filter(s => s.promptTemplate || s.promptFile || s.provider === 'imagen');
      
      aiStages.forEach(stage => {
        expect(stage.model).toBeDefined();
        
        if (stage.id === 'press-photo') {
          expect(stage.model).toBe('imagen-3.0-generate-002');
          expect(stage.provider).toBe('imagen');
        } else {
          expect(stage.model).toBe('gemini-2.0-flash');
        }
      });
    });

    it('should have appropriate temperature settings', () => {
      const aiStages = workflow.stages.filter(s => s.promptTemplate || s.promptFile);
      
      aiStages.forEach(stage => {
        expect(stage.temperature).toBeDefined();
        expect(stage.temperature).toBeGreaterThanOrEqual(0);
        expect(stage.temperature).toBeLessThanOrEqual(1);
        
        // Lower temperature for factual stages
        if (stage.id === 'contact-info') {
          expect(stage.temperature).toBeLessThanOrEqual(0.2);
        }
      });
    });
  });

  describe('Form Stage Configuration', () => {
    const formStages = workflow.stages.filter(s => s.inputType === 'form');

    it('should have form fields for all form stages', () => {
      formStages.forEach(stage => {
        if (stage.id !== 'export') { // Export is special
          expect(stage.formFields).toBeDefined();
          expect(stage.formFields!.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have validation rules for required fields', () => {
      formStages.forEach(stage => {
        if (stage.formFields) {
          const hasValidation = stage.formFields.some(field => 
            field.validation?.required === true
          );
          expect(hasValidation).toBe(true);
        }
      });
    });

    it('should have appropriate field types', () => {
      formStages.forEach(stage => {
        stage.formFields?.forEach(field => {
          expect(['text', 'textarea', 'select']).toContain(field.type);
          
          if (field.type === 'select') {
            expect(field.options).toBeDefined();
            expect(field.options!.length).toBeGreaterThan(0);
          }
        });
      });
    });
  });

  describe('AI Generation Features', () => {
    it('should enable AI redo for appropriate stages', () => {
      const aiRedoStages = workflow.stages.filter(s => s.aiRedoEnabled);
      const expectedAiRedo = [
        'tone-briefing',
        'research',
        'final-press-release'
      ];
      
      aiRedoStages.forEach(stage => {
        expect(expectedAiRedo).toContain(stage.id);
      });
    });

    it('should enable editing for user-reviewable stages', () => {
      const editableStages = workflow.stages.filter(s => s.editEnabled);
      
      // Most stages should be editable
      expect(editableStages.length).toBeGreaterThanOrEqual(6);
      
      // Key content stages must be editable
      const mustBeEditable = [
        'tone-briefing',
        'research',
        'key-facts',
        'contact-info',
        'final-press-release'
      ];
      
      mustBeEditable.forEach(stageId => {
        const stage = editableStages.find(s => s.id === stageId);
        expect(stage).toBeDefined();
      });
    });

    it('should enable copying for content stages', () => {
      const copyableStages = workflow.stages.filter(s => s.copyable);
      
      // All content generation stages should be copyable
      expect(copyableStages.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Export Configuration', () => {
    const exportStage = workflow.stages.find(s => s.id === 'export');

    it('should have proper export configuration', () => {
      expect(exportStage).toBeDefined();
      expect(exportStage!.stageType).toBe('export');
      expect(exportStage!.exportConfig).toBeDefined();
    });

    it('should support all required formats', () => {
      const formats = exportStage!.exportConfig!.formats;
      const requiredFormats = ['html-styled', 'markdown', 'pdf', 'docx'];
      
      requiredFormats.forEach(format => {
        expect(formats).toContain(format);
      });
    });

    it('should have publishing configuration', () => {
      const publishing = exportStage!.exportConfig!.publishing;
      expect(publishing).toBeDefined();
      expect(publishing!.enabled).toBe(true);
      expect(publishing!.seo).toBe(true);
      expect(publishing!.themes).toContain('professional');
    });
  });
});