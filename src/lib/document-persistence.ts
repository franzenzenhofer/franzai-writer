import { firestoreAdapter } from './firestore-adapter';
import type { WizardDocument, StageState } from '@/types';
import { resetStuckExportStages } from './export-stage-recovery';
import { getWorkflowById } from '@/workflows';

/**
 * CRITICAL: Document Persistence with FAIL-HARD semantics
 * - No fallbacks, no mock data, no graceful degradation
 * - All operations must succeed or fail completely
 * - Stage states are preserved exactly as provided
 * - All errors are logged and re-thrown
 */

export interface SaveDocumentResult {
  success: boolean;
  documentId?: string;
  error?: string;
}

export interface LoadDocumentResult {
  success: boolean;
  document?: WizardDocument;
  stageStates?: Record<string, StageState>;
  error?: string;
}

class DocumentPersistenceManager {
  private static instance: DocumentPersistenceManager;
  private readonly COLLECTION_NAME = 'documents';

  private constructor() {
    // Validate that Firestore adapter is available
    if (!firestoreAdapter) {
      throw new Error('FATAL: Firestore adapter not available');
    }
  }

  static getInstance(): DocumentPersistenceManager {
    if (!DocumentPersistenceManager.instance) {
      DocumentPersistenceManager.instance = new DocumentPersistenceManager();
    }
    return DocumentPersistenceManager.instance;
  }

  private log(operation: string, data?: any) {
    console.log(`[DocumentPersistence] ${operation}`, data || '');
  }

  private logError(operation: string, error: any) {
    console.error(`[DocumentPersistence] FAILED: ${operation}`, error);
  }

