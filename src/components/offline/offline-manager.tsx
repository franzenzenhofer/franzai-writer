'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface OfflineManagerProps {
  children: React.ReactNode;
}

export function OfflineManager({ children }: OfflineManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Connection Restored',
        description: 'You are now online. Features are fully available.',
        variant: 'default',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Connection Lost',
        description: 'You are now offline. Some features may be limited.',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker is available
                toast({
                  title: 'App Update Available',
                  description: 'A new version is available. Refresh to update.',
                  variant: 'default',
                });
              } else {
                // Service worker is controlling the page for the first time
                setServiceWorkerReady(true);
                toast({
                  title: 'Offline Mode Enabled',
                  description: 'Franz AI Writer is now available offline.',
                  variant: 'default',
                });
              }
            }
          });
        }
      });

      // Check if service worker is already controlling the page
      if (navigator.serviceWorker.controller) {
        setServiceWorkerReady(true);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  return (
    <>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">Offline Mode</span>
          </div>
        </div>
      )}
      
      {/* Service worker ready indicator */}
      {serviceWorkerReady && isOnline && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">Offline Ready</span>
          </div>
        </div>
      )}
    </>
  );
}