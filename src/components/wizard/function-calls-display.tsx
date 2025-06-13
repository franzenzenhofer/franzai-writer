'use client';

import { Wrench, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface FunctionCall {
  toolName: string;
  input: any;
  output: any;
  timestamp?: string;
}

interface FunctionCallsDisplayProps {
  functionCalls: FunctionCall[];
}

export function FunctionCallsDisplay({ functionCalls }: FunctionCallsDisplayProps) {
  const [expandedCalls, setExpandedCalls] = useState<Set<number>>(new Set());

  if (!functionCalls || functionCalls.length === 0) return null;

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedCalls);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCalls(newExpanded);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Function Calls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {functionCalls.map((call, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpanded(index)}
            >
              <div className="flex items-center gap-2">
                {expandedCalls.has(index) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Badge variant="secondary" className="font-mono text-xs">
                  {call.toolName}
                </Badge>
                {call.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(call.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            {expandedCalls.has(index) && (
              <div className="mt-2 space-y-2 pl-6">
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Input:</h5>
                  <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                    {JSON.stringify(call.input, null, 2)}
                  </pre>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Output:</h5>
                  <pre className="text-xs bg-muted rounded p-2 overflow-x-auto">
                    {JSON.stringify(call.output, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}