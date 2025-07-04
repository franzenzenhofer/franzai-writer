import workflowData from '../workflow.json';
import { Workflow } from '@/types';

describe('Press Release Prompt Quality', () => {
  const workflow = workflowData as Workflow;

  describe('Prompt Structure', () => {
    const stagesWithPrompts = workflow.stages.filter(s => s.promptTemplate || s.promptFile);

    it('should have clear role definitions', () => {
      stagesWithPrompts.forEach(stage => {
        const prompt = stage.promptTemplate!;
        
        // Should define the AI's role
        const hasRole = 
          prompt.includes('You are') ||
          prompt.includes('Your task') ||
          prompt.includes('Generate') ||
          prompt.includes('Create');
        
        expect(hasRole).toBe(true);
      });
    });

    it('should have specific output instructions', () => {
      stagesWithPrompts.forEach(stage => {
        const prompt = stage.promptTemplate!;
        
        if (stage.outputType === 'json') {
          expect(prompt).toContain('JSON');
          expect(prompt.toLowerCase()).toMatch(/return|provide|generate/);
        }
        
        if (stage.outputType === 'markdown') {
          expect(prompt.toLowerCase()).toContain('markdown');
        }
      });
    });

    it('should avoid ambiguous instructions', () => {
      stagesWithPrompts.forEach(stage => {
        const prompt = stage.promptTemplate!;
        
        // Check for vague terms that should be avoided
        const vagueTerms = [
          'maybe',
          'perhaps',
          'might',
          'could possibly',
          'if you want'
        ];
        
        vagueTerms.forEach(term => {
          expect(prompt.toLowerCase()).not.toContain(term);
        });
      });
    });
  });

  describe('Tone Briefing Prompt', () => {
    const stage = workflow.stages.find(s => s.id === 'tone-briefing')!;
    const prompt = stage.promptTemplate!;

    it('should request specific tone analysis elements', () => {
      expect(prompt).toContain('tone of voice');
      expect(prompt).toContain('style guidelines');
      expect(prompt).toContain('key_phrases');
      expect(prompt).toContain('formatting_notes');
    });

    it('should handle case when no examples are provided', () => {
      expect(prompt).toContain('If no examples are provided');
      expect(prompt).toContain('industry standards');
    });

    it('should provide clear examples', () => {
      expect(prompt).toContain('e.g.');
      expect(prompt).toContain('Professional yet approachable');
    });
  });

  describe('Research Prompt', () => {
    const stage = workflow.stages.find(s => s.id === 'research')!;
    const prompt = stage.promptTemplate!;

    it('should instruct to use web search', () => {
      expect(prompt).toContain('web search');
      expect(prompt).toContain('current, accurate information');
    });

    it('should request comprehensive research areas', () => {
      const researchAreas = [
        'company_background',
        'industry_context',
        'recent_developments',
        'competitive_landscape'
      ];
      
      researchAreas.forEach(area => {
        expect(prompt).toContain(area);
      });
    });

    it('should emphasize journalistic relevance', () => {
      expect(prompt).toContain('web search');
      expect(prompt).toContain('well-researched information');
    });
  });

  describe('Final Press Release Prompt', () => {
    const stage = workflow.stages.find(s => s.id === 'final-press-release')!;
    const prompt = stage.promptTemplate!;

    it('should follow AP style guidelines', () => {
      expect(prompt).toContain('AP style');
      expect(prompt).toContain('industry standards');
    });

    it('should include all press release components', () => {
      const components = [
        'FOR IMMEDIATE RELEASE',
        'Headline',
        'Subheadline',
        'Dateline',
        'Lead Paragraph',
        'Body Paragraphs',
        'Boilerplate',
        'Contact Information',
        '### or -30-'
      ];
      
      components.forEach(component => {
        expect(prompt).toContain(component);
      });
    });

    it('should specify inverted pyramid structure', () => {
      expect(prompt).toContain('inverted pyramid');
      expect(prompt).toContain('who, what, when, where, why');
    });

    it('should set appropriate length guidelines', () => {
      expect(prompt).toContain('400-600 words');
    });

    it('should specify distribution readiness', () => {
      expect(prompt).toContain('Reuters');
      expect(prompt).toContain('DPA');
      expect(prompt).toContain('News Aktuell');
    });
  });

  describe('JSON Output Instructions', () => {
    const jsonStages = workflow.stages.filter(s => 
      s.outputType === 'json' && s.promptTemplate
    );

    it('should have explicit JSON-only instructions', () => {
      jsonStages.forEach(stage => {
        const prompt = stage.promptTemplate!;
        
        // Should have clear JSON instruction
        expect(prompt).toMatch(/IMPORTANT:.*JSON|Return ONLY.*JSON/);
        expect(prompt).toContain('must start with {');
        expect(prompt).toContain('end with }');
      });
    });

    it('should provide JSON examples', () => {
      jsonStages.forEach(stage => {
        const prompt = stage.promptTemplate!;
        
        // Should have example format or structure
        const hasExample = 
          prompt.includes('Example format:') || 
          prompt.includes('format:') ||
          prompt.includes('structure:') ||
          prompt.includes('JSON structure:');
        expect(hasExample).toBe(true);
      });
    });

    it('should define all expected fields', () => {
      jsonStages.forEach(stage => {
        const prompt = stage.promptTemplate!;
        const outputFields = stage.outputFields || [];
        
        // Each output field should be mentioned in the prompt
        outputFields.forEach(field => {
          expect(prompt).toContain(field.id);
        });
      });
    });
  });

  describe('Form Field AI Generation', () => {
    const formStagesWithAI = workflow.stages.filter(s => 
      s.inputType === 'form' && (s.promptTemplate || s.promptFile) && s.autoRun
    );

    it('should generate content for form fields', () => {
      expect(formStagesWithAI.length).toBeGreaterThan(0);
      
      formStagesWithAI.forEach(stage => {
        expect(stage.promptTemplate).toBeDefined();
        expect(stage.autoRun).toBe(true);
      });
    });

    it('should reference research data for generation', () => {
      const keyFactsStage = formStagesWithAI.find(s => s.id === 'key-facts');
      expect(keyFactsStage).toBeDefined();
      expect(keyFactsStage!.promptTemplate).toContain('research.output');
    });
  });

  describe('Error Prevention', () => {
    it('should not have circular template references', () => {
      workflow.stages.forEach(stage => {
        if (!stage.promptTemplate && !stage.promptFile) return;
        
        // Extract referenced stages
        const template = stage.promptTemplate || '';
        const matches = template.match(/\{\{([\w-]+)\.output/g) || [];
        const referencedStages = matches.map(m => {
          const match = m.match(/\{\{([\w-]+)\.output/);
          return match ? match[1] : null;
        }).filter(Boolean);
        
        // Should not reference itself
        expect(referencedStages).not.toContain(stage.id);
      });
    });

    it('should use consistent variable naming', () => {
      const allVariables: string[] = [];
      
      workflow.stages.forEach(stage => {
        if (stage.promptTemplate || stage.promptFile) {
          const template = stage.promptTemplate || '';
          const matches = template.match(/\{\{[\w.-]+\}\}/g) || [];
          allVariables.push(...matches);
        }
      });
      
      // Check for consistent patterns
      allVariables.forEach(variable => {
        // Should follow pattern {{stage-id.output.field}}
        if (variable.includes('.output.')) {
          expect(variable).toMatch(/\{\{[\w-]+\.output\.[\w_]+\}\}/);
        }
      });
    });
  });
});