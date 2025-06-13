'use client';

import { Code, Terminal, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

interface CodeExecutionResults {
  code: string;
  stdout?: string;
  stderr?: string;
  images?: Array<{
    name: string;
    base64Data: string;
    mimeType: string;
  }>;
}

interface CodeExecutionDisplayProps {
  results: CodeExecutionResults;
}

export function CodeExecutionDisplay({ results }: CodeExecutionDisplayProps) {
  if (!results) return null;

  const hasOutput = results.stdout || results.stderr;
  const hasImages = results.images && results.images.length > 0;
  const tabCount = 1 + (hasOutput ? 1 : 0) + (hasImages ? 1 : 0);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Code className="h-4 w-4" />
          Code Execution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="code" className="w-full">
          {tabCount > 1 && (
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabCount}, 1fr)` }}>
              <TabsTrigger value="code">Code</TabsTrigger>
              {hasOutput && <TabsTrigger value="output">Output</TabsTrigger>}
              {hasImages && <TabsTrigger value="images">Images</TabsTrigger>}
            </TabsList>
          )}
          
          <TabsContent value="code" className="mt-4">
            <div className="relative">
              <pre className="text-sm bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto">
                <code className="language-python">{results.code}</code>
              </pre>
            </div>
          </TabsContent>
          
          {hasOutput && (
            <TabsContent value="output" className="mt-4">
              <div className="space-y-3">
                {results.stdout && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Terminal className="h-3 w-3" />
                      Standard Output
                    </h5>
                    <pre className="text-sm bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 rounded-lg p-3 overflow-x-auto">
                      {results.stdout}
                    </pre>
                  </div>
                )}
                {results.stderr && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Terminal className="h-3 w-3" />
                      Standard Error
                    </h5>
                    <pre className="text-sm bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 rounded-lg p-3 overflow-x-auto">
                      {results.stderr}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          {hasImages && (
            <TabsContent value="images" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {results.images!.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {image.name || `Image ${index + 1}`}
                    </h5>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={`data:${image.mimeType};base64,${image.base64Data}`}
                        alt={image.name || `Generated image ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}