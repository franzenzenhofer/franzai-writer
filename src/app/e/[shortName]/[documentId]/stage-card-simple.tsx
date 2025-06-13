"use client";

import { useState } from 'react';
import type { Stage, StageState } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface StageCardSimpleProps {
  stage: Stage;
  stageState: StageState;
  onExecute: (stageId: string, input: string) => Promise<void>;
}

export function StageCardSimple({ stage, stageState, onExecute }: StageCardSimpleProps) {
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onExecute(stage.id, input);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{stage.title}</CardTitle>
        <CardDescription>{stage.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {stage.inputType === 'textarea' && (
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={stage.placeholder || 'Enter your input...'}
            className="mb-4"
            rows={4}
          />
        )}
        
        {stageState.output && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="font-semibold mb-2">Output:</p>
            <div className="whitespace-pre-wrap">{stageState.output}</div>
          </div>
        )}
        
        <Button 
          onClick={handleExecute} 
          disabled={isExecuting || (stage.inputType === 'textarea' && !input)}
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Execute Stage'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}