"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity, Server, ArrowLeft } from 'lucide-react';

export function AdminNav() {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold text-slate-900">
              Admin Panel
            </Link>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/debug/ai-log-viewer">
                  <Activity className="h-4 w-4 mr-2" />
                  AI Logs
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/debug/system-status">
                  <Server className="h-4 w-4 mr-2" />
                  System Status
                </Link>
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}