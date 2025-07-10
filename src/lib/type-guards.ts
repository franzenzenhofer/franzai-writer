/**
 * Comprehensive Type Guards for Runtime Type Validation
 * 
 * This module provides runtime type checking functions that validate unknown data
 * against TypeScript interfaces. These guards are essential for dynamic content
 * handling, API responses, and ensuring type safety at runtime.
 */

import type { 
  StageState, 
  Workflow, 
  ExportStageState, 
  Stage, 
  FormField, 
  JsonField, 
  ExportConfig, 
  ExportFormat,
  WizardInstance,
  WizardDocument,
  ImageGenerationSettings,
  ImageOutputData,
  Asset,
  StageInputType,
  FormFieldType
} from '@/types';

/**
 * Utility function to check if value is an object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Utility function to check if value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Utility function to check if value is a number
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Utility function to check if value is a boolean
 */
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Utility function to check if value is an array
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard for StageInputType
 */
export function isStageInputType(value: unknown): value is StageInputType {
  return isString(value) && ['text', 'textarea', 'context', 'form', 'none', 'image', 'document'].includes(value);
}

/**
 * Type guard for FormFieldType
 */
export function isFormFieldType(value: unknown): value is FormFieldType {
  return isString(value) && ['text', 'textarea', 'checkbox', 'select'].includes(value);
}

/**
 * Type guard for FormField
 */
export function isFormField(value: unknown): value is FormField {
  if (!isObject(value)) return false;
  
  const { name, label, type, defaultValue, placeholder, options, validation } = value;
  
  return (
    isString(name) &&
    isString(label) &&
    isFormFieldType(type) &&
    (defaultValue === undefined || isString(defaultValue) || isBoolean(defaultValue) || isNumber(defaultValue)) &&
    (placeholder === undefined || isString(placeholder)) &&
    (options === undefined || (isArray(options) && options.every(opt => 
      isObject(opt) && isString(opt.value) && isString(opt.label)
    ))) &&
    (validation === undefined || isObject(validation))
  );
}

/**
 * Type guard for JsonField
 */
export function isJsonField(value: unknown): value is JsonField {
  if (!isObject(value)) return false;
  
  const { key, label, type, displayOrder, description, required } = value;
  
  return (
    isString(key) &&
    isString(label) &&
    isString(type) &&
    ['text', 'textarea', 'number', 'boolean', 'array', 'object'].includes(type) &&
    (displayOrder === undefined || isNumber(displayOrder)) &&
    (description === undefined || isString(description)) &&
    (required === undefined || isBoolean(required))
  );
}

/**
 * Type guard for ExportFormat
 */
export function isExportFormat(value: unknown): value is ExportFormat {
  if (!isObject(value)) return false;
  
  const { enabled, label, description, icon, aiTemplate, deriveFrom, features, options, stripElements, preserveStructure } = value;
  
  return (
    isBoolean(enabled) &&
    isString(label) &&
    isString(description) &&
    (icon === undefined || isString(icon)) &&
    (aiTemplate === undefined || isString(aiTemplate)) &&
    (deriveFrom === undefined || isString(deriveFrom)) &&
    (features === undefined || (isArray(features) && features.every(f => isString(f)))) &&
    (options === undefined || isObject(options)) &&
    (stripElements === undefined || (isArray(stripElements) && stripElements.every(s => isString(s)))) &&
    (preserveStructure === undefined || isBoolean(preserveStructure))
  );
}

/**
 * Type guard for ExportConfig
 */
export function isExportConfig(value: unknown): value is ExportConfig {
  if (!isObject(value)) return false;
  
  const { aiModel, temperature, formats, publishing, styling } = value;
  
  return (
    (aiModel === undefined || isString(aiModel)) &&
    (temperature === undefined || isNumber(temperature)) &&
    isObject(formats) &&
    Object.values(formats).every(f => f === undefined || isExportFormat(f)) &&
    (publishing === undefined || isObject(publishing)) &&
    (styling === undefined || isObject(styling))
  );
}

/**
 * Type guard for ImageGenerationSettings
 */
export function isImageGenerationSettings(value: unknown): value is ImageGenerationSettings {
  if (!isObject(value)) return false;
  
  const { provider, aspectRatio, numberOfImages, style, negativePrompt, filenames, gemini, imagen } = value;
  
  return (
    (provider === undefined || (isString(provider) && ['gemini', 'imagen'].includes(provider))) &&
    (aspectRatio === undefined || isString(aspectRatio)) &&
    (numberOfImages === undefined || isNumber(numberOfImages)) &&
    (style === undefined || isString(style)) &&
    (negativePrompt === undefined || isString(negativePrompt)) &&
    (filenames === undefined || (isArray(filenames) && filenames.every(f => isString(f)))) &&
    (gemini === undefined || isObject(gemini)) &&
    (imagen === undefined || isObject(imagen))
  );
}

