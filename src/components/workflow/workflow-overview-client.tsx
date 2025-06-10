
"use client";

import type { Workflow } from "@/types";
import { generateWorkflowOverview, type GenerateWorkflowOverviewInput } from "@/ai/flows/generate-workflow-overview-flow";
import React, { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

interface WorkflowOverviewClientProps {
  workflow: Workflow;
}

export function WorkflowOverviewClient({ workflow }: WorkflowOverviewClientProps) {
  const [overview, setOverview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const finalOutputStageId = workflow.config?.finalOutputStageId || (workflow.stages.length > 0 ? workflow.stages[workflow.stages.length - 1].id : undefined);
        const finalOutputStage = finalOutputStageId ? workflow.stages.find(s => s.id === finalOutputStageId) : undefined;

        const input: GenerateWorkflowOverviewInput = {
          workflowName: workflow.name,
          workflowDescription: workflow.description,
          stages: workflow.stages.map(s => ({ title: s.title, description: s.description })),
          finalOutputStageTitle: finalOutputStage?.title
        };
        const result = await generateWorkflowOverview(input);
        setOverview(result.overview);
      } catch (e: any) {
        console.error("Failed to generate workflow overview:", e);
        setError(e.message || "Failed to load overview from AI.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [workflow]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-muted rounded-md text-sm min-h-[100px]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
        Generating AI-powered overview...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-3">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Generating Overview</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (overview) {
    return (
      <div className="mt-3 p-4 bg-muted/70 rounded-md prose prose-sm dark:prose-invert max-w-none">
        <MarkdownRenderer content={overview} />
      </div>
    );
  }

  return (
    <p className="mt-3 p-6 bg-muted rounded-md text-sm text-muted-foreground min-h-[100px]">
      Could not generate an overview for this workflow at the moment.
    </p>
  );
}
