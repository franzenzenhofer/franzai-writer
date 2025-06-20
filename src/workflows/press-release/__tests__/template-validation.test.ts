import workflowData from '../workflow.json';
import { Workflow } from '@/types';

describe('Press Release Template Validation', () => {
  const workflow = workflowData as Workflow;

  const mockStageOutputs = {
    'basic-info': {
      output: {
        topic: 'Test Product Launch',
        message: 'Test message',
        company: 'Test Company',
        website: 'https://test.com'
      }
    },
    'tone-briefing': {
      output: {
        tone: 'Professional and innovative',
        style_guidelines: 'Clear and concise',
        key_phrases: 'cutting-edge, innovative',
        formatting_notes: 'Use AP style'
      }
    },
    'research': {
      output: {
        company_background: 'Test company background',
        industry_context: 'Growing market',
        recent_developments: 'Recent news',
        competitive_landscape: 'Market leaders'
      }
    },
    'key-facts': {
      output: {
        headline: 'Test Headline',
        subheadline: 'Test Subheadline',
        key_points: '• Point 1\n• Point 2',
        quotes: '"Test quote" - CEO',
        statistics: '• 50% growth'
      }
    },
    'contact-info': {
      output: {
        contact_name: 'John Doe',
        contact_title: 'PR Manager',
        contact_email: 'pr@test.com',
        contact_phone: '+1 555-1234',
        additional_contacts: 'Agency contact'
      }
    }
  };

  function extractTemplateVariables(template: string): string[] {
    const matches = template.match(/\{\{[\w.-]+\}\}/g) || [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  }

  function resolveVariable(path: string, context: any): any {
    const parts = path.split('.');
    let value = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  describe('Tone Briefing Template', () => {
    const stage = workflow.stages[1];

    it('should have all required variables resolvable', () => {
      const variables = extractTemplateVariables(stage.promptTemplate || '');
      
      variables.forEach(varPath => {
        const value = resolveVariable(varPath, mockStageOutputs);
        expect(value).toBeDefined();
      });
    });

    it('should reference only available stages', () => {
      const variables = extractTemplateVariables(stage.promptTemplate || '');
      const referencedStages = new Set(
        variables
          .map(v => v.split('.')[0])
          .filter(s => s !== 'headline' && s !== 'subheadline') // Exclude form field refs
      );
      
      // Should only reference basic-info at this stage
      expect(Array.from(referencedStages)).toEqual(['basic-info']);
    });
  });

  describe('Research Template', () => {
    const stage = workflow.stages[2];

    it('should reference tone-briefing output', () => {
      const variables = extractTemplateVariables(stage.promptTemplate || '');
      const hasToneReference = variables.some(v => v.startsWith('tone-briefing.output'));
      expect(hasToneReference).toBe(true);
    });

    it('should have JSON-only output instruction', () => {
      expect(stage.promptTemplate).toContain('IMPORTANT: Return ONLY a valid JSON object');
    });
  });

  describe('Key Facts Template', () => {
    const stage = workflow.stages[3];

    it('should reference research outputs', () => {
      const variables = extractTemplateVariables(stage.promptTemplate || '');
      const hasResearchReference = variables.some(v => v.startsWith('research.output'));
      expect(hasResearchReference).toBe(true);
    });

    it('should not reference form field variables', () => {
      // Key facts is auto-generated, shouldn't reference its own form fields
      const variables = extractTemplateVariables(stage.promptTemplate || '');
      const formFieldRefs = variables.filter(v => 
        ['headline', 'subheadline', 'key_points', 'quotes', 'statistics'].includes(v)
      );
      expect(formFieldRefs).toHaveLength(0);
    });
  });

  describe('Final Press Release Template', () => {
    const stage = workflow.stages[5];

    it('should reference all content stages', () => {
      const variables = extractTemplateVariables(stage.promptTemplate || '');
      const referencedStages = new Set(
        variables.map(v => v.split('.')[0])
      );
      
      expect(referencedStages.has('basic-info')).toBe(true);
      expect(referencedStages.has('tone-briefing')).toBe(true);
      expect(referencedStages.has('key-facts')).toBe(true);
      expect(referencedStages.has('contact-info')).toBe(true);
      expect(referencedStages.has('research')).toBe(true);
    });

    it('should include all press release sections', () => {
      const template = stage.promptTemplate || '';
      
      // Check for required sections
      expect(template).toContain('FOR IMMEDIATE RELEASE');
      expect(template).toContain('Headline');
      expect(template).toContain('Dateline');
      expect(template).toContain('Lead Paragraph');
      expect(template).toContain('Body Paragraphs');
      expect(template).toContain('Boilerplate');
      expect(template).toContain('Contact Information');
      expect(template).toContain('### or -30-');
    });

    it('should have proper markdown formatting instructions', () => {
      const template = stage.promptTemplate || '';
      expect(template).toContain('Format in Markdown');
      expect(template).toContain('400-600 words');
    });
  });

  describe('Cross-Stage Variable Resolution', () => {
    it('should have resolvable dependency chains', () => {
      const stageOutputOrder = [
        'basic-info',
        'tone-briefing',
        'research',
        'key-facts',
        'contact-info',
        'final-press-release'
      ];

      stageOutputOrder.forEach((stageId, index) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        if (!stage?.promptTemplate) return;

        const variables = extractTemplateVariables(stage.promptTemplate);
        const referencedStages = new Set(
          variables
            .map(v => v.split('.')[0])
            .filter(s => stageOutputOrder.includes(s))
        );

        // Should only reference stages that come before it
        referencedStages.forEach(refStageId => {
          const refIndex = stageOutputOrder.indexOf(refStageId);
          expect(refIndex).toBeLessThan(index);
        });
      });
    });
  });

  describe('JSON Output Validation', () => {
    const jsonStages = workflow.stages.filter(s => s.outputType === 'json');

    it('should have JSON-only instructions for all JSON stages', () => {
      jsonStages.forEach(stage => {
        if (stage.promptTemplate) {
          expect(stage.promptTemplate).toContain('JSON');
          // Should have either explicit JSON instruction or example
          const hasJsonInstruction = 
            stage.promptTemplate.includes('Return ONLY a valid JSON') ||
            stage.promptTemplate.includes('Return a JSON') ||
            stage.promptTemplate.includes('format:');
          expect(hasJsonInstruction).toBe(true);
        }
      });
    });

    it('should define all expected output fields', () => {
      jsonStages.forEach(stage => {
        expect(stage.outputFields).toBeDefined();
        expect(stage.outputFields!.length).toBeGreaterThan(0);
        
        stage.outputFields!.forEach(field => {
          expect(field).toMatchObject({
            id: expect.any(String),
            type: expect.any(String)
          });
        });
      });
    });
  });
});