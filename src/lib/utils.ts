import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { StageState } from "@/types"; // Import StageState

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId(): string {
  // Generate a unique ID in the format suggested: e.g., "353534w63456"
  const timestamp = Date.now().toString(36); // Base36 timestamp
  const randomPart = Math.random().toString(36).substring(2, 8); // Random 6 characters
  return `${timestamp}w${randomPart}`;
}

// Helper function to calculate word count from stage outputs
export function calculateWordCount(stageStates: Record<string, StageState>): number {
  let totalWords = 0;

  Object.values(stageStates).forEach(state => {
    if (state.output && typeof state.output === 'string') {
      totalWords += state.output.split(/\s+/).filter(word => word.length > 0).length;
    }
  });

  return totalWords;
}

// Helper function to find the last edited stage
export function findLastEditedStage(stageStates: Record<string, StageState>): string | undefined {
  let lastStage: string | undefined;
  let lastTime = 0;

  Object.entries(stageStates).forEach(([stageId, state]) => {
    if (state.completedAt) {
      const completedTime = new Date(state.completedAt).getTime();
      if (completedTime > lastTime) {
        lastTime = completedTime;
        lastStage = stageId;
      }
    }
  });

  return lastStage;
}
