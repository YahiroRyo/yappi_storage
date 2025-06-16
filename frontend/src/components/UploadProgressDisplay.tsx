import React from 'react';
import { UploadProgress, UploadState } from '../hooks/useUploadProgress';

interface UploadProgressDisplayProps {
  uploadState: UploadState;
  formatSpeed: (bytesPerSecond: number) => string;
  formatRemainingTime: (seconds: number) => string;
}

const UploadProgressDisplay: React.FC<UploadProgressDisplayProps> = ({
  uploadState,
  formatSpeed,
  formatRemainingTime,
}) => {
  const { files, totalFiles, completedFiles, isUploading, overallProgress } = uploadState;

  if (!isUploading && files.size === 0) {
    return null;
  }

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'waiting':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📁';
    }
  };

  const getStatusText = (status: UploadProgress['status']) => {
    switch (status) {
      case 'waiting':
        return '待機中';
      case 'uploading':
        return 'アップロード中';
      case 'processing':
        return '処理中';
      case 'completed':
        return '完了';
      case 'error':
        return 'エラー';
      default:
        return '不明';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="upload-progress-container" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxHeight: '60vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            ファイルアップロード
          </h3>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {completedFiles}/{totalFiles}
          </span>
        </div>
        
        {/* Overall Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${overallProgress}%`,
            height: '100%',
            backgroundColor: isUploading ? '#007bff' : '#28a745',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>{overallProgress.toFixed(1)}%</span>
          {isUploading && (
            <span>全体の進捗</span>
          )}
        </div>
      </div>

      {/* File List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        maxHeight: '300px'
      }}>
        {Array.from(files.values()).map((file) => (
          <div key={file.fileId} style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{ marginRight: '8px', fontSize: '16px' }}>
                {getStatusIcon(file.status)}
              </span>
              <span style={{
                flex: 1,
                fontSize: '14px',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {file.fileName}
              </span>
              <span style={{
                fontSize: '12px',
                color: '#666',
                marginLeft: '8px'
              }}>
                {formatFileSize(file.fileSize)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{
                fontSize: '12px',
                color: file.status === 'error' ? '#dc3545' : '#666',
                marginRight: '8px'
              }}>
                {getStatusText(file.status)}
              </span>
              {file.status === 'uploading' && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {file.percentage.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {(file.status === 'uploading' || file.status === 'processing') && (
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e9ecef',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: `${file.percentage}%`,
                  height: '100%',
                  backgroundColor: file.status === 'processing' ? '#ffc107' : '#007bff',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            )}

            {/* Upload Details */}
            {file.status === 'uploading' && file.speed && file.speed > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#999'
              }}>
                <span>{formatSpeed(file.speed)}</span>
                {file.remainingTime && file.remainingTime > 0 && (
                  <span>残り {formatRemainingTime(file.remainingTime)}</span>
                )}
              </div>
            )}

            {/* Error Message */}
            {file.status === 'error' && file.error && (
              <div style={{
                fontSize: '12px',
                color: '#dc3545',
                marginTop: '4px',
                backgroundColor: '#f8d7da',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {file.error}
              </div>
            )}

            {/* Processing Message */}
            {file.status === 'processing' && (
              <div style={{
                fontSize: '12px',
                color: '#856404',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                動画を圧縮しています...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgressDisplay; 