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
import { UpdateRecommendedButton } from "../update-recommended-button";
import { StageInfoTrigger } from "../stage-info-overlay";
import { CheckCheck } from "lucide-react";

// Enhanced error display component with copy functionality
function ExportStageErrorDisplay({ error, stageTitle }: { error: string; stageTitle: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyError = async () => {
    try {
      // Create a more meaningful error message for copying
      const errorReport = `Export Stage Error Report
Stage: ${stageTitle}
Timestamp: ${new Date().toLocaleString()}
Error: ${error}

Technical Details:
- This error occurred during export processing
- Check browser console for additional details
- Consider refreshing the page if the error persists`;

      await navigator.clipboard.writeText(errorReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Silent copy - visual feedback is enough
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy error details",
        variant: "destructive",
      });
    }
  };

  // Make error message more user-friendly
  const getUserFriendlyError = (error: string): { message: string; isTemplate: boolean } => {
    if (error.includes('Template substitution incomplete') || error.includes('Template variables not found')) {
      return {
        message: "Template variable error: Required data from previous stages is missing or invalid. This usually means a dependency stage didn't complete properly.",
        isTemplate: true
      };
    }
    if (error.includes('Export failed') || error.includes('failed to generate')) {
      return {
        message: "Export generation failed: Unable to create the export formats. This could be due to missing content or a system error.",
        isTemplate: false
      };
    }
    if (error.includes('Publishing failed') || error.includes('Unable to publish')) {
      return {
        message: "Publishing failed: Unable to publish your content online. Check your internet connection and try again.",
        isTemplate: false
      };
    }
    if (error.includes('Network') || error.includes('fetch')) {
      return {
        message: "Network error: Unable to connect to the export service. Check your internet connection and try again.",
        isTemplate: false
      };
    }
    return {
      message: error,
      isTemplate: false
    };
  };

  const { message, isTemplate } = getUserFriendlyError(error);

  return (
    <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5 space-y-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-destructive font-medium text-sm">Export Error</p>
          <p className="text-destructive text-sm leading-relaxed">{message}</p>
          {isTemplate && (
            <p className="text-muted-foreground text-xs">
              💡 Tip: Try running previous stages again or check that all required form fields were completed.
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopyError}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title="Copy error details"
        >
          {copied ? <CheckCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

interface ExportStageCardProps {
  stage: Stage;
  workflow: Workflow;
  stageState: ExportStageState;
  isCurrentStage: boolean;
  onRunStage: (stageId: string) => void;
  allStageStates: Record<string, StageState>;
  onUpdateStageState?: (stageId: string, updates: Partial<ExportStageState>) => void;
  onDismissStaleWarning?: (stageId: string) => void;
  documentId?: string;
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
  documentId,
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
      if (stageState.output.publishing.publishedFormats?.length) {
        setSelectedFormats(stageState.output.publishing.publishedFormats);
      }
    } else {
      setPublishedData(null);
    }
  }, [stageState.output?.publishing]);

  const handleCopy = async (url: string, format: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
      
      // Silent copy - visual feedback is enough
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
          documentId: documentId || workflow.id, // Use actual document ID if available
          workflowId: workflow.id,
          formats: selectedFormats,
          content: stageState.output.formats,
          options: {},
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Publishing failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Publishing failed: ${response.status} ${response.statusText}`;
        } catch {
          errorMessage = `Publishing failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

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
  /**
   * A stage is considered "ready" (i.e. export completed successfully) when the
   * backend has produced at least one usable representation of the styled HTML.
   *
   * Historically the backend returned the full HTML string in `output.htmlStyled`.
   * After the storage-upload refactor it now returns only storage/public URLs and
   * places the readiness flag inside `output.formats['html-styled'].ready`.
   *
   * To stay backwards-compatible *and* support the new contract we treat the
   * stage as ready when **any** of the following is true:
   *   1. `output.htmlStyled`  – legacy inline content
   *   2. `output.htmlStyledUrl` – new storage URL
   *   3. `output.formats['html-styled'].ready === true` – new format map flag
   */
  const isReady =
    stageState.status === "completed" &&
    (
      !!stageState.output?.htmlStyled ||
      !!stageState.output?.htmlStyledUrl ||
      !!stageState.output?.formats?.["html-styled"]?.ready
    );

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
          <div className="flex-1 min-w-0">
            <CardTitle className="font-headline text-xl flex items-center">
              {statusIcon && !dependencyMessage && <span className="mr-2">{statusIcon}</span>}
              {stage.title}
            </CardTitle>
            <CardDescription>{stage.description}</CardDescription>
          </div>
          <div className="flex-shrink-0 ml-2 flex items-center gap-2">
            {isStale && (
              <UpdateRecommendedButton
                onRegenerate={handleRegenerate}
                size="sm"
              />
            )}
            <StageInfoTrigger stage={stage} workflow={workflow} />
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
                  onClick={() => {
                    console.log('🚨🚨🚨 [ExportStageCard] EXPORT BUTTON CLICKED - Stage ID:', stage.id);
                    console.log('🚨🚨🚨 [ExportStageCard] Calling onRunStage with stage ID:', stage.id);
                    onRunStage(stage.id);
                  }}
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
                /*
                 * Provide both legacy and new data sources so the preview works
                 * regardless of how the backend populated the state.
                 */
                htmlStyled={
                  stageState.output.htmlStyled ||
                  stageState.output.formats?.["html-styled"]?.content
                }
                htmlClean={
                  stageState.output.htmlClean ||
                  stageState.output.formats?.["html-clean"]?.content
                }
                htmlStyledUrl={
                  stageState.output.htmlStyledUrl ||
                  stageState.output.formats?.["html-styled"]?.url
                }
                htmlCleanUrl={
                  stageState.output.htmlCleanUrl ||
                  stageState.output.formats?.["html-clean"]?.url
                }
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
            <div className="space-y-4">
              <ExportStageErrorDisplay error={stageState.error} stageTitle={stage.title} />
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => onRunStage(stage.id)}
                  id={`retry-export-${stage.id}`}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Export
                </Button>
              </div>
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