"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText as FileTextIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sanitizeFileContent } from "@/lib/security/sanitization";

interface SmartDropzoneProps {
  onTextExtracted: (text: string) => void;
  className?: string;
  label?: string;
}

export function SmartDropzone({ onTextExtracted, className, label = "Drag 'n' drop files here, or click to select" }: SmartDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const fileContent = reader.result as string;
        switch (extension) {
          case "txt":
          case "md":
            resolve(sanitizeFileContent(fileContent, extension));
            break;
          case "html":
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(fileContent, "text/html");
              const textContent = doc.body.textContent || "";
              resolve(sanitizeFileContent(textContent, extension));
            } catch (e) {
              reject("Failed to parse HTML file.");
            }
            break;
          // Placeholder for other file types
          case "docx":
          case "pdf":
          case "csv":
          case "xlsx":
            toast({
              title: "File Type Not Fully Supported",
              description: `Client-side extraction for .${extension} is not yet implemented. For now, only .txt, .md, and .html are fully supported client-side.`,
              variant: "default",
            });
            resolve(`[File: ${file.name} - content extraction for .${extension} pending full implementation]`);
            break;
          default:
            reject(`Unsupported file type: .${extension}`);
        }
      };
      reader.onerror = () => reject("Failed to read file.");
      reader.readAsText(file);
    });
  }, [toast]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length === 0) {
        return;
      }

      // For simplicity, process only the first file if multiple are dropped.
      const file = acceptedFiles[0];

      try {
        const extractedText = await extractTextFromFile(file);
        onTextExtracted(extractedText);
        // Silent - file content is visible immediately
      } catch (err: any) {
        setError(err.message || "An unknown error occurred during file processing.");
        toast({
          title: "File Processing Error",
          description: err.message || "Could not process the file.",
          variant: "destructive",
        });
      }
    },
    [onTextExtracted, toast, extractTextFromFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false, // Allow only single file upload for simplicity in this context
    accept: {
      "text/plain": [".txt", ".md"],
      "text/html": [".html"],
      // Extended mime types (note: client-side parsing for these is limited here)
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        "hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring",
        isDragActive ? "border-primary bg-accent/10" : "border-input",
        className
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className="text-xs text-muted-foreground">Supports .txt, .md, .html. (Limited support for .docx, .pdf, .csv, .xlsx)</p>
      {error && (
        <div className="mt-4 text-destructive text-sm flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
}