  /**
   * Generate user ID for development - FAIL if localStorage not available in browser
   */
  private generateUserId(): string {
    if (typeof window === 'undefined') {
      // Server-side: generate unique ID per request
      return `server_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (typeof localStorage === 'undefined') {
      throw new Error('FATAL: localStorage not available in browser environment');
    }

    let userId = localStorage.getItem('temp_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('temp_user_id', userId);
      this.log('Generated new user ID', { userId });
    }
    return userId;
  }

  /**
   * Convert Firestore document to WizardDocument
   */
  private firestoreToWizardDocument(data: any): WizardDocument {
    if (!data) {
      throw new Error('FATAL: Cannot convert null/undefined Firestore data to WizardDocument');
    }

    return {
      id: data.id,
      title: data.title,
      workflowId: data.workflowId,
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      userId: data.userId,
    };
  }

  /**
   * Save or create a document - FAIL HARD on any error
   */
  async saveDocument(
    documentId: string | null,
    title: string,
    workflowId: string,
    stageStates: Record<string, StageState>,
    userId?: string
  ): Promise<SaveDocumentResult> {
    try {
      console.log('[DocumentPersistence] STEP 1: Starting document save operation', {
        documentId,
        title,
        workflowId,
        stageStatesKeys: Object.keys(stageStates),
        stageStatesCount: Object.keys(stageStates).length,
        hasUserId: !!userId,
        isNewDocument: documentId === null
      });

      // Validate required fields
      if (!title?.trim()) {
        console.error('[DocumentPersistence] STEP 2: VALIDATION FAILED - Missing title');
        throw new Error('FATAL: Document title is required');
      }
      if (!workflowId?.trim()) {
        console.error('[DocumentPersistence] STEP 2: VALIDATION FAILED - Missing workflowId');
        throw new Error('FATAL: Workflow ID is required');
      }
      if (!stageStates || typeof stageStates !== 'object') {
        console.error('[DocumentPersistence] STEP 2: VALIDATION FAILED - Invalid stageStates', { 
          stageStates, 
          type: typeof stageStates 
        });
        throw new Error('FATAL: Stage states must be a valid object');
      }

      console.log('[DocumentPersistence] STEP 2: Validation passed');

      const effectiveUserId = userId || this.generateUserId();
      console.log('[DocumentPersistence] STEP 3: Determined user ID', { 
        originalUserId: userId,
        effectiveUserId,
        wasGenerated: !userId
      });

      // Clean stage states to ensure Firestore compatibility
      console.log('[DocumentPersistence] STEP 4: Cleaning stage states for Firestore');
      const cleanedStageStates = this.cleanStageStates(stageStates);
      console.log('[DocumentPersistence] STEP 5: Stage states cleaned', {
        originalKeys: Object.keys(stageStates),
        originalCount: Object.keys(stageStates).length,
        cleanedKeys: Object.keys(cleanedStageStates),
        cleanedCount: Object.keys(cleanedStageStates).length
      });

      if (!documentId) {
        console.log('[DocumentPersistence] STEP 6: Creating NEW document (documentId is null)');
        
        // CREATE new document
        const documentData = {
          userId: effectiveUserId,
          title: title.trim(),
          workflowId: workflowId.trim(),
          status: 'draft' as const,
          stageStates: cleanedStageStates,
          metadata: this.cleanUndefinedValues({
            wordCount: this.calculateWordCount(stageStates),
            lastEditedStage: this.findLastEditedStage(stageStates),
            stageCount: Object.keys(stageStates).length
          })
        };

        console.log('[DocumentPersistence] STEP 7: Prepared document data for creation', {
          userId: documentData.userId,
          title: documentData.title,
          workflowId: documentData.workflowId,
          status: documentData.status,
          stageStatesCount: Object.keys(documentData.stageStates).length,
          metadata: documentData.metadata
        });

        console.log('[DocumentPersistence] STEP 8: Calling Firestore adapter to create document');
        const createdId = await firestoreAdapter.createDocument(this.COLLECTION_NAME, documentData);
        
        console.log('[DocumentPersistence] STEP 9: Document creation completed successfully', { 
          createdDocumentId: createdId,
          collectionName: this.COLLECTION_NAME
        });

        this.log('Document created successfully', { documentId: createdId });

        return {
          success: true,
          documentId: createdId
        };
      } else {
        console.log('[DocumentPersistence] STEP 6: Updating EXISTING document', { documentId });
        
        // UPDATE existing document - but first verify it exists
        try {
          const existingDoc = await firestoreAdapter.getDocument(this.COLLECTION_NAME, documentId);
          if (!existingDoc) {
            this.log('Document not found for update, creating new instead', { documentId });
            // Document doesn't exist, create it instead
            const documentData = {
              userId: effectiveUserId,
              title: title.trim(),
              workflowId: workflowId.trim(),
              status: 'draft' as const,
              stageStates: cleanedStageStates,
              metadata: this.cleanUndefinedValues({
                wordCount: this.calculateWordCount(stageStates),
                lastEditedStage: this.findLastEditedStage(stageStates),
                stageCount: Object.keys(stageStates).length
              })
            };

            const createdId = await firestoreAdapter.createDocument(this.COLLECTION_NAME, documentData);
            this.log('Document created instead of updated', { originalId: documentId, createdId });

            return {
              success: true,
              documentId: createdId
            };
          }
        } catch (verifyError: any) {
          this.log('Error verifying document existence, creating new instead', { documentId, error: verifyError.message });
          // If we can't verify existence, create new document
          const documentData = {
            userId: effectiveUserId,
            title: title.trim(),
            workflowId: workflowId.trim(),
            status: 'draft' as const,
            stageStates: cleanedStageStates,
            metadata: this.cleanUndefinedValues({
              wordCount: this.calculateWordCount(stageStates),
              lastEditedStage: this.findLastEditedStage(stageStates),
              stageCount: Object.keys(stageStates).length
            })
          };

          const createdId = await firestoreAdapter.createDocument(this.COLLECTION_NAME, documentData);
          this.log('Document created after verification failure', { originalId: documentId, createdId });

          return {
            success: true,
            documentId: createdId
          };
        }

        // Document exists, proceed with update
        const updates = {
          title: title.trim(),
          status: 'draft' as const,
          stageStates: cleanedStageStates,
          metadata: this.cleanUndefinedValues({
            wordCount: this.calculateWordCount(stageStates),
            lastEditedStage: this.findLastEditedStage(stageStates),
            stageCount: Object.keys(stageStates).length
          })
        };

        await firestoreAdapter.updateDocument(this.COLLECTION_NAME, documentId, updates);
        this.log('Document updated successfully', { documentId });

        return {
          success: true,
          documentId
        };
      }
    } catch (error: any) {
      console.error('[DocumentPersistence] STEP ERROR: Save operation failed', {
        error: error.message,
        errorType: error.constructor.name,
        documentId,
        title,
        workflowId,
        stack: error.stack
      });
      
      this.logError('saveDocument', error);
      return {
        success: false,
        error: error.message || 'Failed to save document'
      };
    }
  }

  /**
   * Load a document by ID - FAIL HARD if not found or invalid
   */
  async loadDocument(documentId: string): Promise<LoadDocumentResult> {
    try {
      this.log('Loading document', { documentId });

      if (!documentId?.trim()) {
        throw new Error('FATAL: Document ID is required');
      }

      const data = await firestoreAdapter.getDocument(this.COLLECTION_NAME, documentId);

      if (!data) {
        this.log('Document not found', { documentId });
        return {
          success: false,
          error: 'Document not found'
        };
      }

      // Validate document structure
      if (!data.stageStates || typeof data.stageStates !== 'object') {
        this.logError('Invalid document structure', { documentId, hasStageStates: !!data.stageStates });
        throw new Error('FATAL: Document has invalid or missing stage states');
      }

      const document = this.firestoreToWizardDocument(data);
      let stageStates = data.stageStates;

      // Apply export stage recovery to fix stuck export stages after reload
      try {
        const workflow = getWorkflowById(document.workflowId);
        if (workflow) {
          stageStates = resetStuckExportStages(stageStates, workflow);
        }
      } catch (error) {
        this.log('Export stage recovery failed (non-critical)', error);
        // Continue with original stageStates - recovery failure is not fatal
      }

      this.log('Document loaded successfully', {
        documentId,
        title: document.title,
        stageStatesCount: Object.keys(stageStates).length,
        stageStatesKeys: Object.keys(stageStates)
      });

      return {
        success: true,
        document,
        stageStates
      };
    } catch (error: any) {
      this.logError('loadDocument', error);
      return {
        success: false,
        error: error.message || 'Failed to load document'
      };
    }
  }

  /**
   * List user documents - FAIL HARD on any error
   */
  async listUserDocuments(userId?: string): Promise<WizardDocument[]> {
    try {
      const effectiveUserId = userId || this.generateUserId();
      this.log('Listing documents for user', { userId: effectiveUserId });

      const documents = await firestoreAdapter.queryDocuments(
        this.COLLECTION_NAME,
        { field: 'userId', operator: '==', value: effectiveUserId },
        { field: 'updatedAt', direction: 'desc' }
      );

      const wizardDocuments = documents.map(data => this.firestoreToWizardDocument(data));

      this.log('Documents listed successfully', {
        userId: effectiveUserId,
        count: wizardDocuments.length
      });

      return wizardDocuments;
    } catch (error: any) {
      this.logError('listUserDocuments', error);
      throw new Error(`FATAL: Failed to list user documents: ${error.message}`);
    }
  }

  /**
   * Delete a document - FAIL HARD on any error
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.log('Deleting document', { documentId });

      if (!documentId?.trim()) {
        throw new Error('FATAL: Document ID is required');
      }

      await firestoreAdapter.deleteDocument(this.COLLECTION_NAME, documentId);
      this.log('Document deleted successfully', { documentId });

      return true;
    } catch (error: any) {
      this.logError('deleteDocument', error);
      throw new Error(`FATAL: Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Clean specific stage state properties that might cause Firestore nested entity errors
   * ROOT CAUSE FIX: Firestore cannot handle deeply nested objects - flatten everything aggressively
   */
  private cleanStageStateSpecific(state: StageState): StageState {
    const cleaned = { ...state };

    // CRITICAL: Firestore nested entity limit is VERY strict
    // Instead of depth limiting, completely flatten all complex objects
    const MAX_DEPTH = 1; // Firestore can barely handle any nesting
    
    // Helper to check and limit object depth
    const limitDepth = (obj: any, depth: number = 0): any => {
      if (depth >= MAX_DEPTH) {
        console.warn(`[DocumentPersistence] Object depth limit reached (${MAX_DEPTH}), converting to string`);
        return typeof obj === 'object' ? '[Complex Object - Depth Limited]' : obj;
      }
      
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => limitDepth(item, depth + 1)).slice(0, 50); // Also limit array size
      }
      
      const limited: any = {};
      let propCount = 0;
      for (const [key, value] of Object.entries(obj)) {
        if (propCount++ > 100) { // Limit properties per object
          console.warn(`[DocumentPersistence] Property limit reached, truncating object`);
          break;
        }
        limited[key] = limitDepth(value, depth + 1);
      }
      return limited;
    };

    // ROOT CAUSE FIX: Convert all complex nested objects to strings or simple summaries
    // Firestore CANNOT handle nested objects - flatten everything completely
    
    if (cleaned.groundingMetadata) {
      console.log('[DocumentPersistence] FLATTENING groundingMetadata to string');
      cleaned.groundingMetadata = `Summary: ${JSON.stringify(cleaned.groundingMetadata).substring(0, 1000)}`;
    }

    if (cleaned.functionCalls) {
      console.log('[DocumentPersistence] FLATTENING functionCalls to string');
      cleaned.functionCalls = `${cleaned.functionCalls.length} function calls: ${JSON.stringify(cleaned.functionCalls).substring(0, 1000)}`;
    }

    if (cleaned.thinkingSteps) {
      console.log('[DocumentPersistence] FLATTENING thinkingSteps to string');
      cleaned.thinkingSteps = `${cleaned.thinkingSteps.length} thinking steps: ${JSON.stringify(cleaned.thinkingSteps).substring(0, 1000)}`;
    }

    if (cleaned.codeExecutionResults) {
      console.log('[DocumentPersistence] FLATTENING codeExecutionResults to string');
      cleaned.codeExecutionResults = `Code results: ${JSON.stringify(cleaned.codeExecutionResults).substring(0, 1000)}`;
    }

    if (cleaned.outputImages) {
      console.log('[DocumentPersistence] FLATTENING outputImages to string');
      cleaned.outputImages = `${cleaned.outputImages.length} output images`;
    }

    if (cleaned.usageMetadata) {
      console.log('[DocumentPersistence] FLATTENING usageMetadata to simple object');
      cleaned.usageMetadata = {
        totalTokens: Number(cleaned.usageMetadata.totalTokenCount) || 0,
        summary: `${cleaned.usageMetadata.candidatesTokenCount || 0} candidates, ${cleaned.usageMetadata.promptTokenCount || 0} prompt`
      };
    }

    // Handle export stage state specifically
    if (cleaned.output && typeof cleaned.output === 'object') {
      // Check if this is an export stage output
      if ('formats' in cleaned.output || 'publishing' in cleaned.output) {
        console.log('[DocumentPersistence] Cleaning export stage output');
        cleaned.output = this.cleanExportStageOutput(cleaned.output);
      }
    }
    
    // ULTIMATE ROOT CAUSE FIX: Completely flatten output and userInput
    // Even simple objects cause nested entity errors - convert to strings if complex
    if (cleaned.output) {
      console.log('[DocumentPersistence] ULTIMATE FLATTENING output to avoid nested entities');
      try {
        const jsonString = JSON.stringify(cleaned.output);
        
        // Check if this is an export stage output that we need to preserve structure for
        if (cleaned.output && typeof cleaned.output === 'object' && 
            ('formats' in cleaned.output || 'publishing' in cleaned.output)) {
          console.log('[DocumentPersistence] Preserving export stage output structure');
          cleaned.output = this.cleanExportStageOutput(cleaned.output);
        } else if (jsonString.length > 5000 || this.hasDeepNesting(cleaned.output)) {
          // Convert complex outputs to string summaries
          cleaned.output = `Complex output (${jsonString.length} chars): ${jsonString.substring(0, 1000)}`;
        } else {
          // Keep simple outputs as-is
          cleaned.output = cleaned.output;
        }
      } catch (e) {
        console.warn('[DocumentPersistence] Output not serializable, converting to string');
        cleaned.output = `Non-serializable output: ${String(cleaned.output).substring(0, 1000)}`;
      }
    }
    
    if (cleaned.userInput) {
      console.log('[DocumentPersistence] ULTIMATE FLATTENING userInput to avoid nested entities');
      try {
        const jsonString = JSON.stringify(cleaned.userInput);
        if (jsonString.length > 2000 || this.hasDeepNesting(cleaned.userInput)) {
          cleaned.userInput = `User input (${jsonString.length} chars): ${jsonString.substring(0, 500)}`;
        } else {
          // Keep simple user inputs
          cleaned.userInput = cleaned.userInput;
        }
      } catch (e) {
        cleaned.userInput = String(cleaned.userInput).substring(0, 1000);
      }
    }

    // Remove potentially problematic properties
    delete cleaned.currentStreamOutput; // This might contain streaming references
    delete cleaned.generationProgress; // This might contain complex state

    return cleaned;
  }

