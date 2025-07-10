'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff } from 'lucide-react';

interface OfflineAIWrapperProps {
  children: React.ReactNode;
  featureName?: string;
  showOfflineMessage?: boolean;
}

export function OfflineAIWrapper({ 
  children, 
  featureName = 'AI features',
  showOfflineMessage = true 
}: OfflineAIWrapperProps) {
  const isOnline = useOnlineStatus();

  if (!isOnline && showOfflineMessage) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <WifiOff className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="flex items-center justify-between">
            <span>
              {featureName} require an internet connection and are not available offline.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="ml-4"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if AI features are available
 */
export function useAIAvailability() {
  const isOnline = useOnlineStatus();
  
  return {
    isAIAvailable: isOnline,
    reason: isOnline ? null : 'offline',
  };
}

/**
 * Component to show AI loading state with offline awareness
 */
export function OfflineAwareAILoader({ 
  isLoading, 
  isOnline, 
  children 
}: {
  isLoading: boolean;
  isOnline: boolean;
  children: React.ReactNode;
}) {
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            AI features require internet connection
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">AI is processing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}