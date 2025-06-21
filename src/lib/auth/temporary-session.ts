/**
 * Temporary Session Management
 * 
 * This module handles temporary user sessions for the "Try It Out" mode.
 * Currently, temp sessions are created automatically when no auth is present.
 * In the future, this will require explicit user action via "Try it out" button.
 */

const TEMP_SESSION_KEY = 'franzai_temp_session';

export interface TemporaryUser {
  uid: string;
  isTemporary: true;
  createdAt: Date;
  expiresAt: Date;
  displayName?: string;
}

/**
 * Create a temporary user session
 * This replaces the old generateUserId() fallback
 * 
 * @returns TemporaryUser object with temp ID and metadata
 */
export function createTemporarySession(): TemporaryUser {
  // Generate a unique temporary user ID
  const timestamp = Date.now();
  const randomId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  const tempId = `temp_user_${timestamp}_${randomId}`;
  
  const tempUser: TemporaryUser = {
    uid: tempId,
    isTemporary: true,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
    displayName: 'Guest User'
  };
  
  return tempUser;
}

/**
 * Get or create a temporary session
 * Stores the session in localStorage for persistence across page reloads
 */
export function getOrCreateTemporarySession(): TemporaryUser | null {
  if (typeof window === 'undefined') {
    // Server-side: no temp sessions
    return null;
  }
  
  try {
    // Check if we have an existing session
    const storedSession = localStorage.getItem(TEMP_SESSION_KEY);
    
    if (storedSession) {
      const session = JSON.parse(storedSession) as TemporaryUser;
      const expiresAt = new Date(session.expiresAt);
      
      // Check if session is still valid
      if (expiresAt > new Date()) {
        // Restore dates as Date objects
        session.createdAt = new Date(session.createdAt);
        session.expiresAt = expiresAt;
        
        // Also set cookie for server-side access
        document.cookie = `temp-user-id=${session.uid}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        
        return session;
      }
      
      // Session expired, remove it
      localStorage.removeItem(TEMP_SESSION_KEY);
    }
    
    // Create new session
    const newSession = createTemporarySession();
    
    // Store in localStorage
    localStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(newSession));
    
    // Also set cookie for server-side access
    document.cookie = `temp-user-id=${newSession.uid}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    
    return newSession;
  } catch (error) {
    console.error('[TemporarySession] Failed to manage temp session:', error);
    // Return a non-persistent session if localStorage fails
    return createTemporarySession();
  }
}

/**
 * Clear the temporary session
 * Used when user logs in with a real account
 */
export function clearTemporarySession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TEMP_SESSION_KEY);
  
  // Also clear the cookie
  document.cookie = 'temp-user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Check if a user ID is a temporary user
 */
export function isTemporaryUserId(userId: string): boolean {
  return userId.startsWith('temp_user_');
}