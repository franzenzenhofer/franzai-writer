import { allWorkflows } from "@/lib/workflow-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";

export default function NewWizardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
          <h1 className="text-3xl font-bold font-headline">Create New Document</h1>
          <p className="text-muted-foreground">Select a workflow to get started.</p>
      </div>
      {allWorkflows.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold font-headline">No Workflows Available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  Contact an administrator to add workflows.
              </p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allWorkflows.map(workflow => (
                  <Card key={workflow.id} className="flex flex-col">
                      <CardHeader>
                          <CardTitle className="font-headline">{workflow.name}</CardTitle>
                          <CardDescription className="h-20 text-ellipsis overflow-hidden">{workflow.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          {/* Placeholder for potential workflow tags or icons */}
                      </CardContent>
                      <CardFooter>
                          <Button asChild className="w-full">
                              <Link href={`/w/new/${workflow.id}`}>
                                  Select Workflow <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                          </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
      )}
       <p className="text-xs text-muted-foreground mt-8 text-center">
          Or go back to <Link href="/dashboard" className="underline hover:text-primary">Dashboard</Link>.
      </p>
    </div>
  );
} 