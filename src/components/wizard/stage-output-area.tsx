"use client";

import type { Stage, StageState, Workflow } from "@/types";
import { JsonRenderer } from "@/components/json-renderer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { WysiwygEditor } from "./wysiwyg-editor";
import { HtmlPreview } from "./html-preview";
import { GroundingSourcesDisplay } from "./grounding-sources-display";
import { FunctionCallsDisplay } from "./function-calls-display";
import { CodeExecutionDisplay } from "./code-execution-display";
// Button and Save icon removed as they are now handled by StageCard
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";


interface StageOutputAreaProps {
  stage: Stage;
  stageState: StageState;
  workflow: Workflow;
  isEditingOutput: boolean;
  onOutputChange?: (newOutput: any) => void;
}

export function StageOutputArea({ stage, stageState, workflow, isEditingOutput, onOutputChange }: StageOutputAreaProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Prevent hydration issues by checking if we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't render anything during SSR/hydration to prevent stacking
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Determine if thinking should be shown based on stage and workflow configuration
  const shouldShowThinking = () => {
    // Stage-level setting takes precedence
    if (stage.showThinking !== undefined) {
      return stage.showThinking;
    }
    // Fall back to workflow-level setting
    if (workflow.config?.showThinking !== undefined) {
      return workflow.config.showThinking;
    }
    // Default to false
    return false;
  };

  const handleCopy = async () => {
    if (stageState.output) {
      try {
        let textToCopy = '';
        
        // Handle different output types
        if (stage.outputType === 'json' && typeof stageState.output === 'object') {
          // If jsonFields is configured, convert to markdown format
          if (stage.jsonFields && stage.jsonFields.length > 0) {
            // Sort fields by displayOrder
            const sortedFields = [...stage.jsonFields].sort((a, b) => {
              const orderA = a.displayOrder ?? 999;
              const orderB = b.displayOrder ?? 999;
              return orderA - orderB;
            });
            
            // Build text output with values only
            const textParts = sortedFields
              .map(field => {
                const value = stageState.output[field.key];
                return value || null;
              })
              .filter(Boolean);
            
            // Join with double newlines for readability
            textToCopy = textParts.join('\n\n');
          } else {
            // For other JSON outputs without jsonFields, stringify it
            textToCopy = JSON.stringify(stageState.output, null, 2);
          }
        } else {
          // For text/markdown, copy as is
          textToCopy = String(stageState.output);
        }
        
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Content copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  // If chat is enabled, the primary display is the chat history.
  // The final "output" field might be used for a summary or not at all for chat.
  if (stage.chatEnabled) {
    if (!stageState.chatHistory || stageState.chatHistory.length === 0) {
      if (stageState.status === "running") {
        return <p className="text-sm text-muted-foreground">AI is thinking...</p>;
      }
      return <p className="text-sm text-muted-foreground">No messages yet. Send a message to start the chat.</p>;
    }
    // Render chat history (simplified rendering for now)
    return (
      <div className="space-y-4">
        {stageState.chatHistory.map((msg, index) => (
          <div key={index} className={cn("p-3 rounded-lg shadow-sm", msg.role === 'user' ? 'bg-secondary text-secondary-foreground ml-auto max-w-[80%]' : 'bg-muted text-muted-foreground mr-auto max-w-[80%]')}>
            <p className="text-xs font-semibold mb-1 capitalize">{msg.role}</p>
            {/* Render message parts - assuming parts are simple text for now */}
            {msg.parts.map((part, pIndex) => (
              <React.Fragment key={pIndex}>
                {part.text && <MarkdownRenderer content={part.text} />}
                {/* TODO: Add rendering for other part types like images, fileData if they appear in chat history parts */}
              </React.Fragment>
            ))}
          </div>
        ))}
        {stageState.status === "running" && stageState.currentStreamOutput && (
           <div className={cn("p-3 rounded-lg shadow-sm animate-pulse", 'bg-muted text-muted-foreground mr-auto max-w-[80%]')}>
             <p className="text-xs font-semibold mb-1 capitalize">Model</p>
             <MarkdownRenderer content={stageState.currentStreamOutput + "..."} /> {/* Show streaming output */}
           </div>
        )}
         {stageState.status === "running" && !stageState.currentStreamOutput && (
            <p className="text-sm text-muted-foreground">AI is thinking...</p>
        )}
      </div>
    );
  }

  // Original logic for non-chat stages:
  if (stageState.status !== "completed" || stageState.output === undefined || stageState.output === null) {
    if (stageState.status === "running") {
      return <p className="text-sm text-muted-foreground">AI is generating output...</p>;
    }
    // For non-chat, if not completed and no output, show "No output yet"
    return <p className="text-sm text-muted-foreground">No output yet for this stage.</p>;
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onOutputChange) {
      onOutputChange(event.target.value);
    }
  };

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
     if (onOutputChange) {
      try {
        const parsedJson = JSON.parse(event.target.value);
        onOutputChange(parsedJson);
      } catch (e) {
        onOutputChange(event.target.value); 
      }
    }
  };

  const handleJsonFieldChange = (fieldKey: string, value: string) => {
    if (onOutputChange && typeof stageState.output === 'object') {
      const updatedOutput = {
        ...stageState.output,
        [fieldKey]: value
      };
      onOutputChange(updatedOutput);
    }
  };

  // Helper function to render form-based JSON output in a user-friendly way
  const renderFormOutput = (jsonData: any) => {
    if (!stage.formFields || !jsonData || typeof jsonData !== 'object') {
      return <JsonRenderer data={jsonData} />;
    }

    return (
      <div className="space-y-4">
        {stage.formFields.map((field) => {
          const value = jsonData[field.name];
          
          return (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {field.label}
              </label>
              <div className="p-3 border rounded-md bg-muted/50 text-sm">
                {field.type === 'select' && field.options ? (
                  // For select fields, show the label instead of the value
                  field.options.find(opt => opt.value === value)?.label || value || 'Not selected'
                ) : (
                  value || 'Not provided'
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render JSON output with jsonFields configuration
  const renderJsonFieldsOutput = (jsonData: any) => {
    if (!stage.jsonFields || !jsonData || typeof jsonData !== 'object') {
      return <JsonRenderer data={jsonData} />;
    }

    // Sort fields by displayOrder if provided
    const sortedFields = [...stage.jsonFields].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    return (
      <div className="space-y-4">
        {sortedFields.map((field) => {
          const value = jsonData[field.key];
          
          return (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
              </label>
              <div className="text-base">
                {field.type === 'textarea' ? (
                  <div className="whitespace-pre-wrap font-body">{value || 'Not provided'}</div>
                ) : (
                  <div className="font-body">{value || 'Not provided'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render EDITABLE JSON fields
  const renderEditableJsonFieldsOutput = (jsonData: any) => {
    if (!stage.jsonFields || !jsonData || typeof jsonData !== 'object') {
      return (
        <Textarea
          value={typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2)}
          onChange={handleJsonChange}
          rows={10}
          className="font-mono text-sm bg-background"
        />
      );
    }

    // Sort fields by displayOrder if provided
    const sortedFields = [...stage.jsonFields].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });

    return (
      <div className="space-y-4">
        {sortedFields.map((field) => {
          const value = jsonData[field.key] || '';
          
          return (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={String(value)}
                  onChange={(e) => handleJsonFieldChange(field.key, e.target.value)}
                  rows={6}
                  className="text-base"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              ) : (
                <Input
                  value={String(value)}
                  onChange={(e) => handleJsonFieldChange(field.key, e.target.value)}
                  className="text-base"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render context-based input in a user-friendly way
  const renderContextOutput = (contextData: any) => {
    if (!contextData || typeof contextData !== 'object') {
      return <p className="whitespace-pre-wrap font-body">{String(contextData || 'No content provided')}</p>;
    }

    const { dropped = '', manual = '' } = contextData;
    const hasDropped = dropped && dropped.trim();
    const hasManual = manual && manual.trim();

    if (!hasDropped && !hasManual) {
      return <p className="text-muted-foreground text-sm">No content provided</p>;
    }

    return (
      <div className="space-y-4">
        {hasManual && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Manual Context Input
            </label>
            <div className="p-3 border rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
              {manual}
            </div>
          </div>
        )}
        {hasDropped && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Uploaded File Content
            </label>
            <div className="p-3 border rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
              {dropped}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOutput = () => {
    if (isEditingOutput && onOutputChange) {
      switch (stage.outputType) {
        case "text":
        case "markdown":
          return (
            <Textarea
              value={String(stageState.output)}
              onChange={handleTextChange}
              rows={10}
              className="font-mono text-sm bg-background"
            />
          );
        case "json":
          console.log('[StageOutputArea] JSON case triggered', {
            stageId: stage.id,
            hasJsonFields: !!(stage.jsonFields && stage.jsonFields.length > 0),
            jsonFields: stage.jsonFields,
            outputType: stage.outputType,
            hasOutput: !!stageState.output
          });
          
          // Check if this is a form-based stage with formFields
          if (stage.inputType === 'form' && stage.formFields) {
            console.log('[StageOutputArea] Using renderFormOutput');
            return renderFormOutput(stageState.output);
          }
          // Check if jsonFields is configured for structured editing
          if (stage.jsonFields && stage.jsonFields.length > 0) {
            console.log('[StageOutputArea] Using renderEditableJsonFieldsOutput');
            return renderEditableJsonFieldsOutput(stageState.output);
          }
          // Fallback to raw JSON editing
          return (
            <Textarea
              value={typeof stageState.output === 'string' ? stageState.output : JSON.stringify(stageState.output, null, 2)}
              onChange={handleJsonChange}
              rows={10}
              className="font-mono text-sm bg-background"
            />
          );
        case "html":
          return (
            <WysiwygEditor
              content={String(stageState.output)}
              onChange={onOutputChange}
            />
          );
        default:
          return <p>Editing not supported for this output type.</p>;
      }
    } else {
      switch (stage.outputType) {
        case "text":
          // Check if this is a context-based stage (like Smart Dropzone)
          if (stage.inputType === 'context') {
            return renderContextOutput(stageState.output);
          }
          return <p className="whitespace-pre-wrap font-body">{String(stageState.output)}</p>;
        case "json":
          // Check if this is a form-based stage with formFields
          if (stage.inputType === 'form' && stage.formFields) {
            return renderFormOutput(stageState.output);
          }
          // Check if jsonFields is configured for structured display
          if (stage.jsonFields && stage.jsonFields.length > 0) {
            return renderJsonFieldsOutput(stageState.output);
          }
          // Fallback to raw JSON display
          return <JsonRenderer data={stageState.output} />;
        case "markdown":
          return <MarkdownRenderer content={String(stageState.output)} />;
        case "html":
          return <HtmlPreview content={String(stageState.output)} removeBorder={true} />;
        default:
          return <p>Unknown output type: {stage.outputType}</p>;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {renderOutput()}
        {/* Copy button for copyable stages */}
        {stage.copyable && 
         stageState.output && 
         !isEditingOutput && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-0 right-0 h-8 w-8 p-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {/* Save Edits button is now managed by StageCard */}
      {/* Display grounding metadata for Google Search */}
      {stageState.groundingMetadata?.searchEntryPoint?.renderedContent && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Google Search Suggestions</h4>
          <div 
            className="grounding-search-suggestions"
            dangerouslySetInnerHTML={{ 
              __html: stageState.groundingMetadata.searchEntryPoint.renderedContent 
            }}
          />
        </div>
      )}

          {/* Display grounding sources if available */}
    {stageState.groundingSources && stageState.groundingSources.length > 0 && (
      <GroundingSourcesDisplay 
        sources={stageState.groundingSources} 
        groundingMetadata={stageState.groundingMetadata}
      />
      )}
      
      {/* Display Function Calls */}
      {stageState.functionCalls && stageState.functionCalls.length > 0 && !isEditingOutput && (
        <FunctionCallsDisplay functionCalls={stageState.functionCalls} />
      )}
      
      {/* Display Code Execution Results */}
      {stageState.codeExecutionResults && !isEditingOutput && (
        <CodeExecutionDisplay results={stageState.codeExecutionResults} />
      )}
      
      {/* Legacy grounding display */}
      {stageState.groundingInfo && (
        <div className="mt-4 text-xs text-muted-foreground">
          <strong>Grounding info:</strong> {JSON.stringify(stageState.groundingInfo)}
        </div>
      )}
      {stageState.thinkingSteps && stageState.thinkingSteps.length > 0 && !isEditingOutput && shouldShowThinking() && (
        <Card className="bg-muted/50 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline flex items-center">
              <Info className="w-4 h-4 mr-2 text-primary" /> {/* Re-using Info icon, consider a "brain" or "lightbulb" icon */}
              Thinking Process
            </CardTitle>
            <CardDescription className="text-xs">
              Intermediate steps or reasoning from the AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stageState.thinkingSteps.map((step, index) => (
              <div key={index} className="p-2 border rounded bg-background text-xs">
                {step.type === 'toolRequest' && (
                  <div>
                    <p className="font-semibold">Tool Call: <code className="font-mono bg-muted p-1 rounded">{step.toolName}</code></p>
                    <p className="mt-1">Input:</p>
                    <pre className="whitespace-pre-wrap font-mono bg-muted p-2 rounded mt-1">{JSON.stringify(step.input, null, 2)}</pre>
                  </div>
                )}
                {step.type === 'toolResponse' && (
                  <div>
                    <p className="font-semibold">Result from <code className="font-mono bg-muted p-1 rounded">{step.toolName}</code>:</p>
                    <pre className="whitespace-pre-wrap font-mono bg-muted p-2 rounded mt-1">{JSON.stringify(step.output, null, 2)}</pre>
                  </div>
                )}
                {step.type === 'textLog' && (
                  <p className="font-mono">{step.message}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {stageState.outputImages && stageState.outputImages.length > 0 && !isEditingOutput && (
        <Card className="bg-muted/50 mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline flex items-center">
              {/* Consider an "Image" icon */}
              <Info className="w-4 h-4 mr-2 text-primary" />
              Generated Images
            </CardTitle>
            <CardDescription className="text-xs">
              Images generated by code execution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stageState.outputImages.map((image, index) => (
              <div key={index} className="p-2 border rounded bg-background">
                {image.name && <p className="text-sm font-semibold mb-1">{image.name}</p>}
                <img
                  src={`data:${image.mimeType};base64,${image.base64Data}`}
                  alt={image.name || `Generated Image ${index + 1}`}
                  className="max-w-full h-auto rounded"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
