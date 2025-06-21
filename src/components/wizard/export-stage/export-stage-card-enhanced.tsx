'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useExportJobStatus } from '@/hooks/use-export-job-progress';
import { ExportOptions } from './export-options';
import { ExportPreview } from './export-preview';
import { 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  RefreshCw 
} from 'lucide-react';
import type { Stage, StageState } from '@/types';

interface ExportStageCardEnhancedProps {
  stage: Stage;
  stageState: StageState;
  onRun: (stageId: string) => void;
  onRetry?: (stageId: string) => void;
  isRunning?: boolean;
  className?: string;
}

/**
 * Enhanced Export Stage Component with Job Progress System
 * 
 * This component uses the new job-based export system that:
 * - Eliminates RSC callback violations
 * - Survives page reloads and network interruptions
 * - Provides real-time progress updates via Firestore subscriptions
 * - Maintains clean separation between client and server logic
 */
export function ExportStageCardEnhanced({
  stage,
  stageState,
  onRun,
  onRetry,
  isRunning = false,
  className = ''
}: ExportStageCardEnhancedProps) {
  const { toast } = useToast();
  
  // Subscribe to export job progress
  const {
    jobState,
    isLoading: jobLoading,
    isRunning: jobRunning,
    isCompleted: jobCompleted,
    isError: jobError,
    progress,
    output: jobOutput,
    error: jobErrorMessage,
    retry: retryJobSubscription
  } = useExportJobStatus(stageState.exportJobId || null);

  // Determine the current state
  const effectiveStatus = jobState?.status || stageState.status;
  const effectiveProgress = progress || stageState.generationProgress;
  const effectiveOutput = jobOutput || stageState.output;
  const effectiveError = jobErrorMessage || stageState.error;

  // Update local stage state when job completes
  useEffect(() => {
    if (jobCompleted && jobOutput && stageState.status !== 'completed') {
      console.log('[ExportStageCardEnhanced] Job completed, updating stage state');
      
      // Note: In a real implementation, you'd want to update the stage state
      // through the parent component's state management system
      // This is a simplified example
      
      toast({
        title: "Export Complete",
        description: "Your content has been exported successfully!",
        variant: "default"
      });
    }
  }, [jobCompleted, jobOutput, stageState.status, toast]);

  // Handle retry
  const handleRetry = () => {
    if (onRetry) {
      onRetry(stage.id);
    } else {
      onRun(stage.id);
    }
    retryJobSubscription();
  };

  // Calculate overall progress
  const getOverallProgress = (): number => {
    if (!effectiveProgress) return 0;
    const { styledHtml = 0, cleanHtml = 0 } = effectiveProgress;
    return Math.round((styledHtml + cleanHtml) / 2);
  };

  // Render status badge
  const renderStatusBadge = () => {
    if (jobLoading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading...
        </Badge>
      );
    }

    switch (effectiveStatus) {
      case 'running':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Exporting...
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Complete
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Ready
          </Badge>
        );
    }
  };

  // Render progress section
  const renderProgress = () => {
    if (!effectiveProgress || effectiveStatus === 'idle') return null;

    const overallProgress = getOverallProgress();
    const { currentFormat = 'Processing...' } = effectiveProgress;

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{currentFormat}</span>
          <span className="font-medium">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        
        {effectiveProgress.styledHtml !== undefined && effectiveProgress.cleanHtml !== undefined && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Styled HTML: {effectiveProgress.styledHtml}%</div>
            <div>Clean HTML: {effectiveProgress.cleanHtml}%</div>
          </div>
        )}
      </div>
    );
  };

  // Render error section
  const renderError = () => {
    if (!effectiveError) return null;

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {effectiveError}
          {jobState && (
            <div className="mt-2 text-xs text-muted-foreground">
              Job ID: {jobState.jobId}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  // Render export results
  const renderExportResults = () => {
    if (effectiveStatus !== 'completed' || !effectiveOutput) return null;

    return (
      <div className="space-y-4">
        <ExportPreview
          output={effectiveOutput}
          exportConfig={stage.exportConfig}
        />
        <ExportOptions
          output={effectiveOutput}
          exportConfig={stage.exportConfig}
        />
      </div>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    const isCurrentlyRunning = isRunning || jobRunning || effectiveStatus === 'running';
    const canRun = stageState.depsAreMet !== false;
    const hasError = effectiveStatus === 'error';

    return (
      <div className="flex gap-2">
        {hasError ? (
          <Button
            onClick={handleRetry}
            disabled={isCurrentlyRunning}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Export
          </Button>
        ) : (
          <Button
            onClick={() => onRun(stage.id)}
            disabled={!canRun || isCurrentlyRunning}
            variant={stage.triggerButton?.variant || 'default'}
            size={stage.triggerButton?.size === 'large' ? 'lg' : 'sm'}
            className="flex items-center gap-2"
          >
            {isCurrentlyRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {stage.triggerButton?.label || 'Export & Publish'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className={`export-stage-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {stage.title}
          </CardTitle>
          {renderStatusBadge()}
        </div>
        {stage.description && (
          <p className="text-sm text-muted-foreground">
            {stage.description}
          </p>
        )}
        {stage.triggerButton?.description && (
          <p className="text-sm text-muted-foreground">
            {stage.triggerButton.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {renderProgress()}
        {renderError()}
        {renderExportResults()}
        {renderActionButtons()}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && jobState && (
          <details className="text-xs text-muted-foreground">
            <summary>Debug Info</summary>
            <pre className="mt-2 p-2 bg-muted rounded">
              {JSON.stringify({
                jobId: jobState.jobId,
                status: jobState.status,
                progress: jobState.progress,
                hasOutput: !!jobState.output,
                createdAt: jobState.createdAt,
                updatedAt: jobState.updatedAt
              }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
} 