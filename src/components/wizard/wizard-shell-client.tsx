"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { WizardInstance, Stage, StageState } from '@/types';
import { StageCard } from './stage-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, Info, Lightbulb, DownloadCloud, FileWarning, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FinalDocumentDialog } from './final-document-dialog';
import { siteConfig } from '@/config/site';
import { useDocumentPersistence } from '@/hooks/use-document-persistence';
import { Badge } from '@/components/ui/badge';

// Import the server action wrapper
import { runAiStageWrapper } from './wizard-actions';

// Rest of the wizard-shell.tsx content goes here - just replace runAiStage calls with runAiStageWrapper
export default function WizardShellClient({ instance: initialInstance }: { instance: WizardInstance }) {
  // Copy all the component logic from wizard-shell.tsx
  // but use runAiStageWrapper instead of the fetch-based runAiStage
  
  // This is a placeholder - the full implementation would be copied from wizard-shell.tsx
  return <div>Wizard Shell Client</div>;
}