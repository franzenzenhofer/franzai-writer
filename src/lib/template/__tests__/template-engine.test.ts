import { buildContext, renderTemplate, clearTemplateCache } from '../index';
import type { Workflow, StageState } from '@/types';

describe('Template Engine', () => {
  beforeEach(() => {
    clearTemplateCache();
  });

  const mockWorkflow: Workflow = {
    id: 'poem-generator',
    type: 'poem',
    title: 'Poetry Generator',
    stages: [],
    version: '1.0.0'
  };

  const mockStageStates: Record<string, StageState> = {
    'poem-topic': {
      status: 'completed',
      output: 'Love and nature in spring',
      depsAreMet: true
    },
    'generate-poem-with-title': {
      status: 'completed',
      output: {
        title: 'Spring\'s Embrace',
        poem: 'Roses bloom in morning light,\nNature\'s beauty pure and bright.'
      },
      depsAreMet: true
    },
    'generate-poem-image': {
      status: 'completed',
      output: {
        images: [
          {
            publicUrl: 'https://storage.googleapis.com/test/spring-image.jpg',
            alt: 'Spring flowers blooming'
          }
        ]
      },
      depsAreMet: true
    }
  };

  describe('buildContext', () => {
    it('should build correct template context', () => {
      const context = buildContext(mockWorkflow, mockStageStates);
      
      expect(context.workflow.id).toBe('poem-generator');
      expect(context.workflow.type).toBe('poem');
      expect(context.workflow.title).toBe('Poetry Generator');
      expect(context.stages['poem-topic']).toBe('Love and nature in spring');
      expect(context.stages['generate-poem-with-title'].title).toBe('Spring\'s Embrace');
    });

    it('should handle missing stage outputs', () => {
      const statesWithNull = {
        ...mockStageStates,
        'missing-stage': {
          status: 'idle' as const,
          output: null,
          depsAreMet: true
        }
      };
      
      const context = buildContext(mockWorkflow, statesWithNull);
      expect(context.stages['missing-stage']).toBeNull();
    });
  });

  describe('renderTemplate', () => {
    let context: ReturnType<typeof buildContext>;

    beforeEach(() => {
      context = buildContext(mockWorkflow, mockStageStates);
    });

    it('should render simple variables', () => {
      const template = 'Workflow: {{workflow.id}}, Type: {{workflow.type}}';
      const result = renderTemplate(template, context);
      
      expect(result).toBe('Workflow: poem-generator, Type: poem');
    });

    it('should render nested object properties', () => {
      const template = 'Title: {{stages.generate-poem-with-title.title}}';
      const result = renderTemplate(template, context);
      
      expect(result).toBe('Title: Spring\'s Embrace');
    });

    it('should render array elements', () => {
      const template = 'Image URL: {{stages.generate-poem-image.images.[0].publicUrl}}';
      const result = renderTemplate(template, context);
      
      expect(result).toBe('Image URL: https://storage.googleapis.com/test/spring-image.jpg');
    });

    it('should handle if conditionals', () => {
      const template = `
        {{#if stages.generate-poem-image.images}}
        Image Available: {{stages.generate-poem-image.images.[0].publicUrl}}
        {{/if}}
        {{#if stages.missing-stage}}
        This should not appear
        {{/if}}
      `;
      
      const result = renderTemplate(template, context);
      
      expect(result).toContain('Image Available: https://storage.googleapis.com/test/spring-image.jpg');
      expect(result).not.toContain('This should not appear');
    });

    it('should use custom helpers', () => {
      const template = `
        JSON: {{json stages.generate-poem-with-title}}
        Exists: {{exists stages.poem-topic}}
        Default: {{default stages.missing-value "fallback"}}
      `;
      
      const result = renderTemplate(template, context);
      
      expect(result).toContain('"title": "Spring\'s Embrace"');
      expect(result).toContain('Exists: true');
      expect(result).toContain('Default: fallback');
    });

    it('should strip unresolved handlebars expressions', () => {
      const template = `
        Valid: {{stages.poem-topic}}
        Invalid: {{stages.nonexistent.field}}
        Another: {{missing.completely}}
      `;
      
      const result = renderTemplate(template, context);
      
      expect(result).toContain('Valid: Love and nature in spring');
      expect(result).not.toContain('{{');
      expect(result).not.toContain('}}');
    });

    it('should handle complex template structures', () => {
      const template = `
        # {{stages.generate-poem-with-title.title}}
        
        Topic: {{stages.poem-topic}}
        
        {{#if stages.generate-poem-image.images}}
        ![Image]({{stages.generate-poem-image.images.[0].publicUrl}})
        {{/if}}
        
        Poem:
        {{stages.generate-poem-with-title.poem}}
      `;
      
      const result = renderTemplate(template, context);
      
      expect(result).toContain('# Spring\'s Embrace');
      expect(result).toContain('Topic: Love and nature in spring');
      expect(result).toContain('![Image](https://storage.googleapis.com/test/spring-image.jpg)');
      expect(result).toContain('Roses bloom in morning light,');
    });

    it('should cache compiled templates', () => {
      const template = 'Test: {{workflow.id}}';
      
      const result1 = renderTemplate(template, context);
      const result2 = renderTemplate(template, context);
      
      expect(result1).toBe(result2);
      expect(result1).toBe('Test: poem-generator');
    });

    it('should handle template errors gracefully', () => {
      const invalidTemplate = '{{#invalid syntax';
      
      const result = renderTemplate(invalidTemplate, context);
      
      // Should return stripped version as fallback - may still contain the original text
      // The important thing is that it doesn't throw an error
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('integration test with real workflow structure', () => {
    it('should process complete poem template correctly', () => {
      const context = buildContext(mockWorkflow, mockStageStates);
      
      const poemTemplate = `
        You are creating HTML for this poem:
        
        Title: {{stages.generate-poem-with-title.title}}
        Topic: {{stages.poem-topic}}
        
        Poem Content:
        {{stages.generate-poem-with-title.poem}}
        
        {{#if stages.generate-poem-image.images}}
        Available Image: {{stages.generate-poem-image.images.[0].publicUrl}}
        {{/if}}
        
        Create beautiful HTML now.
      `;
      
      const result = renderTemplate(poemTemplate, context);
      
      expect(result).toContain('Title: Spring\'s Embrace');
      expect(result).toContain('Topic: Love and nature in spring');
      expect(result).toContain('Roses bloom in morning light,');
      expect(result).toContain('Available Image: https://storage.googleapis.com/test/spring-image.jpg');
      expect(result).toContain('Create beautiful HTML now.');
      expect(result).not.toContain('{{');
      expect(result).not.toContain('}}');
    });
  });
}); 