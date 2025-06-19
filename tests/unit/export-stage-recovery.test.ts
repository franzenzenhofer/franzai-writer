import { resetStuckExportStages } from '@/lib/export-stage-recovery';
import type { StageState, Workflow } from '@/types';

describe('Export Stage Recovery', () => {
  test('resets running export stage to idle', () => {
    const stageStates: Record<string, StageState> = {
      'export-publish': {
        stageId: 'export-publish',
        status: 'running',
        generationProgress: { currentFormat: 'Processing: 50%' },
        error: undefined,
      } as StageState,
      'regular-stage': {
        stageId: 'regular-stage', 
        status: 'completed',
      } as StageState,
    };

    const workflow: Workflow = {
      id: 'test',
      name: 'Test Workflow',
      description: 'Test',
      stages: [
        { id: 'export-publish', stageType: 'export', title: 'Export', description: '', inputType: 'none', outputType: 'export-interface' },
        { id: 'regular-stage', title: 'Regular', description: '', inputType: 'text', outputType: 'text' },
      ]
    } as any;

    const result = resetStuckExportStages(stageStates, workflow);

    expect(result['export-publish'].status).toBe('idle');
    expect(result['export-publish'].generationProgress).toBeUndefined();
    expect(result['export-publish'].error).toBeUndefined();
    expect(result['regular-stage'].status).toBe('completed'); // Not affected
  });

  test('leaves non-export stages unchanged', () => {
    const stageStates: Record<string, StageState> = {
      'ai-stage': {
        stageId: 'ai-stage',
        status: 'running',
      } as StageState,
    };

    const workflow: Workflow = {
      id: 'test',
      name: 'Test Workflow', 
      description: 'Test',
      stages: [
        { id: 'ai-stage', title: 'AI Stage', description: '', inputType: 'text', outputType: 'text' },
      ]
    } as any;

    const result = resetStuckExportStages(stageStates, workflow);

    expect(result['ai-stage'].status).toBe('running'); // Should not be changed
  });

  test('leaves completed export stages unchanged', () => {
    const stageStates: Record<string, StageState> = {
      'export-publish': {
        stageId: 'export-publish',
        status: 'completed',
        output: { formats: {} },
      } as StageState,
    };

    const workflow: Workflow = {
      id: 'test',
      name: 'Test Workflow',
      description: 'Test', 
      stages: [
        { id: 'export-publish', stageType: 'export', title: 'Export', description: '', inputType: 'none', outputType: 'export-interface' },
      ]
    } as any;

    const result = resetStuckExportStages(stageStates, workflow);

    expect(result['export-publish'].status).toBe('completed'); // Should not be changed
  });

  test('returns new object without mutating original', () => {
    const stageStates: Record<string, StageState> = {
      'export-publish': {
        stageId: 'export-publish',
        status: 'running',
      } as StageState,
    };

    const workflow: Workflow = {
      id: 'test',
      name: 'Test Workflow',
      description: 'Test',
      stages: [
        { id: 'export-publish', stageType: 'export', title: 'Export', description: '', inputType: 'none', outputType: 'export-interface' },
      ]
    } as any;

    const result = resetStuckExportStages(stageStates, workflow);

    expect(result).not.toBe(stageStates); // Different object
    expect(stageStates['export-publish'].status).toBe('running'); // Original unchanged
    expect(result['export-publish'].status).toBe('idle'); // Result is fixed
  });
});