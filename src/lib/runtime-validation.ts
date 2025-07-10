/**
 * Runtime Validation Utilities
 * 
 * This module provides high-level validation utilities that integrate with the
 * existing validation system and provide comprehensive runtime type checking
 * for dynamic content handling scenarios.
 */

import type { StageState, Workflow, WizardInstance } from '@/types';
import { 
  isStageState, 
  isWorkflow, 
  isWizardInstance, 
  validateStageStateRuntime, 
  validateWorkflowRuntime, 
  validateWizardInstanceRuntime,
  validateStageStatesCollection,
  validateWorkflowsArray
} from './type-guards';
import { validateStageState, validateAllStageStates } from './stage-state-validation';
import { validateStageStatesMatchWorkflow } from './workflow-utils';

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data: T | null;
  errors: string[];
  warnings: string[];
}

/**
 * Validation context for better error reporting
 */
export interface ValidationContext {
  source: string;
  operation: string;
  userId?: string;
  documentId?: string;
  timestamp: Date;
}

/**
 * Comprehensive StageState validation that combines type checking with business logic
 */
export function validateStageStateComprehensive(
  value: unknown, 
  context?: ValidationContext
): ValidationResult<StageState> {
  const result: ValidationResult<StageState> = {
    isValid: false,
    data: null,
    errors: [],
    warnings: []
  };
  
  try {
    // Step 1: Runtime type validation
    const stageState = validateStageStateRuntime(value, context?.source);
    
    // Step 2: Business logic validation
    const validatedStageState = validateStageState(stageState);
    
    // Step 3: Check for warnings (state changes during validation)
    if (validatedStageState !== stageState) {
      result.warnings.push('Stage state was modified during validation to fix inconsistencies');
    }
    
    result.isValid = true;
    result.data = validatedStageState;
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }
  
  return result;
}

/**
 * Comprehensive Workflow validation
 */
export function validateWorkflowComprehensive(
  value: unknown, 
  context?: ValidationContext
): ValidationResult<Workflow> {
  const result: ValidationResult<Workflow> = {
    isValid: false,
    data: null,
    errors: [],
    warnings: []
  };
  
  try {
    // Step 1: Runtime type validation
    const workflow = validateWorkflowRuntime(value, context?.source);
    
    // Step 2: Business logic validation
    if (workflow.stages.length === 0) {
      result.errors.push('Workflow must have at least one stage');
      return result;
    }
    
    // Check for duplicate stage IDs
    const stageIds = workflow.stages.map(s => s.id);
    const uniqueStageIds = new Set(stageIds);
    if (stageIds.length !== uniqueStageIds.size) {
      result.errors.push('Workflow contains duplicate stage IDs');
      return result;
    }
    
    // Validate stage dependencies
    for (const stage of workflow.stages) {
      if (stage.dependencies) {
        for (const depId of stage.dependencies) {
          if (!uniqueStageIds.has(depId)) {
            result.errors.push(`Stage ${stage.id} depends on non-existent stage ${depId}`);
          }
        }
      }
      
      if (stage.autorunDependsOn) {
        for (const depId of stage.autorunDependsOn) {
          if (!uniqueStageIds.has(depId)) {
            result.errors.push(`Stage ${stage.id} autorun depends on non-existent stage ${depId}`);
          }
        }
      }
    }
    
    if (result.errors.length > 0) {
      return result;
    }
    
    result.isValid = true;
    result.data = workflow;
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }
  
  return result;
}

/**
 * Comprehensive WizardInstance validation
 */
