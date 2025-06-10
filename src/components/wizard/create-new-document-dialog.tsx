
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockWorkflows } from "@/lib/mock-data"; // Assuming mockWorkflows is fine to list available workflows

export function CreateNewDocumentDialog() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(mockWorkflows[0]?.id || "");

  // Fallback if mockWorkflows is empty or selectedWorkflowId is not set initially
  const linkHref = selectedWorkflowId ? `/wizard/_new_${selectedWorkflowId}` : "/dashboard"; 
  const canProceed = !!selectedWorkflowId;

  return (
    <Dialog defaultOpen>
      {/* DialogTrigger is not needed here as defaultOpen is true */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Choose a Workflow</DialogTitle>
          <DialogDescription>
            Select the type of document you want to create.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workflow-select" className="text-right col-span-1">
              Workflow
            </Label>
            <Select 
              value={selectedWorkflowId} 
              onValueChange={setSelectedWorkflowId}
              disabled={mockWorkflows.length === 0}
            >
              <SelectTrigger id="workflow-select" className="col-span-3">
                <SelectValue placeholder="Select a workflow" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkflows.map(wf => (
                  <SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" asChild disabled={!canProceed}>
            <Link href={linkHref}>Start with Selected Workflow</Link>
          </Button>
        </DialogFooter>
        {!canProceed && mockWorkflows.length === 0 && (
            <p className="text-xs text-destructive text-center col-span-full">No workflows available to create a document.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
