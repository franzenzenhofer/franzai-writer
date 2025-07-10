import type { 
  AIProgressStep, 
  AIStageExecution, 
  AIStepExecution, 
  AIOperationType
} from '@/types';
import { AI_PROGRESS_STEPS } from '@/types';

export class ProgressManager {
  private stageId: string;
  private operationType: AIOperationType;
  private steps: AIProgressStep[];
  private currentStepIndex: number = 0;
  private startTime: number = 0;
  private stepStartTime: number = 0;
  private stageHistory: AIStageExecution[] = [];
  private executionId: string;
  private stepExecutions: AIStepExecution[] = [];
  private onProgressUpdate?: (progress: any) => void;
  
  constructor(
    stageId: string,
    operationType: AIOperationType,
    stageHistory: AIStageExecution[] = [],
    onProgressUpdate?: (progress: any) => void
  ) {
    this.stageId = stageId;
    this.operationType = operationType;
    this.steps = [...AI_PROGRESS_STEPS[operationType]];
    this.stageHistory = stageHistory;
    this.onProgressUpdate = onProgressUpdate;
    this.executionId = `${stageId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  start(): void {
    this.startTime = Date.now();
    this.stepStartTime = this.startTime;
    this.currentStepIndex = 0;
    this.stepExecutions = [];
    
    this.updateProgress();
  }
  
  nextStep(stepDetails?: string): void {
    // Complete current step
    if (this.currentStepIndex < this.steps.length) {
      const currentStep = this.steps[this.currentStepIndex];
      const stepExecution: AIStepExecution = {
        stepId: currentStep.id,
        startTime: this.stepStartTime,
        endTime: Date.now(),
        duration: Date.now() - this.stepStartTime,
        success: true,
        details: stepDetails
      };
      this.stepExecutions.push(stepExecution);
    }
    
    // Move to next step
    this.currentStepIndex++;
    this.stepStartTime = Date.now();
    
    this.updateProgress(stepDetails);
  }
  
  getStageHistory(): AIStageExecution[] {
    return this.stageHistory;
  }
  
  complete(success: boolean = true, error?: string): void {
    const endTime = Date.now();
    
    // Complete final step if not already completed
    if (this.currentStepIndex < this.steps.length) {
      const currentStep = this.steps[this.currentStepIndex];
      const stepExecution: AIStepExecution = {
        stepId: currentStep.id,
        startTime: this.stepStartTime,
        endTime: endTime,
        duration: endTime - this.stepStartTime,
        success: success,
        error: error
      };
      this.stepExecutions.push(stepExecution);
    }
    
    // Create stage execution record
    const stageExecution: AIStageExecution = {
      stageId: this.stageId,
      executionId: this.executionId,
      startTime: this.startTime,
      endTime: endTime,
      duration: endTime - this.startTime,
      success: success,
      steps: this.stepExecutions,
      error: error
    };
    
    // Update history
    this.stageHistory.push(stageExecution);
    
    // Final progress update
    this.updateProgress(undefined, true);
  }
  
  private updateProgress(stepDetails?: string, completed: boolean = false): void {
    const currentStep = this.steps[this.currentStepIndex];
    const elapsedTime = Date.now() - this.startTime;
    
    // Calculate progress percentage based on step weights
    let progressPercentage = 0;
    let totalWeight = 0;
    
    this.steps.forEach((step, index) => {
      const weight = step.weight || 1 / this.steps.length;
      totalWeight += weight;
      
      if (index < this.currentStepIndex) {
        progressPercentage += weight;
      } else if (index === this.currentStepIndex && !completed) {
        // Add partial progress for current step based on elapsed time
        const stepElapsed = Date.now() - this.stepStartTime;
        const stepEstimated = step.estimatedDuration || 2000;
        const stepProgress = Math.min(stepElapsed / stepEstimated, 0.9); // Don't complete until explicitly moved
        progressPercentage += weight * stepProgress;
      }
    });
    
    progressPercentage = Math.min((progressPercentage / totalWeight) * 100, completed ? 100 : 95);
    
    // Estimate remaining time
    const estimatedTimeRemaining = this.estimateRemainingTime();
    
    const progress = {
      currentStep,
      totalSteps: this.steps.length,
      completedSteps: this.currentStepIndex,
      progressPercentage,
      estimatedTimeRemaining,
      startTime: this.startTime,
      stepStartTime: this.stepStartTime,
      stepDetails,
      elapsedTime,
      stageHistory: this.stageHistory
    };
    
    this.onProgressUpdate?.(progress);
  }
  
  private estimateRemainingTime(): number {
    // Use historical data if available
    const historicalAverage = this.getHistoricalAverage();
    if (historicalAverage) {
      const elapsedTime = Date.now() - this.startTime;
      const estimatedTotal = historicalAverage;
      return Math.max(0, estimatedTotal - elapsedTime);
    }
    
    // Use step-based estimation
    let remainingTime = 0;
    
    for (let i = this.currentStepIndex; i < this.steps.length; i++) {
      const step = this.steps[i];
      const stepEstimated = step.estimatedDuration || 2000;
      
      if (i === this.currentStepIndex) {
        // For current step, subtract elapsed time
        const stepElapsed = Date.now() - this.stepStartTime;
        remainingTime += Math.max(0, stepEstimated - stepElapsed);
      } else {
        // For future steps, add full estimated duration
        remainingTime += stepEstimated;
      }
    }
    
    return remainingTime;
  }
  
  private getHistoricalAverage(): number | null {
    if (this.stageHistory.length === 0) return null;
    
    const successfulExecutions = this.stageHistory.filter(
      execution => execution.success && execution.duration
    );
    
    if (successfulExecutions.length === 0) return null;
    
    // Weight recent executions more heavily
    const weights = successfulExecutions.map((_, index) => {
      const recency = index / successfulExecutions.length;
      return 0.5 + 0.5 * recency; // Range from 0.5 to 1.0
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const weightedSum = successfulExecutions.reduce((sum, execution, index) => {
      return sum + (execution.duration || 0) * weights[index];
    }, 0);
    
    return weightedSum / totalWeight;
  }
  
  // Static helper methods
  static getOperationType(stage: any): AIOperationType {
    if (stage.stageType === 'export') {
      return 'EXPORT_GENERATION';
    } else if (stage.outputType === 'image') {
      return 'IMAGE_GENERATION';
    } else if (stage.thinkingSettings?.enabled) {
      return 'THINKING_GENERATION';
    } else {
      return 'TEXT_GENERATION';
    }
  }
  
  static loadStageHistory(stageId: string): AIStageExecution[] {
    try {
      const key = `ai-progress-history-${stageId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const history = JSON.parse(stored);
        // Keep only last 10 executions
        return history.slice(-10);
      }
    } catch (error) {
      console.warn('Failed to load stage history:', error);
    }
    return [];
  }
  
  static saveStageHistory(stageId: string, history: AIStageExecution[]): void {
    try {
      const key = `ai-progress-history-${stageId}`;
      // Keep only last 10 executions
      const trimmedHistory = history.slice(-10);
      localStorage.setItem(key, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.warn('Failed to save stage history:', error);
    }
  }
}