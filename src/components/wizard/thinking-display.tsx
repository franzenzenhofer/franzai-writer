'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface ThinkingStep {
  type: 'textLog' | 'toolRequest' | 'toolResponse';
  message?: string;
  toolName?: string;
  input?: any;
  output?: any;
  timestamp?: string;
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
  
  // More meaningful statistics
  const thinkingIntensity = outputTokens > 0 ? (thinkingTokens / outputTokens).toFixed(1) : '0';
  const thinkingCostRatio = totalTokens > 0 ? ((thinkingTokens / totalTokens) * 100).toFixed(0) : '0';
  const outputCostRatio = totalTokens > 0 ? ((outputTokens / totalTokens) * 100).toFixed(0) : '0';
  const inputCostRatio = totalTokens > 0 ? ((promptTokens / totalTokens) * 100).toFixed(0) : '0';
  
  // Quality metrics
  const wordsPerThinkingToken = thinkingTokens > 0 ? (outputTokens / thinkingTokens * 100).toFixed(0) : '0';
  const totalCost = promptTokens + thinkingTokens + outputTokens;
  
  // Categorize thinking steps
  const thoughtSteps = thinkingSteps.filter(step => step.type === 'textLog' && step.message?.includes('Thought'));
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
                        {step.type === 'textLog' && step.message?.includes('Thought') ? 'Thought' : 
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
                Token Usage & Cost Breakdown
              </h5>
              
              {/* Token Breakdown */}
              <div className="bg-muted/20 rounded-lg p-3 mb-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">Token Breakdown</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input (Prompt):</span>
                    <span className="font-mono">{promptTokens.toLocaleString()} tokens ({inputCostRatio}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-medium">Thinking (Internal):</span>
                    <span className="font-mono text-purple-600">{thinkingTokens.toLocaleString()} tokens ({thinkingCostRatio}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Output (Response):</span>
                    <span className="font-mono text-blue-600">{outputTokens.toLocaleString()} tokens ({outputCostRatio}%)</span>
                  </div>
                  <div className="border-t border-muted/30 pt-1 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Tokens:</span>
                      <span className="font-mono">{totalTokens.toLocaleString()} tokens</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">AI Performance</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Thinking Intensity:</span>
                    <div className="text-purple-600 font-semibold">{thinkingIntensity}x</div>
                    <div className="text-muted-foreground text-[10px]">{thinkingIntensity} thinking per output token</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Output Efficiency:</span>
                    <div className="text-green-600 font-semibold">{wordsPerThinkingToken}%</div>
                    <div className="text-muted-foreground text-[10px]">output tokens per thinking token</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-muted/20 rounded-lg p-3 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-purple-600">{thinkingSteps.length}</div>
              <div className="text-xs text-muted-foreground">Reasoning Steps</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">{thinkingTokens.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Thinking Tokens</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{outputTokens.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Output Tokens</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{thinkingIntensity}x</div>
              <div className="text-xs text-muted-foreground">Think Intensity</div>
            </div>
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
} 