'use client';

import { Globe, Link, Search, Star, Wrench, Clock, ExternalLink, TrendingUp, Database, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

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
  functionCalls?: Array<{
    toolName: string;
    input: any;
    output: any;
    timestamp?: string;
  }>;
}

export function GroundingSourcesDisplay({ sources, groundingMetadata, functionCalls }: GroundingSourcesDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return null;

  const toolsUsed = functionCalls?.map(fc => fc.toolName) || [];
  const hasGoogleSearch = sources.some(source => source.url?.includes('vertexaisearch.cloud.google.com')) || 
                         (groundingMetadata?.webSearchQueries?.length ?? 0) > 0;
  const hasGroundingSupports = (groundingMetadata?.groundingSupports?.length ?? 0) > 0;
  const totalConfidence = groundingMetadata?.groundingSupports?.reduce((sum, support) => {
    const avgScore = support.confidenceScores.reduce((a, b) => a + b, 0) / (support.confidenceScores.length || 1);
    return sum + avgScore;
  }, 0) || 0;
  const avgConfidence = hasGroundingSupports && groundingMetadata?.groundingSupports ? 
    totalConfidence / groundingMetadata.groundingSupports.length : 0;

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
          Sources ({sources.length})
        </div>
      </div>
      {isExpanded && (
        <CardContent className="space-y-4">
        
        <div className="bg-muted/20 rounded-lg p-3">
          <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            AI Tools & Capabilities Used
          </h5>
          <div className="flex flex-wrap gap-1">
            {hasGoogleSearch && (
              <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                <Globe className="h-3 w-3 mr-1" />
                Google Search Grounding
              </Badge>
            )}
            {groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                {groundingMetadata.groundingChunks.length} Knowledge Sources
              </Badge>
            )}
            {hasGroundingSupports && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Quality Validation
              </Badge>
            )}
            {toolsUsed.length > 0 && toolsUsed.map((tool, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {groundingMetadata?.webSearchQueries && groundingMetadata.webSearchQueries.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search Queries Executed ({groundingMetadata.webSearchQueries.length})
            </h5>
            <div className="flex flex-wrap gap-1">
              {groundingMetadata.webSearchQueries.map((query, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  &ldquo;{query}&rdquo;
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Knowledge Sources ({sources.length})
          </h5>
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div key={index} className="border-l-2 border-primary/60 pl-3 py-2 bg-primary/5 rounded-r">
                <div className="flex items-start gap-2">
                  {source.type === 'search' ? (
                    <Globe className="h-3 w-3 mt-1 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Link className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{source.title}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        Source {index + 1}
                      </Badge>
                    </div>
                    {source.snippet && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{source.snippet}</p>
                    )}
                    {source.url && (
                      <div className="flex items-center gap-1 mt-2">
                        <ExternalLink className="h-3 w-3 text-blue-500" />
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate"
                          title={source.url}
                        >
                          {source.url.length > 60 ? source.url.substring(0, 60) + '...' : source.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {groundingMetadata?.groundingSupports && groundingMetadata.groundingSupports.length > 0 && (
          <>
            <Separator />
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Content Quality & Grounding Assessment
              </h5>
              <div className="space-y-3">
                {groundingMetadata.groundingSupports.map((support, index) => {
                  const avgScore = support.confidenceScores.reduce((a, b) => a + b, 0) / (support.confidenceScores.length || 1);
                  const confidenceLevel = avgScore > 0.8 ? 'High' : avgScore > 0.6 ? 'Medium' : 'Low';
                  const confidenceColor = avgScore > 0.8 ? 'bg-success/10 text-success' :
                                        avgScore > 0.6 ? 'bg-warning/10 text-warning' :
                                        'bg-destructive/10 text-destructive';
                  
                  return (
                    <div key={index} className="bg-muted/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Segment {index + 1}
                        </Badge>
                        <Badge className={`text-xs ${confidenceColor}`}>
                          {confidenceLevel} Confidence ({Math.round(avgScore * 100)}%)
                        </Badge>
                      </div>
                      <p className="text-xs mb-2 font-medium">&ldquo;{support.segment.text}&rdquo;</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Sources:</span>
                        {support.groundingChunkIndices.map((chunkIndex, scoreIndex) => (
                          <Badge key={scoreIndex} variant="outline" className="text-xs">
                            #{chunkIndex + 1}
                          </Badge>
                        ))}
                        {support.segment.startIndex !== undefined && (
                          <span className="ml-2">
                            Position: {support.segment.startIndex}-{support.segment.endIndex}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {groundingMetadata?.searchEntryPoint?.renderedContent && (
          <>
            <Separator />
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Google Search Suggestions
              </h5>
              <div 
                className="grounding-search-suggestions text-xs border rounded p-2 bg-gray-50"
                dangerouslySetInnerHTML={{ 
                  __html: groundingMetadata.searchEntryPoint.renderedContent 
                }}
              />
            </div>
          </>
        )}

        <div className="bg-primary/5 rounded-lg p-3 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">{sources.length}</div>
              <div className="text-xs text-muted-foreground">Sources</div>
            </div>
            {groundingMetadata?.webSearchQueries && (
              <div>
                <div className="text-lg font-semibold text-green-600">{groundingMetadata.webSearchQueries.length}</div>
                <div className="text-xs text-muted-foreground">Queries</div>
              </div>
            )}
            {hasGroundingSupports && (
              <div>
                <div className="text-lg font-semibold text-purple-600">{Math.round(avgConfidence * 100)}%</div>
                <div className="text-xs text-muted-foreground">Avg Quality</div>
              </div>
            )}
            {groundingMetadata?.groundingChunks && (
              <div>
                <div className="text-lg font-semibold text-orange-600">{groundingMetadata.groundingChunks.length}</div>
                <div className="text-xs text-muted-foreground">Knowledge Chunks</div>
              </div>
            )}
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
}