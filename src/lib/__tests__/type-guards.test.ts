/**
 * Type Guards Test Suite
 * 
 * Test suite for runtime type validation functions to ensure they work correctly
 * with real workflow data and handle edge cases properly.
 */

import { 
  isStageState, 
  isWorkflow, 
  isWizardInstance, 
  isStage,
  isFormField,
  isJsonField,
  isExportFormat,
  isExportConfig,
  isImageGenerationSettings,
  isImageOutputData,
  isAsset,
  validateStageStateRuntime,
  validateWorkflowRuntime,
  validateWizardInstanceRuntime,
  castToStageState,
  castToWorkflow,
  castToWizardInstance,
  validateStageStatesCollection,
  validateWorkflowsArray
} from '../type-guards';
import { 
  validateStageStateComprehensive,
  validateWorkflowComprehensive,
  validateWizardInstanceComprehensive,
  quickValidators,
  createValidator
} from '../runtime-validation';

// Mock data for testing
const mockStageState = {
  stageId: 'test-stage',
  status: 'completed' as const,
  userInput: 'test input',
  output: 'test output',
  error: undefined,
  depsAreMet: true,
  completedAt: '2024-01-01T00:00:00Z',
  isEditingInput: false,
  isEditingOutput: false,
  isStale: false,
  staleDismissed: false,
  shouldAutoRun: false,
  groundingInfo: undefined,
  groundingMetadata: undefined,
  groundingSources: undefined,
  functionCalls: undefined,
  codeExecutionResults: undefined,
  thinkingSteps: undefined,
  outputImages: undefined,
  usageMetadata: undefined,
  currentStreamOutput: undefined,
  generationProgress: undefined
};

const mockStage = {
  id: 'test-stage',
  title: 'Test Stage',
  description: 'A test stage',
  inputType: 'text' as const,
  outputType: 'text' as const,
  dependencies: [],
  autoRun: false,
  groundingRequested: false,
  isOptional: false
};

const mockWorkflow = {
  id: 'test-workflow',
  name: 'Test Workflow',
  description: 'A test workflow',
  stages: [mockStage],
  config: {},
  defaultModel: 'gemini-2.0-flash',
  temperature: 0.7
};

const mockWizardDocument = {
  id: 'test-doc',
  title: 'Test Document',
  workflowId: 'test-workflow',
  status: 'draft' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userId: 'test-user'
};

const mockWizardInstance = {
  document: mockWizardDocument,
  documentId: 'test-doc',
  workflow: mockWorkflow,
  stageStates: {
    'test-stage': mockStageState
  },
  currentStageId: 'test-stage'
};

