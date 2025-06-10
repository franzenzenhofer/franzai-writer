
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
  // onSaveEdits prop is removed as StageCard now handles the "Save Output Edits" button
}

export function StageOutputArea({ stage, stageState, isEditingOutput, onOutputChange }: StageOutputAreaProps) {
  if (stageState.status !== "completed" || stageState.output === undefined || stageState.output === null) {
    if (stageState.status === "running") {
      return <p className="text-sm text-muted-foreground">AI is generating output...</p>;
    }
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
          return <p className="whitespace-pre-wrap font-body">{String(stageState.output)}</p>;
        case "json":
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
    </div>
  );
}
