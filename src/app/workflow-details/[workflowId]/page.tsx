
import { getWorkflowById } from "@/lib/workflow-loader";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, ListTree, Sparkles } from "lucide-react";
import { WorkflowOverviewClient } from "@/components/workflow/workflow-overview-client";

export default function WorkflowDetailsPage({ params }: { params: { workflowId: string } }) {
  const workflow = getWorkflowById(params.workflowId);

  if (!workflow) {
    notFound();
  }

  const uniqueModels = Array.from(new Set(workflow.stages.filter(s => s.model).map(s => s.model)));
  const stagesWithTemp = workflow.stages.filter(s => s.temperature !== undefined);


  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{workflow.name}</CardTitle>
          <CardDescription className="text-lg">{workflow.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-xl mb-3 font-headline flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Workflow Configuration
              </h3>
              {uniqueModels.length > 0 ? (
                <>
                  <p className="text-sm font-medium">AI Models Used:</p>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1 mt-1">
                    {uniqueModels.map(model => <li key={model as string}>{model || "Default Model"}</li>)}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Default AI model is used for all applicable stages.</p>
              )}
              {stagesWithTemp.length > 0 && (
                <>
                  <p className="text-sm font-medium mt-3">Custom Temperature Settings:</p>
                  <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1 mt-1">
                    {stagesWithTemp.map(stage => (
                      <li key={stage.id}>{stage.title}: Temperature {stage.temperature}</li>
                    ))}
                  </ul>
                </>
              )}
              {(uniqueModels.length === 0 && stagesWithTemp.length === 0) && (
                 <p className="text-sm text-muted-foreground mt-1">This workflow uses default AI configurations for model and temperature.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3 font-headline flex items-center">
                <ListTree className="mr-2 h-5 w-5 text-primary" />
                Stage Dependencies
              </h3>
              {workflow.stages.length > 0 ? (
                <div className="space-y-3">
                  {workflow.stages.map(stage => (
                    <div key={stage.id} className="p-3 border rounded-md bg-card shadow-sm">
                      <h4 className="font-semibold text-md text-foreground">{stage.title}</h4>
                      {stage.dependencies && stage.dependencies.length > 0 ? (
                        <div className="text-xs mt-1">
                          <span className="text-muted-foreground">Depends on: </span>
                          <span className="text-foreground">
                            {stage.dependencies.map(depId => {
                              const depStage = workflow.stages.find(s => s.id === depId);
                              return depStage ? depStage.title : depId;
                            }).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs mt-1 text-muted-foreground">No direct dependencies</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No stages defined in this workflow.</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-xl mb-2 font-headline flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                AI-Generated Overview
              </h3>
               <WorkflowOverviewClient workflow={workflow} />
            </div>

          </div>
        </CardContent>
      </Card>

       <div className="text-center">
        <Button size="lg" asChild>
          <Link href={`/wizard/_new_${workflow.id}`}>
            Start using {workflow.name}
          </Link>
        </Button>
      </div>
    </div>
  );
}