describe('Type Guards', () => {
  describe('isStageState', () => {
    test('should validate correct StageState', () => {
      expect(isStageState(mockStageState)).toBe(true);
    });
    
    test('should reject invalid StageState', () => {
      expect(isStageState({})).toBe(false);
      expect(isStageState({ status: 'invalid' })).toBe(false);
      expect(isStageState({ status: 'idle', invalidProp: true })).toBe(false);
    });
    
    test('should handle minimal valid StageState', () => {
      const minimal = { status: 'idle' };
      expect(isStageState(minimal)).toBe(true);
    });
  });
  
  describe('isWorkflow', () => {
    test('should validate correct Workflow', () => {
      expect(isWorkflow(mockWorkflow)).toBe(true);
    });
    
    test('should reject invalid Workflow', () => {
      expect(isWorkflow({})).toBe(false);
      expect(isWorkflow({ id: 'test' })).toBe(false);
      expect(isWorkflow({ 
        id: 'test', 
        name: 'Test', 
        description: 'Test',
        stages: [{ invalid: true }]
      })).toBe(false);
    });
  });
  
  describe('isWizardInstance', () => {
    test('should validate correct WizardInstance', () => {
      expect(isWizardInstance(mockWizardInstance)).toBe(true);
    });
    
    test('should reject invalid WizardInstance', () => {
      expect(isWizardInstance({})).toBe(false);
      expect(isWizardInstance({ 
        document: mockWizardDocument,
        workflow: { invalid: true },
        stageStates: {}
      })).toBe(false);
    });
  });
  
  describe('isStage', () => {
    test('should validate correct Stage', () => {
      expect(isStage(mockStage)).toBe(true);
    });
    
    test('should reject invalid Stage', () => {
      expect(isStage({})).toBe(false);
      expect(isStage({ 
        id: 'test',
        title: 'Test',
        description: 'Test',
        inputType: 'invalid',
        outputType: 'text'
      })).toBe(false);
    });
  });
  
  describe('isFormField', () => {
    test('should validate correct FormField', () => {
      const formField = {
        name: 'test',
        label: 'Test Field',
        type: 'text' as const,
        defaultValue: 'default',
        placeholder: 'Enter text'
      };
      expect(isFormField(formField)).toBe(true);
    });
    
    test('should reject invalid FormField', () => {
      expect(isFormField({})).toBe(false);
      expect(isFormField({ 
        name: 'test',
        label: 'Test',
        type: 'invalid'
      })).toBe(false);
    });
  });
  
  describe('isJsonField', () => {
    test('should validate correct JsonField', () => {
      const jsonField = {
        key: 'test',
        label: 'Test Field',
        type: 'text' as const,
        displayOrder: 1,
        required: true
      };
      expect(isJsonField(jsonField)).toBe(true);
    });
    
    test('should reject invalid JsonField', () => {
      expect(isJsonField({})).toBe(false);
      expect(isJsonField({ 
        key: 'test',
        label: 'Test',
        type: 'invalid'
      })).toBe(false);
    });
  });
  
  describe('isExportFormat', () => {
    test('should validate correct ExportFormat', () => {
      const exportFormat = {
        enabled: true,
        label: 'HTML',
        description: 'HTML format'
      };
      expect(isExportFormat(exportFormat)).toBe(true);
    });
    
    test('should reject invalid ExportFormat', () => {
      expect(isExportFormat({})).toBe(false);
      expect(isExportFormat({ 
        enabled: 'yes',
        label: 'HTML'
      })).toBe(false);
    });
  });
  
  describe('isImageGenerationSettings', () => {
    test('should validate correct ImageGenerationSettings', () => {
      const settings = {
        provider: 'gemini' as const,
        aspectRatio: '16:9',
        numberOfImages: 2,
        style: 'photographic'
      };
      expect(isImageGenerationSettings(settings)).toBe(true);
    });
    
    test('should reject invalid ImageGenerationSettings', () => {
      expect(isImageGenerationSettings({ 
        provider: 'invalid',
        aspectRatio: '16:9'
      })).toBe(false);
    });
  });
  
  describe('isImageOutputData', () => {
    test('should validate correct ImageOutputData', () => {
      const imageData = {
        provider: 'gemini' as const,
        images: [{
          promptUsed: 'test prompt',
          mimeType: 'image/png',
          aspectRatio: '16:9'
        }],
        selectedImageIndex: 0,
        accompanyingText: 'Generated image'
      };
      expect(isImageOutputData(imageData)).toBe(true);
    });
    
    test('should reject invalid ImageOutputData', () => {
      expect(isImageOutputData({
        provider: 'invalid',
        images: []
      })).toBe(false);
    });
  });
});

describe('Runtime Validation Functions', () => {
  describe('validateStageStateRuntime', () => {
    test('should validate correct StageState', () => {
      expect(() => validateStageStateRuntime(mockStageState)).not.toThrow();
    });
    
    test('should throw for invalid StageState', () => {
      expect(() => validateStageStateRuntime({})).toThrow();
      expect(() => validateStageStateRuntime({ status: 'invalid' })).toThrow();
    });
  });
  
  describe('validateWorkflowRuntime', () => {
    test('should validate correct Workflow', () => {
      expect(() => validateWorkflowRuntime(mockWorkflow)).not.toThrow();
    });
    
    test('should throw for invalid Workflow', () => {
      expect(() => validateWorkflowRuntime({})).toThrow();
      expect(() => validateWorkflowRuntime({ id: 'test' })).toThrow();
    });
  });
  
  describe('validateWizardInstanceRuntime', () => {
    test('should validate correct WizardInstance', () => {
      expect(() => validateWizardInstanceRuntime(mockWizardInstance)).not.toThrow();
    });
    
    test('should throw for invalid WizardInstance', () => {
      expect(() => validateWizardInstanceRuntime({})).toThrow();
    });
  });
});

describe('Safe Casting Functions', () => {
  describe('castToStageState', () => {
    test('should cast valid StageState', () => {
      const result = castToStageState(mockStageState);
      expect(result).toEqual(mockStageState);
    });
    
    test('should return null for invalid data', () => {
      const result = castToStageState({});
      expect(result).toBeNull();
    });
  });
  
  describe('castToWorkflow', () => {
    test('should cast valid Workflow', () => {
      const result = castToWorkflow(mockWorkflow);
      expect(result).toEqual(mockWorkflow);
    });
    
    test('should return null for invalid data', () => {
      const result = castToWorkflow({});
      expect(result).toBeNull();
    });
  });
  
  describe('castToWizardInstance', () => {
    test('should cast valid WizardInstance', () => {
      const result = castToWizardInstance(mockWizardInstance);
      expect(result).toEqual(mockWizardInstance);
    });
    
    test('should return null for invalid data', () => {
      const result = castToWizardInstance({});
      expect(result).toBeNull();
    });
  });
});

