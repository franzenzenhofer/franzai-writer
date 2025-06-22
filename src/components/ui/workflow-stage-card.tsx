import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface WorkflowStageCardProps {
  stage: {
    id: string;
    title: string;
    description: string;
    isOptional?: boolean;
    inputType: string;
    outputType: string;
    dependencies?: string[];
  };
  index: number;
  totalStages: number;
  icon: LucideIcon;
  getDependencyTitle?: (depId: string) => string;
}

export function WorkflowStageCard({ 
  stage, 
  index, 
  totalStages, 
  icon: Icon,
  getDependencyTitle 
}: WorkflowStageCardProps) {
  return (
    <div className="relative">
      {/* Progress line */}
      {index < totalStages - 1 && (
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
                  {stage.dependencies.map(depId => (
                    <Badge key={depId} variant="outline" className="text-xs">
                      {getDependencyTitle?.(depId) || depId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}