import { getWorkflowById, allWorkflows } from "@/lib/workflow-loader";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings, 
  GitBranch, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Thermometer,
  FileText,
  Image,
  Code,
  FormInput,
  Eye,
  Zap,
  Network,
  Timer,
  Share2,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { WorkflowOverviewClient } from "@/components/workflow/workflow-overview-client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
  
  // Calculate workflow stats
  const totalStages = workflow.stages.length;
  const optionalStages = workflow.stages.filter(s => s.isOptional).length;
  const aiStages = workflow.stages.filter(s => s.inputType === 'none' && s.promptTemplate).length;
  const inputStages = workflow.stages.filter(s => s.inputType !== 'none').length;
  
  // Get stage types for icons
  const getStageIcon = (stage: any) => {
    if (stage.outputType === 'image') return Image;
    if (stage.outputType === 'html') return Code;
    if (stage.inputType === 'form') return FormInput;
    if (stage.inputType === 'textarea') return FileText;
    if (stage.inputType === 'none' && stage.promptTemplate) return Sparkles;
    return FileText;
  };

  // Get other workflows for navigation
  const otherWorkflows = allWorkflows.filter(w => w.id !== workflow.id).slice(0, 3);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 md:p-12">
          <div className="relative z-10">
            <Badge className="mb-4" variant="secondary">
              Workflow
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{workflow.name}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{workflow.description}</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">{totalStages}</div>
                <div className="text-sm text-muted-foreground">Total Stages</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">{aiStages}</div>
                <div className="text-sm text-muted-foreground">AI Stages</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">{inputStages}</div>
                <div className="text-sm text-muted-foreground">Input Stages</div>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">{optionalStages}</div>
                <div className="text-sm text-muted-foreground">Optional</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Button asChild size="lg">
                <Link href={workflow.shortName ? `/w/${workflow.shortName}/new` : `/w/new/${workflow.id}`}>
                  <Zap className="mr-2 h-5 w-5" />
                  Start Workflow
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">
                  <BookOpen className="mr-2 h-5 w-5" />
                  View Examples
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl" />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI-Powered Analysis
                </CardTitle>
                <CardDescription>
                  Let AI explain what this workflow does and how to use it effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowOverviewClient workflow={workflow} />
              </CardContent>
            </Card>

            {/* Workflow Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflow.stages.some(s => s.outputType === 'image') && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                        <Image className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Image Generation</h4>
                        <p className="text-sm text-muted-foreground">Creates AI-generated images</p>
                      </div>
                    </div>
                  )}
                  {workflow.stages.some(s => s.stageType === 'export') && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                        <Share2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Export & Publish</h4>
                        <p className="text-sm text-muted-foreground">Multiple export formats available</p>
                      </div>
                    </div>
                  )}
                  {workflow.config?.autoScroll?.enabled && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
                        <Timer className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Auto-Progress</h4>
                        <p className="text-sm text-muted-foreground">Automatic stage advancement</p>
                      </div>
                    </div>
                  )}
                  {workflow.stages.some(s => s.autoRun) && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
                        <Zap className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Smart Automation</h4>
                        <p className="text-sm text-muted-foreground">AI stages run automatically</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stages Tab */}
          <TabsContent value="stages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  Workflow Pipeline
                </CardTitle>
                <CardDescription>
                  Step-by-step breakdown of the workflow process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflow.stages.map((stage, index) => {
                    const Icon = getStageIcon(stage);
                    const progress = ((index + 1) / workflow.stages.length) * 100;
                    
                    return (
                      <div key={stage.id} className="relative">
                        {/* Progress line */}
                        {index < workflow.stages.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                        )}
                        
                        <div className="flex gap-4">
                          {/* Stage icon */}
                          <div className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                            stage.isOptional 
                              ? "bg-muted text-muted-foreground" 
                              : "bg-blue-100 text-blue-600 dark:bg-blue-950"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          {/* Stage content */}
                          <div className="flex-1 pb-8">
                            <div className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold flex items-center gap-2">
                                    {stage.title}
                                    {stage.isOptional && (
                                      <Badge variant="outline" className="text-xs">Optional</Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {stage.description}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="ml-4">
                                  Step {index + 1}
                                </Badge>
                              </div>
                              
                              {/* Stage details */}
                              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Input:</span>
                                  <span className="ml-2 font-medium">{stage.inputType}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Output:</span>
                                  <span className="ml-2 font-medium">{stage.outputType}</span>
                                </div>
                              </div>
                              
                              {stage.dependencies && stage.dependencies.length > 0 && (
                                <div className="mt-3 text-sm">
                                  <span className="text-muted-foreground">Dependencies:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {stage.dependencies.map(depId => {
                                      const depStage = workflow.stages.find(s => s.id === depId);
                                      return (
                                        <Badge key={depId} variant="outline" className="text-xs">
                                          {depStage ? depStage.title : depId}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Models */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    AI Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {uniqueModels.length > 0 ? (
                    <div className="space-y-2">
                      {uniqueModels.map((model, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium">{model || "Default Model"}</span>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Using default model</p>
                      <Badge variant="secondary" className="mt-2">
                        {workflow.defaultModel || "gemini-2.0-flash"}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Temperature Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-blue-600" />
                    Temperature Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stagesWithTemp.length > 0 ? (
                    <div className="space-y-3">
                      {stagesWithTemp.map(stage => (
                        <div key={stage.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{stage.title}</span>
                            <span className="font-mono text-sm">{stage.temperature}</span>
                          </div>
                          <Progress 
                            value={stage.temperature ? stage.temperature * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Using default temperature</p>
                      <div className="mt-2">
                        <Progress value={70} className="h-2 max-w-[200px] mx-auto" />
                        <span className="text-sm text-muted-foreground mt-1">0.7</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Workflow Settings */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Workflow Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border">
                      <Network className="h-5 w-5 text-muted-foreground mb-2" />
                      <h4 className="font-medium">Auto-run Stages</h4>
                      <p className="text-2xl font-bold mt-1">
                        {workflow.stages.filter(s => s.autoRun).length}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <Eye className="h-5 w-5 text-muted-foreground mb-2" />
                      <h4 className="font-medium">Show Thinking</h4>
                      <p className="text-sm mt-1">
                        {workflow.config?.showThinking ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <Timer className="h-5 w-5 text-muted-foreground mb-2" />
                      <h4 className="font-medium">Auto Scroll</h4>
                      <p className="text-sm mt-1">
                        {workflow.config?.autoScroll?.enabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Other Workflows */}
        {otherWorkflows.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Explore Other Workflows</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherWorkflows.map(w => (
                <Card key={w.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {w.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href={`/workflow-details/${w.id}`}>
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}