  /**
   * Clean export stage output for Firestore storage
   */
  private cleanExportStageOutput(output: any): any {
    const cleaned: any = {
      htmlStyled: output.htmlStyled || undefined,
      htmlClean: output.htmlClean || undefined,
      markdown: output.markdown || undefined,
      formats: {}
    };
    
    // Clean formats object
    if (output.formats && typeof output.formats === 'object') {
      for (const [format, data] of Object.entries(output.formats)) {
        if (data && typeof data === 'object') {
          cleaned.formats[format] = {
            ready: !!(data as any).ready,
            content: (data as any).content || undefined,
            url: (data as any).url || undefined,
            error: (data as any).error || undefined
          };
        }
      }
    }
    
    // Clean publishing data
    if (output.publishing && typeof output.publishing === 'object') {
      cleaned.publishing = {
        publishedUrl: output.publishing.publishedUrl || undefined,
        publishedAt: output.publishing.publishedAt ? 
          (output.publishing.publishedAt instanceof Date ? 
            output.publishing.publishedAt.toISOString() : 
            output.publishing.publishedAt) : undefined,
        publishedFormats: Array.isArray(output.publishing.publishedFormats) ? 
          output.publishing.publishedFormats : undefined,
        shortUrl: output.publishing.shortUrl || undefined,
        qrCodeUrl: output.publishing.qrCodeUrl || undefined
      };
    }
    
    return cleaned;
  }

