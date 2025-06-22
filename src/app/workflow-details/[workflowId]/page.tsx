import { getWorkflowById, allWorkflows } from "@/lib/workflow-loader";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { WorkflowHero } from "@/components/ui/workflow-hero";
import { WorkflowStageCard } from "@/components/ui/workflow-stage-card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { 
  ArrowLeft, 
  Settings, 
  GitBranch, 
  Sparkles, 
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
  ChevronRight
} from "lucide-react";
import { WorkflowOverviewClient } from "@/components/workflow/workflow-overview-client";

// Get stage icon based on stage properties
const getStageIcon = (stage: any) => {
  if (stage.outputType === 'image') return Image;
  if (stage.outputType === 'html') return Code;
  if (stage.inputType === 'form') return FormInput;
  if (stage.inputType === 'textarea') return FileText;
  if (stage.inputType === 'none' && stage.promptTemplate) return Sparkles;
  return FileText;
};

export default async function WorkflowDetailsPage({ params }: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = await params;
  const workflow = getWorkflowById(workflowId);

  if (!workflow) {
    notFound();
  }

  const uniqueModels = Array.from(new Set(workflow.stages.filter(s => s.model).map(s => s.model)));
  const stagesWithTemp = workflow.stages.filter(s => s.temperature !== undefined);
  const autoRunStages = workflow.stages.filter(s => s.autoRun).length;
  
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
        <WorkflowHero workflow={workflow} />

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
                        <Image className="h-5 w-5 text-blue-600" alt="Image generation" />
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
                  {workflow.stages.map((stage, index) => (
                    <WorkflowStageCard
                      key={stage.id}
                      stage={stage}
                      index={index}
                      totalStages={workflow.stages.length}
                      icon={getStageIcon(stage)}
                      getDependencyTitle={(depId) => {
                        const depStage = workflow.stages.find(s => s.id === depId);
                        return depStage ? depStage.title : depId;
                      }}
                    />
                  ))}
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
                    <StatCard
                      icon={Network}
                      label="Auto-run Stages"
                      value={autoRunStages}
                    />
                    <StatCard
                      icon={Eye}
                      label="Show Thinking"
                      value={workflow.config?.showThinking ? "Enabled" : "Disabled"}
                    />
                    <StatCard
                      icon={Timer}
                      label="Auto Scroll"
                      value={workflow.config?.autoScroll?.enabled ? "Enabled" : "Disabled"}
                    />
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