"use client";

import type { Stage, StageState, Workflow, ExportStageState } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Sparkles, Loader2, Globe, Check, Copy, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { ExportPreview } from "./export-preview";
import { ExportOptions } from "./export-options";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DismissibleWarningBadge } from "../dismissible-warning-badge";

interface ExportStageCardProps {
  stage: Stage;
  workflow: Workflow;
  stageState: ExportStageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string) => void;
  allStageStates: Record<string, StageState>;
  onUpdateStageState?: (stageId: string, updates: Partial<ExportStageState>) => void;
  onDismissStaleWarning?: (stageId: string) => void;
}

interface PublishedData {
  publishedUrl: string; // This will now be the base URL
  publishedFormats?: string[];
}

export function ExportStageCard({
  stage,
  workflow,
  stageState,
  isCurrentStage,
  onRunStage,
  allStageStates,
  onUpdateStageState,
  onDismissStaleWarning,
}: ExportStageCardProps) {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState<PublishedData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Publishing options
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['html-styled']);

  // Handle regeneration for stale exports
  const handleRegenerate = () => {
    onRunStage(stage.id);
  };

  useEffect(() => {
    if (stageState.output?.publishing?.publishedUrl) {
      setPublishedData({
        publishedUrl: stageState.output.publishing.publishedUrl,
        publishedFormats: stageState.output.publishing.publishedFormats,
      });
    } else {
      setPublishedData(null);
    }
  }, [stageState.output?.publishing]);

  const handleCopy = async (url: string, format: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
      
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: workflow.id,
          formats: selectedFormats,
          content: stageState.output.formats,
          options: {},
        }),
      });

      if (!response.ok) throw new Error('Publishing failed');

      const result = await response.json();
      
      const newPublishedData = {
        publishedUrl: result.publishedUrl,
        publishedFormats: selectedFormats,
      };

      setPublishedData(newPublishedData);

      if (onUpdateStageState) {
        onUpdateStageState(stage.id, {
          output: {
            ...stageState.output,
            publishing: {
              ...stageState.output.publishing,
              ...newPublishedData
            },
          },
        });
      }

      toast({
        title: "Published!",
        description: "Your content is now available online",
      });
    } catch (error) {
      console.error('Publishing error:', error);
      toast({
        title: "Publishing failed",
        description: "Unable to publish your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

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

  // Check if stage is stale (dependencies have changed)
  const isStale = stageState.isStale && stageState.status === 'completed' && !stageState.staleDismissed;
  
  const publishableFormats = ['html-styled', 'html-clean', 'markdown'];
  const availableFormats = Object.entries(stageState.output?.formats || {})
    .filter(([format, state]) => state.ready && publishableFormats.includes(format))
    .map(([format]) => format);

  const formatLabels: Record<string, string> = {
    'html-styled': 'Styled HTML',
    'html-clean': 'Clean HTML',
    'markdown': 'Markdown',
  };

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
        <CardHeader className="flex flex-row justify-between items-start pb-4 pt-2">
          <div>
            <CardTitle className="font-headline text-xl flex items-center">
              {statusIcon && !dependencyMessage && <span className="mr-2">{statusIcon}</span>}
              {stage.title}
              {isStale && (
                <DismissibleWarningBadge
                  onDismiss={() => onDismissStaleWarning?.(stage.id)}
                  onClick={handleRegenerate}
                  className="ml-2"
                >
                  Update recommended
                </DismissibleWarningBadge>
              )}
            </CardTitle>
            <CardDescription>{stage.description}</CardDescription>
          </div>
        </CardHeader>
        
        {dependencyMessage && (
          <div className="px-6 pt-4 pb-2 text-center">
            <Badge variant="secondary" className="text-sm whitespace-normal">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              {dependencyMessage}
            </Badge>
          </div>
        )}
        
        <CardContent className="space-y-4">
          
          {stageState.status === "idle" && !dependencyMessage && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Ready to transform your content into professional formats and share it with the world?
              </p>
              
              <div className="flex justify-start">
                <Button
                  size="lg"
                  onClick={() => onRunStage(stage.id)}
                  disabled={!canRun}
                  id={`trigger-export-${stage.id}`}
                  data-testid={`trigger-export-${stage.id}`}
                >
                  {stage.triggerButton?.label || "Export & Publish"}
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">What you&apos;ll get:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Professional HTML (styled &amp; clean)</li>
                  <li>Markdown for GitHub/Notion</li>
                  <li>PDF &amp; Word documents (based on clean HTML)</li>
                  <li>Instant web publishing (HTML &amp; Markdown only)</li>
                </ul>
              </div>
            </div>
          )}
          
          {stageState.status === "running" && (
            <div className="space-y-4">
              <h4 className="font-semibold">Creating Your Exports...</h4>
              
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
            <div className="space-y-4">
              <ExportPreview
                htmlStyled={stageState.output.htmlStyled}
                htmlClean={stageState.output.htmlClean}
                defaultView={stage.exportConfig?.styling?.defaultView || 'clean'}
              />
              
              <ExportOptions
                formats={stageState.output.formats}
                exportConfig={stage.exportConfig}
              />

              {stage.exportConfig?.publishing?.enabled && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-start gap-2">
                      <Globe className="h-5 w-5" />
                      Publish to Web
                    </CardTitle>
                    <CardDescription>
                      Share your content with a permanent, shareable link
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-3">
                          <Label>Select formats to publish:</Label>
                          {availableFormats.map((format) => (
                            <div key={format} className="flex items-center space-x-2">
                              <Checkbox
                                id={`publish-${format}`}
                                checked={selectedFormats.includes(format)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedFormats([...selectedFormats, format]);
                                  } else {
                                    setSelectedFormats(selectedFormats.filter(f => f !== format));
                                  }
                                }}
                              />
                              <Label htmlFor={`publish-${format}`} className="cursor-pointer font-normal">
                                {format === 'html-styled' && 'Styled HTML'}
                                {format === 'html-clean' && 'Clean HTML'}
                                {format === 'markdown' && 'Markdown'}
                              </Label>
                            </div>
                          ))}
                        </div>
            
                        <Button
                          onClick={handlePublish}
                          disabled={isPublishing || selectedFormats.length === 0}
                          className="w-full"
                        >
                          {isPublishing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            <>
                              <Globe className="mr-2 h-4 w-4" />
                              {publishedData ? "Update Publication" : "Publish Now"}
                            </>
                          )}
                        </Button>
                    </div>

                    {publishedData && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3 mt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">Published Successfully!</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-sm text-green-700">Your content is now available at:</p>
                          
                          <div className="space-y-2">
                            {publishedData.publishedFormats && publishedData.publishedFormats.map(format => (
                              <div key={format} className="flex items-center gap-3 p-3 bg-white rounded border">
                                <div className="w-24 shrink-0 text-sm font-medium text-gray-700">
                                  {formatLabels[format] || format}:
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a 
                                    href={`${publishedData.publishedUrl}/${format}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-sm font-mono break-all block"
                                  >
                                    {`${publishedData.publishedUrl}/${format}`}
                                  </a>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopy(`${publishedData.publishedUrl}/${format}`, format)}
                                  className="shrink-0 h-8 w-8 p-0"
                                >
                                  {copied === format ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
        
        {/* CardFooter like other stage cards - Always show regenerate when ready */}
        {isReady && !dependencyMessage && (
          <CardFooter className="flex justify-end gap-2 items-center flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRegenerate}
              id={`regenerate-${stage.id}`}
              data-testid={`regenerate-${stage.id}`}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Regenerate Exports
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  );
}