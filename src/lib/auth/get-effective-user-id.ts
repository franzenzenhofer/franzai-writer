import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/lib/firebase-admin';

/**
 * Get the effective user ID for server-side operations
 * Returns either the authenticated user ID or a temp user ID
 */
export async function getEffectiveUserId(): Promise<string> {
  try {
    // Try to get authenticated user first
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (authToken?.value) {
      try {
        initAdmin();
        const decodedToken = await getAuth().verifyIdToken(authToken.value);
        return decodedToken.uid;
      } catch (error) {
        console.log('[getEffectiveUserId] Failed to verify auth token:', error);
      }
    }
  } catch (error) {
    console.log('[getEffectiveUserId] Error getting auth:', error);
  }
  
  // No authenticated user, use temp user ID
  const cookieStore = await cookies();
  let tempUserId = cookieStore.get('temp-user-id')?.value;
  
  if (!tempUserId) {
    // Generate new temp user ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    tempUserId = `temp_user_${timestamp}_${randomId}`;
    
    // Note: We can't set cookies in a server component that's already rendering
    // The temp user will be created client-side if needed
  }
  
  return tempUserId || 'temp_user_fallback';
}