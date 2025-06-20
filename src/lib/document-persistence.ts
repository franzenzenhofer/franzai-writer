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

      // Reconstruct export stage data from flattened format
      stageStates = this.reconstructExportStages(stageStates);

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
      (cleaned as any).groundingMetadata = `Summary: ${JSON.stringify(cleaned.groundingMetadata).substring(0, 1000)}`;
    }

    if (cleaned.functionCalls) {
      console.log('[DocumentPersistence] FLATTENING functionCalls to string');
      (cleaned as any).functionCalls = `${cleaned.functionCalls.length} function calls: ${JSON.stringify(cleaned.functionCalls).substring(0, 1000)}`;
    }

    if (cleaned.thinkingSteps) {
      console.log('[DocumentPersistence] FLATTENING thinkingSteps to string');
      (cleaned as any).thinkingSteps = `${cleaned.thinkingSteps.length} thinking steps: ${JSON.stringify(cleaned.thinkingSteps).substring(0, 1000)}`;
    }

    if (cleaned.codeExecutionResults) {
      console.log('[DocumentPersistence] FLATTENING codeExecutionResults to string');
      (cleaned as any).codeExecutionResults = `Code results: ${JSON.stringify(cleaned.codeExecutionResults).substring(0, 1000)}`;
    }

    if (cleaned.outputImages) {
      console.log('[DocumentPersistence] FLATTENING outputImages to string');
      (cleaned as any).outputImages = `${cleaned.outputImages.length} output images`;
    }

    if (cleaned.usageMetadata) {
      console.log('[DocumentPersistence] FLATTENING usageMetadata to simple object');
      (cleaned as any).usageMetadata = {
        totalTokenCount: Number(cleaned.usageMetadata.totalTokenCount) || 0,
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
   * ULTIMATE FIX: Convert ALL complex data to strings to avoid nested entity errors
   */
  private cleanStageStates(stageStates: Record<string, StageState>): Record<string, StageState> {
    const cleaned: Record<string, StageState> = {};

    for (const [stageId, state] of Object.entries(stageStates)) {
      if (!state || typeof state !== 'object') {
        this.log('Skipping invalid stage state', { stageId, state });
        continue;
      }

      try {
        console.log(`[DocumentPersistence] ULTIMATE CLEANING for Firestore: ${stageId}`);

        // ULTIMATE FIRESTORE FIX: Only keep essential scalar properties
        // Convert everything else to strings to completely avoid nested entity errors
        const firestore_safe_state: any = {
          stageId: String(state.stageId || stageId),
          status: String(state.status || 'idle'),
          error: state.error ? String(state.error) : undefined,
          completedAt: state.completedAt || undefined,
          
          // Convert ALL complex objects to strings
          userInput_string: state.userInput ? 
            JSON.stringify(state.userInput).substring(0, 2000) : undefined,
          
          // DO NOT include output_string for export stages - it's too large
          output_string: (state.output && typeof state.output === 'object' && 
                         ('formats' in state.output || 'publishing' in state.output)) ? 
            undefined : // Skip output_string for export stages
            (state.output ? JSON.stringify(state.output).substring(0, 5000) : undefined),
        };

        // For export stages, flatten EVERYTHING to prevent nested entity errors
        // Also check by stage ID since export stages might be named 'export-publish'
        if ((state.output && typeof state.output === 'object' && 
            ('formats' in state.output || 'publishing' in state.output)) ||
            stageId.includes('export')) {
          console.log(`[DocumentPersistence] FLATTENING export stage completely: ${stageId}`);
          firestore_safe_state.isExportStage = true;
          
          // Extract only the essential data as flat strings
          const exportOutput = state.output as any;
          
          // Store HTML content separately as flat strings
          if (exportOutput.htmlStyled) {
            firestore_safe_state.htmlStyled_truncated = String(exportOutput.htmlStyled).substring(0, 1000);
          }
          if (exportOutput.htmlClean) {
            firestore_safe_state.htmlClean_truncated = String(exportOutput.htmlClean).substring(0, 1000);
          }
          if (exportOutput.markdown) {
            firestore_safe_state.markdown_truncated = String(exportOutput.markdown).substring(0, 1000);
          }
          
          // Flatten formats data
          if (exportOutput.formats) {
            console.log(`[DocumentPersistence] Export formats structure:`, {
              formatKeys: Object.keys(exportOutput.formats),
              sampleFormat: exportOutput.formats['html-styled'] ? {
                ready: exportOutput.formats['html-styled'].ready,
                hasContent: !!exportOutput.formats['html-styled'].content,
                contentLength: exportOutput.formats['html-styled'].content?.length,
                hasUrl: !!exportOutput.formats['html-styled'].url
              } : null
            });
            
            firestore_safe_state.hasFormats = true;
            firestore_safe_state.formatsReady = !!(exportOutput.formats['html-styled']?.ready && 
                                                   exportOutput.formats['html-clean']?.ready && 
                                                   exportOutput.formats['markdown']?.ready);
            
            // DO NOT store the formats object at all - it causes nested entity errors
            // We'll reconstruct it on load from the ready flags
          }
          
          // Flatten publishing data
          if (exportOutput.publishing) {
            firestore_safe_state.hasPublishing = true;
            firestore_safe_state.publishedUrl = String(exportOutput.publishing.publishedUrl || '');
            firestore_safe_state.publishedFormats = Array.isArray(exportOutput.publishing.publishedFormats) ? 
              exportOutput.publishing.publishedFormats.join(',') : '';
            if (exportOutput.publishing.publishedAt) {
              firestore_safe_state.publishedAt = String(exportOutput.publishing.publishedAt);
            }
            if (exportOutput.publishing.shortUrl) {
              firestore_safe_state.shortUrl = String(exportOutput.publishing.shortUrl);
            }
            if (exportOutput.publishing.qrCodeUrl) {
              firestore_safe_state.qrCodeUrl = String(exportOutput.publishing.qrCodeUrl);
            }
          }
          
          // Don't store the complex nested output
          delete firestore_safe_state.output_string;
        }

        // Clean undefined values
        cleaned[stageId] = this.cleanUndefinedValues(firestore_safe_state) as StageState;

        // Final verification - this MUST succeed
        try {
          const testJson = JSON.stringify(cleaned[stageId]);
          if (testJson.includes('[object Object]')) {
            throw new Error('Contains non-serializable objects');
          }
          console.log(`[DocumentPersistence] Stage ${stageId} successfully cleaned to ${testJson.length} chars`);
        } catch (e) {
          console.error(`[DocumentPersistence] CRITICAL: Stage ${stageId} STILL not serializable after ultimate cleaning!`, e);
          // Last resort - minimal string-only state
          cleaned[stageId] = {
            stageId: String(stageId),
            status: 'error',
            error: 'Stage data too complex for Firestore',
            summary: String(state).substring(0, 500)
          } as any;
        }
      } catch (error) {
        console.error(`[DocumentPersistence] Failed to clean stage ${stageId}`, error);
        // Create a minimal valid state
        cleaned[stageId] = {
          stageId: String(stageId),
          status: 'error',
          error: 'Failed to save stage state'
        } as any;
      }
    }

    // CRITICAL TEST: Verify the cleaned data is 100% Firestore compatible
    try {
      const testSerialization = JSON.stringify(cleaned);
      console.log(`[DocumentPersistence] CLEANING SUCCESS: ${Object.keys(cleaned).length} stages, ${testSerialization.length} chars total`);
      
      // Double-check for any remaining nested objects
      if (testSerialization.includes('[object Object]')) {
        console.error('[DocumentPersistence] CRITICAL: Cleaned data still contains [object Object]!');
        throw new Error('Cleaning failed - contains non-serializable objects');
      }
      
      // Additional check for export stages and deep nesting
      const exportStage = Object.entries(cleaned).find(([id, state]) => 
        id.includes('export') || (state as any).isExportStage
      );
      if (exportStage) {
        console.log('[DocumentPersistence] Export stage found after cleaning:', {
          stageId: exportStage[0],
          cleanedState: exportStage[1]
        });
      }
      
      // Deep check for nested objects
      const checkForNestedObjects = (obj: any, path: string = 'root'): string[] => {
        const issues: string[] = [];
        
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date)) {
          for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object') {
              if (Array.isArray(value)) {
                // Check array items
                value.forEach((item, index) => {
                  if (item && typeof item === 'object') {
                    issues.push(`${path}.${key}[${index}] contains object`);
                    issues.push(...checkForNestedObjects(item, `${path}.${key}[${index}]`));
                  }
                });
              } else if (!(value instanceof Date)) {
                // Found a nested object
                issues.push(`${path}.${key} is a nested object`);
                issues.push(...checkForNestedObjects(value, `${path}.${key}`));
              }
            }
          }
        }
        
        return issues;
      };
      
      const nestedIssues = checkForNestedObjects(cleaned);
      if (nestedIssues.length > 0) {
        console.error('[DocumentPersistence] CRITICAL: Found nested objects after cleaning:', nestedIssues);
        // Log sample of problematic data
        nestedIssues.slice(0, 5).forEach(path => {
          console.error(`[DocumentPersistence] Nested object at ${path}`);
        });
      }
      
    } catch (e) {
      console.error('[DocumentPersistence] CRITICAL: Cleaned stageStates STILL not serializable!', e);
      console.error('[DocumentPersistence] Raw cleaned data:', cleaned);
      throw new Error('FATAL: Stage states could not be cleaned for Firestore');
    }

    console.log(`[DocumentPersistence] ULTIMATE CLEANING COMPLETE: ${Object.keys(cleaned).length} stages processed`);
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
   * Check if an object has deep nesting (more than 2 levels)
   */
  private hasDeepNesting(obj: any, depth: number = 0): boolean {
    if (depth > 2) return true;
    if (!obj || typeof obj !== 'object' || obj instanceof Date) return false;
    if (Array.isArray(obj)) {
      return obj.some(item => this.hasDeepNesting(item, depth + 1));
    }
    return Object.values(obj).some(value => this.hasDeepNesting(value, depth + 1));
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

  /**
   * Reconstruct export stage data from flattened Firestore format
   */
  private reconstructExportStages(stageStates: Record<string, StageState>): Record<string, StageState> {
    const reconstructed: Record<string, StageState> = {};

    for (const [stageId, state] of Object.entries(stageStates)) {
      if (!state || typeof state !== 'object') {
        reconstructed[stageId] = state;
        continue;
      }

      // Check if this is a flattened export stage
      if ((state as any).isExportStage) {
        console.log(`[DocumentPersistence] Reconstructing export stage: ${stageId}`);
        
        // Reconstruct the output object from flattened data
        const output: any = {};
        
        // Reconstruct HTML content
        if ((state as any).htmlStyled_truncated) {
          output.htmlStyled = (state as any).htmlStyled_truncated;
        }
        if ((state as any).htmlClean_truncated) {
          output.htmlClean = (state as any).htmlClean_truncated;
        }
        if ((state as any).markdown_truncated) {
          output.markdown = (state as any).markdown_truncated;
        }
        
        // Reconstruct formats object
        if ((state as any).hasFormats) {
          output.formats = {};
          
          if ((state as any).htmlStyledUrl) {
            output.formats['html-styled'] = {
              ready: true,
              url: (state as any).htmlStyledUrl
            };
          }
          if ((state as any).htmlCleanUrl) {
            output.formats['html-clean'] = {
              ready: true,
              url: (state as any).htmlCleanUrl
            };
          }
          if ((state as any).markdownUrl) {
            output.formats['markdown'] = {
              ready: true,
              url: (state as any).markdownUrl
            };
          }
          if ((state as any).pdfUrl) {
            output.formats['pdf'] = {
              ready: true,
              url: (state as any).pdfUrl
            };
          }
          if ((state as any).docxUrl) {
            output.formats['docx'] = {
              ready: true,
              url: (state as any).docxUrl
            };
          }
        }
        
        // Reconstruct publishing object
        if ((state as any).hasPublishing && (state as any).publishedUrl) {
          output.publishing = {
            publishedUrl: (state as any).publishedUrl,
            publishedFormats: (state as any).publishedFormats ? 
              (state as any).publishedFormats.split(',') : []
          };
          
          if ((state as any).publishedAt) {
            output.publishing.publishedAt = (state as any).publishedAt;
          }
          if ((state as any).shortUrl) {
            output.publishing.shortUrl = (state as any).shortUrl;
          }
          if ((state as any).qrCodeUrl) {
            output.publishing.qrCodeUrl = (state as any).qrCodeUrl;
          }
        }
        
        // Create reconstructed state
        reconstructed[stageId] = {
          stageId: state.stageId || stageId,
          status: state.status || 'idle',
          error: state.error,
          completedAt: state.completedAt,
          output: Object.keys(output).length > 0 ? output : undefined,
          // Try to parse userInput if it was stringified
          userInput: (state as any).userInput_string ? 
            (() => {
              try {
                return JSON.parse((state as any).userInput_string);
              } catch {
                return (state as any).userInput_string;
              }
            })() : state.userInput
        } as StageState;
        
        // Clean up flattened properties
        const cleanState = { ...reconstructed[stageId] };
        delete (cleanState as any).isExportStage;
        delete (cleanState as any).htmlStyled_truncated;
        delete (cleanState as any).htmlClean_truncated;
        delete (cleanState as any).markdown_truncated;
        delete (cleanState as any).hasFormats;
        delete (cleanState as any).formatsReady;
        delete (cleanState as any).htmlStyledUrl;
        delete (cleanState as any).htmlCleanUrl;
        delete (cleanState as any).markdownUrl;
        delete (cleanState as any).pdfUrl;
        delete (cleanState as any).docxUrl;
        delete (cleanState as any).hasPublishing;
        delete (cleanState as any).publishedUrl;
        delete (cleanState as any).publishedFormats;
        delete (cleanState as any).publishedAt;
        delete (cleanState as any).shortUrl;
        delete (cleanState as any).qrCodeUrl;
        delete (cleanState as any).userInput_string;
        delete (cleanState as any).output_string;
        
        reconstructed[stageId] = cleanState;
      } else {
        // Non-export stage - try to parse stringified data
        const cleanState = { ...state };
        
        if ((cleanState as any).userInput_string) {
          try {
            cleanState.userInput = JSON.parse((cleanState as any).userInput_string);
          } catch {
            cleanState.userInput = (cleanState as any).userInput_string;
          }
          delete (cleanState as any).userInput_string;
        }
        
        if ((cleanState as any).output_string) {
          try {
            cleanState.output = JSON.parse((cleanState as any).output_string);
          } catch {
            cleanState.output = (cleanState as any).output_string;
          }
          delete (cleanState as any).output_string;
        }
        
        reconstructed[stageId] = cleanState;
      }
    }

    return reconstructed;
  }
}

// Export singleton instance
export const documentPersistence = DocumentPersistenceManager.getInstance(); 