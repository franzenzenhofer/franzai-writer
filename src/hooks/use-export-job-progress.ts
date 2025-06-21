'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ExportJobState } from '@/lib/export-job-manager';

interface UseExportJobProgressReturn {
  jobState: ExportJobState | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook to subscribe to export job progress in real-time
 * 
 * This hook provides the client-side subscription to export job state,
 * eliminating the need for server-side callbacks that violate RSC boundaries.
 * 
 * Features:
 * - Real-time progress updates via Firestore subscriptions
 * - Automatic reconnection on network issues
 * - Survives page reloads and tab switches
 * - Clean error handling and retry logic
 */
export function useExportJobProgress(jobId: string | null): UseExportJobProgressReturn {
  const [jobState, setJobState] = useState<ExportJobState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (!jobId) {
      setJobState(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    console.log('[useExportJobProgress] Subscribing to job:', jobId);
    setIsLoading(true);
    setError(null);

    let unsubscribe: Unsubscribe | null = null;

    try {
      const jobDocRef = doc(db, 'export-jobs', jobId);
      
      unsubscribe = onSnapshot(
        jobDocRef,
        {
          // Include metadata changes to detect when we're offline
          includeMetadataChanges: true
        },
        (docSnapshot) => {
          console.log('[useExportJobProgress] Job state updated:', {
            jobId,
            exists: docSnapshot.exists(),
            fromCache: docSnapshot.metadata.fromCache,
            hasPendingWrites: docSnapshot.metadata.hasPendingWrites
          });

          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as ExportJobState;
            setJobState(data);
            setError(null);
            
            // Only set loading to false if this is not a cached result
            if (!docSnapshot.metadata.fromCache) {
              setIsLoading(false);
            }
          } else {
            // Job document doesn't exist yet - this can happen briefly when the job is being created
            console.log('[useExportJobProgress] Job document does not exist yet:', jobId);
            setJobState(null);
            
            // Don't immediately set error - give it a moment for the job to be created
            setTimeout(() => {
              if (!docSnapshot.exists()) {
                setError('Export job not found');
                setIsLoading(false);
              }
            }, 2000);
          }
        },
        (err) => {
          console.error('[useExportJobProgress] Subscription error:', err);
          setError(err.message || 'Failed to subscribe to export progress');
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error('[useExportJobProgress] Failed to set up subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up export progress subscription');
      setIsLoading(false);
    }

    // Cleanup subscription on unmount or jobId change
    return () => {
      if (unsubscribe) {
        console.log('[useExportJobProgress] Unsubscribing from job:', jobId);
        unsubscribe();
      }
    };
  }, [jobId]);

  return {
    jobState,
    isLoading,
    error,
    retry
  };
}

/**
 * Helper hook for common export job progress scenarios
 */
export function useExportJobStatus(jobId: string | null) {
  const { jobState, isLoading, error, retry } = useExportJobProgress(jobId);
  
  const isRunning = jobState?.status === 'running';
  const isCompleted = jobState?.status === 'completed';
  const isError = jobState?.status === 'error' || !!error;
  const progress = jobState?.progress;
  const output = jobState?.output;
  const jobError = jobState?.error || error;
  
  return {
    jobState,
    isLoading,
    isRunning,
    isCompleted,
    isError,
    progress,
    output,
    error: jobError,
    retry
  };
} 