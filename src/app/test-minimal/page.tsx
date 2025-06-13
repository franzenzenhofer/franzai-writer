"use client";

// Test importing useAuth which imports firebase
import { useAuth } from "@/components/layout/app-providers";

export default function TestMinimalPage() {
  const { user } = useAuth();
  return <div>Test Minimal Client Component - User: {user?.email || 'none'}</div>;
}