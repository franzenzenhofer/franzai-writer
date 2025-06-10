'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Database, Settings } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Document page error:', error)
  }, [error])

  // Check for specific Firestore errors
  const isFirestoreConfigError = error.message.includes('Firestore API') || 
                                  error.message.includes('permission-denied') ||
                                  error.message.includes('PERMISSION_DENIED');
  
  const isConnectionError = error.message.includes('Database connection') ||
                           error.message.includes('unavailable') ||
                           error.message.includes('offline');

  if (isFirestoreConfigError) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 max-w-2xl mx-auto">
        <Database className="w-16 h-16 text-destructive mb-6" />
        <h1 className="text-3xl font-bold font-headline mb-4">Database Configuration Required</h1>
        <p className="text-muted-foreground mb-6">
          The Firestore database is not properly configured. This could mean:
        </p>
        <ul className="text-left text-muted-foreground mb-6 space-y-2">
          <li>• Firestore API needs to be enabled</li>
          <li>• Firestore database needs to be created</li>
          <li>• Firebase project configuration is missing</li>
        </ul>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button onClick={reset}>
            <Settings className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (isConnectionError) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 max-w-2xl mx-auto">
        <AlertCircle className="w-16 h-16 text-orange-500 mb-6" />
        <h1 className="text-3xl font-bold font-headline mb-4">Connection Failed</h1>
        <p className="text-muted-foreground mb-6">
          Unable to connect to the database. Please check your internet connection and Firebase configuration.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <AlertCircle className="w-16 h-16 text-destructive mb-6" />
      <h1 className="text-3xl font-bold font-headline mb-4">Something went wrong!</h1>
      <p className="text-muted-foreground mb-6">
        An error occurred while loading the document.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  )
} 