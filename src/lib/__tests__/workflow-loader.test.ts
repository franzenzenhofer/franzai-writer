import { allWorkflows, getWorkflowById, getWorkflowByShortName } from '../workflow-loader';
import { Workflow } from '@/types';

describe('Workflow Loader', () => {
  describe('Press Release Workflow Integration', () => {
    let pressReleaseWorkflow: Workflow | undefined;

    beforeAll(() => {
      pressReleaseWorkflow = allWorkflows.find(w => w.id === 'press-release');
    });

    it('should include press release workflow in allWorkflows', () => {
      expect(pressReleaseWorkflow).toBeDefined();
      expect(pressReleaseWorkflow?.id).toBe('press-release');
    });

    it('should be retrievable by ID', () => {
      const workflow = getWorkflowById('press-release');
      expect(workflow).toBeDefined();
      expect(workflow?.name).toBe('Press Release Generator');
    });

    it('should be retrievable by short name', () => {
      const workflow = getWorkflowByShortName('press-release');
      expect(workflow).toBeDefined();
      expect(workflow?.id).toBe('press-release');
    });

    it('should have valid workflow structure', () => {
      expect(pressReleaseWorkflow).toMatchObject({
        id: expect.any(String),
        shortName: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        stages: expect.any(Array),
        config: expect.any(Object)
      });
    });

    it('should be in correct position in workflow list', () => {
      const workflowIds = allWorkflows.map(w => w.id);
      const pressReleaseIndex = workflowIds.indexOf('press-release');
      
      // Should be after the test workflows
      expect(pressReleaseIndex).toBeGreaterThan(-1);
      expect(pressReleaseIndex).toBeLessThan(allWorkflows.length);
    });
  });

  describe('All Workflows Validation', () => {
    it('should have unique IDs', () => {
      const ids = allWorkflows.map(w => w.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have unique short names', () => {
      const shortNames = allWorkflows.map(w => w.shortName).filter(Boolean);
      const uniqueShortNames = new Set(shortNames);
      expect(shortNames.length).toBe(uniqueShortNames.size);
    });

    it('should have valid stage structures', () => {
      allWorkflows.forEach(workflow => {
        expect(workflow.stages.length).toBeGreaterThan(0);
        
        workflow.stages.forEach(stage => {
          // All stages must have id, inputType, and outputType
          expect(stage.id).toBeDefined();
          expect(typeof stage.id).toBe('string');
          expect(stage.inputType).toBeDefined();
          expect(typeof stage.inputType).toBe('string');
          expect(stage.outputType).toBeDefined();
          expect(typeof stage.outputType).toBe('string');
          
          // Most stages should have a name (except perhaps some special stages)
          if (stage.name !== undefined) {
            expect(typeof stage.name).toBe('string');
          }
        });
      });
    });
  });
});