/**
 * Type guard for Stage
 */
export function isStage(value: unknown): value is Stage {
  if (!isObject(value)) return false;
  
  const { 
    id, title, description, placeholder, stageType, inputType, formFields, jsonFields, 
    promptTemplate, prompt, model, temperature, outputType, dependencies, autoRun, 
    autorunDependsOn, groundingRequested, isOptional, tokenEstimate, autoRunConditions,
    thinkingSettings, toolNames, tools, functionCallingMode, systemInstructions,
    groundingSettings, codeExecutionSettings, imageSettings, documentSettings,
    filesApiSettings, aiRedoEnabled, editEnabled, showThinking, copyable,
    hideImageMetadata, jsonSchema, maxTokens, systemInstruction, showAsHero,
    triggerButton, exportConfig, imageGenerationSettings
  } = value;
  
  return (
    isString(id) &&
    isString(title) &&
    isString(description) &&
    (placeholder === undefined || isString(placeholder)) &&
    (stageType === undefined || (isString(stageType) && ['default', 'export'].includes(stageType))) &&
    isStageInputType(inputType) &&
    (formFields === undefined || (isArray(formFields) && formFields.every(f => isFormField(f)))) &&
    (jsonFields === undefined || (isArray(jsonFields) && jsonFields.every(f => isJsonField(f)))) &&
    (promptTemplate === undefined || isString(promptTemplate)) &&
    (prompt === undefined || isString(prompt)) &&
    (model === undefined || isString(model)) &&
    (temperature === undefined || isNumber(temperature)) &&
    isString(outputType) &&
    ['text', 'json', 'markdown', 'html', 'export-interface', 'image'].includes(outputType) &&
    (dependencies === undefined || (isArray(dependencies) && dependencies.every(d => isString(d)))) &&
    (autoRun === undefined || isBoolean(autoRun)) &&
    (autorunDependsOn === undefined || (isArray(autorunDependsOn) && autorunDependsOn.every(d => isString(d)))) &&
    (groundingRequested === undefined || isBoolean(groundingRequested)) &&
    (isOptional === undefined || isBoolean(isOptional)) &&
    (tokenEstimate === undefined || isNumber(tokenEstimate)) &&
    (autoRunConditions === undefined || isObject(autoRunConditions)) &&
    (thinkingSettings === undefined || isObject(thinkingSettings)) &&
    (toolNames === undefined || (isArray(toolNames) && toolNames.every(t => isString(t)))) &&
    (tools === undefined || isArray(tools)) &&
    (functionCallingMode === undefined || (isString(functionCallingMode) && ['AUTO', 'ANY', 'NONE'].includes(functionCallingMode))) &&
    (systemInstructions === undefined || isString(systemInstructions)) &&
    (groundingSettings === undefined || isObject(groundingSettings)) &&
    (codeExecutionSettings === undefined || isObject(codeExecutionSettings)) &&
    (imageSettings === undefined || isObject(imageSettings)) &&
    (documentSettings === undefined || isObject(documentSettings)) &&
    (filesApiSettings === undefined || isObject(filesApiSettings)) &&
    (aiRedoEnabled === undefined || isBoolean(aiRedoEnabled)) &&
    (editEnabled === undefined || isBoolean(editEnabled)) &&
    (showThinking === undefined || isBoolean(showThinking)) &&
    (copyable === undefined || isBoolean(copyable)) &&
    (hideImageMetadata === undefined || isBoolean(hideImageMetadata)) &&
    (jsonSchema === undefined || isObject(jsonSchema)) &&
    (maxTokens === undefined || isNumber(maxTokens)) &&
    (systemInstruction === undefined || isString(systemInstruction)) &&
    (showAsHero === undefined || isBoolean(showAsHero)) &&
    (triggerButton === undefined || isObject(triggerButton)) &&
    (exportConfig === undefined || isExportConfig(exportConfig)) &&
    (imageGenerationSettings === undefined || isImageGenerationSettings(imageGenerationSettings))
  );
}

/**
 * Type guard for Workflow
 */
export function isWorkflow(value: unknown): value is Workflow {
  if (!isObject(value)) return false;
  
  const { id, shortName, name, description, stages, config, defaultModel, temperature } = value;
  
  return (
    isString(id) &&
    (shortName === undefined || isString(shortName)) &&
    isString(name) &&
    isString(description) &&
    isArray(stages) &&
    stages.every(stage => isStage(stage)) &&
    (config === undefined || isObject(config)) &&
    (defaultModel === undefined || isString(defaultModel)) &&
    (temperature === undefined || isNumber(temperature))
  );
}

