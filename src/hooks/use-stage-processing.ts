import { useState, useCallback, useEffect } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/layout/app-providers';

interface UseStageProcessingProps {
  instance: WizardInstance;
  updateStageState: (stageId: string, updates: Partial<StageState>) => void;
  documentId?: string;
  scrollToStageById?: (stageId: string) => void;
}

interface UseStageProcessingReturn {
  aiStageLoaded: boolean;
  aiLoadError: string | null;
  aiLoadAttempts: number;
  loadAiStageRunner: () => Promise<void>;
  handleRunStage: (stageId: string, currentInput?: any, aiRedoNotes?: string) => Promise<void>;
  handleInputChange: (stageId: string, fieldName: string, value: any) => void;
  handleFormSubmit: (stageId: string, data: any) => void;
  handleEditInputRequest: (stageId: string) => void;
  handleSetEditingOutput: (stageId: string, isEditing: boolean) => void;
  handleOutputEdit: (stageId: string, newOutput: any) => void;
  handleDismissStaleWarning: (stageId: string) => void;
}

// Lazy load the AI stage runner to prevent Turbopack static analysis
let runAiStage: any = null;

// Template variable resolution utility for image generation settings
function resolveImageGenerationSettings(settings: any, contextVars: Record<string, any>): any {
  if (!settings) return settings;
  
  // Check if required context exists before attempting resolution
  if (settings.aspectRatio?.includes('image-briefing.output')) {
    const imageBriefing = contextVars['image-briefing'];
    if (!imageBriefing?.output || typeof imageBriefing.output !== 'object') {
      console.error('[resolveImageGenerationSettings] image-briefing output not available or invalid', {
        imageBriefing,
        hasOutput: !!imageBriefing?.output,
        outputType: typeof imageBriefing?.output,
        imageBriefingUserInput: imageBriefing?.userInput,
        allContextVarKeys: Object.keys(contextVars)
      });
      throw new Error('FATAL: Image generation attempted before image-briefing form was submitted or output is invalid. The form data must be saved to state before dependent stages can run.');
    }
  }
  
  // Deep clone the settings to avoid mutations
  const resolvedSettings = JSON.parse(JSON.stringify(settings));
  
  // Helper function to resolve template variables
  const resolveTemplate = (template: string): string => {
    if (typeof template !== 'string') return template;
    
    const regex = /\{\{([\w.-]+)\}\}/g;
    let result = template;
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      const fullPath = match[1];
      const pathParts = fullPath.split('.');
      
      let value = contextVars;
      let found = true;
      for (const part of pathParts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          found = false;
          break;
        }
      }
      
      if (found) {
        const replacement = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value);
        result = result.replace(match[0], replacement);
      } else {
        console.error(`Image generation template variable '{{${fullPath}}}' not found in context.`, {
          fullPath,
          contextVars,
          availableKeys: Object.keys(contextVars).map(k => `${k}: ${Object.keys(contextVars[k] || {}).join(', ')}`)
        });
        // Don't replace if not found, leave the template
      }
    }
    
    return result;
  };
  
  // Resolve aspectRatio and numberOfImages if they are template strings
  if (resolvedSettings.aspectRatio) {
    const resolved = resolveTemplate(resolvedSettings.aspectRatio);
    // FAIL HARD: If template variables aren't resolved, throw error
    if (resolved.includes('{{')) {
      throw new Error(`FATAL: Template variable '${resolvedSettings.aspectRatio}' could not be resolved. Required context data is missing.`);
    }
    // Validate that the aspect ratio is one of the supported values
    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    if (!validAspectRatios.includes(resolved)) {
      throw new Error(`FATAL: Invalid aspect ratio '${resolved}'. Must be one of: ${validAspectRatios.join(', ')}`);
    }
    resolvedSettings.aspectRatio = resolved;
  }
  
  if (resolvedSettings.numberOfImages) {
    const resolved = resolveTemplate(resolvedSettings.numberOfImages);
    // FAIL HARD: If template variables aren't resolved, throw error
    if (resolved.includes('{{')) {
      throw new Error(`FATAL: Template variable '${resolvedSettings.numberOfImages}' could not be resolved. Required context data is missing.`);
    }
    const numValue = parseInt(resolved, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 4) {
      throw new Error(`FATAL: Invalid numberOfImages '${resolved}'. Must be a number between 1 and 4.`);
    }
    resolvedSettings.numberOfImages = numValue;
  }
  
  // Resolve filenames from template context
  if (resolvedSettings.filenames) {
    const resolved = resolveTemplate(resolvedSettings.filenames);
    // FAIL HARD: If template variables aren't resolved, throw error
    if (resolved.includes('{{')) {
      throw new Error(`FATAL: Template variable '${resolvedSettings.filenames}' could not be resolved. AI-generated filenames not available.`);
    }
    
    try {
      // Parse the JSON array of filenames
      const parsedFilenames = JSON.parse(resolved);
      if (Array.isArray(parsedFilenames)) {
        resolvedSettings.filenames = parsedFilenames;
        console.log('[resolveImageGenerationSettings] Using AI-generated filenames:', parsedFilenames);
      } else {
        console.warn('[resolveImageGenerationSettings] Filenames is not an array, ignoring:', resolved);
        delete resolvedSettings.filenames;
      }
    } catch (parseError) {
      console.warn('[resolveImageGenerationSettings] Failed to parse filenames JSON, ignoring:', resolved);
      delete resolvedSettings.filenames;
    }
  }
  
  return resolvedSettings;
}

