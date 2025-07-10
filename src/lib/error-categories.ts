// Error categorization system for better error handling and user experience
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  AI_API = 'ai-api',
  FIREBASE = 'firebase',
  WORKFLOW = 'workflow',
  RENDER = 'render',
  UNKNOWN = 'unknown',
}

export interface ErrorMetadata {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  actionSuggestion?: string;
  retryable: boolean;
  component?: string;
  userId?: string;
  workflowId?: string;
  stageId?: string;
  timestamp: string;
  errorId: string;
  userAgent?: string;
  url?: string;
  stack?: string;
  additionalData?: Record<string, any>;
}

export interface CategorizedError {
  originalError: Error;
  metadata: ErrorMetadata;
}

// Error categorization logic
export function categorizeError(error: Error, context?: {
  component?: string;
  userId?: string;
  workflowId?: string;
  stageId?: string;
  additionalData?: Record<string, any>;
}): CategorizedError {
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  
  let category = ErrorCategory.UNKNOWN;
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let userMessage = 'An unexpected error occurred';
  let actionSuggestion = 'Try refreshing the page or contact support if the issue persists';
  let retryable = false;

  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorName.includes('networkerror')) {
    category = ErrorCategory.NETWORK;
    severity = 'high';
    userMessage = 'Network connection issue detected';
    actionSuggestion = 'Check your internet connection and try again';
    retryable = true;
  }
  
  // Authentication errors
  else if (errorMessage.includes('unauthorized') ||
           errorMessage.includes('authentication') ||
           errorMessage.includes('login') ||
           errorMessage.includes('token') ||
           errorMessage.includes('session expired')) {
    category = ErrorCategory.AUTHENTICATION;
    severity = 'high';
    userMessage = 'Authentication required';
    actionSuggestion = 'Please sign in again to continue';
    retryable = false;
  }
  
  // Authorization errors
  else if (errorMessage.includes('forbidden') ||
           errorMessage.includes('permission') ||
           errorMessage.includes('access denied') ||
           errorMessage.includes('not authorized')) {
    category = ErrorCategory.AUTHORIZATION;
    severity = 'high';
    userMessage = 'Access denied';
    actionSuggestion = 'You don\'t have permission to perform this action';
    retryable = false;
  }
  
  // Validation errors
  else if (errorMessage.includes('validation') ||
           errorMessage.includes('invalid') ||
           errorMessage.includes('required') ||
           errorMessage.includes('format')) {
    category = ErrorCategory.VALIDATION;
    severity = 'medium';
    userMessage = 'Input validation failed';
    actionSuggestion = 'Please check your input and try again';
    retryable = false;
  }
  
  // AI API errors
  else if (errorMessage.includes('ai') ||
           errorMessage.includes('gemini') ||
           errorMessage.includes('genai') ||
           errorMessage.includes('model') ||
           errorMessage.includes('quota') ||
           errorMessage.includes('rate limit')) {
    category = ErrorCategory.AI_API;
    severity = 'high';
    userMessage = 'AI service temporarily unavailable';
    actionSuggestion = 'The AI service is experiencing issues. Please try again in a few moments';
    retryable = true;
  }
  
  // Firebase errors
  else if (errorMessage.includes('firebase') ||
           errorMessage.includes('firestore') ||
           errorMessage.includes('storage') ||
           errorMessage.includes('auth/') ||
           errorMessage.includes('firestore/')) {
    category = ErrorCategory.FIREBASE;
    severity = 'high';
    userMessage = 'Database connection issue';
    actionSuggestion = 'Please try again. If the problem persists, contact support';
    retryable = true;
  }
  
  // Workflow errors
  else if (errorMessage.includes('workflow') ||
           errorMessage.includes('stage') ||
           errorMessage.includes('template') ||
           context?.workflowId) {
    category = ErrorCategory.WORKFLOW;
    severity = 'high';
    userMessage = 'Workflow processing error';
    actionSuggestion = 'Try restarting the workflow or contact support';
    retryable = true;
  }
  
  // Render errors
  else if (errorMessage.includes('render') ||
           errorMessage.includes('component') ||
           errorMessage.includes('react') ||
           errorName.includes('rendererror')) {
    category = ErrorCategory.RENDER;
    severity = 'critical';
    userMessage = 'Page rendering error';
    actionSuggestion = 'Try refreshing the page';
    retryable = true;
  }

  // Generate unique error ID
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const metadata: ErrorMetadata = {
    category,
    severity,
    userMessage,
    actionSuggestion,
    retryable,
    component: context?.component,
    userId: context?.userId,
    workflowId: context?.workflowId,
    stageId: context?.stageId,
    timestamp: new Date().toISOString(),
    errorId,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    stack: error.stack,
    additionalData: context?.additionalData,
  };

  return {
    originalError: error,
    metadata,
  };
}

// Helper function to get error category display info
export function getErrorCategoryInfo(category: ErrorCategory) {
  const categoryMap = {
    [ErrorCategory.NETWORK]: {
      icon: '🌐',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      title: 'Network Error',
    },
    [ErrorCategory.AUTHENTICATION]: {
      icon: '🔐',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      title: 'Authentication Error',
    },
    [ErrorCategory.AUTHORIZATION]: {
      icon: '🚫',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      title: 'Access Denied',
    },
    [ErrorCategory.VALIDATION]: {
      icon: '⚠️',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      title: 'Validation Error',
    },
    [ErrorCategory.AI_API]: {
      icon: '🤖',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      title: 'AI Service Error',
    },
    [ErrorCategory.FIREBASE]: {
      icon: '🔥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      title: 'Database Error',
    },
    [ErrorCategory.WORKFLOW]: {
      icon: '⚙️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Workflow Error',
    },
    [ErrorCategory.RENDER]: {
      icon: '🎨',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      title: 'Rendering Error',
    },
    [ErrorCategory.UNKNOWN]: {
      icon: '❓',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      title: 'Unknown Error',
    },
  };

  return categoryMap[category] || categoryMap[ErrorCategory.UNKNOWN];
}