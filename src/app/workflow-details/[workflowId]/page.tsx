
import { getWorkflowById } from "@/lib/workflow-loader";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, ListTree } from "lucide-react";

export default function WorkflowDetailsPage({ params }: { params: { workflowId: string } }) {
  const workflow = getWorkflowById(params.workflowId);

  if (!workflow) {
    notFound();
  }

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
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-xl mb-2 font-headline flex items-center">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Workflow Configuration
              </h3>
              <p className="text-muted-foreground">
                This section will provide details about the AI models used, specific configurations,
                and other technical aspects of the workflow.
              </p>
              <p className="mt-2 p-4 bg-muted rounded-md text-sm">
                <strong>Note:</strong> Detailed configuration display is under development.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-2 font-headline flex items-center">
                <ListTree className="mr-2 h-5 w-5 text-primary" />
                Stage Dependency Map
              </h3>
              <p className="text-muted-foreground">
                A visual representation of the workflow stages and their dependencies will be shown here,
                helping you understand the flow of content generation.
              </p>
              <div className="mt-3 p-6 bg-muted rounded-md text-center">
                <ListTree className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm">
                  Visual dependency map coming soon!
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl mb-2 font-headline">Generated Overview</h3>
               <p className="text-muted-foreground">
                An AI-generated summary of what this workflow typically produces will be displayed here.
              </p>
              <div className="mt-3 p-6 bg-muted rounded-md text-center">
                 <p className="text-sm">
                  AI-generated workflow overview is under development.
                </p>
              </div>
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
