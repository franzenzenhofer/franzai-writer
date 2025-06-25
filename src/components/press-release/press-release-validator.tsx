"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Lightbulb, 
  FileText,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { pressReleaseValidator, type ValidationResult, type PressReleaseContent } from '@/lib/press-release-validator';

interface PressReleaseValidatorProps {
  content: Partial<PressReleaseContent>;
  onValidationComplete?: (result: ValidationResult) => void;
  autoValidate?: boolean;
}

export function PressReleaseValidatorComponent({
  content,
  onValidationComplete,
  autoValidate = true
}: PressReleaseValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (autoValidate && content && Object.keys(content).length > 0) {
      validateContent();
    }
  }, [content, autoValidate]);

  const validateContent = async () => {
    if (!content.headline && !content.content) {
      return;
    }

    setIsValidating(true);

    // Simulate async validation (in real implementation, this might call an API)
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const fullContent: PressReleaseContent = {
        headline: content.headline || '',
        subheadline: content.subheadline,
        content: content.content || '',
        quotes: content.quotes || '',
        statistics: content.statistics || '',
        contactName: content.contactName || '',
        contactTitle: content.contactTitle || '',
        contactEmail: content.contactEmail || '',
        contactPhone: content.contactPhone || '',
        companyName: content.companyName || '',
        website: content.website,
      };

      const result = pressReleaseValidator.validatePressRelease(fullContent);
      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (isValidating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Validating Press Release...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={undefined} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Checking AP style, structure, and professional standards...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Press Release Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              No content to validate yet. Start writing your press release to see quality insights.
            </p>
            <Button onClick={validateContent} disabled={!content.headline && !content.content}>
              Run Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quality Assessment
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(validationResult.score)}`}>
              {validationResult.score}
            </span>
            <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
              {getScoreLabel(validationResult.score)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {validationResult.isValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">
              {validationResult.isValid 
                ? 'Ready for publication' 
                : 'Requires attention before publication'
              }
            </span>
          </div>

          {/* Quality Score Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Quality Score</span>
              <span className={getScoreColor(validationResult.score)}>
                {validationResult.score}/100
              </span>
            </div>
            <Progress value={validationResult.score} className="w-full" />
          </div>

          {/* Validation Details */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="errors">
                Errors {validationResult.errors.length > 0 && `(${validationResult.errors.length})`}
              </TabsTrigger>
              <TabsTrigger value="warnings">
                Warnings {validationResult.warnings.length > 0 && `(${validationResult.warnings.length})`}
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                Tips {validationResult.suggestions.length > 0 && `(${validationResult.suggestions.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="text-2xl font-bold text-red-600">
                    {validationResult.errors.length}
                  </div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationResult.warnings.length}
                  </div>
                  <div className="text-sm text-yellow-600">Warnings</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {validationResult.suggestions.length}
                  </div>
                  <div className="text-sm text-blue-600">Suggestions</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="space-y-3">
              {validationResult.errors.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  No errors found
                </div>
              ) : (
                validationResult.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">{error.field}</div>
                        <div>{error.message}</div>
                        {error.location && (
                          <div className="text-xs opacity-80">Location: {error.location}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </TabsContent>

            <TabsContent value="warnings" className="space-y-3">
              {validationResult.warnings.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  No warnings
                </div>
              ) : (
                validationResult.warnings.map((warning, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">{warning.field}</div>
                        <div>{warning.message}</div>
                        {warning.suggestion && (
                          <div className="text-sm text-muted-foreground mt-1">
                            💡 {warning.suggestion}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-3">
              {validationResult.suggestions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  Your press release is well-optimized
                </div>
              ) : (
                validationResult.suggestions.map((suggestion, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">{suggestion.field}</div>
                        <div>{suggestion.message}</div>
                        {suggestion.example && (
                          <div className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                            <strong>Example:</strong> {suggestion.example}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={validateContent} variant="outline" size="sm">
              Revalidate
            </Button>
            {validationResult.isValid && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Ready to Publish
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}