"use client";

import type { Workflow } from "@/types";
import React, { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkflowOverviewClientProps {
  workflow: Workflow;
}

interface ErrorDetails {
  error: string;
  statusCode?: number;
  errorType?: string;
  requestId?: string;
  timestamp?: string;
  details?: any;
}

export function WorkflowOverviewClient({ workflow }: WorkflowOverviewClientProps) {
  const [overview, setOverview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      const requestId = Math.random().toString(36).substring(7);
      console.log(`[WorkflowOverviewClient] REQUEST ${requestId} START:`, new Date().toISOString());
      
      try {
        setIsLoading(true);
        setErrorDetails(null);
        
        const finalOutputStageId = workflow.config?.finalOutputStageId || 
          (workflow.stages.length > 0 ? workflow.stages[workflow.stages.length - 1].id : undefined);
        const finalOutputStage = finalOutputStageId ? 
          workflow.stages.find(s => s.id === finalOutputStageId) : undefined;

        const requestBody = {
          workflowName: workflow.name,
          workflowDescription: workflow.description,
          stages: workflow.stages.map(s => ({ title: s.title, description: s.description })),
          finalOutputStageTitle: finalOutputStage?.title
        };
        
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} BODY:`, JSON.stringify(requestBody, null, 2));
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error(`[WorkflowOverviewClient] REQUEST ${requestId} CLIENT TIMEOUT after 30s`);
          controller.abort();
        }, 30000); // 30 second timeout
        
        const startTime = Date.now();
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} FETCHING:`, new Date().toISOString());
        
        const response = await fetch('/api/workflow-overview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = Date.now();
        
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} RESPONSE STATUS:`, response.status);
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} RESPONSE STATUS TEXT:`, response.statusText);
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} RESPONSE TIME:`, endTime - startTime, 'ms');
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} RESPONSE HEADERS:`, Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} RESPONSE DATA:`, JSON.stringify(data, null, 2));
        
        if (!response.ok) {
          // Enhanced error handling with status code details
          const error: ErrorDetails = {
            error: data.error || `HTTP ${response.status}: ${response.statusText}`,
            statusCode: data.statusCode || response.status,
            errorType: data.errorType || 'HTTPError',
            requestId: data.requestId || requestId,
            timestamp: data.timestamp || new Date().toISOString(),
            details: data.details
          };
          
          console.error(`[WorkflowOverviewClient] REQUEST ${requestId} API ERROR:`, error);
          setErrorDetails(error);
          return;
        }
        
        if (data.success && data.data?.overview) {
          setOverview(data.data.overview);
          console.log(`[WorkflowOverviewClient] REQUEST ${requestId} SUCCESS with status ${data.statusCode || 200}`);
        } else {
          throw new Error('Invalid response format');
        }
        
      } catch (e: any) {
        console.error(`[WorkflowOverviewClient] REQUEST ${requestId} CLIENT ERROR:`, e);
        console.error(`[WorkflowOverviewClient] REQUEST ${requestId} ERROR TYPE:`, e.name);
        console.error(`[WorkflowOverviewClient] REQUEST ${requestId} ERROR STACK:`, e.stack);
        
        const error: ErrorDetails = {
          error: e.message || "Failed to load overview from AI",
          errorType: e.name || 'UnknownError',
          requestId: requestId,
          timestamp: new Date().toISOString()
        };
        
        if (e.name === 'AbortError') {
          error.error = 'Request timed out after 30 seconds';
          error.statusCode = 504;
          error.errorType = 'TimeoutError';
        }
        
        setErrorDetails(error);
      } finally {
        setIsLoading(false);
        console.log(`[WorkflowOverviewClient] REQUEST ${requestId} END:`, new Date().toISOString());
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

  if (errorDetails) {
    return (
      <Alert variant="destructive" className="mt-3">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Error Generating Overview
          {errorDetails.statusCode && (
            <Badge variant="destructive" className="text-xs">
              {errorDetails.statusCode}
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p className="font-medium">{errorDetails.error}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 space-y-1 text-xs font-mono">
              {errorDetails.errorType && (
                <div>Type: {errorDetails.errorType}</div>
              )}
              {errorDetails.requestId && (
                <div>Request ID: {errorDetails.requestId}</div>
              )}
              {errorDetails.timestamp && (
                <div>Time: {new Date(errorDetails.timestamp).toLocaleTimeString()}</div>
              )}
              {errorDetails.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs">Technical Details</summary>
                  <pre className="mt-1 overflow-auto p-2 bg-black/10 rounded text-xs">
                    {JSON.stringify(errorDetails.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </AlertDescription>
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
    <Alert className="mt-3">
      <Info className="h-4 w-4" />
      <AlertTitle>No Overview Available</AlertTitle>
      <AlertDescription>
        Could not generate an overview for this workflow at the moment.
      </AlertDescription>
    </Alert>
  );
}