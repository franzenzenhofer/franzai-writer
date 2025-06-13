'use client';

import { Globe, Link, Search, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GroundingSource {
  type: 'search' | 'url';
  title: string;
  url?: string;
  snippet?: string;
}

interface GroundingSourcesDisplayProps {
  sources: GroundingSource[];
  groundingMetadata?: {
    searchEntryPoint?: {
      renderedContent: string;
    };
    groundingChunks?: Array<{
      web: {
        uri: string;
        title: string;
      };
    }>;
    groundingSupports?: Array<{
      segment: {
        startIndex?: number;
        endIndex: number;
        text: string;
      };
      groundingChunkIndices: number[];
      confidenceScores: number[];
    }>;
    webSearchQueries?: string[];
  };
}

export function GroundingSourcesDisplay({ sources, groundingMetadata }: GroundingSourcesDisplayProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Grounding Sources
          <Badge variant="secondary" className="text-xs">
            Google Search
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display web search queries if available */}
        {groundingMetadata?.webSearchQueries && groundingMetadata.webSearchQueries.length > 0 && (
          <div className="mb-4">
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search Queries
            </h5>
            <div className="flex flex-wrap gap-1">
              {groundingMetadata.webSearchQueries.map((query, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Display grounding sources */}
        {sources.map((source, index) => (
          <div key={index} className="border-l-2 border-blue-500 pl-3 py-2">
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

        {/* Display grounding supports with confidence scores */}
        {groundingMetadata?.groundingSupports && groundingMetadata.groundingSupports.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Grounding Quality
            </h5>
            <div className="space-y-2">
              {groundingMetadata.groundingSupports.map((support, index) => (
                <div key={index} className="bg-muted/30 rounded p-2">
                  <p className="text-xs mb-1">&ldquo;{support.segment.text}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    {support.confidenceScores.map((score, scoreIndex) => (
                      <Badge key={scoreIndex} variant="outline" className="text-xs">
                        {Math.round(score * 100)}%
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}