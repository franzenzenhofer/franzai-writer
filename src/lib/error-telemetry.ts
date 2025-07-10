import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { ErrorMetadata, CategorizedError } from './error-categories';

export interface ErrorTelemetryEntry {
  errorId: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userMessage: string;
  stack?: string;
  component?: string;
  userId?: string;
  workflowId?: string;
  stageId?: string;
  userAgent?: string;
  url?: string;
  timestamp: Timestamp;
  actionSuggestion?: string;
  retryable: boolean;
  additionalData?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: Timestamp;
  occurrenceCount?: number;
  firstOccurrence?: Timestamp;
  lastOccurrence?: Timestamp;
}

class ErrorTelemetry {
  private static instance: ErrorTelemetry;
  private isInitialized = false;
  private fallbackToLocalStorage = false;

  private constructor() {}

  static getInstance(): ErrorTelemetry {
    if (!ErrorTelemetry.instance) {
      ErrorTelemetry.instance = new ErrorTelemetry();
    }
    return ErrorTelemetry.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Test Firebase connection
      await this.testConnection();
      this.isInitialized = true;
      this.fallbackToLocalStorage = false;
    } catch (error) {
      console.warn('Firebase telemetry initialization failed, falling back to localStorage:', error);
      this.fallbackToLocalStorage = true;
      this.isInitialized = true;
    }
  }

  private async testConnection() {
    // Simple test to verify Firebase connection
    const testCollection = collection(db, 'error_telemetry');
    const testQuery = query(testCollection, limit(1));
    await getDocs(testQuery);
  }

  async logError(categorizedError: CategorizedError): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { originalError, metadata } = categorizedError;
    
    if (this.fallbackToLocalStorage) {
      await this.logErrorToLocalStorage(categorizedError);
      return;
    }

    try {
      const telemetryEntry: ErrorTelemetryEntry = {
        errorId: metadata.errorId,
        category: metadata.category,
        severity: metadata.severity,
        message: originalError.message,
        userMessage: metadata.userMessage,
        stack: metadata.stack,
        component: metadata.component,
        userId: metadata.userId,
        workflowId: metadata.workflowId,
        stageId: metadata.stageId,
        userAgent: metadata.userAgent,
        url: metadata.url,
        timestamp: Timestamp.now(),
        actionSuggestion: metadata.actionSuggestion,
        retryable: metadata.retryable,
        additionalData: metadata.additionalData,
        resolved: false,
        occurrenceCount: 1,
        firstOccurrence: Timestamp.now(),
        lastOccurrence: Timestamp.now(),
      };

      // Check if similar error already exists
      const existingError = await this.findSimilarError(telemetryEntry);
      
      if (existingError) {
        // Update existing error with new occurrence
        await this.updateErrorOccurrence(existingError.id, telemetryEntry);
      } else {
        // Log new error
        await this.createNewErrorEntry(telemetryEntry);
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged to telemetry:', telemetryEntry);
      }
    } catch (error) {
      console.error('Failed to log error to Firebase, falling back to localStorage:', error);
      this.fallbackToLocalStorage = true;
      await this.logErrorToLocalStorage(categorizedError);
    }
  }

  private async logErrorToLocalStorage(categorizedError: CategorizedError): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const { originalError, metadata } = categorizedError;
      const telemetryEntry = {
        errorId: metadata.errorId,
        category: metadata.category,
        severity: metadata.severity,
        message: originalError.message,
        userMessage: metadata.userMessage,
        stack: metadata.stack,
        component: metadata.component,
        userId: metadata.userId,
        workflowId: metadata.workflowId,
        stageId: metadata.stageId,
        userAgent: metadata.userAgent,
        url: metadata.url,
        timestamp: metadata.timestamp,
        actionSuggestion: metadata.actionSuggestion,
        retryable: metadata.retryable,
        additionalData: metadata.additionalData,
      };

      const existingTelemetry = JSON.parse(localStorage.getItem('error_telemetry') || '[]');
      existingTelemetry.push(telemetryEntry);
      
      // Keep only last 100 entries
      const recentTelemetry = existingTelemetry.slice(-100);
      localStorage.setItem('error_telemetry', JSON.stringify(recentTelemetry));
    } catch (error) {
      console.error('Failed to log error to localStorage:', error);
    }
  }

  private async findSimilarError(telemetryEntry: ErrorTelemetryEntry): Promise<any> {
    try {
      const errorsCollection = collection(db, 'error_telemetry');
      const similarQuery = query(
        errorsCollection,
        where('message', '==', telemetryEntry.message),
        where('component', '==', telemetryEntry.component || null),
        where('userId', '==', telemetryEntry.userId || null),
        where('resolved', '==', false),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(similarQuery);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error('Error finding similar errors:', error);
      return null;
    }
  }

  private async updateErrorOccurrence(errorId: string, newEntry: ErrorTelemetryEntry): Promise<void> {
    try {
      const errorDoc = doc(db, 'error_telemetry', errorId);
      await updateDoc(errorDoc, {
        occurrenceCount: increment(1),
        lastOccurrence: Timestamp.now(),
        // Update other fields that might have changed
        stack: newEntry.stack,
        url: newEntry.url,
        userAgent: newEntry.userAgent,
        additionalData: newEntry.additionalData,
      });
    } catch (error) {
      console.error('Error updating error occurrence:', error);
    }
  }

  private async createNewErrorEntry(telemetryEntry: ErrorTelemetryEntry): Promise<void> {
    try {
      const errorsCollection = collection(db, 'error_telemetry');
      await addDoc(errorsCollection, telemetryEntry);
    } catch (error) {
      console.error('Error creating new error entry:', error);
      throw error;
    }
  }

  async getErrorStats(userId?: string): Promise<{
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorTelemetryEntry[];
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.fallbackToLocalStorage) {
      return this.getErrorStatsFromLocalStorage(userId);
    }

    try {
      const errorsCollection = collection(db, 'error_telemetry');
      let baseQuery = query(errorsCollection, orderBy('timestamp', 'desc'), limit(100));
      
      if (userId) {
        baseQuery = query(errorsCollection, where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(100));
      }

      const snapshot = await getDocs(baseQuery);
      const errors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ErrorTelemetryEntry[];

      const errorsByCategory: Record<string, number> = {};
      const errorsBySeverity: Record<string, number> = {};

      errors.forEach(error => {
        errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
        errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      });

      return {
        totalErrors: errors.length,
        errorsByCategory,
        errorsBySeverity,
        recentErrors: errors.slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting error stats:', error);
      return {
        totalErrors: 0,
        errorsByCategory: {},
        errorsBySeverity: {},
        recentErrors: [],
      };
    }
  }

  private getErrorStatsFromLocalStorage(userId?: string): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorTelemetryEntry[];
  } {
    if (typeof window === 'undefined') {
      return {
        totalErrors: 0,
        errorsByCategory: {},
        errorsBySeverity: {},
        recentErrors: [],
      };
    }

    try {
      const telemetryData = JSON.parse(localStorage.getItem('error_telemetry') || '[]');
      const filteredErrors = userId 
        ? telemetryData.filter((error: any) => error.userId === userId)
        : telemetryData;

      const errorsByCategory: Record<string, number> = {};
      const errorsBySeverity: Record<string, number> = {};

      filteredErrors.forEach((error: any) => {
        errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
        errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      });

      return {
        totalErrors: filteredErrors.length,
        errorsByCategory,
        errorsBySeverity,
        recentErrors: filteredErrors.slice(-10).reverse(),
      };
    } catch (error) {
      console.error('Error getting stats from localStorage:', error);
      return {
        totalErrors: 0,
        errorsByCategory: {},
        errorsBySeverity: {},
        recentErrors: [],
      };
    }
  }
}

export const errorTelemetry = ErrorTelemetry.getInstance();