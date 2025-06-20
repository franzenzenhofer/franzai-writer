import { verifyWorkflowModels } from './workflow-loader';
import type { Workflow, Stage } from '@/types';
import { modelCapabilities, ModelAbilities, getModelCapabilities } from './model-capabilities';

let consoleWarnSpy: jest.SpyInstance;

beforeEach(() => {
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  consoleWarnSpy.mockRestore();
});

const createTestWorkflow = (stages: Stage[], defaultModel?: string): Workflow => ({
  id: 'test-workflow',
  name: 'Test Workflow',
  description: 'A workflow for testing model verification',
  stages,
  defaultModel,
});

const createTestStage = (
  id: string,
  model?: string,
  requestedAbilities: {
    tools?: string[];
    thinking?: boolean;
    grounding?: boolean;
    codeExecution?: boolean;
    imageOutput?: boolean;
    imageGenSettings?: boolean;
  } = {}
): Stage => ({
  id,
  title: `Stage ${id}`,
  description: `Description for stage ${id}`,
  inputType: 'text',
  outputType: requestedAbilities.imageOutput ? 'image' : 'text',
  model,
  toolNames: requestedAbilities.tools,
  thinkingSettings: requestedAbilities.thinking ? { enabled: true } : undefined,
  groundingSettings: requestedAbilities.grounding ? { googleSearch: { enabled: true } } : undefined,
  codeExecutionSettings: requestedAbilities.codeExecution ? { enabled: true } : undefined,
  imageGenerationSettings: requestedAbilities.imageGenSettings ? { provider: 'gemini' } : undefined,
});