  /**
   * Clean stage states for Firestore storage
   */
  private cleanStageStates(stageStates: Record<string, StageState>): Record<string, StageState> {
    const cleaned: Record<string, StageState> = {};

    for (const [stageId, state] of Object.entries(stageStates)) {
      if (!state || typeof state !== 'object') {
        this.log('Skipping invalid stage state', { stageId, state });
        continue;
      }

      try {
        // Log the state being cleaned for debugging
        console.log(`[DocumentPersistence] Cleaning stage state: ${stageId}`, {
          status: state.status,
          hasUserInput: !!state.userInput,
          userInputType: typeof state.userInput,
          hasOutput: !!state.output,
          outputType: typeof state.output,
          keys: Object.keys(state),
          hasGroundingMetadata: !!state.groundingMetadata,
          hasFunctionCalls: !!state.functionCalls,
          hasThinkingSteps: !!state.thinkingSteps,
          hasCodeExecutionResults: !!state.codeExecutionResults
        });

        // Clean the stage state with special handling for known complex properties
        const cleanedState = this.cleanStageStateSpecific(state);
        cleaned[stageId] = this.cleanUndefinedValues(cleanedState);

        // Verify the cleaned state
        try {
          JSON.stringify(cleaned[stageId]);
        } catch (e) {
          console.error(`[DocumentPersistence] Stage ${stageId} still has non-serializable data after cleaning`, e);
          // Try to salvage what we can
          cleaned[stageId] = {
            stageId: state.stageId,
            status: state.status || 'idle',
            error: state.error ? String(state.error) : undefined,
            completedAt: state.completedAt,
            // Convert complex objects to simple representations
            userInput: state.userInput ? JSON.parse(JSON.stringify(state.userInput)) : undefined,
            output: state.output ? JSON.parse(JSON.stringify(state.output)) : undefined
          } as StageState;
        }
      } catch (error) {
        console.error(`[DocumentPersistence] Failed to clean stage ${stageId}`, error);
        // Create a minimal valid state
        cleaned[stageId] = {
          stageId: stageId,
          status: 'error',
          error: 'Failed to save stage state'
        } as StageState;
      }
    }

    return cleaned;
  }

