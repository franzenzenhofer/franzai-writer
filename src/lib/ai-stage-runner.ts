"use client";

/**
 * Client-side helper that calls the server-side AI Stage execution through
 * the /api/wizard/execute endpoint.
 * It intentionally contains **no** server-only imports so it is safe to
 * bundle in any Client Component.
 */
export async function runAiStage<TParams = any, TResult = any>(params: TParams): Promise<TResult> {
  const response = await fetch("/api/wizard/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    // Try to read error payload; fall back to status text
    let message: string;
    try {
      const json = await response.json();
      message = json.error ?? response.statusText;
    } catch {
      message = response.statusText;
    }
    throw new Error(message || "AI execution failed");
  }

  return response.json() as Promise<TResult>;
} 