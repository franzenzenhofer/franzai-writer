"use client";

import type { Stage, StageState, Workflow, ExportStageState } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Sparkles, Loader2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { ExportPreview } from "./export-preview";
import { ExportOptions } from "./export-options";
import { PublishDialog } from "./publish-dialog";

interface ExportStageCardProps {
  stage: Stage;
  workflow: Workflow;
  stageState: ExportStageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string) => void;
  allStageStates: Record<string, StageState>;
  onUpdateStageState?: (stageId: string, updates: Partial<ExportStageState>) => void;
}

export function ExportStageCard({
  stage,
  workflow,
  stageState,
  isCurrentStage,
  onRunStage,
  allStageStates,
  onUpdateStageState,
}: ExportStageCardProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  
  const getDependencyMessage = () => {
    if (stageState.depsAreMet === false && stage.dependencies && stage.dependencies.length > 0) {
      const incompleteDeps = stage.dependencies
        .filter(depId => allStageStates[depId]?.status !== 'completed')
        .map(depId => workflow.stages.find(s => s.id === depId)?.title || depId);
      
      if (incompleteDeps.length > 0) {
        return `Waiting for: ${incompleteDeps.join(', ')}`;
      }
    }
    return null;
  };
  
  const dependencyMessage = getDependencyMessage();
  const canRun = stageState.depsAreMet !== false && stageState.status !== "running";
  const isReady = stageState.status === "completed" && stageState.output?.htmlStyled;
  
  let statusIcon = null;
  let cardClasses = "mb-6 transition-all duration-300 min-h-[400px]";
  
  switch (stageState.status) {
    case "completed":
      statusIcon = <CheckCircle2 className="text-green-500" />;
      cardClasses = cn(cardClasses, "border-green-500");
      break;
    case "running":
      statusIcon = <Loader2 className="animate-spin text-primary" />;
      cardClasses = cn(cardClasses, "border-primary");
      break;
    case "error":
      statusIcon = <AlertCircle className="text-destructive" />;
      cardClasses = cn(cardClasses, "border-destructive");
      break;
    default: // idle
      if (stageState.depsAreMet === false) {
        cardClasses = cn(cardClasses, "opacity-70 bg-muted/30");
      } else if (isCurrentStage) {
        cardClasses = cn(cardClasses, "border-accent shadow-lg");
      } else {
        cardClasses = cn(cardClasses, "border-border");
      }
  }
  
  // Hero treatment for export stage
  if (stage.showAsHero) {
    cardClasses = cn(cardClasses, "bg-gradient-to-br from-background to-muted/20");
  }
  
  return (
    <>
      <Card 
        id={`stage-${stage.id}`} 
        data-testid={`stage-card-${stage.id}`}
        className={cardClasses}
      >
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl flex items-center justify-center">
            {statusIcon && !dependencyMessage && <span className="mr-2">{statusIcon}</span>}
            {stage.title}
          </CardTitle>
          <CardDescription className="text-base">{stage.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {dependencyMessage && (
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {dependencyMessage}
              </Badge>
            </div>
          )}
          
          {stageState.status === "idle" && !dependencyMessage && (
            <div className="text-center space-y-6 py-8">
              <p className="text-muted-foreground">
                Ready to transform your content into professional formats and share it with the world?
              </p>
              
              <Button
                size="lg"
                onClick={() => onRunStage(stage.id)}
                disabled={!canRun}
                className="mx-auto"
                id={`trigger-export-${stage.id}`}
                data-testid={`trigger-export-${stage.id}`}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {stage.triggerButton?.label || "Export & Publish"}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">What you&apos;ll get:</p>
                <ul className="space-y-1">
                  <li>• Professional HTML (styled &amp; clean)</li>
                  <li>• Markdown for GitHub/Notion</li>
                  <li>• PDF &amp; Word documents (based on clean HTML)</li>
                  <li>• Instant web publishing (HTML &amp; Markdown only)</li>
                </ul>
              </div>
            </div>
          )}
          
          {stageState.status === "running" && (
            <div className="space-y-4">
              <h4 className="text-center font-semibold">Creating Your Exports...</h4>
              
              {stageState.generationProgress?.styledHtml !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating styled HTML...</span>
                    <span>{Math.round(stageState.generationProgress.styledHtml)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stageState.generationProgress.styledHtml}%` }}
                    />
                  </div>
                </div>
              )}
              
              {stageState.generationProgress?.cleanHtml !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Creating clean HTML...</span>
                    <span>{Math.round(stageState.generationProgress.cleanHtml)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stageState.generationProgress.cleanHtml}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isReady && (
            <div className="space-y-6">
              <ExportPreview 
                htmlStyled={stageState.output.htmlStyled}
                htmlClean={stageState.output.htmlClean}
              />
              
              <ExportOptions
                formats={stageState.output.formats}
                exportConfig={stage.exportConfig}
                onPublish={() => setShowPublishDialog(true)}
              />
              
              {stageState.output.publishing?.publishedUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Published Successfully!</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-green-700">Your content is now available at:</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white px-3 py-2 rounded border text-sm font-mono">
                          {stageState.output.publishing.shortUrl || stageState.output.publishing.publishedUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(stageState.output.publishing?.shortUrl || stageState.output.publishing?.publishedUrl || '');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {stageState.output.publishing.publishedFormats && (
                        <p className="text-xs text-green-600">
                          Published formats: {stageState.output.publishing.publishedFormats.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {stageState.status === "error" && stageState.error && (
            <div className="text-center space-y-4">
              <p className="text-destructive">{stageState.error}</p>
              <Button
                variant="outline"
                onClick={() => onRunStage(stage.id)}
                id={`retry-export-${stage.id}`}
              >
                Retry Export
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {showPublishDialog && (
        <PublishDialog
          isOpen={showPublishDialog}
          onClose={() => setShowPublishDialog(false)}
          documentId={workflow.id}
          formats={stageState.output.formats}
          publishingConfig={stage.exportConfig?.publishing}
          onPublishComplete={(result) => {
            // Update stage state with publishing information
            if (onUpdateStageState) {
              onUpdateStageState(stage.id, {
                output: {
                  ...stageState.output,
                  publishing: {
                    publishedUrl: result.publishedUrl,
                    shortUrl: result.shortUrl,
                    qrCodeUrl: result.qrCodeUrl,
                    publishedAt: new Date(),
                    publishedFormats: result.publishedFormats || ['html-styled'],
                  },
                },
              });
            }
            // Don't close dialog immediately - let user see the results first
            // Dialog will close when user clicks "Done" button
          }}
        />
      )}
    </>
  );
}