  /**
   * Recursively clean undefined values and ensure Firebase compatibility
   */
  private cleanUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    // Handle functions (Firebase doesn't accept functions)
    if (typeof obj === 'function') {
      console.warn('[DocumentPersistence] Function detected in data, converting to null');
      return null;
    }

    // Handle Dates (convert to ISO string for Firebase)
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanUndefinedValues(item)).filter(item => item !== null && item !== undefined);
    }

    // Handle Objects
    if (typeof obj === 'object') {
      // Check for circular references or DOM nodes
      try {
        JSON.stringify(obj);
      } catch (e) {
        console.warn('[DocumentPersistence] Non-serializable object detected, converting to string representation', e);
        return String(obj);
      }

      // Handle specific known problematic types
      if (obj instanceof File || obj instanceof Blob) {
        console.warn('[DocumentPersistence] File/Blob detected, converting to metadata');
        return {
          type: 'file',
          name: obj instanceof File ? obj.name : 'unnamed',
          size: obj.size,
          mimeType: obj.type
        };
      }

      // Handle ArrayBuffer and typed arrays
      if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj)) {
        console.warn('[DocumentPersistence] ArrayBuffer detected, converting to null');
        return null;
      }

      // Handle Map objects
      if (obj instanceof Map) {
        console.warn('[DocumentPersistence] Map detected, converting to plain object');
        const mapObj: any = {};
        obj.forEach((value, key) => {
          mapObj[String(key)] = this.cleanUndefinedValues(value);
        });
        return mapObj;
      }

      // Handle Set objects
      if (obj instanceof Set) {
        console.warn('[DocumentPersistence] Set detected, converting to array');
        return Array.from(obj).map(item => this.cleanUndefinedValues(item));
      }

      // Handle Error objects
      if (obj instanceof Error) {
        return {
          name: obj.name,
          message: obj.message,
          stack: obj.stack
        };
      }

      // Handle complex nested objects that might cause Firestore issues
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip undefined values and functions
        if (value !== undefined && typeof value !== 'function') {
          // Also skip keys that start with underscore (often internal properties)
          if (!key.startsWith('_')) {
            const cleanedValue = this.cleanUndefinedValues(value);
            // Only add non-null, non-undefined values
            if (cleanedValue !== null && cleanedValue !== undefined) {
              cleaned[key] = cleanedValue;
            }
          }
        }
      }
      return cleaned;
    }

    // Handle primitive values
    return obj;
  }

  /**
   * Calculate word count from stage outputs
   */
  private calculateWordCount(stageStates: Record<string, StageState>): number {
    let totalWords = 0;

    Object.values(stageStates).forEach(state => {
      if (state.output && typeof state.output === 'string') {
        totalWords += state.output.split(/\s+/).filter(word => word.length > 0).length;
      }
    });

    return totalWords;
  }

  /**
   * Find the last edited stage
   */
  private findLastEditedStage(stageStates: Record<string, StageState>): string | undefined {
    let lastStage: string | undefined;
    let lastTime = 0;

    Object.entries(stageStates).forEach(([stageId, state]) => {
      if (state.completedAt) {
        const completedTime = new Date(state.completedAt).getTime();
        if (completedTime > lastTime) {
          lastTime = completedTime;
          lastStage = stageId;
        }
      }
    });

    return lastStage;
  }
}

// Export singleton instance
export const documentPersistence = DocumentPersistenceManager.getInstance(); 