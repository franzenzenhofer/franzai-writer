"use client";

import type { Stage, StageState } from "@/types";
import { JsonRenderer } from "@/components/json-renderer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface StageOutputAreaProps {
  stage: Stage;
  stageState: StageState;
}

export function StageOutputArea({ stage, stageState }: StageOutputAreaProps) {
  if (stageState.status !== "completed" || stageState.output === undefined || stageState.output === null) {
    return <p className="text-sm text-muted-foreground">No output yet for this stage.</p>;
  }

  const renderOutput = () => {
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
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-background shadow-sm">
        {renderOutput()}
      </div>
      {stageState.groundingInfo && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline flex items-center">
              <Info className="w-4 h-4 mr-2 text-primary" />
              Grounding Information
            </CardTitle>
            <CardDescription className="text-xs">
              Context or sources used by the AI for this output.
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
