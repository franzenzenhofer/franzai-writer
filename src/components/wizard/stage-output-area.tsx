
"use client";

import type { Stage, StageState } from "@/types";
import { JsonRenderer } from "@/components/json-renderer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
// Button and Save icon removed as they are now handled by StageCard
import React from 'react';


interface StageOutputAreaProps {
  stage: Stage;
  stageState: StageState;
  isEditingOutput: boolean;
  onOutputChange?: (newOutput: any) => void;
}

export function StageOutputArea({ stage, stageState, isEditingOutput, onOutputChange }: StageOutputAreaProps) {

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
          return (
            <Textarea
              value={typeof stageState.output === 'string' ? stageState.output : JSON.stringify(stageState.output, null, 2)}
              onChange={handleJsonChange}
              rows={10}
              className="font-mono text-sm bg-background"
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
          return <JsonRenderer data={stageState.output} />;
        case "markdown":
          return <MarkdownRenderer content={String(stageState.output)} />;
        default:
          return <p>Unknown output type: {stage.outputType}</p>;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-background shadow-sm min-h-[100px]">
        {renderOutput()}
      </div>
      {/* Save Edits button is now managed by StageCard */}
      {stageState.groundingInfo && !isEditingOutput && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline flex items-center">
              <Info className="w-4 h-4 mr-2 text-primary" />
              Grounding Information
            </CardTitle>
            <CardDescription className="text-xs">
              Context or sources used by the AI for this output. (Placeholder)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonRenderer data={stageState.groundingInfo} />
          </CardContent>
        </Card>
      )}
      {stageState.thinkingSteps && stageState.thinkingSteps.length > 0 && !isEditingOutput && (
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