describe('verifyWorkflowModels', () => {
  // ... (other tests remain the same) ...

  it('gemini-2.0-flash: should not warn for supported abilities (tools, grounding, codeExec)', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-2.0-flash', { tools: ['someTool'], grounding: true, codeExecution: true }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('gemini-2.0-flash: should warn for imageGeneration', () => {
    const stages: Stage[] = [createTestStage('stage1', 'gemini-2.0-flash', { imageOutput: true })];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Model 'gemini-2.0-flash' in stage 'stage1' (workflow 'test-workflow') does not support image generation"));
  });

  it('gemini-2.0-flash: should warn for thinking', () => {
    const stages: Stage[] = [createTestStage('stage1', 'gemini-2.0-flash', { thinking: true })];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Model 'gemini-2.0-flash' in stage 'stage1' (workflow 'test-workflow') does not support thinking mode"));
  });

  it('gemini-2.0-flash-exp: should not warn for thinking', () => {
    const stages: Stage[] = [createTestStage('stage1', 'gemini-2.0-flash-exp', { thinking: true })];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('gemini-2.0-flash-preview-image-generation: should not warn for imageGeneration and warn for toolUse', () => {
    const stagesWithImg: Stage[] = [createTestStage('stage_img', 'gemini-2.0-flash-preview-image-generation', { imageOutput: true })];
    const workflowImg = createTestWorkflow(stagesWithImg);
    verifyWorkflowModels(workflowImg);
    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockClear();

    const stagesWithTools: Stage[] = [createTestStage('stage_tools', 'gemini-2.0-flash-preview-image-generation', { tools: ['aTool'] })];
    const workflowTools = createTestWorkflow(stagesWithTools);
    verifyWorkflowModels(workflowTools);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("does not support tool use"));
  });

  it('gemini-2.0-flash-lite: should warn for toolUse, thinking, grounding, codeExecution, imageGeneration', () => {
    const model = 'gemini-2.0-flash-lite';
    const abilitiesToCheck = {
        tools: ['aTool'],
        thinking: true,
        grounding: true,
        codeExecution: true,
        imageOutput: true
    };
    const expectedMessages = {
        tools: "does not support tool use",
        thinking: "does not support thinking mode",
        grounding: "does not support grounding",
        codeExecution: "does not support code execution",
        imageOutput: "does not support image generation"
    };

    for (const [abilityKey, requestedValue] of Object.entries(abilitiesToCheck)) {
        consoleWarnSpy.mockClear();
        // Need to cast abilityKey as it's used as an index
        const currentAbility = { [abilityKey as keyof typeof abilitiesToCheck]: requestedValue };
        const stage = createTestStage('stage1', model, currentAbility);
        const workflow = createTestWorkflow([stage]);
        verifyWorkflowModels(workflow);

        const msgFragment = expectedMessages[abilityKey as keyof typeof expectedMessages];
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(msgFragment || "ERROR_NO_MESSAGE_FRAGMENT_FOUND"));
    }
  });

  it('gemini-2.5-flash: should not warn for thinking, toolUse, grounding, codeExecution', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-2.5-flash', { thinking: true, tools: ['t'], grounding: true, codeExecution: true }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('gemini-2.5-flash: should warn for imageGeneration', () => {
    const stages: Stage[] = [createTestStage('stage1', 'gemini-2.5-flash', { imageOutput: true })];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("does not support image generation"));
  });

  // MODIFIED/NEW TESTS FOR 1.5 GROUNDING
  it('gemini-1.5-flash: should warn if grounding is requested (now defaults to false in map)', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-1.5-flash', { grounding: true }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'gemini-1.5-flash' in stage 'stage1' (workflow 'test-workflow') does not support grounding, but it's requested")
    );
  });

  it('gemini-1.5-pro: should warn if grounding is requested (now defaults to false in map)', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-1.5-pro', { grounding: true }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'gemini-1.5-pro' in stage 'stage1' (workflow 'test-workflow') does not support grounding, but it's requested")
    );
  });

  it('gemini-1.5-flash: should NOT warn for toolUse or codeExecution', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-1.5-flash', { tools: ['aTool'], codeExecution: true }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('gemini-1.5-pro: should NOT warn for toolUse or codeExecution', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-1.5-pro', { tools: ['aTool'], codeExecution: true }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });


  it('should use default workflow model if stage model is not specified and warn accordingly', () => {
    const stages: Stage[] = [
      createTestStage('stage1', undefined, { imageOutput: true }),
    ];
    const workflow = createTestWorkflow(stages, 'gemini-2.0-flash');
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'gemini-2.0-flash' in stage 'stage1'")
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("does not support image generation")
    );
  });

  it('should warn if no model is specified at stage or workflow level', () => {
    const stages: Stage[] = [createTestStage('stage1')];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("does not have a model specified and no default workflow model is set")
    );
  });

  it('should warn if model is not found in capabilities', () => {
    const stages: Stage[] = [createTestStage('stage1', 'unknown-model', {tools: ['aTool']})];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'unknown-model' specified in stage 'stage1'")
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("not found in modelCapabilities")
    );
  });

  it('should handle model names with prefixes like googleai/', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'googleai/gemini-1.5-flash', { grounding: true }), // 1.5-flash now has grounding:false
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'googleai/gemini-1.5-flash' in stage 'stage1'")
    );
     expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("does not support grounding") // Changed expectation
    );
  });

  it('should correctly verify stages with outputType "image" for image generation (positive case)', () => {
    const stageNeedsImageGen: Stage = createTestStage('imageStage', 'gemini-2.0-flash-preview-image-generation', { imageOutput: true });
    const workflow = createTestWorkflow([stageNeedsImageGen]);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should correctly verify stages with imageGenerationSettings (positive case)', () => {
    const stageNeedsImageGen: Stage = createTestStage('imageStage', 'gemini-2.0-flash-preview-image-generation', { imageGenSettings: true });
    const workflow = createTestWorkflow([stageNeedsImageGen]);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should correctly verify stages with outputType "image" for image generation (negative case)', () => {
    const stageNeedsImageGen: Stage = createTestStage('imageStage', 'gemini-1.5-pro', { imageOutput: true }); // 1.5 pro is imageGeneration:false
    const workflow = createTestWorkflow([stageNeedsImageGen]);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Model 'gemini-1.5-pro' in stage 'imageStage' (workflow 'test-workflow') does not support image generation")
    );
  });

  it('gemini-2.0-flash-lite: should warn if toolUse is requested', () => {
    const stages: Stage[] = [
      createTestStage('stage1', 'gemini-2.0-flash-lite', { tools: ['testTool'] }),
    ];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'gemini-2.0-flash-lite' in stage 'stage1' (workflow 'test-workflow') does not support tool use, but tools are specified: testTool")
    );
  });

  it('should handle -exp models by mapping to base if base exists (e.g. hypothetical gemini-1.5-flash-exp for grounding)', () => {
    const stages: Stage[] = [createTestStage('stage1', 'gemini-1.5-flash-exp', { grounding: true })];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);

    // gemini-1.5-flash (base of -exp) is grounding:false in our map
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'gemini-1.5-flash-exp' in stage 'stage1' (workflow 'test-workflow') does not support grounding")
    );
  });

  it('should handle -001 models by mapping to base if base exists (e.g. gemini-1.5-pro-001 for grounding)', () => {
    const stages: Stage[] = [createTestStage('stage1', 'gemini-1.5-pro-001', { grounding: true })];
    const workflow = createTestWorkflow(stages);
    verifyWorkflowModels(workflow);
    // gemini-1.5-pro (base of -001) is grounding:false
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Model 'gemini-1.5-pro-001' in stage 'stage1' (workflow 'test-workflow') does not support grounding")
    );
  });
});
