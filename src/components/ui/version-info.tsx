'use client';

import { useEffect, useState } from 'react';
import { useBuildInfo, checkForUpdates } from '@/hooks/use-build-info';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VersionInfoProps {
  className?: string;
  showUpdateCheck?: boolean;
}

export function VersionInfo({ className = '', showUpdateCheck = true }: VersionInfoProps) {
  const { buildInfo, loading } = useBuildInfo();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!buildInfo || !showUpdateCheck) return;

    // Check for updates every 5 minutes
    const interval = setInterval(async () => {
      const hasUpdate = await checkForUpdates(buildInfo.buildId);
      if (hasUpdate) {
        setUpdateAvailable(true);
        toast({
          title: 'Update Available',
          description: 'A new version is available. Click to refresh.',
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          ),
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [buildInfo, showUpdateCheck, toast]);

  if (loading || !buildInfo) return null;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      <span>v{buildInfo.version}</span>
      {buildInfo.env !== 'production' && (
        <span className="ml-2">({buildInfo.gitCommit})</span>
      )}
      {updateAvailable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="ml-2 h-6 px-2 text-xs"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Update
        </Button>
      )}
    </div>
  );
}

// Minimal version display for footers
export function VersionBadge({ className = '' }: { className?: string }) {
  const { buildInfo } = useBuildInfo();
  
  if (!buildInfo) return null;
  
  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      v{buildInfo.version} • Build {buildInfo.buildId.substring(0, 8)}
    </span>
  );
}