import React, { useCallback, useState } from 'react';
import { useWsClient } from '../api/files/client';
import { uploadFiles } from '../api/files/uploadFile';
import { useUploadProgress } from '../hooks/useUploadProgress';
import UploadProgressDisplay from './UploadProgressDisplay';

const FileUploadWithProgress: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const wsClient = useWsClient();
  const {
    uploadState,
    initializeUpload,
    updateFileProgress,
    startFileUpload,
    completeFileUpload,
    setFileError,
    resetUpload,
    formatSpeed,
    formatRemainingTime,
  } = useUploadProgress();

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // アップロード状態を初期化
    const fileIds = initializeUpload(files);
    
    try {
      // 高速アップロード設定
      const uploadConfig = {
        maxConcurrency: 4,
        adaptiveChunkSize: true,
        enableTurboMode: true,
        maxChunkSize: 75 * 1024 * 1024, // 75MB
        enableParallelFiles: files.length <= 3, // 3ファイル以下なら並列処理
      };

      await uploadFiles(
        wsClient,
        files,
        uploadConfig,
        (fileIndex: number, fileName: string, progress) => {
          const fileId = fileIds[fileIndex];
          if (fileId) {
            // アップロード開始時
            if (progress.currentChunk === 1 && progress.percentage === 0) {
              startFileUpload(fileId);
            }
            
            // プログレス更新
            updateFileProgress(fileId, {
              uploadedBytes: progress.uploadedBytes,
              percentage: progress.percentage,
              currentChunk: progress.currentChunk,
              totalChunks: progress.totalChunks,
              speed: progress.speed,
              status: progress.status,
            });

            // アップロード完了時
            if (progress.status === 'completed') {
              completeFileUpload(fileId);
            }
          }
        }
      );

      console.log('All files uploaded successfully!');
      
      // 5秒後にプログレス表示をリセット
      setTimeout(() => {
        resetUpload();
      }, 5000);

    } catch (error) {
      console.error('Upload failed:', error);
      
      // エラーが発生したファイルにエラー状態を設定
      fileIds.forEach((fileId, index) => {
        setFileError(fileId, `アップロードに失敗しました: ${error}`);
      });
    }
  }, [wsClient, initializeUpload, updateFileProgress, startFileUpload, completeFileUpload, setFileError, resetUpload]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFileUpload(files);
    // ファイル入力をリセット
    event.target.value = '';
  }, [handleFileUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      {/* ファイルアップロードエリア */}
      <div
        style={{
          border: `2px dashed ${isDragOver ? '#007bff' : '#ddd'}`,
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDragOver ? '#f8f9fa' : 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '20px'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          📁
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
          ファイルをドラッグ＆ドロップまたはクリックして選択
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          複数ファイルの同時アップロード対応・動画ファイルは自動圧縮
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* 高速アップロード設定の表示 */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>🚀 高速アップロード機能</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>最大4つのチャンクを同時送信</li>
          <li>ファイルサイズに応じた動的チャンクサイズ（5MB〜100MB）</li>
          <li>3ファイル以下なら並列アップロード</li>
          <li>動画ファイルは自動でH.264圧縮</li>
          <li>リアルタイムプログレス＆速度表示</li>
        </ul>
      </div>

      {/* アップロード状態表示 */}
      {(uploadState.isUploading || uploadState.files.size > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0' }}>アップロード状況</h4>
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>全体の進捗:</strong> {uploadState.overallProgress.toFixed(1)}%
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>完了ファイル:</strong> {uploadState.completedFiles}/{uploadState.totalFiles}
            </div>
            <div>
              <strong>ステータス:</strong> {uploadState.isUploading ? 'アップロード中' : '完了'}
            </div>
          </div>
        </div>
      )}

      {/* プログレス表示 */}
      <UploadProgressDisplay
        uploadState={uploadState}
        formatSpeed={formatSpeed}
        formatRemainingTime={formatRemainingTime}
      />
    </div>
  );
};

export default FileUploadWithProgress; 