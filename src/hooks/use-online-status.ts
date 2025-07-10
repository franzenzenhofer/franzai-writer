'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect online/offline status
 * @returns {boolean} - true if online, false if offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to provide offline-aware functionality
 * @returns {object} - online status and helper functions
 */
export function useOfflineCapabilities() {
  const isOnline = useOnlineStatus();
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  const isFeatureAvailable = (feature: 'ai' | 'sync' | 'images' | 'storage') => {
    if (isOnline) return true;
    
    // These features require internet connection
    const onlineOnly = ['ai', 'sync', 'images'];
    return !onlineOnly.includes(feature);
  };

  const queueOfflineAction = (action: any) => {
    if (!isOnline) {
      setPendingActions(prev => [...prev, action]);
    }
  };

  const processPendingActions = () => {
    if (isOnline && pendingActions.length > 0) {
      // Process pending actions when back online
      pendingActions.forEach(action => {
        // This would need to be implemented based on the specific action type
        console.log('Processing pending action:', action);
      });
      setPendingActions([]);
    }
  };

  useEffect(() => {
    processPendingActions();
  }, [isOnline]);

  return {
    isOnline,
    isFeatureAvailable,
    queueOfflineAction,
    pendingActions,
  };
}