export function validateWizardInstanceComprehensive(
  value: unknown, 
  context?: ValidationContext
): ValidationResult<WizardInstance> {
  const result: ValidationResult<WizardInstance> = {
    isValid: false,
    data: null,
    errors: [],
    warnings: []
  };
  
  try {
    // Step 1: Runtime type validation
    const wizardInstance = validateWizardInstanceRuntime(value, context?.source);
    
    // Step 2: Validate workflow
    const workflowValidation = validateWorkflowComprehensive(wizardInstance.workflow, context);
    if (!workflowValidation.isValid) {
      result.errors.push(...workflowValidation.errors.map(e => `Workflow: ${e}`));
      return result;
    }
    
    // Step 3: Validate stage states collection
    const stageStatesValidation = validateStageStatesCollection(wizardInstance.stageStates, context?.source);
    
    // Step 4: Validate stage states match workflow
    const matchValidation = validateStageStatesMatchWorkflow(wizardInstance.workflow, stageStatesValidation);
    if (!matchValidation.isValid) {
      result.warnings.push(`Stage states don't match workflow: ${matchValidation.mismatchedIds.length} mismatched IDs`);
    }
    
    // Step 5: Validate individual stage states
    const validatedStageStates = validateAllStageStates(stageStatesValidation);
    
    // Step 6: Check for warnings (state changes during validation)
    if (JSON.stringify(validatedStageStates) !== JSON.stringify(stageStatesValidation)) {
      result.warnings.push('Some stage states were modified during validation to fix inconsistencies');
    }
    
    result.isValid = true;
    result.data = {
      ...wizardInstance,
      workflow: workflowValidation.data!,
      stageStates: validatedStageStates
    };
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }
  
  return result;
}

/**
 * Validate data from external sources (APIs, localStorage, etc.)
 */
