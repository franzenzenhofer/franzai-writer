import { useMemo, useCallback, useEffect } from 'react';
import type { WizardInstance, Stage } from '@/types';
import { siteConfig } from '@/config/site';

interface UseWizardUIStateProps {
  instance: WizardInstance;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  setInstance: React.Dispatch<React.SetStateAction<WizardInstance>>;
}

interface UseWizardUIStateReturn {
  completedStagesCount: number;
  totalStages: number;
  progressPercentage: number;
  isWizardCompleted: boolean;
  currentFocusStage: Stage | undefined;
  currentStageId: string;
  scrollToStageById: (stageId: string) => void;
}

/**
 * Hook for managing wizard UI state including progress, current stage, and scrolling
 */
export function useWizardUIState({
  instance,
  pageTitle,
  setPageTitle,
  setInstance,
}: UseWizardUIStateProps): UseWizardUIStateReturn {
  
  // Calculate progress
  const completedStagesCount = useMemo(() => {
    return instance.workflow.stages.filter(
      stage => instance.stageStates[stage.id]?.status === 'completed'
    ).length;
  }, [instance.workflow.stages, instance.stageStates]);

  const totalStages = useMemo(() => {
    return instance.workflow.stages.length;
  }, [instance.workflow.stages]);

  const progressPercentage = useMemo(() => {
    return totalStages > 0 ? (completedStagesCount / totalStages) * 100 : 0;
  }, [completedStagesCount, totalStages]);

  const isWizardCompleted = useMemo(() => {
    return completedStagesCount === totalStages;
  }, [completedStagesCount, totalStages]);

  // Find current focus stage
  const currentFocusStage = useMemo(() => {
    return instance.workflow.stages.find(
      s => {
        const state = instance.stageStates[s.id];
        return state && state.status !== 'completed' && state.depsAreMet !== false;
      }
    ) || instance.workflow.stages.find(s => instance.stageStates[s.id]?.depsAreMet === false) 
      || instance.workflow.stages.find(s => instance.stageStates[s.id]?.status === 'completed' && instance.stageStates[s.id]?.isStale === true && !instance.stageStates[s.id]?.staleDismissed)
      || instance.workflow.stages[instance.workflow.stages.length - 1];
  }, [instance.workflow.stages, instance.stageStates]);

  const currentStageId = useMemo(() => {
    return currentFocusStage?.id || instance.workflow.stages[0].id;
  }, [currentFocusStage, instance.workflow.stages]);

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

  // Effect to update page title based on stage output
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
  }, [instance.stageStates, instance.workflow.config?.setTitleFromStageOutput, setPageTitle, setInstance]);

  return {
    completedStagesCount,
    totalStages,
    progressPercentage,
    isWizardCompleted,
    currentFocusStage,
    currentStageId,
    scrollToStageById,
  };
}