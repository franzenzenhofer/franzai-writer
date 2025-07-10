"use client";

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Stage, StageState, Workflow, ExportStageState } from '@/types';

// Lazy load the export stage card component
const ExportStageCard = React.lazy(() => import('./export-stage-card').then(module => ({ default: module.ExportStageCard })));

// Loading component for export stage card
function ExportStageCardLoadingFallback({ stage }: { stage: Stage }) {
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="h-4 w-4" />
          <span>Loading export options...</span>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExportStageCardLazyProps {
  stage: Stage;
  workflow: Workflow;
  stageState: ExportStageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string, userInput?: any, aiRedoNotes?: string) => void;
  allStageStates: Record<string, StageState>;
  onDismissStaleWarning: (stageId: string) => void;
  onUpdateStageState?: (stageId: string, updates: Partial<ExportStageState>) => void;
  documentId?: string;
}

export function ExportStageCardLazy(props: ExportStageCardLazyProps) {
  return (
    <Suspense fallback={<ExportStageCardLoadingFallback stage={props.stage} />}>
      <ExportStageCard {...props} />
    </Suspense>
  );
}