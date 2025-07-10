"use client";

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Stage, StageState, Workflow, ExportStageState } from '@/types';

// Lazy load the main stage card component
const StageCard = React.lazy(() => import('./stage-card').then(module => ({ default: module.StageCard })));

// Loading component for stage card
function StageCardLoadingFallback({ stage }: { stage: Stage }) {
  return (
    <Card className="mb-4 border-border">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          {stage.title}
          {stage.isOptional && <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

interface StageCardLazyProps {
  stage: Stage;
  workflow: Workflow;
  stageState: StageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string, userInput?: any, aiRedoNotes?: string) => void;
  onInputChange: (stageId: string, fieldName: string, value: any) => void;
  onFormSubmit: (stageId: string, data: any) => void;
  onEditInputRequest: (stageId: string) => void;
  onOutputEdit: (stageId: string, newOutput: any) => void;
  onSetEditingOutput: (stageId: string, isEditing: boolean) => void;
  onDismissStaleWarning: (stageId: string) => void;
  allStageStates: Record<string, StageState>;
  documentId?: string;
  onUpdateStageState?: (stageId: string, updates: Partial<ExportStageState>) => void;
}

export function StageCardLazy(props: StageCardLazyProps) {
  // Show dependency message immediately without lazy loading
  if (props.stageState.depsAreMet === false && props.stage.dependencies && props.stage.dependencies.length > 0) {
    const incompleteDeps = props.stage.dependencies
      .filter(depId => props.allStageStates[depId]?.status !== 'completed')
      .map(depId => props.workflow.stages.find(s => s.id === depId)?.title || depId);
    
    if (incompleteDeps.length > 0) {
      return (
        <Card className="mb-4 opacity-60">
          <div className="px-6 pt-4 pb-2 text-center">
            <Badge variant="secondary" className="text-sm whitespace-normal">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Waiting for: {incompleteDeps.join(', ')}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center">
              {props.stage.title}
              {props.stage.isOptional && <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete the required stages above to unlock this stage.
            </p>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Suspense fallback={<StageCardLoadingFallback stage={props.stage} />}>
      <StageCard {...props} />
    </Suspense>
  );
}