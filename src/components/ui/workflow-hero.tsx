import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";
import { Zap, BookOpen } from "lucide-react";

interface WorkflowHeroProps {
  workflow: {
    id: string;
    name: string;
    description: string;
    shortName?: string;
    stages: Array<{
      isOptional?: boolean;
      inputType: string;
      promptTemplate?: string;
    }>;
  };
}

export function WorkflowHero({ workflow }: WorkflowHeroProps) {
  const totalStages = workflow.stages.length;
  const optionalStages = workflow.stages.filter(s => s.isOptional).length;
  const aiStages = workflow.stages.filter(s => s.inputType === 'none' && s.promptTemplate).length;
  const inputStages = workflow.stages.filter(s => s.inputType !== 'none').length;

  return (
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
  );
}