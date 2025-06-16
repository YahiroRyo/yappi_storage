import { useState, useCallback } from 'react';

export interface UploadProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  percentage: number;
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error';
  currentChunk?: number;
  totalChunks?: number;
  speed?: number; // bytes per second
  remainingTime?: number; // seconds
  error?: string;
}

export interface UploadState {
  files: Map<string, UploadProgress>;
  totalFiles: number;
  completedFiles: number;
  isUploading: boolean;
  overallProgress: number;
}

export const useUploadProgress = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    files: new Map(),
    totalFiles: 0,
    completedFiles: 0,
    isUploading: false,
    overallProgress: 0,
  });

  const initializeUpload = useCallback((files: File[]) => {
    const fileMap = new Map<string, UploadProgress>();
    
    files.forEach((file, index) => {
      const fileId = `${file.name}_${Date.now()}_${index}`;
      fileMap.set(fileId, {
        fileId,
        fileName: file.name,
        fileSize: file.size,
        uploadedBytes: 0,
        percentage: 0,
        status: 'waiting',
        currentChunk: 0,
        totalChunks: 0,
        speed: 0,
        remainingTime: 0,
      });
    });

    setUploadState({
      files: fileMap,
      totalFiles: files.length,
      completedFiles: 0,
      isUploading: true,
      overallProgress: 0,
    });

    return Array.from(fileMap.keys());
  }, []);

  const updateFileProgress = useCallback((
    fileId: string, 
    updates: Partial<UploadProgress>
  ) => {
    setUploadState(prev => {
      const newFiles = new Map(prev.files);
      const file = newFiles.get(fileId);
      
      if (!file) return prev;

      const updatedFile = { ...file, ...updates };
      
      // Calculate speed and remaining time if uploadedBytes is updated
      if (updates.uploadedBytes !== undefined) {
        const now = Date.now();
        const elapsed = (now - (file as any).startTime || now) / 1000;
        
        if (elapsed > 0) {
          updatedFile.speed = updatedFile.uploadedBytes / elapsed;
          const remainingBytes = updatedFile.fileSize - updatedFile.uploadedBytes;
          updatedFile.remainingTime = updatedFile.speed > 0 ? remainingBytes / updatedFile.speed : 0;
        }
        
        updatedFile.percentage = (updatedFile.uploadedBytes / updatedFile.fileSize) * 100;
      }

      newFiles.set(fileId, updatedFile);

      // Calculate overall progress
      let totalBytes = 0;
      let uploadedBytes = 0;
      let completedFiles = 0;

      newFiles.forEach(file => {
        totalBytes += file.fileSize;
        uploadedBytes += file.uploadedBytes;
        if (file.status === 'completed') completedFiles++;
      });

      const overallProgress = totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0;
      const isUploading = Array.from(newFiles.values()).some(
        file => file.status === 'uploading' || file.status === 'processing'
      );

      return {
        files: newFiles,
        totalFiles: prev.totalFiles,
        completedFiles,
        isUploading,
        overallProgress,
      };
    });
  }, []);

  const startFileUpload = useCallback((fileId: string) => {
    setUploadState(prev => {
      const newFiles = new Map(prev.files);
      const file = newFiles.get(fileId);
      
      if (file) {
        newFiles.set(fileId, {
          ...file,
          status: 'uploading',
          startTime: Date.now(),
        } as any);
      }

      return { ...prev, files: newFiles };
    });
  }, []);

  const completeFileUpload = useCallback((fileId: string) => {
    updateFileProgress(fileId, {
      status: 'completed',
      percentage: 100,
      uploadedBytes: uploadState.files.get(fileId)?.fileSize || 0,
    });
  }, [updateFileProgress, uploadState.files]);

  const setFileError = useCallback((fileId: string, error: string) => {
    updateFileProgress(fileId, {
      status: 'error',
      error,
    });
  }, [updateFileProgress]);

  const resetUpload = useCallback(() => {
    setUploadState({
      files: new Map(),
      totalFiles: 0,
      completedFiles: 0,
      isUploading: false,
      overallProgress: 0,
    });
  }, []);

  const formatSpeed = useCallback((bytesPerSecond: number): string => {
    const mb = bytesPerSecond / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    
    const kb = bytesPerSecond / 1024;
    return `${kb.toFixed(1)} KB/s`;
  }, []);

  const formatRemainingTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${Math.ceil(seconds)}秒`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}分`;
    return `${Math.ceil(seconds / 3600)}時間`;
  }, []);

  return {
    uploadState,
    initializeUpload,
    updateFileProgress,
    startFileUpload,
    completeFileUpload,
    setFileError,
    resetUpload,
    formatSpeed,
    formatRemainingTime,
  };
}; 