describe('Collection Validation Functions', () => {
  describe('validateStageStatesCollection', () => {
    test('should validate correct collection', () => {
      const collection = { 'test-stage': mockStageState };
      expect(() => validateStageStatesCollection(collection)).not.toThrow();
    });
    
    test('should throw for invalid collection', () => {
      expect(() => validateStageStatesCollection({})).not.toThrow(); // Empty is valid
      expect(() => validateStageStatesCollection({ 'test': {} })).toThrow();
    });
  });
  
  describe('validateWorkflowsArray', () => {
    test('should validate correct array', () => {
      const array = [mockWorkflow];
      expect(() => validateWorkflowsArray(array)).not.toThrow();
    });
    
    test('should throw for invalid array', () => {
      expect(() => validateWorkflowsArray([])).not.toThrow(); // Empty is valid
      expect(() => validateWorkflowsArray([{}])).toThrow();
    });
  });
});

describe('Comprehensive Validation', () => {
  describe('validateStageStateComprehensive', () => {
    test('should validate and fix StageState', () => {
      const result = validateStageStateComprehensive(mockStageState);
      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
    
    test('should report errors for invalid data', () => {
      const result = validateStageStateComprehensive({});
      expect(result.isValid).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('validateWorkflowComprehensive', () => {
    test('should validate correct Workflow', () => {
      const result = validateWorkflowComprehensive(mockWorkflow);
      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
    
    test('should detect duplicate stage IDs', () => {
      const invalidWorkflow = {
        ...mockWorkflow,
        stages: [mockStage, mockStage] // Duplicate stages
      };
      const result = validateWorkflowComprehensive(invalidWorkflow);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Workflow contains duplicate stage IDs');
    });
    
    test('should detect invalid dependencies', () => {
      const invalidWorkflow = {
        ...mockWorkflow,
        stages: [{
          ...mockStage,
          dependencies: ['non-existent-stage']
        }]
      };
      const result = validateWorkflowComprehensive(invalidWorkflow);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('depends on non-existent stage'))).toBe(true);
    });
  });
  
  describe('validateWizardInstanceComprehensive', () => {
    test('should validate correct WizardInstance', () => {
      const result = validateWizardInstanceComprehensive(mockWizardInstance);
      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });
    
    test('should cascade validation errors', () => {
      const invalidInstance = {
        ...mockWizardInstance,
        workflow: { ...mockWorkflow, stages: [] } // Empty stages
      };
      const result = validateWizardInstanceComprehensive(invalidInstance);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Workflow:'))).toBe(true);
    });
  });
});

describe('Dynamic Content Validator', () => {
  test('should create validator with context', () => {
    const validator = createValidator({
      source: 'test',
      operation: 'test',
      timestamp: new Date()
    });
    
    expect(validator).toBeDefined();
    expect(validator.validateStageState).toBeDefined();
    expect(validator.validateWorkflow).toBeDefined();
    expect(validator.validateWizardInstance).toBeDefined();
  });
  
  test('should validate data with context', () => {
    const validator = createValidator({
      source: 'test',
      operation: 'test',
      timestamp: new Date()
    });
    
    const result = validator.validateStageState(mockStageState);
    expect(result.isValid).toBe(true);
  });
});

describe('Quick Validators', () => {
  test('should provide quick validation functions', () => {
    expect(quickValidators.apiStageState).toBeDefined();
    expect(quickValidators.apiWorkflow).toBeDefined();
    expect(quickValidators.localStorageWizardInstance).toBeDefined();
    expect(quickValidators.firestoreStageState).toBeDefined();
    expect(quickValidators.firestoreWorkflow).toBeDefined();
  });
  
  test('should validate API response', () => {
    const result = quickValidators.apiStageState(mockStageState, '/api/stage');
    expect(result.isValid).toBe(true);
  });
  
  test('should validate localStorage data', () => {
    const result = quickValidators.localStorageWizardInstance(mockWizardInstance, 'wizard-instance');
    expect(result.isValid).toBe(true);
  });
});