'use client';

import { useEffect, useState } from 'react';

interface BuildInfo {
  version: string;
  buildTime: string;
  buildTimestamp: number;
  buildId: string;
  gitCommit: string;
  gitBranch: string;
  nodeVersion: string;
  env: string;
}

export function useBuildInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/build-info.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch build info');
        return res.json();
      })
      .then(data => {
        setBuildInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading build info:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { buildInfo, loading, error };
}

// Utility function to check if the app needs a refresh
export function checkForUpdates(currentBuildId: string): Promise<boolean> {
  return fetch('/build-info.json')
    .then(res => res.json())
    .then(data => data.buildId !== currentBuildId)
    .catch(() => false);
}