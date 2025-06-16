import { useWsClient } from "@/api/files/client";
import { registrationFiles } from "@/api/files/registrationFiles";
import { uploadFiles } from "@/api/files/uploadFile";
import { Button } from "@/components/ui/button";
import { GridVerticalRow } from "@/components/ui/grid/gridVerticalRow";
import { Loading } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { uiConfig } from "@/components/ui/uiConfig";
import { fileToFileKind } from "@/helpers/fileToFileKind";
import { useUploadProgress } from "@/hooks/useUploadProgress";
import { FormEventHandler, useState } from "react";
import { UploadFileButton } from "../uploadFileButton";
import { X } from "lucide-react";

type Props = {
  parentDirectoryId?: string;
  isOpended: boolean;
  setIsOpended: (value: boolean) => void;
  setRefreshFiles: (func: (value: boolean) => boolean) => void;
};

export const UploadFileModal = ({
  parentDirectoryId,
  isOpended,
  setIsOpended,
  setRefreshFiles,
}: Props) => {
  const [uploadFileFormData, setUploadFileFormData] = useState<{
    files: File[];
    disabled: boolean;
  }>({
    files: [],
    disabled: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const wsClient = useWsClient();
  
  // 新しいプログレス機能を追加
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

  const onUploadFile: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (uploadFileFormData.files.length === 0) {
      return;
    }

    setIsLoading(true);
    setUploadFileFormData((value) => ({ ...value, disabled: true }));

    // プログレス状態を初期化
    const fileIds = initializeUpload(uploadFileFormData.files);

    try {
      // 高速アップロード設定
      const uploadConfig = {
        maxConcurrency: 4,
        adaptiveChunkSize: true,
        enableTurboMode: true,
        maxChunkSize: 75 * 1024 * 1024, // 75MB
        enableParallelFiles: uploadFileFormData.files.length <= 3, // 3ファイル以下なら並列処理
      };

      const urls = await uploadFiles(
        wsClient, 
        uploadFileFormData.files, 
        uploadConfig,
        (fileIndex: number, fileName: string, progress) => {
          const fileId = fileIds[fileIndex];
          if (fileId) {
            // アップロード開始時
            if (progress.currentChunk === 1 && progress.percentage > 0) {
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
      
      const registrationFilesData = uploadFileFormData.files.map((file, index) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: urls[index],
        kind: fileToFileKind(file),
        parent_directory_id: parentDirectoryId,
      }));

      const res = await registrationFiles(registrationFilesData);
      
      // 処理完了後、3秒後にモーダルを閉じる
      setTimeout(() => {
        setIsLoading(false);
        setUploadFileFormData({
          files: [],
          disabled: false,
        });
        setIsOpended(false);
        setRefreshFiles((value) => !value);
        resetUpload();
      }, 3000);

      if (res.status === 200) {
        console.log("uploaded all files");
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      // エラーが発生した場合、該当ファイルにエラー状態を設定
      fileIds.forEach((fileId, index) => {
        if (fileId) {
          setFileError(fileId, `アップロードに失敗しました: ${error}`);
        }
      });
      
      setIsLoading(false);
      setUploadFileFormData((value) => ({ ...value, disabled: false }));
    }
  };

  const handleFileSelect = (files: FileList) => {
    setUploadFileFormData((prev) => ({
      ...prev,
      files: Array.from(files),
    }));
  };

  // ステータスアイコンを取得する関数
  const getStatusIcon = (status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error') => {
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

  // ステータステキストを取得する関数
  const getStatusText = (status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error') => {
    switch (status) {
      case 'waiting':
        return '待機中';
      case 'uploading':
        return 'アップロード中';
      case 'processing':
        return '動画圧縮中';
      case 'completed':
        return '完了';
      case 'error':
        return 'エラー';
      default:
        return '不明';
    }
  };

  if (isOpended) {
    return (
      <Modal width="35rem" onClose={() => setIsOpended(false)}>
        <GridVerticalRow gap="1rem">
          <Text size="pixcel" pixcel="1.5rem" fontWeight={400}>
            ファイルアップロード
          </Text>
          <form onSubmit={onUploadFile}>
            <GridVerticalRow gap="1rem">
              <UploadFileButton onFileSelect={handleFileSelect} />
              
              {/* 高速化設定の表示 */}
              {uploadFileFormData.files.length > 0 && (
                <div style={{
                  backgroundColor: uiConfig.color.surface.medium,
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem"
                }}>
                  <Text size="small" fontWeight={600}>🚀 高速アップロード設定</Text>
                  <div style={{ marginTop: "0.25rem", color: "#666" }}>
                    <Text size="small">
                      • 並列チャンク送信で高速化 • 動画は自動圧縮 • リアルタイム進捗表示
                    </Text>
                  </div>
                </div>
              )}
              
              {uploadFileFormData.files.length > 0 && (
                <div style={{ maxHeight: "300px", overflow: "auto", margin: "1rem 0" }}>
                  <Text size="small" fontWeight={600}>選択されたファイル ({uploadFileFormData.files.length}件):</Text>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {uploadFileFormData.files.map((file, index) => {
                      // 対応するプログレス情報を取得
                      const fileProgress = Array.from(uploadState.files.values())[index];
                      
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "0.75rem",
                            background: "#f9fafb",
                            borderRadius: "0.5rem",
                            gap: "0.5rem"
                          }}
                        >
                          {/* ファイル情報ヘッダー */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "0.9rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                              }}>
                                {fileProgress && (
                                  <span style={{ fontSize: "1rem" }}>
                                    {getStatusIcon(fileProgress.status)}
                                  </span>
                                )}
                                <Text size="small" fontWeight={500}>{file.name}</Text>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Text size="small" color="gray">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Text>
                                {fileProgress && (
                                  <Text size="small" color={fileProgress.status === 'error' ? 'red' : 'gray'}>
                                    {getStatusText(fileProgress.status)}
                                  </Text>
                                )}
                              </div>
                            </div>
                            
                            {!isLoading && (
                              <Button
                                type="button"
                                color={{
                                  backgroundColor: "transparent",
                                  textColor: "#333",
                                }}
                                radius="50%"
                                padding="0.25rem"
                                justifyContent="center"
                                onClick={() => {
                                  setUploadFileFormData((prev) => ({
                                    ...prev,
                                    files: prev.files.filter((_, i) => i !== index),
                                  }));
                                }}
                              >
                                <X style={{ width: "1rem", height: "1rem" }} />
                              </Button>
                            )}
                          </div>

                          {/* プログレスバー */}
                          {fileProgress && (fileProgress.status === 'uploading' || fileProgress.status === 'processing') && (
                            <div>
                              <div style={{
                                width: "100%",
                                height: "6px",
                                backgroundColor: uiConfig.color.surface.high,
                                borderRadius: "3px",
                                overflow: "hidden"
                              }}>
                                <div 
                                  style={{ 
                                    width: `${fileProgress.percentage}%`, 
                                    height: "100%", 
                                    backgroundColor: fileProgress.status === 'processing' ? '#ffc107' : uiConfig.color.bg.secondary.tint,
                                    transition: "width 0.3s ease-in-out" 
                                  }} 
                                />
                              </div>
                              
                              {/* 詳細情報 */}
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "0.25rem",
                                fontSize: "0.75rem",
                                color: "#666"
                              }}>
                                <span>{fileProgress.percentage.toFixed(1)}%</span>
                                {fileProgress.status === 'uploading' && fileProgress.speed && fileProgress.speed > 0 && (
                                  <span>{formatSpeed(fileProgress.speed)}</span>
                                )}
                                {fileProgress.status === 'uploading' && fileProgress.remainingTime && fileProgress.remainingTime > 0 && (
                                  <span>残り {formatRemainingTime(fileProgress.remainingTime)}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* エラーメッセージ */}
                          {fileProgress && fileProgress.status === 'error' && fileProgress.error && (
                            <div style={{
                              fontSize: "0.75rem",
                              color: "#dc3545",
                              backgroundColor: "#f8d7da",
                              padding: "0.5rem",
                              borderRadius: "0.25rem"
                            }}>
                              {fileProgress.error}
                            </div>
                          )}

                          {/* 処理中メッセージ */}
                          {fileProgress && fileProgress.status === 'processing' && (
                            <div style={{
                              fontSize: "0.75rem",
                              color: "#856404",
                              fontStyle: "italic"
                            }}>
                              動画を圧縮しています...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 全体プログレス表示 */}
              {isLoading && uploadState.files.size > 0 && (
                <div style={{
                  backgroundColor: uiConfig.color.surface.medium,
                  padding: "1rem",
                  borderRadius: "0.5rem"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem"
                  }}>
                    <Text size="small" fontWeight={600}>全体の進捗</Text>
                    <Text size="small">{uploadState.completedFiles}/{uploadState.totalFiles}</Text>
                  </div>
                  
                  <div style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: uiConfig.color.surface.high,
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div 
                      style={{ 
                        width: `${uploadState.overallProgress}%`, 
                        height: "100%", 
                        backgroundColor: uploadState.isUploading ? uiConfig.color.bg.secondary.tint : '#28a745',
                        transition: "width 0.3s ease-in-out" 
                      }} 
                    />
                  </div>
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.25rem",
                    fontSize: "0.75rem",
                    color: "#666"
                  }}>
                    <span>{uploadState.overallProgress.toFixed(1)}%</span>
                    {uploadState.isUploading && (
                      <span>アップロード中...</span>
                    )}
                  </div>
                </div>
              )}
              
              <Button
                color={{
                  backgroundColor: uiConfig.color.bg.secondary.dark,
                  textColor: uiConfig.color.text.high,
                }}
                textAlign="center"
                border={`1px solid ${uiConfig.color.on.secondary.container}`}
                radius="32px"
                padding="0.5rem 1rem"
                type="submit"
                disabled={uploadFileFormData.disabled || uploadFileFormData.files.length === 0}
              >
                <Text size="pixcel" pixcel="1rem" fontWeight={600}>
                  {uploadFileFormData.files.length > 1 ? `${uploadFileFormData.files.length}件のファイルをアップロード` : "アップロード"}
                </Text>
              </Button>
            </GridVerticalRow>
          </form>
        </GridVerticalRow>

        <Loading isLoading={isLoading} />
      </Modal>
    );
  }

  return <></>;
};
