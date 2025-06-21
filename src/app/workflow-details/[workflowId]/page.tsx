import { getWorkflowById } from "@/lib/workflow-loader";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, GitBranch, Sparkles, ArrowRight, Cpu, Thermometer } from "lucide-react";
import { WorkflowOverviewClient } from "@/components/workflow/workflow-overview-client";
import { Badge } from "@/components/ui/badge";

export default async function WorkflowDetailsPage({ params }: { params: Promise<{ workflowId: string }> }) {
  console.log('[WorkflowDetailsPage] STEP 1: Page function called');
  console.log('[WorkflowDetailsPage] STEP 2: Params received:', params);
  
  const { workflowId } = await params;
  console.log('[WorkflowDetailsPage] STEP 3: WorkflowId extracted:', workflowId);
  
  console.log('[WorkflowDetailsPage] STEP 4: Calling getWorkflowById...');
  const workflow = getWorkflowById(workflowId);
  console.log('[WorkflowDetailsPage] STEP 5: Workflow result:', workflow ? 'Found' : 'Not found');

  if (!workflow) {
    console.log('[WorkflowDetailsPage] STEP 6: Workflow not found, calling notFound()');
    notFound();
  }

  const uniqueModels = Array.from(new Set(workflow.stages.filter(s => s.model).map(s => s.model)));
  const stagesWithTemp = workflow.stages.filter(s => s.temperature !== undefined);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6 md:py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{workflow.name}</h1>
          <p className="text-lg text-muted-foreground">{workflow.description}</p>
        </div>

        {/* Configuration Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Models */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span>AI Models</span>
                </div>
                {uniqueModels.length > 0 ? (
                  <div className="space-y-1">
                    {uniqueModels.map(model => (
                      <Badge key={model as string} variant="secondary" className="text-xs">
                        {model || "Default Model"}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Using default model</p>
                )}
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span>Temperature Settings</span>
                </div>
                {stagesWithTemp.length > 0 ? (
                  <div className="space-y-1">
                    {stagesWithTemp.map(stage => (
                      <div key={stage.id} className="text-sm text-muted-foreground">
                        {stage.title}: <span className="font-mono">{stage.temperature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Using default temperature</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Flow */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Workflow Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflow.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-3">
                  {/* Stage Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  {/* Stage Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{stage.title}</h4>
                      {stage.isOptional && (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    {stage.dependencies && stage.dependencies.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requires: {stage.dependencies.map(depId => {
                          const depStage = workflow.stages.find(s => s.id === depId);
                          return depStage ? depStage.title : depId;
                        }).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Arrow (except for last item) */}
                  {index < workflow.stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Overview */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowOverviewClient workflow={workflow} />
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <Button size="lg" asChild>
            <Link href={workflow.shortName ? `/w/${workflow.shortName}/new` : `/w/new/${workflow.id}`}>
              Start {workflow.name}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}