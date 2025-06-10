interface ErrorLogEntry {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  
  private constructor() {}
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  logError(error: Error, context?: { component?: string; userId?: string; metadata?: Record<string, any> }) {
    const entry: ErrorLogEntry = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    };
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', entry);
    }
    
    // In production, you would send this to an error tracking service
    // For now, we'll store in localStorage for debugging
    if (typeof window !== 'undefined') {
      try {
        const errors = this.getStoredErrors();
        errors.push(entry);
        // Keep only last 50 errors
        const recentErrors = errors.slice(-50);
        localStorage.setItem('app_errors', JSON.stringify(recentErrors));
      } catch (e) {
        console.error('Failed to store error log:', e);
      }
    }
  }
  
  getStoredErrors(): ErrorLogEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('app_errors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  clearStoredErrors() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_errors');
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();