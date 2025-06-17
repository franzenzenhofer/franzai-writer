import { nanoid } from 'nanoid';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import type { Asset } from '@/types';

/**
 * Asset Manager - Centralized system for managing all generated and uploaded assets
 * 
 * Core principles:
 * - Single source of truth for all assets
 * - Automatic lifecycle management
 * - Document association tracking
 * - Firebase Storage integration
 */
export class AssetManager {
  
  /**
   * Create a new asset record and upload file to Firebase Storage
   * 
   * @param params Asset creation parameters
   * @returns The created asset record
   */
  async createAsset(params: {
    userId: string;
    file: Blob | Buffer;
    metadata: {
      fileName: string;
      mimeType: string;
      source: 'generated' | 'uploaded';
      generationPrompt?: string;
      generationModel?: string;
      documentId?: string;
      stageId?: string;
      dimensions?: { width: number; height: number };
    }
  }): Promise<Asset> {
    try {
      console.log('[ASSET MANAGER] Creating new asset for user:', params.userId);
      
      // 1. Generate asset ID
      const assetId = nanoid();
      
      // 2. Upload to standardized path: assets/{assetId}/original.{ext}
      const ext = params.metadata.mimeType.split('/')[1] || 'png';
      const storagePath = `assets/${assetId}/original.${ext}`;
      const storageRef = ref(storage, storagePath);
      
      // 3. Upload file to Firebase Storage with retry logic
      let uploadAttempts = 0;
      let publicUrl: string | null = null;
      
      while (uploadAttempts < 3 && !publicUrl) {
        try {
          await uploadBytes(storageRef, params.file, { 
            contentType: params.metadata.mimeType 
          });
          publicUrl = await getDownloadURL(storageRef);
        } catch (uploadError: any) {
          uploadAttempts++;
          console.error(`[ASSET MANAGER] Upload attempt ${uploadAttempts} failed:`, uploadError);
          
          if (uploadError.code === 'storage/unauthorized' || uploadError.code === 'storage/unauthenticated') {
            console.error('[ASSET MANAGER] ❌ Storage authentication error - check Firebase Auth and Storage rules');
          }
          
          if (uploadAttempts >= 3) {
            throw new Error(`Failed to upload after ${uploadAttempts} attempts: ${uploadError.message}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
        }
      }
      
      if (!publicUrl) {
        throw new Error('Failed to get public URL after upload');
      }
      
      // 4. Create asset record
      const asset: Asset = {
        id: assetId,
        userId: params.userId,
        type: 'image', // TODO: Support other types based on mimeType
        mimeType: params.metadata.mimeType,
        storageUrl: storagePath,
        publicUrl,
        fileName: params.metadata.fileName,
        fileSize: params.file instanceof Blob ? params.file.size : params.file.length,
        dimensions: params.metadata.dimensions,
        createdAt: serverTimestamp(),
        source: params.metadata.source,
        generationPrompt: params.metadata.generationPrompt,
        generationModel: params.metadata.generationModel,
        documentIds: params.metadata.documentId ? [params.metadata.documentId] : [],
        stageReferences: params.metadata.documentId && params.metadata.stageId ? [{
          documentId: params.metadata.documentId,
          stageId: params.metadata.stageId,
          addedAt: serverTimestamp()
        }] : [],
        lastAccessedAt: serverTimestamp(),
        isDeleted: false
      };
      
      // 5. Save to Firestore
      await setDoc(doc(db, 'assets', assetId), asset);
      
      console.log('[ASSET MANAGER] ✅ Asset created successfully:', assetId);
      console.log('[ASSET MANAGER] ✅ Public URL:', publicUrl);
      
      return asset;
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to create asset:', error);
      throw new Error(`Failed to create asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Add an existing asset to a document (for asset reuse)
   */
  async addAssetToDocument(assetId: string, documentId: string, stageId: string): Promise<void> {
    try {
      console.log(`[ASSET MANAGER] Adding asset ${assetId} to document ${documentId}`);
      
      await updateDoc(doc(db, 'assets', assetId), {
        documentIds: arrayUnion(documentId),
        stageReferences: arrayUnion({
          documentId,
          stageId,
          addedAt: serverTimestamp()
        }),
        lastAccessedAt: serverTimestamp()
      });
      
      console.log('[ASSET MANAGER] ✅ Asset added to document');
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to add asset to document:', error);
      throw error;
    }
  }
  
  /**
   * Remove an asset from a document (doesn't delete the asset)
   */
  async removeAssetFromDocument(assetId: string, documentId: string): Promise<void> {
    try {
      console.log(`[ASSET MANAGER] Removing asset ${assetId} from document ${documentId}`);
      
      // Get current asset data
      const assetDoc = await getDoc(doc(db, 'assets', assetId));
      if (!assetDoc.exists()) {
        throw new Error('Asset not found');
      }
      
      const asset = assetDoc.data() as Asset;
      
      // Remove document reference
      await updateDoc(doc(db, 'assets', assetId), {
        documentIds: arrayRemove(documentId),
        stageReferences: asset.stageReferences.filter(ref => ref.documentId !== documentId)
      });
      
      // Check if asset is now orphaned
      const remainingDocs = asset.documentIds.filter(id => id !== documentId);
      if (remainingDocs.length === 0) {
        console.log('[ASSET MANAGER] ⚠️  Asset is now orphaned, marking for cleanup');
        // Asset will be cleaned up by scheduled function after 30 days
      }
      
      console.log('[ASSET MANAGER] ✅ Asset removed from document');
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to remove asset from document:', error);
      throw error;
    }
  }
  
  /**
   * Get an asset by ID
   */
  async getAsset(assetId: string): Promise<Asset | null> {
    try {
      const assetDoc = await getDoc(doc(db, 'assets', assetId));
      if (!assetDoc.exists()) {
        return null;
      }
      
      // Update last accessed timestamp
      await updateDoc(doc(db, 'assets', assetId), {
        lastAccessedAt: serverTimestamp()
      });
      
      return { id: assetDoc.id, ...assetDoc.data() } as Asset;
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to get asset:', error);
      return null;
    }
  }
  
  /**
   * Get all assets for a user with optional filtering
   */
  async getUserAssets(userId: string, options?: {
    type?: 'image' | 'video' | 'file';
    documentId?: string;
    includeDeleted?: boolean;
    limit?: number;
  }): Promise<Asset[]> {
    try {
      console.log(`[ASSET MANAGER] Getting assets for user: ${userId}`);
      
      let q = query(
        collection(db, 'assets'),
        where('userId', '==', userId)
      );
      
      if (!options?.includeDeleted) {
        q = query(q, where('isDeleted', '==', false));
      }
      
      if (options?.type) {
        q = query(q, where('type', '==', options.type));
      }
      
      if (options?.documentId) {
        q = query(q, where('documentIds', 'array-contains', options.documentId));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      const snapshot = await getDocs(q);
      const assets = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Asset));
      
      console.log(`[ASSET MANAGER] ✅ Found ${assets.length} assets`);
      return assets;
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to get user assets:', error);
      return [];
    }
  }
  
  /**
   * Soft delete an asset (mark as deleted, don't actually remove)
   */
  async softDeleteAsset(assetId: string, userId: string): Promise<void> {
    try {
      console.log(`[ASSET MANAGER] Soft deleting asset: ${assetId}`);
      
      // Verify ownership
      const assetDoc = await getDoc(doc(db, 'assets', assetId));
      if (!assetDoc.exists()) {
        throw new Error('Asset not found');
      }
      
      const asset = assetDoc.data() as Asset;
      if (asset.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own assets');
      }
      
      // Mark as deleted
      await updateDoc(doc(db, 'assets', assetId), {
        isDeleted: true,
        deletedAt: serverTimestamp()
      });
      
      console.log('[ASSET MANAGER] ✅ Asset soft deleted');
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to soft delete asset:', error);
      throw error;
    }
  }
  
  /**
   * Permanently delete an asset (removes from storage and database)
   * Only use for cleanup operations
   */
  async permanentlyDeleteAsset(assetId: string): Promise<void> {
    try {
      console.log(`[ASSET MANAGER] Permanently deleting asset: ${assetId}`);
      
      const assetDoc = await getDoc(doc(db, 'assets', assetId));
      if (!assetDoc.exists()) {
        console.log('[ASSET MANAGER] Asset not found, nothing to delete');
        return;
      }
      
      const asset = assetDoc.data() as Asset;
      
      // Delete from Firebase Storage
      try {
        await deleteObject(ref(storage, asset.storageUrl));
        console.log('[ASSET MANAGER] ✅ Deleted from storage');
      } catch (storageError) {
        console.warn('[ASSET MANAGER] ⚠️  Storage deletion failed (file may not exist):', storageError);
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'assets', assetId));
      console.log('[ASSET MANAGER] ✅ Deleted from database');
      
      console.log('[ASSET MANAGER] ✅ Asset permanently deleted');
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to permanently delete asset:', error);
      throw error;
    }
  }
  
  /**
   * Cleanup orphaned assets (assets not associated with any documents)
   * Should be called by scheduled function
   */
  async cleanupOrphanedAssets(olderThanDays: number = 30): Promise<number> {
    try {
      console.log(`[ASSET MANAGER] Cleaning up assets older than ${olderThanDays} days`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const q = query(
        collection(db, 'assets'),
        where('documentIds', '==', []),
        where('lastAccessedAt', '<', cutoffDate),
        where('isDeleted', '==', false)
      );
      
      const snapshot = await getDocs(q);
      let deletedCount = 0;
      
      for (const doc of snapshot.docs) {
        try {
          await this.permanentlyDeleteAsset(doc.id);
          deletedCount++;
        } catch (error) {
          console.error(`[ASSET MANAGER] Failed to delete orphaned asset ${doc.id}:`, error);
        }
      }
      
      console.log(`[ASSET MANAGER] ✅ Cleaned up ${deletedCount} orphaned assets`);
      return deletedCount;
    } catch (error) {
      console.error('[ASSET MANAGER] ❌ Failed to cleanup orphaned assets:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const assetManager = new AssetManager();