export function validateExternalData<T>(
  value: unknown,
  validator: (value: unknown) => value is T,
  context: ValidationContext
): ValidationResult<T> {
  const result: ValidationResult<T> = {
    isValid: false,
    data: null,
    errors: [],
    warnings: []
  };
  
  try {
    if (validator(value)) {
      result.isValid = true;
      result.data = value;
    } else {
      result.errors.push(`Invalid data structure from ${context.source}`);
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }
  
  return result;
}

/**
 * Validate API response data
 */
export function validateApiResponse<T>(
  response: unknown,
  validator: (value: unknown) => value is T,
  apiEndpoint: string,
  operation: string
): ValidationResult<T> {
  const context: ValidationContext = {
    source: `API: ${apiEndpoint}`,
    operation,
    timestamp: new Date()
  };
  
  return validateExternalData(response, validator, context);
}

/**
 * Validate localStorage data
 */
export function validateLocalStorageData<T>(
  data: unknown,
  validator: (value: unknown) => value is T,
  key: string
): ValidationResult<T> {
  const context: ValidationContext = {
    source: `localStorage: ${key}`,
    operation: 'read',
    timestamp: new Date()
  };
  
  return validateExternalData(data, validator, context);
}

/**
 * Validate Firestore document data
 */
export function validateFirestoreData<T>(
  data: unknown,
  validator: (value: unknown) => value is T,
  collection: string,
  documentId: string
): ValidationResult<T> {
  const context: ValidationContext = {
    source: `Firestore: ${collection}/${documentId}`,
    operation: 'read',
    documentId,
    timestamp: new Date()
  };
  
  return validateExternalData(data, validator, context);
}

/**
 * Batch validation for multiple workflows
 */
export function validateWorkflowsBatch(
  workflows: unknown[],
  context?: ValidationContext
): ValidationResult<Workflow[]> {
  const result: ValidationResult<Workflow[]> = {
    isValid: false,
    data: null,
    errors: [],
    warnings: []
  };
  
  try {
    const validatedWorkflows = validateWorkflowsArray(workflows, context?.source);
    
    // Additional batch validation
    const workflowIds = validatedWorkflows.map(w => w.id);
    const uniqueWorkflowIds = new Set(workflowIds);
    if (workflowIds.length !== uniqueWorkflowIds.size) {
      result.errors.push('Batch contains duplicate workflow IDs');
      return result;
    }
    
    result.isValid = true;
    result.data = validatedWorkflows;
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }
  
  return result;
}

/**
 * Validation utilities for dynamic content scenarios
 */
export class DynamicContentValidator {
  private context: ValidationContext;
  
  constructor(context: ValidationContext) {
    this.context = context;
  }
  
  /**
   * Validate unknown data as StageState
   */
  validateStageState(value: unknown): ValidationResult<StageState> {
    return validateStageStateComprehensive(value, this.context);
  }
  
  /**
   * Validate unknown data as Workflow
   */
  validateWorkflow(value: unknown): ValidationResult<Workflow> {
    return validateWorkflowComprehensive(value, this.context);
  }
  
  /**
   * Validate unknown data as WizardInstance
   */
  validateWizardInstance(value: unknown): ValidationResult<WizardInstance> {
    return validateWizardInstanceComprehensive(value, this.context);
  }
  
  /**
   * Validate array of unknown data as StageState[]
   */
  validateStageStatesArray(values: unknown[]): ValidationResult<StageState[]> {
    const result: ValidationResult<StageState[]> = {
      isValid: false,
      data: null,
      errors: [],
      warnings: []
    };
    
    try {
      const validatedStates: StageState[] = [];
      
      for (let i = 0; i < values.length; i++) {
        const stateResult = this.validateStageState(values[i]);
        
        if (!stateResult.isValid) {
          result.errors.push(`Item ${i}: ${stateResult.errors.join(', ')}`);
          return result;
        }
        
        validatedStates.push(stateResult.data!);
        result.warnings.push(...stateResult.warnings.map(w => `Item ${i}: ${w}`));
      }
      
      result.isValid = true;
      result.data = validatedStates;
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown validation error');
    }
    
    return result;
  }
  
  /**
   * Update validation context
   */
  updateContext(updates: Partial<ValidationContext>): void {
    this.context = { ...this.context, ...updates };
  }
}

/**
 * Create a validator for a specific context
 */
export function createValidator(context: ValidationContext): DynamicContentValidator {
  return new DynamicContentValidator(context);
}

/**
 * Quick validation functions for common scenarios
 */
export const quickValidators = {
  /**
   * Validate API response as StageState
   */
  apiStageState: (response: unknown, endpoint: string) => 
    validateApiResponse(response, isStageState, endpoint, 'fetch'),
  
  /**
   * Validate API response as Workflow
   */
  apiWorkflow: (response: unknown, endpoint: string) => 
    validateApiResponse(response, isWorkflow, endpoint, 'fetch'),
  
  /**
   * Validate localStorage data as WizardInstance
   */
  localStorageWizardInstance: (data: unknown, key: string) => 
    validateLocalStorageData(data, isWizardInstance, key),
  
  /**
   * Validate Firestore document as StageState
   */
  firestoreStageState: (data: unknown, collection: string, docId: string) => 
    validateFirestoreData(data, isStageState, collection, docId),
  
  /**
   * Validate Firestore document as Workflow
   */
  firestoreWorkflow: (data: unknown, collection: string, docId: string) => 
    validateFirestoreData(data, isWorkflow, collection, docId)
};

/**
 * Error handler for validation failures
 */
export function handleValidationFailure<T>(
  result: ValidationResult<T>,
  fallbackAction: () => T,
  logContext?: string
): T {
  if (result.isValid) {
    if (result.warnings.length > 0) {
      console.warn(`Validation warnings${logContext ? ` for ${logContext}` : ''}:`, result.warnings);
    }
    return result.data!;
  }
  
  console.error(`Validation failed${logContext ? ` for ${logContext}` : ''}:`, result.errors);
  
  // Following the project's "fail fast" policy - we still log the error but provide fallback
  return fallbackAction();
}

/**
 * Validation middleware for API endpoints
 */
export function createValidationMiddleware<T>(
  validator: (value: unknown) => value is T,
  errorMessage: string
) {
  return (data: unknown): T => {
    if (!validator(data)) {
      throw new Error(errorMessage);
    }
    return data;
  };
}