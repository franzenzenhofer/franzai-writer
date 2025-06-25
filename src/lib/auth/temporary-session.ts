/**
 * Temporary session management for unauthenticated users
 * Provides session continuity during trial/demo usage
 */

export interface TemporaryUser {
  uid: string;
  createdAt: Date;
  isTemporary: true;
}

const TEMP_USER_KEY = 'temp-user-session';
const TEMP_USER_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or create a temporary session for unauthenticated users
 */
export function getOrCreateTemporarySession(): TemporaryUser {
  if (typeof window === 'undefined') {
    // Server-side: create a new temp user
    return createNewTemporaryUser();
  }

  try {
    const stored = localStorage.getItem(TEMP_USER_KEY);
    if (stored) {
      const tempUser: TemporaryUser = JSON.parse(stored);
      
      // Check if session is still valid
      const age = Date.now() - new Date(tempUser.createdAt).getTime();
      if (age < TEMP_USER_EXPIRY) {
        return tempUser;
      }
    }
  } catch (error) {
    console.warn('[TemporarySession] Failed to parse stored session:', error);
  }

  // Create new temporary user
  const newTempUser = createNewTemporaryUser();
  
  try {
    localStorage.setItem(TEMP_USER_KEY, JSON.stringify(newTempUser));
  } catch (error) {
    console.warn('[TemporarySession] Failed to store session:', error);
  }
  
  return newTempUser;
}

/**
 * Clear the temporary session
 */
export function clearTemporarySession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TEMP_USER_KEY);
    } catch (error) {
      console.warn('[TemporarySession] Failed to clear session:', error);
    }
  }
}

/**
 * Create a new temporary user
 */
function createNewTemporaryUser(): TemporaryUser {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  
  return {
    uid: `temp_user_${timestamp}_${randomId}`,
    createdAt: new Date(),
    isTemporary: true
  };
}

/**
 * Check if a user ID represents a temporary user
 */
export function isTemporaryUserId(userId: string): boolean {
  return userId.startsWith('temp_user_');
}