/**
 * Type guard for StageState
 */
export function isStageState(value: unknown): value is StageState {
  if (!isObject(value)) return false;
  
  const { 
    stageId, status, userInput, output, error, depsAreMet, completedAt, 
    isEditingInput, isEditingOutput, isStale, staleDismissed, shouldAutoRun,
    groundingInfo, groundingMetadata, groundingSources, functionCalls, 
    codeExecutionResults, thinkingSteps, outputImages, usageMetadata,
    currentStreamOutput, generationProgress
  } = value;
  
  return (
    (stageId === undefined || isString(stageId)) &&
    isString(status) &&
    ['idle', 'running', 'completed', 'error'].includes(status) &&
    // userInput and output can be any type
    (error === undefined || isString(error)) &&
    (depsAreMet === undefined || isBoolean(depsAreMet)) &&
    (completedAt === undefined || isString(completedAt)) &&
    (isEditingInput === undefined || isBoolean(isEditingInput)) &&
    (isEditingOutput === undefined || isBoolean(isEditingOutput)) &&
    (isStale === undefined || isBoolean(isStale)) &&
    (staleDismissed === undefined || isBoolean(staleDismissed)) &&
    (shouldAutoRun === undefined || isBoolean(shouldAutoRun)) &&
    (groundingInfo === undefined || typeof groundingInfo !== 'undefined') &&
    (groundingMetadata === undefined || isObject(groundingMetadata)) &&
    (groundingSources === undefined || isArray(groundingSources)) &&
    (functionCalls === undefined || isArray(functionCalls)) &&
    (codeExecutionResults === undefined || isObject(codeExecutionResults)) &&
    (thinkingSteps === undefined || isArray(thinkingSteps)) &&
    (outputImages === undefined || isArray(outputImages)) &&
    (usageMetadata === undefined || isObject(usageMetadata)) &&
    (currentStreamOutput === undefined || isString(currentStreamOutput)) &&
    (generationProgress === undefined || isObject(generationProgress))
  );
}

/**
 * Type guard for ExportStageState
 */
export function isExportStageState(value: unknown): value is ExportStageState {
  if (!isStageState(value)) return false;
  
  const { output, generationProgress } = value;
  
  return (
    isObject(output) &&
    isObject(output.formats) &&
    (generationProgress === undefined || isObject(generationProgress))
  );
}

/**
 * Type guard for WizardDocument
 */
export function isWizardDocument(value: unknown): value is WizardDocument {
  if (!isObject(value)) return false;
  
  const { id, title, workflowId, status, createdAt, updatedAt, userId } = value;
  
  return (
    isString(id) &&
    isString(title) &&
    isString(workflowId) &&
    isString(status) &&
    ['draft', 'in-progress', 'completed'].includes(status) &&
    isString(createdAt) &&
    isString(updatedAt) &&
    isString(userId)
  );
}

/**
 * Type guard for WizardInstance
 */
export function isWizardInstance(value: unknown): value is WizardInstance {
  if (!isObject(value)) return false;
  
  const { document, documentId, workflow, stageStates, currentStageId } = value;
  
  return (
    isWizardDocument(document) &&
    (documentId === undefined || isString(documentId)) &&
    isWorkflow(workflow) &&
    isObject(stageStates) &&
    Object.values(stageStates).every(state => isStageState(state)) &&
    (currentStageId === undefined || isString(currentStageId))
  );
}

/**
 * Type guard for ImageOutputData
 */
export function isImageOutputData(value: unknown): value is ImageOutputData {
  if (!isObject(value)) return false;
  
  const { provider, images, selectedImageIndex, accompanyingText } = value;
  
  return (
    isString(provider) &&
    ['gemini', 'imagen'].includes(provider) &&
    isArray(images) &&
    images.every(img => isObject(img) && isString(img.promptUsed) && isString(img.mimeType) && isString(img.aspectRatio)) &&
    (selectedImageIndex === undefined || isNumber(selectedImageIndex)) &&
    (accompanyingText === undefined || isString(accompanyingText))
  );
}

/**
 * Type guard for Asset
 */
