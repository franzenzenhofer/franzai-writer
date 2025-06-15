'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface ThinkingStep {
  type: 'thought' | 'textLog' | 'toolRequest' | 'toolResponse';
  text?: string;
  content?: string;
  thought?: boolean;
  message?: string;
  toolName?: string;
  input?: any;
  output?: any;
}

interface ThinkingDisplayProps {
  thinkingSteps: ThinkingStep[];
  usageMetadata?: {
    thoughtsTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    promptTokenCount?: number;
  };
}

export function ThinkingDisplay({ thinkingSteps, usageMetadata }: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 🔥 DEBUG: Log what we're receiving
  console.log('🧠 [ThinkingDisplay] Received props:', {
    thinkingStepsCount: thinkingSteps?.length || 0,
    hasUsageMetadata: !!usageMetadata,
    usageMetadata: usageMetadata,
    thoughtsTokenCount: usageMetadata?.thoughtsTokenCount,
    candidatesTokenCount: usageMetadata?.candidatesTokenCount,
    totalTokenCount: usageMetadata?.totalTokenCount
  });
  
  if (!thinkingSteps || thinkingSteps.length === 0) return null;

  const thinkingTokens = usageMetadata?.thoughtsTokenCount || 0;
  const outputTokens = usageMetadata?.candidatesTokenCount || 0;
  const totalTokens = usageMetadata?.totalTokenCount || 0;
  const promptTokens = usageMetadata?.promptTokenCount || 0;
  
  const thinkingRatio = totalTokens > 0 ? ((thinkingTokens / totalTokens) * 100).toFixed(1) : '0';
  const efficiency = outputTokens > 0 ? (thinkingTokens / outputTokens).toFixed(1) : '0';
  
  // Categorize thinking steps
  const thoughtSteps = thinkingSteps.filter(step => step.type === 'thought' || step.thought);
  const textLogSteps = thinkingSteps.filter(step => step.type === 'textLog');
  const toolSteps = thinkingSteps.filter(step => step.type === 'toolRequest' || step.type === 'toolResponse');

  return (
    <Card className="mt-4">
      <div 
        className="px-6 py-2 cursor-pointer hover:bg-muted/50 transition-colors border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-sm font-normal flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          Thinking Process ({thinkingSteps.length} steps)
        </div>
      </div>
      {isExpanded && (
        <CardContent className="space-y-4">
        
        <div className="bg-muted/20 rounded-lg p-3">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">
            AI Reasoning & Analysis
          </h5>
          <div className="flex flex-wrap gap-1">
            <Badge variant="default" className="text-xs bg-purple-600">
              Thinking Mode Enabled
            </Badge>
            {thinkingTokens > 0 && (
              <Badge variant="outline" className="text-xs">
                {thinkingTokens.toLocaleString()} Thinking Tokens
              </Badge>
            )}
            {thoughtSteps.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {thoughtSteps.length} Thought{thoughtSteps.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {textLogSteps.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {textLogSteps.length} Log{textLogSteps.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {toolSteps.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {toolSteps.length} Tool Call{toolSteps.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-3">
            Reasoning Steps ({thinkingSteps.length})
          </h5>
          <div className="space-y-3">
            {thinkingSteps.map((step, index) => (
              <div key={index} className="border-l-2 border-purple-400 pl-3 py-2 bg-purple-50/30 rounded-r">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs shrink-0">
                        Step {index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {step.type === 'thought' || step.thought ? 'Thought' : 
                         step.type === 'textLog' ? 'Log' : 
                         step.type === 'toolRequest' ? 'Tool Request' : 
                         step.type === 'toolResponse' ? 'Tool Response' : 
                         'Unknown'}
                      </Badge>
                      {step.toolName && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {step.toolName}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Display step content */}
                    {(step.text || step.content) && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {step.text || step.content}
                      </p>
                    )}
                    
                    {step.message && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {step.message}
                      </p>
                    )}
                    
                    {step.input && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Input:</p>
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-1 mt-1">
                          {typeof step.input === 'string' ? step.input : JSON.stringify(step.input).substring(0, 200)}
                          {JSON.stringify(step.input).length > 200 && '...'}
                        </p>
                      </div>
                    )}
                    
                    {step.output && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">Output:</p>
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-1 mt-1">
                          {typeof step.output === 'string' ? step.output : JSON.stringify(step.output).substring(0, 200)}
                          {JSON.stringify(step.output).length > 200 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {usageMetadata && (
          <>
            <Separator />
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-3">
                Token Usage & Performance
              </h5>
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Thinking Tokens:</span>
                    <div className="text-purple-600 font-semibold">{thinkingTokens.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Output Tokens:</span>
                    <div className="text-blue-600 font-semibold">{outputTokens.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Thinking Ratio:</span>
                    <div className="text-green-600 font-semibold">{thinkingRatio}%</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Efficiency:</span>
                    <div className="text-orange-600 font-semibold">{efficiency}:1</div>
                  </div>
                </div>
                {promptTokens > 0 && (
                  <div className="mt-2 pt-2 border-t border-muted/30">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Total Usage:</span> {totalTokens.toLocaleString()} tokens 
                      ({promptTokens.toLocaleString()} prompt + {thinkingTokens.toLocaleString()} thinking + {outputTokens.toLocaleString()} output)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="bg-muted/20 rounded-lg p-3 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-purple-600">{thinkingSteps.length}</div>
              <div className="text-xs text-muted-foreground">Steps</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{thinkingTokens.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Thinking Tokens</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{thinkingRatio}%</div>
              <div className="text-xs text-muted-foreground">Of Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">{efficiency}:1</div>
              <div className="text-xs text-muted-foreground">Think:Output</div>
            </div>
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
} 