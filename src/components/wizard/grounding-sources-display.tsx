'use client';

import { Globe, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GroundingSource {
  type: 'search' | 'url';
  title: string;
  url?: string;
  snippet?: string;
}

interface GroundingSourcesDisplayProps {
  sources: GroundingSource[];
}

export function GroundingSourcesDisplay({ sources }: GroundingSourcesDisplayProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Grounding Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
            <div className="flex items-start gap-2">
              {source.type === 'search' ? (
                <Globe className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
              ) : (
                <Link className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{source.title}</h4>
                {source.snippet && (
                  <p className="text-xs text-muted-foreground mt-1">{source.snippet}</p>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    {source.url}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}