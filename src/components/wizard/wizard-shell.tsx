"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { StageCard } from './stage-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Info, Lightbulb, FileWarning, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { siteConfig } from '@/config/site';
import { useDocumentPersistence } from '@/hooks/use-document-persistence';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/layout/app-providers';
import { cn } from '@/lib/utils';

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

interface WizardShellProps {
  initialInstance: WizardInstance;
}

export function WizardShell({ initialInstance }: WizardShellProps) {
  const [instance, setInstance] = useState<WizardInstance>(initialInstance);
  const { toast } = useToast();
  const { user, effectiveUser } = useAuth();
  const [pageTitle, setPageTitle] = useState(initialInstance.document.title);
  const [aiStageLoaded, setAiStageLoaded] = useState(false);
  const [aiLoadError, setAiLoadError] = useState<string | null>(null);
  const [aiLoadAttempts, setAiLoadAttempts] = useState(0);
  const [aiLoadStartTime, setAiLoadStartTime] = useState<number>(Date.now());

  // Enhanced AI stage runner loading with detailed error tracking
  const loadAiStageRunner = useCallback(async (retryAttempt: number = 0) => {
    const startTime = Date.now();
    setAiLoadStartTime(startTime);
    
    // Skip loading toast - users don't need to see this
    
    console.log(`[WizardShell] Loading AI stage runner (attempt ${retryAttempt + 1})...`, {
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
      
      console.log('[WizardShell] ✅ AI stage runner loaded successfully!', {
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
      
      // Skip success toast - AI loading is expected behavior
      
      console.log('[WizardShell] ✅ AI stage runner function validated successfully');
      
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
      
      console.error('[WizardShell] ❌ Failed to load AI stage runner:', errorDetails);
      
      setAiLoadAttempts(retryAttempt + 1);
      setAiLoadError(error.message);
      
      // Auto-retry up to 3 times with exponential backoff
      if (retryAttempt < 2) {
        const retryDelay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
        console.log(`[WizardShell] 🔄 Retrying AI load in ${retryDelay}ms...`);
        
        // Silent retry - no need to show toast for automatic retries
        
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
          duration: 15000, // Show longer for complex error
          action: (
            <Button
              onClick={() => {
                setAiStageLoaded(false);
                setAiLoadError(null);
                setAiLoadAttempts(0);
                loadAiStageRunner();
              }}
              size="sm"
            >
              Retry
            </Button>
          )
        });
      }
    }
  }, [toast, aiStageLoaded]);

  // Load the AI stage runner dynamically with retries
  useEffect(() => {
    loadAiStageRunner();
  }, [loadAiStageRunner]);

  // Auto-scroll utility
  const scrollToStageById = useCallback((stageId: string) => {
    const stageElement = document.getElementById(`stage-${stageId}`);
    if (stageElement) {
      const elementTop = stageElement.getBoundingClientRect().top + window.pageYOffset;
      const headerOffset = 120; // Account for sticky header height + some padding
      window.scrollTo({
        top: elementTop - headerOffset,
        behavior: 'smooth'
      });
    }
  }, []);

  // Callback to sync instance changes from persistence layer
  const updateInstanceForPersistence = useCallback((updates: Partial<WizardInstance>) => {
    setInstance(prev => ({ ...prev, ...updates }));
  }, []);

  // Document persistence
  const { 
    isSaving, 
    lastSaved, 
    saveError, 
    documentId,
    saveDocument 
  } = useDocumentPersistence({
    instance,
    updateInstance: updateInstanceForPersistence,
  });

  const updateStageState = useCallback((stageId: string, updates: Partial<StageState>) => {
    let needsImmediateSave = false;
    const resultState = setInstance(prevInstance => {
      const newStageStates = {
        ...prevInstance.stageStates,
        [stageId]: {
          ...prevInstance.stageStates[stageId],
          ...updates,
        },
      };
      // Decide persistence before returning (so we can capture final merged state)
      if (prevInstance.stageStates[stageId]?.stageId === stageId) {
        const upd = updates as any;
        needsImmediateSave =
          !!upd.output?.publishing ||
          !!upd.output?.formats ||
          upd.status === 'completed';
      }
      const evaluatedStageStates = evaluateDependenciesLogic(newStageStates, prevInstance.workflow.stages);
      return { ...prevInstance, stageStates: evaluatedStageStates };
    });

    if (needsImmediateSave) {
      // Next tick save so React state has committed
      setTimeout(() => {
        saveDocument();
      }, 0);
    }
  }, [saveDocument]);

  // Enhanced dependency evaluation logic with support for autoRunConditions
  const evaluateDependenciesLogic = (currentStageStates: Record<string, StageState>, stages: Stage[]): Record<string, StageState> => {
    const newStageStates = { ...currentStageStates };
    let changed = false;

    stages.forEach(stage => {
      const currentState = newStageStates[stage.id];
      if (!currentState) return; // Should not happen if initialized correctly

      // Evaluate basic dependencies
      let depsMet = true;
      if (stage.dependencies && stage.dependencies.length > 0) {
        depsMet = stage.dependencies.every(depId => 
          newStageStates[depId]?.status === 'completed'
        );
      }

      // Evaluate autorun conditions (more complex dependency logic)
      let autoRunConditionsMet = true;
      if (stage.autoRunConditions) {
        if (stage.autoRunConditions.requiresAll) {
          autoRunConditionsMet = stage.autoRunConditions.requiresAll.every(depId => 
            newStageStates[depId]?.status === 'completed'
          );
        }
        if (autoRunConditionsMet && stage.autoRunConditions.requiresAny) {
          autoRunConditionsMet = stage.autoRunConditions.requiresAny.some(depId => 
            newStageStates[depId]?.status === 'completed'
          );
        }
      }
      
      let isStale = false;
      if (currentState.status === 'completed' && currentState.output && currentState.completedAt) {
        // ONLY check staleness for truly completed stages
        const stageCompletedAt = new Date(currentState.completedAt).getTime();
        
        // Check staleness based on basic dependencies
        if (stage.dependencies && stage.dependencies.length > 0) {
          isStale = stage.dependencies.some(depId => {
            const depState = newStageStates[depId];
            // Only consider a dependency if it has been completed
            if (depState?.status === 'completed' && depState?.completedAt) {
              const depCompletedAt = new Date(depState.completedAt).getTime();
              // Stage is stale if dependency was completed AFTER this stage
              return depCompletedAt > stageCompletedAt;
            }
            // Incomplete dependencies don't make a stage stale
            return false;
          });
        }
        
        // Also check staleness based on autorun conditions
        if (!isStale && stage.autoRunConditions?.requiresAll) {
          isStale = stage.autoRunConditions.requiresAll.some(depId => {
            const depState = newStageStates[depId];
            // Only consider a dependency if it has been completed
            if (depState?.status === 'completed' && depState?.completedAt) {
              const depCompletedAt = new Date(depState.completedAt).getTime();
              // Stage is stale if dependency was completed AFTER this stage
              return depCompletedAt > stageCompletedAt;
            }
            // Incomplete dependencies don't make a stage stale
            return false;
          });
        }
        
        // Also check staleness based on autorun dependencies
        if (!isStale && stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
          isStale = stage.autorunDependsOn.some(depId => {
            const depState = newStageStates[depId];
            // Only consider a dependency if it has been completed
            if (depState?.status === 'completed' && depState?.completedAt) {
              const depCompletedAt = new Date(depState.completedAt).getTime();
              // Stage is stale if dependency was completed AFTER this stage
              return depCompletedAt > stageCompletedAt;
            }
            // Incomplete dependencies don't make a stage stale
            return false;
          });
        }
      }

      // Evaluate autorun dependencies (separate from activation dependencies)
      let autorunDepsMet = true;
      if (stage.autorunDependsOn && stage.autorunDependsOn.length > 0) {
        // Use explicit autorun dependencies
        autorunDepsMet = stage.autorunDependsOn.every(depId => 
          newStageStates[depId]?.status === 'completed'
        );
      } else {
        // Fall back to regular dependencies (backward compatibility)
        autorunDepsMet = depsMet;
      }

      // Determine if stage should auto-run
      let shouldAutoRun = false;
      if (stage.autoRun && currentState.status === 'idle' && !currentState.isEditingOutput) {
        if (stage.autoRunConditions) {
          // Use complex autorun conditions AND autorun dependencies
          shouldAutoRun = depsMet && autoRunConditionsMet && autorunDepsMet;
        } else {
          // Use simple dependency logic - stage must be active (depsMet) AND autorun deps met
          shouldAutoRun = depsMet && autorunDepsMet;
        }
      }

      if (
        currentState.depsAreMet !== depsMet ||
        currentState.isStale !== isStale ||
        currentState.shouldAutoRun !== shouldAutoRun
      ) {
        newStageStates[stage.id] = {
          ...currentState,
          depsAreMet: depsMet,
          isStale: isStale,
          shouldAutoRun: shouldAutoRun,
          // Reset staleDismissed when stage is no longer stale
          staleDismissed: isStale ? currentState.staleDismissed : false,
        };
        changed = true;
      }
    });
    return changed ? newStageStates : currentStageStates; // Return original if no change to avoid re-render
  };
  
  // Effect for initial and subsequent dependency evaluations
  useEffect(() => {
    setInstance(prevInstance => ({
      ...prevInstance,
      stageStates: evaluateDependenciesLogic(prevInstance.stageStates, prevInstance.workflow.stages)
    }));
  }, []); // Runs once on mount, subsequent calls via updateStageState


  useEffect(() => {
    instance.workflow.stages.forEach(stage => {
      const stageState = instance.stageStates[stage.id];
      // Defensive check: ensure stageState exists before accessing its properties
      if (stageState && stageState.shouldAutoRun && stageState.status === 'idle' && stageState.depsAreMet && !stageState.isEditingOutput) {
        console.log(`[Autorun] Triggering autorun for stage ${stage.id}`);
        handleRunStage(stage.id, stageState.userInput);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance.stageStates, instance.workflow.stages]); 


  useEffect(() => {
    const titleStageId = instance.workflow.config?.setTitleFromStageOutput;
    if (titleStageId) {
      const titleStageState = instance.stageStates[titleStageId];
      if (titleStageState?.status === 'completed' && titleStageState.output) {
        let newTitle = "";
        if (typeof titleStageState.output === 'string') {
            newTitle = titleStageState.output;
        } 
        else if (titleStageId === "page-title-generation" && typeof titleStageState.output === 'object' && titleStageState.output !== null && Array.isArray(titleStageState.output.titles) && titleStageState.output.titles.length > 0) {
            // For page-title-generation, if 'chosenTitle' exists in outline-creation's userInput, use that.
            const outlineStageUserInput = instance.stageStates['outline-creation']?.userInput;
            if (outlineStageUserInput && typeof outlineStageUserInput === 'object' && outlineStageUserInput.chosenTitle) {
                 newTitle = outlineStageUserInput.chosenTitle;
            } else {
                newTitle = titleStageState.output.titles[0]; 
            }
        }
         else if (titleStageId === "dish-name" && typeof titleStageState.output === 'string') { // For Recipe Workflow
            newTitle = titleStageState.output;
        }
        else if (typeof titleStageState.output === 'object' && titleStageState.output !== null && titleStageState.output.title) { // Generic title from object
             newTitle = titleStageState.output.title;
        }
        
        if (newTitle && newTitle.length > 0 && newTitle.length < 150) { 
            setPageTitle(newTitle);
            if (typeof document !== 'undefined') {
                document.title = `${newTitle} - ${siteConfig.name}`;
            }
            setInstance(prev => ({
                ...prev,
                document: { ...prev.document, title: newTitle }
            }));
        }
      }
    }
  }, [instance.stageStates, instance.workflow.config?.setTitleFromStageOutput]);


  const handleInputChange = (stageId: string, fieldName: string, value: any) => {
    // This is primarily for simple input types like 'textarea' or 'context' now.
    // Form inputs are handled by onFormSubmit.
    if (fieldName === 'userInput') {
         updateStageState(stageId, { userInput: value, status: 'idle', output: undefined, completedAt: undefined, isStale: true });
    }
  };

  const handleFormSubmit = (stageId: string, data: any) => {
    // This function is called from StageInputArea when form field values change.
    // It updates the central state with the latest form data.
    const stage = instance.workflow.stages.find(s => s.id === stageId);
    if (!stage) return;

    // For form stages without a promptTemplate, immediately mark as completed with the form data as output
    if (stage.inputType === 'form' && !stage.promptTemplate) {
      updateStageState(stageId, { 
        userInput: data,
        output: data, // Form data becomes the output
        status: 'completed',
        completedAt: new Date().toISOString(),
        isStale: false
      });
      // This will trigger dependency evaluation and autoRun stages will execute
    } else {
      // For other stages, just update the input
      updateStageState(stageId, { 
        userInput: data, 
        status: 'idle',
        isStale: true
      });
    }
  };

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
      const diagnosticInfo = {
        aiStageLoaded,
        runAiStageExists: !!runAiStage,
        aiLoadError,
        aiLoadAttempts,
        timeSinceLoadMs: timeSinceLoad,
        networkOnline: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        userAgent: navigator.userAgent,
        url: window.location.href,
        stageId,
        stageTitle,
      };
      
      console.error('[handleRunStage] 🚨 AI System Not Ready - Detailed Diagnostics:', diagnosticInfo);
      
      // Determine specific error cause and solution
      let errorTitle = "AI System Not Ready";
      let errorDescription = "";
      let actionableSteps: string[] = [];
      
      if (aiLoadError) {
        errorTitle = "AI Module Failed to Load";
        errorDescription = `The AI system encountered an error during initialization and cannot process "${stageTitle}".`;
        actionableSteps = [
          "Refresh the page to retry loading",
          "Check your internet connection", 
          "Clear browser cache (Cmd/Ctrl + Shift + R)",
          "Check browser console for detailed error logs",
          "Contact support if the issue persists"
        ];
      } else if (timeSinceLoad < 10000) {
        errorTitle = "AI System Still Loading";
        errorDescription = `The AI system is still initializing. Please wait a moment before running "${stageTitle}".`;
        actionableSteps = [
          `Wait ${Math.ceil((10000 - timeSinceLoad) / 1000)} more seconds`,
          "Try again in a few seconds",
          "Ensure stable internet connection",
          "Try refreshing if loading takes too long"
        ];
      } else {
        errorTitle = "AI System Load Timeout";
        errorDescription = `The AI system failed to load after ${Math.round(timeSinceLoad / 1000)} seconds. Cannot process "${stageTitle}".`;
        actionableSteps = [
          "Refresh the page (most likely to fix)",
          "Clear browser cache and cookies",
          "Check your internet connection speed",
          "Open browser console to see detailed errors",
          "Try a different browser or incognito mode"
        ];
      }
      
      const detailedError = `${errorDescription}

Technical Status:
• AI Module Loaded: ${aiStageLoaded ? 'Yes' : 'No'}
• Function Available: ${!!runAiStage ? 'Yes' : 'No'}
• Load Attempts: ${aiLoadAttempts}/3
• Time Since Page Load: ${Math.round(timeSinceLoad / 1000)}s
• Network Status: ${navigator.onLine ? 'Online' : 'Offline'}
• Connection: ${(navigator as any).connection?.effectiveType || 'Unknown'}

Developer Info:
• Stage ID: ${stageId}
• Stage Title: ${stageTitle}
• Error: ${aiLoadError || 'No specific error'}
• URL: ${window.location.href}
• Timestamp: ${new Date().toISOString()}

Solutions (try in order):
${actionableSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Still having issues? Check the browser console for detailed logs.`;

      toast({
        title: errorTitle,
        description: detailedError,
        variant: "destructive",
        duration: 15000, // Show longer for complex troubleshooting
        action: (
          <Button
            onClick={() => {
              console.log('[handleRunStage] Manual retry requested from toast');
              setAiStageLoaded(false);
              setAiLoadError(null);
              setAiLoadAttempts(0);
              loadAiStageRunner();
            }}
            size="sm"
          >
            Retry AI
          </Button>
        )
      });
      
      return;
    }

    console.log('[handleRunStage] ✅ AI system ready, proceeding with stage execution');
    console.log('[handleRunStage] Called with:', { stageId, currentInput, hasAiRedoNotes: !!aiRedoNotes });
    if (!stage) return;

    const currentStageState = instance.stageStates[stageId];
    console.log('[handleRunStage] Current stage state:', currentStageState);
    // Use the most up-to-date userInput from the state for the current stage
    const stageInputForRun = currentStageState.userInput ?? currentInput;
    console.log('[handleRunStage] Stage input for run:', stageInputForRun);


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
        // Don't include incomplete stages in context at all
    });


    // Handle export stage type
    console.log('🚨🚨🚨 [handleRunStage] EXPORT STAGE CHECK - stageType:', stage.stageType, 'stageId:', stageId);
    if (stage.stageType === 'export') {
      console.log('🚨🚨🚨 [handleRunStage] DETECTED EXPORT STAGE - USING DEDICATED EXPORT FLOW 🚨🚨🚨');
      console.log('[handleRunStage] Starting export stage execution');
      try {
        const { executeExportStage } = await import('@/ai/flows/export-stage-execution');
        
        console.log('[handleRunStage] executeExportStage imported successfully');
        
        // Set a timeout for export generation (30 seconds)
        const exportPromise = executeExportStage({
          stage,
          workflow: instance.workflow,
          allStageStates: instance.stageStates,
          documentId: instance.documentId || 'temp-export',
          userId: effectiveUser?.uid || 'anonymous',
          // NOTE: Progress updates are now handled server-side and persisted;
          // we no longer pass a client callback to avoid the RSC boundary issue.
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Export generation timed out after 30 seconds')), 30000);
        });
        
        console.log('[handleRunStage] Waiting for export to complete...');
        const result = await Promise.race([exportPromise, timeoutPromise]) as any;
        
        console.log('[handleRunStage] Export completed successfully');
        console.log('[handleRunStage] Export result keys:', Object.keys(result || {}));
        console.log('[handleRunStage] Export formats:', Object.keys(result?.formats || {}));
        
        updateStageState(stageId, {
          status: "completed",
          output: result,
          completedAt: new Date().toISOString(),
          isStale: false,
          generationProgress: undefined, // Clear progress
        });
        
        toast({ 
          title: "Export Complete", 
          description: "Your content has been exported successfully!",
          variant: "default"
        });
      } catch (error) {
        console.error('[handleRunStage] Export error:', error);
        console.error('[handleRunStage] Export error stack:', error instanceof Error ? error.stack : 'No stack');
        
        updateStageState(stageId, { 
          status: "error", 
          error: error instanceof Error ? error.message : "Export failed",
          generationProgress: undefined, // Clear progress
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
            ? stageInputForRun // Output is the submitted form data itself
            : (stage.inputType === 'textarea' || stage.inputType === 'context' 
                ? stageInputForRun // Output is the text/context input
                : undefined),
        completedAt: new Date().toISOString(),
        isStale: false,
      });
      // Silent completion for non-AI stages
      
      // Auto-scroll to next stage after a brief delay (configurable)
      const autoScrollConfig = instance.workflow.config?.autoScroll;
      if (autoScrollConfig?.enabled !== false) { // Default to enabled if not configured
        setTimeout(() => {
          const nextStageIndex = instance.workflow.stages.findIndex(s => s.id === stageId) + 1;
          if (nextStageIndex < instance.workflow.stages.length) {
            const nextStage = instance.workflow.stages[nextStageIndex];
            const shouldScroll = nextStage.autoRun ? 
              (autoScrollConfig?.scrollToAutorun !== false) : // Default to true for autorun
              (autoScrollConfig?.scrollToManual === true); // Default to false for manual
            
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
        console.log('[handleRunStage] Enhanced prompt with AI REDO notes:', aiRedoNotes);
      }

      console.log('[handleRunStage] About to call runAiStage with:', {
        hasPromptTemplate: !!enhancedPromptTemplate,
        model: stage.model || "googleai/gemini-2.5-flash-preview-05-20",
        temperature: stage.temperature || 0.7,
        contextVarsKeys: Object.keys(contextVars),
        currentStageInput: stageInputForRun,
        stageOutputType: stage.outputType,
        hasAiRedoNotes: !!aiRedoNotes,
        willForceGoogleSearchGrounding: !!aiRedoNotes,
        // CRITICAL: Debug groundingSettings from workflow
        stageGroundingSettings: stage.groundingSettings,
        hasGroundingSettings: !!stage.groundingSettings,
        googleSearchEnabled: stage.groundingSettings?.googleSearch?.enabled,
      });

      // 🚨 VISUAL INDICATOR: Show grounding status in console for easy debugging
      if (stage.groundingSettings?.googleSearch?.enabled) {
        console.log('🟢🟢🟢 WORKFLOW SAYS: GOOGLE SEARCH GROUNDING SHOULD BE ENABLED! 🟢🟢🟢');
        console.log('🔧 Stage configuration has groundingSettings.googleSearch.enabled = true');
      } else {
        console.log('🔴🔴🔴 WORKFLOW SAYS: NO GOOGLE SEARCH GROUNDING CONFIGURED 🔴🔴🔴');
        console.log('🔧 Stage configuration groundingSettings:', stage.groundingSettings);
      }
      
      const result = await runAiStage({
        promptTemplate: enhancedPromptTemplate,
        model: stage.model || "googleai/gemini-2.5-flash-preview-05-20",
        temperature: stage.temperature || 0.7,
        thinkingSettings: stage.thinkingSettings,
        toolNames: stage.toolNames,
        systemInstructions: stage.systemInstructions, // Pass systemInstructions

        contextVars: contextVars,
        currentStageInput: stageInputForRun,
        stageOutputType: stage.outputType,
        // CRITICAL: Pass AI Redo notes to force Google Search grounding
        aiRedoNotes: aiRedoNotes,
        forceGoogleSearchGrounding: !!aiRedoNotes, // Force grounding when AI Redo is used
        // CRITICAL: Pass groundingSettings from the workflow stage configuration
        groundingSettings: stage.groundingSettings,
        // Add JSON schema and fields for structured output
        jsonSchema: stage.jsonSchema,
        jsonFields: stage.jsonFields,
        // Add image generation settings with resolved template variables
        imageGenerationSettings: stage.outputType === 'image' && stage.imageGenerationSettings ? 
          resolveImageGenerationSettings(stage.imageGenerationSettings, contextVars) : 
          undefined,
        // Pass stage and workflow for export stages
        stage: stage,
        workflow: instance.workflow,
        // CRITICAL: Pass user/document context for asset management
        userId: user?.uid,
        documentId: documentId,
        stageId: stageId,
      });

      if (result.error) {
        // Preserve chat history on error, but clear current stream
        updateStageState(stageId, { status: "error", error: result.error, currentStreamOutput: "" });
        toast({ title: "AI Stage Error", description: result.error, variant: "destructive" });
        return; // Stop further processing on error
      }
      
      updateStageState(stageId, {
        status: "completed",
        output: result.content, // Final accumulated content
        groundingInfo: result.groundingInfo,
        groundingMetadata: result.groundingMetadata, // Store grounding metadata
        groundingSources: result.groundingSources, // CRITICAL FIX: Store grounding sources!
        thinkingSteps: result.thinkingSteps,
        outputImages: result.outputImages,
        
        currentStreamOutput: "", // Clear stream output
        completedAt: new Date().toISOString(),
        isStale: false,
        usageMetadata: result.usageMetadata, // Store usage metadata for thinking display
      });
      
      // Silent completion for AI stages - users can see the output
      
      // Auto-scroll to next stage after a brief delay (configurable)
      const autoScrollConfig = instance.workflow.config?.autoScroll;
      if (autoScrollConfig?.enabled !== false) { // Default to enabled if not configured
        setTimeout(() => {
          const nextStageIndex = instance.workflow.stages.findIndex(s => s.id === stageId) + 1;
          if (nextStageIndex < instance.workflow.stages.length) {
            const nextStage = instance.workflow.stages[nextStageIndex];
            const shouldScroll = nextStage.autoRun ? 
              (autoScrollConfig?.scrollToAutorun !== false) : // Default to true for autorun
              (autoScrollConfig?.scrollToManual === true); // Default to false for manual
            
            if (shouldScroll) {
              scrollToStageById(nextStage.id);
            }
          }
        }, 500);
      }

    } catch (error: any) {
      console.error("Error running AI stage:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        stageId,
        promptTemplate: stage.promptTemplate
      });
      updateStageState(stageId, { status: "error", error: error.message || "AI processing failed." });
      toast({ title: "AI Stage Error", description: error.message || "An error occurred.", variant: "destructive" });
    }
  }, [aiStageLoaded, aiLoadAttempts, aiLoadError, aiLoadStartTime, loadAiStageRunner, instance.workflow, instance.stageStates, updateStageState, toast, scrollToStageById, documentId, user?.uid]);


  
  const handleEditInputRequest = (stageId: string) => {
    updateStageState(stageId, { status: "idle", output: undefined, completedAt: undefined, isEditingOutput: false });
    // Silent - UI already shows editing state
  };

  const handleSetEditingOutput = (stageId: string, isEditing: boolean) => {
    updateStageState(stageId, { isEditingOutput: isEditing });
  };

  const handleOutputEdit = (stageId: string, newOutput: any) => {
    updateStageState(stageId, { output: newOutput, completedAt: new Date().toISOString(), isStale: false });
  };

  const handleDismissStaleWarning = (stageId: string) => {
    updateStageState(stageId, { staleDismissed: true });
    // Silent - dismissal is visible in UI
  };
  
  const completedStagesCount = instance.workflow.stages.filter(
    stage => instance.stageStates[stage.id]?.status === 'completed'
  ).length;
  const totalStages = instance.workflow.stages.length;
  const progressPercentage = totalStages > 0 ? (completedStagesCount / totalStages) * 100 : 0;

  const isWizardCompleted = completedStagesCount === totalStages;

  const currentFocusStage = instance.workflow.stages.find(
    s => {
      const state = instance.stageStates[s.id];
      return state && state.status !== 'completed' && state.depsAreMet !== false;
    }
  ) || instance.workflow.stages.find(s => instance.stageStates[s.id]?.depsAreMet === false) 
    || instance.workflow.stages.find(s => instance.stageStates[s.id]?.status === 'completed' && instance.stageStates[s.id]?.isStale === true && !instance.stageStates[s.id]?.staleDismissed)
    || instance.workflow.stages[instance.workflow.stages.length - 1]; 

  const currentStageId = currentFocusStage?.id || instance.workflow.stages[0].id;


  return (
    <>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <h1 
          className="text-2xl md:text-3xl font-bold font-headline mb-2"
          data-testid="wizard-page-title"
        >
          {pageTitle}
        </h1>
        <div className="flex items-center gap-2 mb-1 text-sm md:text-base text-muted-foreground">
          {!isSaving && lastSaved && (
            <span className="text-xs md:text-sm" data-testid="last-saved-text">
              {`Last saved ${lastSaved.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).replace(',', '')}`}
            </span>
          )}
          {!isSaving && lastSaved && <span className="px-1">|</span>}
          <p>Workflow: {instance.workflow.name}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{completedStagesCount} / {totalStages} Stages</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="w-full h-3"
            data-testid="wizard-progress-bar"
          />
          <div className="flex items-center justify-end mt-2 gap-2">
            {isSaving && (
              <Badge variant="secondary" className="text-xs">
                <Save className="w-3 h-3 mr-1 animate-pulse" />
                Saving...
              </Badge>
            )}
            {saveError && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Save failed
              </Badge>
            )}
          </div>
        </div>

        {isWizardCompleted && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/30">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-300 font-headline">Wizard Completed!</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-500">
              All stages have been completed. You can now view and export your document.
            </AlertDescription>
          </Alert>
        )}

        {!isWizardCompleted && instance.stageStates[currentStageId]?.depsAreMet === false && (
           <Alert variant="default" className="mb-6 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-300 font-headline">Next Steps</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-500">
              Please complete the preceding stages to unlock &apos;{instance.workflow.stages.find(s => s.id === currentStageId)?.title}&apos;.
            </AlertDescription>
          </Alert>
        )}
        {!isWizardCompleted && instance.stageStates[currentStageId]?.isStale === true && instance.stageStates[currentStageId]?.status === 'completed' && !instance.stageStates[currentStageId]?.staleDismissed && (
           <Alert variant="default" className="mb-6 bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700">
            <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-700 dark:text-amber-300 font-headline">Update Recommended</AlertTitle>
            <AlertDescription className="text-amber-600 dark:text-amber-500">
              The input or dependencies for stage &apos;{instance.workflow.stages.find(s => s.id === currentStageId)?.title}&apos; have changed. You may want to re-run or review its output.
            </AlertDescription>
          </Alert>
        )}


        {instance.workflow.stages.map(stage => (
          <StageCard
            key={stage.id}
            stage={stage}
            workflow={instance.workflow}
            stageState={instance.stageStates[stage.id] || { 
              stageId: stage.id, 
              status: 'idle', 
              depsAreMet: !(stage.dependencies && stage.dependencies.length > 0), 
              isEditingOutput: false,
              shouldAutoRun: false,
              isStale: false,
              staleDismissed: false,
              userInput: undefined,
              output: undefined,
              error: undefined,
              completedAt: undefined,
              groundingInfo: undefined,
              thinkingSteps: undefined,
              currentStreamOutput: undefined,
              outputImages: undefined
            }}
            isCurrentStage={stage.id === currentStageId && !isWizardCompleted}
            onRunStage={handleRunStage}
            onInputChange={handleInputChange}
            onFormSubmit={handleFormSubmit}
            documentId={documentId || undefined}
            
            onEditInputRequest={handleEditInputRequest}
            onOutputEdit={handleOutputEdit}
            onSetEditingOutput={handleSetEditingOutput}
            onDismissStaleWarning={handleDismissStaleWarning}
            onUpdateStageState={updateStageState}
            allStageStates={instance.stageStates}
          />
        ))}


      </div>
    </>
  );
}
