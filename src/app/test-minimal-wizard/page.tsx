"use client";

import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/layout/app-providers";
import { WizardShell } from "@/components/wizard/wizard-shell";

export default function TestMinimalWizard() {
  const { user } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Minimal Wizard Test</h1>
      <p>This page works with Turbopack!</p>
      <p>Auth instance: {auth ? "loaded" : "not loaded"}</p>
      <p>User: {user ? user.email : "not logged in"}</p>
      <p>WizardShell imported: {WizardShell ? "yes" : "no"}</p>
    </div>
  );
}