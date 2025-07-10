"use client";

import React, { Suspense } from 'react';
import { Loader2, Eye, Brain, Search, Image as ImageIcon, FileText, Code } from 'lucide-react';

// Lazy load various display components
const HtmlPreview = React.lazy(() => import('./html-preview').then(module => ({ default: module.HtmlPreview })));
const WysiwygEditor = React.lazy(() => import('./wysiwyg-editor').then(module => ({ default: module.WysiwygEditor })));
const ThinkingDisplay = React.lazy(() => import('./thinking-display').then(module => ({ default: module.ThinkingDisplay })));
const GroundingSourcesDisplay = React.lazy(() => import('./grounding-sources-display').then(module => ({ default: module.GroundingSourcesDisplay })));
const ImageOutputDisplay = React.lazy(() => import('./image-output-display').then(module => ({ default: module.ImageOutputDisplay })));
const FunctionCallsDisplay = React.lazy(() => import('./function-calls-display').then(module => ({ default: module.FunctionCallsDisplay })));
const CodeExecutionDisplay = React.lazy(() => import('./code-execution-display').then(module => ({ default: module.CodeExecutionDisplay })));

// Loading fallback components
function GenericLoadingFallback({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{text}</span>
      <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />
    </div>
  );
}

// Lazy HTML Preview component
interface HtmlPreviewLazyProps {
  content: string;
  removeBorder?: boolean;
  className?: string;
}

export function HtmlPreviewLazy(props: HtmlPreviewLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={Eye} text="Loading preview..." />}>
      <HtmlPreview {...props} />
    </Suspense>
  );
}

// Lazy WYSIWYG Editor component
interface WysiwygEditorLazyProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function WysiwygEditorLazy(props: WysiwygEditorLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={FileText} text="Loading editor..." />}>
      <WysiwygEditor {...props} />
    </Suspense>
  );
}

// Lazy Thinking Display component
interface ThinkingDisplayLazyProps {
  thinkingSteps?: Array<{
    content: string;
    timestamp?: string;
  }>;
  usageMetadata?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  className?: string;
}

export function ThinkingDisplayLazy(props: ThinkingDisplayLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={Brain} text="Loading thinking steps..." />}>
      <ThinkingDisplay {...props} />
    </Suspense>
  );
}

// Lazy Grounding Sources Display component
interface GroundingSourcesDisplayLazyProps {
  groundingSources?: Array<{
    uri?: string;
    title?: string;
    snippet?: string;
  }>;
  className?: string;
}

export function GroundingSourcesDisplayLazy(props: GroundingSourcesDisplayLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={Search} text="Loading sources..." />}>
      <GroundingSourcesDisplay {...props} />
    </Suspense>
  );
}

// Lazy Image Output Display component
interface ImageOutputDisplayLazyProps {
  images?: Array<{
    url?: string;
    caption?: string;
    filename?: string;
  }>;
  className?: string;
}

export function ImageOutputDisplayLazy(props: ImageOutputDisplayLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={ImageIcon} text="Loading images..." />}>
      <ImageOutputDisplay {...props} />
    </Suspense>
  );
}

// Lazy Function Calls Display component
interface FunctionCallsDisplayLazyProps {
  functionCalls?: Array<{
    name: string;
    args: Record<string, any>;
    result?: any;
  }>;
  className?: string;
}

export function FunctionCallsDisplayLazy(props: FunctionCallsDisplayLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={Code} text="Loading function calls..." />}>
      <FunctionCallsDisplay {...props} />
    </Suspense>
  );
}

// Lazy Code Execution Display component
interface CodeExecutionDisplayLazyProps {
  codeExecution?: {
    code: string;
    language: string;
    output?: string;
    error?: string;
  };
  className?: string;
}

export function CodeExecutionDisplayLazy(props: CodeExecutionDisplayLazyProps) {
  return (
    <Suspense fallback={<GenericLoadingFallback icon={Code} text="Loading code execution..." />}>
      <CodeExecutionDisplay {...props} />
    </Suspense>
  );
}