/**
 * Hook for managing stage processing, including AI stage execution and input handling
 */
export function useStageProcessing({
  instance,
  updateStageState,
  documentId,
  scrollToStageById,
}: UseStageProcessingProps): UseStageProcessingReturn {
  const { toast } = useToast();
  const { user, effectiveUser } = useAuth();
  const [aiStageLoaded, setAiStageLoaded] = useState(false);
  const [aiLoadError, setAiLoadError] = useState<string | null>(null);
  const [aiLoadAttempts, setAiLoadAttempts] = useState(0);
  const [aiLoadStartTime, setAiLoadStartTime] = useState<number>(Date.now());

  // Enhanced AI stage runner loading with detailed error tracking
  const loadAiStageRunner = useCallback(async (retryAttempt: number = 0) => {
    const startTime = Date.now();
    setAiLoadStartTime(startTime);
    
    console.log(`[useStageProcessing] Loading AI stage runner (attempt ${retryAttempt + 1})...`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryAttempt,
      aiStageLoaded,
      runAiStageExists: !!runAiStage,
    });
    
    try {
      const aiModule = await import('@/lib/ai-stage-runner');
      const loadTime = Date.now() - startTime;
      
      console.log('[useStageProcessing] ✅ AI stage runner loaded successfully!', {
        loadTimeMs: loadTime,
        moduleKeys: Object.keys(aiModule),
        runAiStageType: typeof aiModule.runAiStage,
        runAiStageExists: !!aiModule.runAiStage,
      });
      
      if (!aiModule.runAiStage || typeof aiModule.runAiStage !== 'function') {
        throw new Error(`AI module loaded but runAiStage is ${typeof aiModule.runAiStage}, expected function`);
      }
      
      runAiStage = aiModule.runAiStage;
      setAiStageLoaded(true);
      setAiLoadError(null);
      
      console.log('[useStageProcessing] ✅ AI stage runner function validated successfully');
      
    } catch (error: any) {
      const loadTime = Date.now() - startTime;
      const errorDetails = {
        loadTimeMs: loadTime,
        attempt: retryAttempt + 1,
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        networkOnline: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      };
      
      console.error('[useStageProcessing] ❌ Failed to load AI stage runner:', errorDetails);
      
      setAiLoadAttempts(retryAttempt + 1);
      setAiLoadError(error.message);
      
      // Auto-retry up to 3 times with exponential backoff
      if (retryAttempt < 2) {
        const retryDelay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
        console.log(`[useStageProcessing] 🔄 Retrying AI load in ${retryDelay}ms...`);
        
        setTimeout(() => {
          loadAiStageRunner(retryAttempt + 1);
        }, retryDelay);
      } else {
        // Final failure - show comprehensive error toast
        const comprehensiveError = `AI Module Load Failed After ${retryAttempt + 1} Attempts

🔍 Technical Details:
• Error: ${error.message}
• Load time: ${loadTime}ms
• Network: ${navigator.onLine ? 'Online' : 'Offline'}
• Connection: ${(navigator as any).connection?.effectiveType || 'Unknown'}
• Browser: ${navigator.userAgent.split(' ').pop()}

🔧 Developer Debug Info:
• URL: ${window.location.href}
• Timestamp: ${new Date().toISOString()}
• Stack: ${error.stack?.split('\n')[1] || 'No stack trace'}

💡 Solutions:
1. Refresh the page (Cmd/Ctrl + R)
2. Clear browser cache (Cmd/Ctrl + Shift + R)
3. Check browser console for more details
4. Try a different browser
5. Check network connection`;

        toast({
          title: "AI System Unavailable",
          description: comprehensiveError,
          variant: "destructive",
          duration: 15000,
        });
      }
    }
  }, [toast, aiStageLoaded]);

  // Load the AI stage runner dynamically with retries
  useEffect(() => {
    loadAiStageRunner();
  }, [loadAiStageRunner]);

  const handleRunStage = useCallback(async (stageId: string, currentInput?: any, aiRedoNotes?: string) => {
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    const stageTitle = stage?.title || stageId;
    const currentTime = Date.now();
    const timeSinceLoad = currentTime - aiLoadStartTime;
    
    console.log('[handleRunStage] AI readiness check:', {
      stageId,
      stageTitle,
      aiStageLoaded,
      runAiStageExists: !!runAiStage,
      aiLoadError,
      aiLoadAttempts,
      timeSinceLoadMs: timeSinceLoad,
      timestamp: new Date().toISOString(),
    });
    
    if (!aiStageLoaded || !runAiStage) {
      // Show detailed error - logic from original wizard-shell
      const errorTitle = "AI System Not Ready";
      const errorDescription = `The AI system is not ready to process "${stageTitle}". Please wait for it to load.`;
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 15000,
      });
      
      return;
    }

    console.log('[handleRunStage] ✅ AI system ready, proceeding with stage execution');
    if (!stage) return;

    const currentStageState = instance.stageStates[stageId];
    const stageInputForRun = currentStageState.userInput ?? currentInput;

    if (currentStageState.depsAreMet === false && stage.dependencies && stage.dependencies.length > 0) {
      toast({ title: "Dependencies Not Met", description: `Please complete previous stages before running "${stage.title}".`, variant: "default" });
      return;
    }

    updateStageState(stageId, { status: "running", error: undefined, isEditingOutput: false });
    
    const contextVars: Record<string, any> = {};
    instance.workflow.stages.forEach(s => {
        const sState = instance.stageStates[s.id];
        if (s.id === stageId) { 
            contextVars[s.id] = { userInput: stageInputForRun, output: sState.output };
        } else if (sState?.status === 'completed') {
            contextVars[s.id] = { userInput: sState.userInput, output: sState.output };
        }
    });

    // Handle export stage type
    if (stage.stageType === 'export') {
      console.log('[handleRunStage] Starting export stage execution');
      try {
        const { executeExportStage } = await import('@/ai/flows/export-stage-execution');
        
        const exportPromise = executeExportStage({
          stage,
          workflow: instance.workflow,
          allStageStates: instance.stageStates,
          documentId: documentId || 'temp-export',
          userId: effectiveUser?.uid || 'anonymous',
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Export generation timed out after 30 seconds')), 30000);
        });
        
        const result = await Promise.race([exportPromise, timeoutPromise]) as any;
        
        updateStageState(stageId, {
          status: "completed",
          output: result,
          completedAt: new Date().toISOString(),
          isStale: false,
          generationProgress: undefined,
        });
        
        toast({ 
          title: "Export Complete", 
          description: "Your content has been exported successfully!",
          variant: "default"
        });
      } catch (error) {
        console.error('[handleRunStage] Export error:', error);
        
        updateStageState(stageId, { 
          status: "error", 
          error: error instanceof Error ? error.message : "Export failed",
          generationProgress: undefined,
        });
        
        toast({ 
          title: "Export Error", 
          description: error instanceof Error ? error.message : "Export failed", 
          variant: "destructive" 
        });
      }
      return;
    }

    if (!stage.promptTemplate) { 
      updateStageState(stageId, { 
        status: "completed", 
        output: stage.inputType === 'form' 
            ? stageInputForRun 
            : (stage.inputType === 'textarea' || stage.inputType === 'context' 
                ? stageInputForRun 
                : undefined),
        completedAt: new Date().toISOString(),
        isStale: false,
      });
      
      // Auto-scroll to next stage after a brief delay
      const autoScrollConfig = instance.workflow.config?.autoScroll;
      if (autoScrollConfig?.enabled !== false && scrollToStageById) {
        setTimeout(() => {
          const nextStageIndex = instance.workflow.stages.findIndex(s => s.id === stageId) + 1;
          if (nextStageIndex < instance.workflow.stages.length) {
            const nextStage = instance.workflow.stages[nextStageIndex];
            const shouldScroll = nextStage.autoRun ? 
              (autoScrollConfig?.scrollToAutorun !== false) :
              (autoScrollConfig?.scrollToManual === true);
            
            if (shouldScroll) {
              scrollToStageById(nextStage.id);
            }
          }
        }, 500);
      }
      
      return;
    }
    
    try {
      // Enhance prompt template with AI REDO notes if provided
      let enhancedPromptTemplate = stage.promptTemplate;
      if (aiRedoNotes && stage.promptTemplate) {
        enhancedPromptTemplate = `${stage.promptTemplate}\n\nAdditional instructions: ${aiRedoNotes}`;
      }
      
      const result = await runAiStage({
        promptTemplate: enhancedPromptTemplate,
        model: stage.model || "googleai/gemini-2.5-flash-preview-05-20",
        temperature: stage.temperature || 0.7,
        thinkingSettings: stage.thinkingSettings,
        toolNames: stage.toolNames,
        systemInstructions: stage.systemInstructions,
        contextVars: contextVars,
        currentStageInput: stageInputForRun,
        stageOutputType: stage.outputType,
        aiRedoNotes: aiRedoNotes,
        forceGoogleSearchGrounding: !!aiRedoNotes,
        groundingSettings: stage.groundingSettings,
        jsonSchema: stage.jsonSchema,
        jsonFields: stage.jsonFields,
        imageGenerationSettings: stage.outputType === 'image' && stage.imageGenerationSettings ? 
          resolveImageGenerationSettings(stage.imageGenerationSettings, contextVars) : 
          undefined,
        stage: stage,
        workflow: instance.workflow,
        userId: user?.uid,
        documentId: documentId,
        stageId: stageId,
      });

      if (result.error) {
        updateStageState(stageId, { status: "error", error: result.error, currentStreamOutput: "" });
        toast({ title: "AI Stage Error", description: result.error, variant: "destructive" });
        return;
      }
      
      updateStageState(stageId, {
        status: "completed",
        output: result.content,
        groundingInfo: result.groundingInfo,
        groundingMetadata: result.groundingMetadata,
        groundingSources: result.groundingSources,
        thinkingSteps: result.thinkingSteps,
        outputImages: result.outputImages,
        currentStreamOutput: "",
        completedAt: new Date().toISOString(),
        isStale: false,
        usageMetadata: result.usageMetadata,
      });
      
      // Auto-scroll to next stage after a brief delay
      const autoScrollConfig = instance.workflow.config?.autoScroll;
      if (autoScrollConfig?.enabled !== false && scrollToStageById) {
        setTimeout(() => {
          const nextStageIndex = instance.workflow.stages.findIndex(s => s.id === stageId) + 1;
          if (nextStageIndex < instance.workflow.stages.length) {
            const nextStage = instance.workflow.stages[nextStageIndex];
            const shouldScroll = nextStage.autoRun ? 
              (autoScrollConfig?.scrollToAutorun !== false) :
              (autoScrollConfig?.scrollToManual === true);
            
            if (shouldScroll) {
              scrollToStageById(nextStage.id);
            }
          }
        }, 500);
      }

    } catch (error: any) {
      console.error("Error running AI stage:", error);
      updateStageState(stageId, { status: "error", error: error.message || "AI processing failed." });
      toast({ title: "AI Stage Error", description: error.message || "An error occurred.", variant: "destructive" });
    }
  }, [aiStageLoaded, aiLoadAttempts, aiLoadError, aiLoadStartTime, instance.workflow, instance.stageStates, updateStageState, toast, scrollToStageById, documentId, user?.uid, effectiveUser?.uid]);

  const handleInputChange = useCallback((stageId: string, fieldName: string, value: any) => {
    if (fieldName === 'userInput') {
      updateStageState(stageId, { userInput: value, status: 'idle', output: undefined, completedAt: undefined, isStale: true });
    }
  }, [updateStageState]);

  const handleFormSubmit = useCallback((stageId: string, data: any) => {
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    if (stage.inputType === 'form' && !stage.promptTemplate) {
      updateStageState(stageId, { 
        userInput: data,
        output: data,
        status: 'completed',
        completedAt: new Date().toISOString(),
        isStale: false
      });
    } else {
      updateStageState(stageId, { 
        userInput: data, 
        status: 'idle',
        isStale: true
      });
    }
  }, [instance.workflow.stages, updateStageState]);

  const handleEditInputRequest = useCallback((stageId: string) => {
    updateStageState(stageId, { status: "idle", output: undefined, completedAt: undefined, isEditingOutput: false });
  }, [updateStageState]);

  const handleSetEditingOutput = useCallback((stageId: string, isEditing: boolean) => {
    updateStageState(stageId, { isEditingOutput: isEditing });
  }, [updateStageState]);

  const handleOutputEdit = useCallback((stageId: string, newOutput: any) => {
    updateStageState(stageId, { output: newOutput, completedAt: new Date().toISOString(), isStale: false });
  }, [updateStageState]);

  const handleDismissStaleWarning = useCallback((stageId: string) => {
    updateStageState(stageId, { staleDismissed: true });
  }, [updateStageState]);

  return {
    aiStageLoaded,
    aiLoadError,
    aiLoadAttempts,
    loadAiStageRunner,
    handleRunStage,
    handleInputChange,
    handleFormSubmit,
    handleEditInputRequest,
    handleSetEditingOutput,
    handleOutputEdit,
    handleDismissStaleWarning,
  };
}