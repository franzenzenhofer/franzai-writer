"use server";

import { documentPersistence } from "@/lib/document-persistence";

/**
 * List user documents server action
 */
export async function listUserDocuments() {
  const docs = await documentPersistence.listUserDocuments();
  return docs;
}

/**
 * Copy a document server action
 */
export async function copyDocument(documentId: string, newTitle?: string) {
  const result = await documentPersistence.copyDocument(documentId, newTitle);
  return result;
}

/**
 * Delete a document server action
 */
export async function deleteDocument(documentId: string) {
  const result = await documentPersistence.deleteDocument(documentId);
  return result;
}

/**
 * Delete multiple documents server action
 */
export async function deleteDocuments(documentIds: string[]) {
  const result = await documentPersistence.deleteDocuments(documentIds);
  return result;
}