export function isAsset(value: unknown): value is Asset {
  if (!isObject(value)) return false;
  
  const { 
    id, userId, type, mimeType, storageUrl, publicUrl, thumbnailUrl, fileName,
    fileSize, dimensions, createdAt, source, generationPrompt, generationModel,
    documentIds, stageReferences, lastAccessedAt, isDeleted, deletedAt, tags, description
  } = value;
  
  return (
    isString(id) &&
    isString(userId) &&
    isString(type) &&
    ['image', 'video', 'file'].includes(type) &&
    isString(mimeType) &&
    isString(storageUrl) &&
    isString(publicUrl) &&
    (thumbnailUrl === undefined || isString(thumbnailUrl)) &&
    isString(fileName) &&
    isNumber(fileSize) &&
    (dimensions === undefined || (isObject(dimensions) && isNumber(dimensions.width) && isNumber(dimensions.height))) &&
    (createdAt !== undefined) &&
    isString(source) &&
    ['generated', 'uploaded'].includes(source) &&
    (generationPrompt === undefined || isString(generationPrompt)) &&
    (generationModel === undefined || isString(generationModel)) &&
    isArray(documentIds) &&
    documentIds.every(id => isString(id)) &&
    isArray(stageReferences) &&
    stageReferences.every(ref => isObject(ref) && isString(ref.documentId) && isString(ref.stageId)) &&
    (lastAccessedAt !== undefined) &&
    isBoolean(isDeleted) &&
    (deletedAt === undefined || typeof deletedAt !== 'undefined') &&
    (tags === undefined || (isArray(tags) && tags.every(tag => isString(tag)))) &&
    (description === undefined || isString(description))
  );
}

/**
 * Runtime validation function for StageState with detailed error reporting
 */
export function validateStageStateRuntime(value: unknown, context?: string): StageState {
  if (!isStageState(value)) {
    const contextMsg = context ? ` in ${context}` : '';
    throw new Error(`Invalid StageState object${contextMsg}. Expected object with valid status ('idle' | 'running' | 'completed' | 'error') and other required properties.`);
  }
  return value;
}

/**
 * Runtime validation function for Workflow with detailed error reporting
 */
export function validateWorkflowRuntime(value: unknown, context?: string): Workflow {
  if (!isWorkflow(value)) {
    const contextMsg = context ? ` in ${context}` : '';
    throw new Error(`Invalid Workflow object${contextMsg}. Expected object with id, name, description, and valid stages array.`);
  }
  return value;
}

/**
 * Runtime validation function for WizardInstance with detailed error reporting
 */
export function validateWizardInstanceRuntime(value: unknown, context?: string): WizardInstance {
  if (!isWizardInstance(value)) {
    const contextMsg = context ? ` in ${context}` : '';
    throw new Error(`Invalid WizardInstance object${contextMsg}. Expected object with valid document, workflow, and stageStates.`);
  }
  return value;
}

/**
 * Safely cast unknown value to StageState with validation
 */
export function castToStageState(value: unknown, context?: string): StageState | null {
  try {
    return validateStageStateRuntime(value, context);
  } catch (error) {
    console.error(`Failed to cast to StageState: ${error}`);
    return null;
  }
}

/**
 * Safely cast unknown value to Workflow with validation
 */
export function castToWorkflow(value: unknown, context?: string): Workflow | null {
  try {
    return validateWorkflowRuntime(value, context);
  } catch (error) {
    console.error(`Failed to cast to Workflow: ${error}`);
    return null;
  }
}

/**
 * Safely cast unknown value to WizardInstance with validation
 */
export function castToWizardInstance(value: unknown, context?: string): WizardInstance | null {
  try {
    return validateWizardInstanceRuntime(value, context);
  } catch (error) {
    console.error(`Failed to cast to WizardInstance: ${error}`);
    return null;
  }
}

/**
 * Validate a collection of stage states
 */
export function validateStageStatesCollection(value: unknown, context?: string): Record<string, StageState> {
  if (!isObject(value)) {
    const contextMsg = context ? ` in ${context}` : '';
    throw new Error(`Invalid StageStates collection${contextMsg}. Expected object with string keys and StageState values.`);
  }
  
  const result: Record<string, StageState> = {};
  
  for (const [key, stageState] of Object.entries(value)) {
    if (!isString(key)) {
      throw new Error(`Invalid key in StageStates collection: expected string, got ${typeof key}`);
    }
    
    result[key] = validateStageStateRuntime(stageState, `${context}.${key}`);
  }
  
  return result;
}

/**
 * Validate an array of workflows
 */
export function validateWorkflowsArray(value: unknown, context?: string): Workflow[] {
  if (!isArray(value)) {
    const contextMsg = context ? ` in ${context}` : '';
    throw new Error(`Invalid Workflows array${contextMsg}. Expected array of Workflow objects.`);
  }
  
  return value.map((workflow, index) => 
    validateWorkflowRuntime(workflow, `${context}[${index}]`)
  );
}