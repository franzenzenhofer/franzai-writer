import { FirebaseError } from 'firebase/app';

/**
 * User-friendly error messages with actionable guidance for Firebase errors
 * Following the FAIL HARD philosophy: provide clear, actionable errors instead of fallbacks
 */

export interface FirebaseErrorInfo {
  userMessage: string;
  technicalMessage: string;
  actionableSteps: string[];
  errorType: 'auth' | 'firestore' | 'storage' | 'network' | 'quota' | 'permission' | 'unknown';
  severity: 'high' | 'medium' | 'low';
  retryable: boolean;
}

/**
 * Centralized Firebase error handling with specific, user-friendly messages
 */
export class FirebaseErrorHandler {
  
  /**
   * Convert Firebase error to user-friendly error with actionable guidance
   */
  static handleFirebaseError(error: any, operation: string): FirebaseErrorInfo {
    
    // Check if it's a Firebase error
    if (error?.code && typeof error.code === 'string') {
      return this.handleKnownFirebaseError(error, operation);
    }
    
    // Handle network errors
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, operation);
    }
    
    // Handle quota/limits errors
    if (this.isQuotaError(error)) {
      return this.handleQuotaError(error, operation);
    }
    
    // Handle unknown errors
    return this.handleUnknownError(error, operation);
  }
  
  /**
   * Handle known Firebase error codes with specific messages
   */
  private static handleKnownFirebaseError(error: FirebaseError, operation: string): FirebaseErrorInfo {
    const code = error.code.toLowerCase();
    
    // Authentication Errors
    if (code.startsWith('auth/')) {
      return this.handleAuthError(error, operation);
    }
    
    // Firestore Errors  
    if (code.startsWith('firestore/') || code.startsWith('permission-denied')) {
      return this.handleFirestoreError(error, operation);
    }
    
    // Storage Errors
    if (code.startsWith('storage/')) {
      return this.handleStorageError(error, operation);
    }
    
    // Default Firebase error
    return {
      userMessage: `${operation} failed due to a system error. Please try again.`,
      technicalMessage: `Firebase Error: ${error.code} - ${error.message}`,
      actionableSteps: [
        "Try refreshing the page and attempting the operation again",
        "Check your internet connection",
        "If the problem persists, contact support"
      ],
      errorType: 'unknown',
      severity: 'medium',
      retryable: true
    };
  }
  
  /**
   * Handle Firebase Authentication errors
   */
  private static handleAuthError(error: FirebaseError, operation: string): FirebaseErrorInfo {
    const code = error.code;
    
    switch (code) {
      case 'auth/user-not-found':
        return {
          userMessage: "No account exists with this email address.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Check that you've entered the correct email address",
            "Try signing up for a new account instead",
            "Use the 'Forgot Password' option if you think you have an account"
          ],
          errorType: 'auth',
          severity: 'low',
          retryable: false
        };
        
      case 'auth/wrong-password':
        return {
          userMessage: "The password you entered is incorrect.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Double-check your password and try again",
            "Use the 'Forgot Password' option to reset your password",
            "Make sure Caps Lock is not enabled"
          ],
          errorType: 'auth',
          severity: 'low',
          retryable: true
        };
        
      case 'auth/invalid-email':
        return {
          userMessage: "The email address format is invalid.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Check that your email address is correctly formatted (e.g., user@example.com)",
            "Remove any extra spaces from the email field"
          ],
          errorType: 'auth',
          severity: 'low',
          retryable: true
        };
        
      case 'auth/user-disabled':
        return {
          userMessage: "This account has been disabled.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Contact support to reactivate your account",
            "Check your email for any account status notifications"
          ],
          errorType: 'auth',
          severity: 'high',
          retryable: false
        };
        
      case 'auth/too-many-requests':
        return {
          userMessage: "Too many failed login attempts. Please try again later.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Wait 15-30 minutes before trying again",
            "Use the 'Forgot Password' option to reset your password",
            "Try from a different device or network"
          ],
          errorType: 'auth',
          severity: 'medium',
          retryable: true
        };
        
      case 'auth/email-already-in-use':
        return {
          userMessage: "An account with this email already exists.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Try signing in instead of creating a new account",
            "Use the 'Forgot Password' option if you don't remember your password",
            "Use a different email address for a new account"
          ],
          errorType: 'auth',
          severity: 'low',
          retryable: false
        };
        
      case 'auth/weak-password':
        return {
          userMessage: "The password is too weak.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Use a password with at least 8 characters",
            "Include uppercase letters, lowercase letters, numbers, and symbols",
            "Avoid common words or patterns"
          ],
          errorType: 'auth',
          severity: 'low',
          retryable: true
        };
        
      case 'auth/network-request-failed':
        return {
          userMessage: "Unable to connect to authentication service.",
          technicalMessage: `Auth Error: ${error.message}`,
          actionableSteps: [
            "Check your internet connection",
            "Try again in a few moments",
            "Disable any VPN or proxy settings temporarily"
          ],
          errorType: 'network',
          severity: 'medium',
          retryable: true
        };
        
      default:
        return {
          userMessage: "Authentication failed. Please try again.",
          technicalMessage: `Auth Error: ${error.code} - ${error.message}`,
          actionableSteps: [
            "Try refreshing the page and signing in again",
            "Check your internet connection",
            "Clear your browser cache and cookies"
          ],
          errorType: 'auth',
          severity: 'medium',
          retryable: true
        };
    }
  }
  
  /**
   * Handle Firestore database errors
   */
  private static handleFirestoreError(error: FirebaseError, operation: string): FirebaseErrorInfo {
    const code = error.code;
    
    switch (code) {
      case 'firestore/permission-denied':
      case 'permission-denied':
        return {
          userMessage: "You don't have permission to access this data.",
          technicalMessage: `Firestore Error: ${error.message}`,
          actionableSteps: [
            "Make sure you are signed in to your account",
            "Refresh the page and try again",
            "Contact support if you believe you should have access"
          ],
          errorType: 'permission',
          severity: 'high',
          retryable: false
        };
        
      case 'firestore/unavailable':
        return {
          userMessage: "The database is temporarily unavailable.",
          technicalMessage: `Firestore Error: ${error.message}`,
          actionableSteps: [
            "Try again in a few moments",
            "Check your internet connection",
            "The service should be restored shortly"
          ],
          errorType: 'firestore',
          severity: 'medium',
          retryable: true
        };
        
      case 'firestore/deadline-exceeded':
        return {
          userMessage: "The operation timed out due to high server load.",
          technicalMessage: `Firestore Error: ${error.message}`,
          actionableSteps: [
            "Try again - the server may be less busy now",
            "Check your internet connection speed",
            "Try breaking large operations into smaller parts"
          ],
          errorType: 'firestore',
          severity: 'medium',
          retryable: true
        };
        
      case 'firestore/quota-exceeded':
        return {
          userMessage: "Service quota exceeded. Please try again later.",
          technicalMessage: `Firestore Error: ${error.message}`,
          actionableSteps: [
            "Wait a few minutes and try again",
            "Consider upgrading your plan if this happens frequently",
            "Contact support for quota increase options"
          ],
          errorType: 'quota',
          severity: 'high',
          retryable: true
        };
        
      case 'firestore/resource-exhausted':
        return {
          userMessage: "Database resources are temporarily exhausted.",
          technicalMessage: `Firestore Error: ${error.message}`,
          actionableSteps: [
            "Try again in a few minutes",
            "Reduce the size of your data operations",
            "Contact support if this persists"
          ],
          errorType: 'quota',
          severity: 'high',
          retryable: true
        };
        
      case 'firestore/failed-precondition':
        return {
          userMessage: "The operation couldn't be completed due to a data conflict.",
          technicalMessage: `Firestore Error: ${error.message}`,
          actionableSteps: [
            "Refresh the page to get the latest data",
            "Try the operation again",
            "Check if someone else modified the same data"
          ],
          errorType: 'firestore',
          severity: 'medium',
          retryable: true
        };
        
      default:
        return {
          userMessage: `Database operation failed: ${operation}`,
          technicalMessage: `Firestore Error: ${error.code} - ${error.message}`,
          actionableSteps: [
            "Try refreshing the page and attempting the operation again",
            "Check your internet connection",
            "Contact support if the problem persists"
          ],
          errorType: 'firestore',
          severity: 'medium',
          retryable: true
        };
    }
  }
  
  /**
   * Handle Firebase Storage errors
   */
  private static handleStorageError(error: FirebaseError, operation: string): FirebaseErrorInfo {
    const code = error.code;
    
    switch (code) {
      case 'storage/quota-exceeded':
        return {
          userMessage: "Storage quota exceeded. Cannot upload more files.",
          technicalMessage: `Storage Error: ${error.message}`,
          actionableSteps: [
            "Delete some unused files to free up space",
            "Upgrade your storage plan",
            "Contact support for storage increase options"
          ],
          errorType: 'quota',
          severity: 'high',
          retryable: false
        };
        
      case 'storage/unauthenticated':
        return {
          userMessage: "You need to sign in to upload files.",
          technicalMessage: `Storage Error: ${error.message}`,
          actionableSteps: [
            "Sign in to your account",
            "Refresh the page after signing in",
            "Try the upload operation again"
          ],
          errorType: 'auth',
          severity: 'high',
          retryable: false
        };
        
      case 'storage/unauthorized':
        return {
          userMessage: "You don't have permission to access this file.",
          technicalMessage: `Storage Error: ${error.message}`,
          actionableSteps: [
            "Make sure you are signed in",
            "Check if you own this file",
            "Contact support if you believe you should have access"
          ],
          errorType: 'permission',
          severity: 'high',
          retryable: false
        };
        
      case 'storage/retry-limit-exceeded':
        return {
          userMessage: "File upload failed after multiple attempts.",
          technicalMessage: `Storage Error: ${error.message}`,
          actionableSteps: [
            "Check your internet connection stability",
            "Try uploading a smaller file",
            "Wait a few minutes and try again"
          ],
          errorType: 'network',
          severity: 'medium',
          retryable: true
        };
        
      case 'storage/invalid-format':
        return {
          userMessage: "The file format is not supported.",
          technicalMessage: `Storage Error: ${error.message}`,
          actionableSteps: [
            "Check the supported file formats",
            "Convert your file to a supported format",
            "Try uploading a different file"
          ],
          errorType: 'storage',
          severity: 'low',
          retryable: false
        };
        
      case 'storage/object-not-found':
        return {
          userMessage: "The requested file was not found.",
          technicalMessage: `Storage Error: ${error.message}`,
          actionableSteps: [
            "Check if the file still exists",
            "Try refreshing the page",
            "The file may have been moved or deleted"
          ],
          errorType: 'storage',
          severity: 'medium',
          retryable: false
        };
        
      default:
        return {
          userMessage: `File operation failed: ${operation}`,
          technicalMessage: `Storage Error: ${error.code} - ${error.message}`,
          actionableSteps: [
            "Try the operation again",
            "Check your internet connection",
            "Contact support if the problem persists"
          ],
          errorType: 'storage',
          severity: 'medium',
          retryable: true
        };
    }
  }
  
  /**
   * Handle network-related errors
   */
  private static handleNetworkError(error: any, operation: string): FirebaseErrorInfo {
    return {
      userMessage: "Network connection failed. Please check your internet connection.",
      technicalMessage: `Network Error: ${error.message || 'Connection failed'}`,
      actionableSteps: [
        "Check your internet connection",
        "Try again in a few moments",
        "Disable any VPN or proxy settings temporarily",
        "Try switching to a different network (mobile data, etc.)"
      ],
      errorType: 'network',
      severity: 'medium',
      retryable: true
    };
  }
  
  /**
   * Handle quota/rate limit errors
   */
  private static handleQuotaError(error: any, operation: string): FirebaseErrorInfo {
    return {
      userMessage: "Service quota exceeded. Please try again later.",
      technicalMessage: `Quota Error: ${error.message || 'Quota exceeded'}`,
      actionableSteps: [
        "Wait a few minutes and try again",
        "Consider upgrading your plan if this happens frequently",
        "Contact support for quota increase options",
        "Try breaking large operations into smaller parts"
      ],
      errorType: 'quota',
      severity: 'high',
      retryable: true
    };
  }
  
  /**
   * Handle unknown errors
   */
  private static handleUnknownError(error: any, operation: string): FirebaseErrorInfo {
    return {
      userMessage: `${operation} failed due to an unexpected error. Please try again.`,
      technicalMessage: `Unknown Error: ${error.message || error.toString()}`,
      actionableSteps: [
        "Try refreshing the page and attempting the operation again",
        "Check your internet connection",
        "Clear your browser cache and cookies",
        "Contact support if the problem persists"
      ],
      errorType: 'unknown',
      severity: 'medium',
      retryable: true
    };
  }
  
  /**
   * Check if error is network-related
   */
  private static isNetworkError(error: any): boolean {
    if (!error) return false;
    
    const errorString = error.toString().toLowerCase();
    const networkKeywords = [
      'network', 'connection', 'timeout', 'unreachable', 
      'offline', 'net::', 'fetch'
    ];
    
    return networkKeywords.some(keyword => errorString.includes(keyword));
  }
  
  /**
   * Check if error is quota-related
   */
  private static isQuotaError(error: any): boolean {
    if (!error) return false;
    
    const errorString = error.toString().toLowerCase();
    const quotaKeywords = [
      'quota', 'limit', 'exceeded', 'rate', 'throttle',
      'too many', 'resource-exhausted'
    ];
    
    return quotaKeywords.some(keyword => errorString.includes(keyword));
  }
  
  /**
   * Create a detailed error for logging while throwing user-friendly error
   */
  static createDetailedError(errorInfo: FirebaseErrorInfo, originalError: any): Error {
    const detailedError = new Error(errorInfo.userMessage);
    
    // Add additional properties for debugging
    (detailedError as any).technicalMessage = errorInfo.technicalMessage;
    (detailedError as any).actionableSteps = errorInfo.actionableSteps;
    (detailedError as any).errorType = errorInfo.errorType;
    (detailedError as any).severity = errorInfo.severity;
    (detailedError as any).retryable = errorInfo.retryable;
    (detailedError as any).originalError = originalError;
    
    return detailedError;
  }
  
  /**
   * Log comprehensive error information for debugging
   */
  static logError(operation: string, errorInfo: FirebaseErrorInfo, originalError: any): void {
    console.error(`[FIREBASE ERROR] ${operation} failed:`, {
      userMessage: errorInfo.userMessage,
      technicalMessage: errorInfo.technicalMessage,
      errorType: errorInfo.errorType,
      severity: errorInfo.severity,
      retryable: errorInfo.retryable,
      actionableSteps: errorInfo.actionableSteps,
      originalError: originalError,
      timestamp: new Date().toISOString()
    });
  }
}