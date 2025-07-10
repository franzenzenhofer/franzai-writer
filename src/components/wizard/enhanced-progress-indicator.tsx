"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Activity, CheckCircle2, Loader2 } from 'lucide-react';
import type { AIProgressStep, AIStageExecution } from '@/types';

interface EnhancedProgressIndicatorProps {
  isRunning: boolean;
  currentStep?: AIProgressStep;
  totalSteps?: number;
  completedSteps?: number;
  progressPercentage?: number;
  estimatedTimeRemaining?: number;
  elapsedTime?: number;
  stepDetails?: string;
  stageHistory?: AIStageExecution[];
  className?: string;
  compact?: boolean;
}

function formatTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds / 100) / 10}s`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${seconds}s`;
}

function getEstimatedTimeFromHistory(
  stageHistory: AIStageExecution[] | undefined,
  currentStep: AIProgressStep | undefined
): number | null {
  if (!stageHistory || !currentStep) return null;
  
  // Find similar executions
  const similarExecutions = stageHistory.filter(
    execution => execution.success && execution.duration
  );
  
  if (similarExecutions.length === 0) return null;
  
  // Calculate average duration
  const avgDuration = similarExecutions.reduce(
    (sum, exec) => sum + (exec.duration || 0),
    0
  ) / similarExecutions.length;
  
  return avgDuration;
}

export function EnhancedProgressIndicator({
  isRunning,
  currentStep,
  totalSteps = 4,
  completedSteps = 0,
  progressPercentage = 0,
  estimatedTimeRemaining,
  elapsedTime,
  stepDetails,
  stageHistory,
  className = "",
  compact = false
}: EnhancedProgressIndicatorProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Smooth progress animation
  useEffect(() => {
    if (!isRunning) {
      setDisplayProgress(0);
      return;
    }
    
    const targetProgress = Math.min(progressPercentage, 95); // Don't go to 100% until complete
    const difference = Math.abs(targetProgress - displayProgress);
    
    if (difference < 1) return;
    
    const animationDuration = Math.min(difference * 20, 1000); // Smooth animation
    setAnimationSpeed(animationDuration / 1000);
    
    const startProgress = displayProgress;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newProgress = startProgress + (targetProgress - startProgress) * easeOut;
      
      setDisplayProgress(newProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [progressPercentage, displayProgress, isRunning]);
  
  // Complete animation when stopping
  useEffect(() => {
    if (!isRunning && displayProgress > 0) {
      setDisplayProgress(100);
      setTimeout(() => setDisplayProgress(0), 300);
    }
  }, [isRunning, displayProgress]);
  
  // Historical time estimate
  const historicalEstimate = getEstimatedTimeFromHistory(stageHistory, currentStep);
  const timeEstimate = estimatedTimeRemaining || historicalEstimate;
  
  if (!isRunning && displayProgress === 0) {
    return null;
  }
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Progress value={displayProgress} className="flex-1 h-2" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
          {currentStep && (
            <span className="whitespace-nowrap">{currentStep.name}</span>
          )}
          {timeEstimate && (
            <span className="text-muted-foreground">
              · {formatTime(timeEstimate)}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card className={cn("border-0 shadow-none bg-muted/30", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">AI Processing</h4>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <Badge variant="secondary" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Running
              </Badge>
            )}
            {timeEstimate && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeEstimate)}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={displayProgress} 
            className="h-2"
            style={{
              transition: `width ${animationSpeed * 200}ms ease-out`
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {completedSteps} of {totalSteps} steps
            </span>
            <span>
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>
        
        {/* Current Step */}
        {currentStep && (
          <div className="flex items-start gap-2">
            <div className="mt-1">
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{currentStep.name}</span>
                {elapsedTime && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(elapsedTime)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stepDetails || currentStep.description}
              </p>
            </div>
          </div>
        )}
        
        {/* Historical Performance Indicator */}
        {stageHistory && stageHistory.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Based on {stageHistory.length} previous execution{stageHistory.length !== 1 ? 's' : ''}
              </span>
              {historicalEstimate && (
                <span>
                  Avg: {formatTime(historicalEstimate)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}