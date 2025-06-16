const MessageType = {
  File: 0,
  InitializeFileName: 1,
  FinishedUpload: 2,
} as const;

// 高速化設定
interface UploadConfig {
  maxConcurrency: number;
  adaptiveChunkSize: boolean;
  enableTurboMode: boolean;
  maxChunkSize: number;
  maxRetries?: number;        // 最大リトライ回数
  retryDelay?: number;        // 初期リトライ遅延（ミリ秒）
}

const DEFAULT_CONFIG: UploadConfig = {
  maxConcurrency: 3,           // 同時送信チャンク数
  adaptiveChunkSize: true,     // ファイルサイズに応じた動的チャンクサイズ
  enableTurboMode: true,       // 高速モード（遅延なし）
  maxChunkSize: 100 * 1024 * 1024,  // 最大チャンクサイズ（100MB）
  maxRetries: 3,               // 最大リトライ回数
  retryDelay: 1000,            // 初期リトライ遅延（1秒）
};

// CRC32テーブル（IEEE polynomial）
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  const polynomial = 0xEDB88320;

  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ polynomial;
      } else {
        crc = crc >>> 1;
      }
    }
    table[i] = crc;
  }
  return table;
})();

// 高速CRC32計算関数（バックエンドのCRC32IEEEと同じアルゴリズム）
const calculateChecksum = (data: ArrayBuffer): number => {
  const bytes = new Uint8Array(data);
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < bytes.length; i++) {
    const tableIndex = (crc ^ bytes[i]) & 0xFF;
    crc = (crc >>> 8) ^ CRC32_TABLE[tableIndex];
  }
  
  const result = (crc ^ 0xFFFFFFFF) >>> 0; // >>> 0で32bit unsigned integerに変換
  console.log(`CRC32 checksum calculated: ${result} for ${bytes.length} bytes`);
  
  return result;
};

// 動的チャンクサイズの決定
const getOptimalChunkSize = (fileSize: number, config: UploadConfig): number => {
  if (!config.adaptiveChunkSize) {
    return Math.min(50 * 1024 * 1024, config.maxChunkSize); // 固定50MB
  }
  
  if (fileSize < 10 * 1024 * 1024) return Math.min(5 * 1024 * 1024, config.maxChunkSize);     // 5MB for small files
  if (fileSize < 100 * 1024 * 1024) return Math.min(25 * 1024 * 1024, config.maxChunkSize);   // 25MB for medium files
  if (fileSize < 1024 * 1024 * 1024) return Math.min(50 * 1024 * 1024, config.maxChunkSize);  // 50MB for large files
  return Math.min(100 * 1024 * 1024, config.maxChunkSize); // 100MB for very large files
};

// WebSocket接続の準備を待つ関数
const waitForConnection = (client: WebSocket): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (client.readyState === WebSocket.OPEN) {
      // バイナリタイプの設定確認
      if (client.binaryType !== 'arraybuffer') {
        console.log(`Setting WebSocket binaryType to arraybuffer (was: ${client.binaryType})`);
        client.binaryType = 'arraybuffer';
      }
      console.log(`WebSocket ready: binaryType=${client.binaryType}, readyState=${client.readyState}`);
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error("WebSocket connection timeout"));
    }, 5000); // 5秒タイムアウト

    client.onopen = () => {
      clearTimeout(timeout);
      
      // バイナリタイプの設定確認と設定
      if (client.binaryType !== 'arraybuffer') {
        console.log(`Setting WebSocket binaryType to arraybuffer (was: ${client.binaryType})`);
        client.binaryType = 'arraybuffer';
      }
      
      console.log("WebSocket connection established");
      console.log(`WebSocket ready: binaryType=${client.binaryType}, readyState=${client.readyState}`);
      resolve();
    };

    client.onerror = (error) => {
      clearTimeout(timeout);
      console.error("WebSocket connection error:", error);
      reject(new Error("WebSocket connection failed"));
    };
  });
};

// 各ファイルアップロード前の初期化を保証する関数
const ensureFileInitialization = (client: WebSocket, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Initializing new file upload session for: ${fileName}`);
    
    // 初期化リクエストを送信
    const initMessage = {
      Event: "initialize_file_name",
      Data: { filename: fileName }
    };
    
    const initHandler = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);
        if (response.Event === "initialize_file_name") {
          if (response.Data.status === "initialized") {
            console.log(`File initialization successful for ${fileName}, session ID: ${response.Data.session_id}`);
            client.removeEventListener('message', initHandler);
            resolve(response.Data.session_id);
          } else {
            client.removeEventListener('message', initHandler);
            reject(new Error(`File initialization failed: ${response.Data.message || 'Unknown error'}`));
          }
        }
      } catch (error) {
        client.removeEventListener('message', initHandler);
        reject(new Error(`Failed to parse initialization response: ${error}`));
      }
    };
    
    // タイムアウト設定
    const timeout = setTimeout(() => {
      client.removeEventListener('message', initHandler);
      reject(new Error("File initialization timeout"));
    }, 10000); // 10秒タイムアウト
    
    client.addEventListener('message', initHandler);
    
    // クリーンアップ用のクリアタイムアウト
    const originalHandler = initHandler;
    const wrappedHandler = (event: MessageEvent) => {
      clearTimeout(timeout);
      originalHandler(event);
    };
    
    client.removeEventListener('message', initHandler);
    client.addEventListener('message', wrappedHandler);
    
    console.log(`Sending initialization message:`, initMessage);
    client.send(JSON.stringify(initMessage));
  });
};

export const uploadFile = async (
  client: WebSocket,
  file: File,
  config?: Partial<UploadConfig>,
  onProgress?: (progress: {
    uploadedBytes: number;
    totalBytes: number;
    percentage: number;
    currentChunk: number;
    totalChunks: number;
    speed: number;
    status: 'uploading' | 'processing' | 'completed';
  }) => void
): Promise<string> => {
  const uploadConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  
  return new Promise(async (resolve, reject) => {
    try {
      // WebSocket接続を待つ
      await waitForConnection(client);
    } catch (error) {
      reject(error);
      return;
    }

    let sessionId = "";
    const totalSize = file.size;
    let isCompleted = false;

    console.log(`Starting high-speed CRC32 upload for ${file.name} (${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
    console.log(`Upload config:`, uploadConfig);

    // WebSocketイベントハンドラの設定
    const messageHandler = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);
        console.log("Received WebSocket message:", response);
        
        switch (response.Event) {
          case "initialize_file_name":
            if (response.Data.status === "initialized") {
              sessionId = response.Data.session_id;
              console.log(`File upload initialized with session ID: ${sessionId}`);
              startChunkUpload();
            } else {
              reject(new Error(`Failed to initialize file upload: ${response.Data.message || 'Unknown error'}`));
            }
            break;
            
          case "upload_file_chunk":
            if (response.Data.status === "error") {
              if (response.Data.error_type === "checksum_mismatch") {
                console.log(`CRC32 checksum mismatch detected - will be handled by chunk-specific retry logic`);
                // この場合は個別のチャンクリトライロジックで処理される
              } else {
                reject(new Error(`Upload error: ${response.Data.message}`));
              }
            } else if (response.Data.status === "success") {
              console.log(`Chunk uploaded successfully. Chunks received: ${response.Data.chunks_received}`);
            }
            break;
            
          case "finished_upload":
            if (response.Data.status === "completed") {
              console.log(`Upload completed. File: ${response.Data.filename}, Size: ${response.Data.total_size} bytes`);
              
              // 動画ファイルの場合は処理中ステータスを通知
              const isVideoFile = /\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i.test(file.name);
              if (isVideoFile && onProgress) {
                onProgress({
                  uploadedBytes: totalSize,
                  totalBytes: totalSize,
                  percentage: 100,
                  currentChunk: 0,
                  totalChunks: 0,
                  speed: 0,
                  status: 'processing'
                });
                
                // 動画処理完了を待つ（2秒後に完了ステータスを送信）
                setTimeout(() => {
                  if (onProgress) {
                    onProgress({
                      uploadedBytes: totalSize,
                      totalBytes: totalSize,
                      percentage: 100,
                      currentChunk: 0,
                      totalChunks: 0,
                      speed: 0,
                      status: 'completed'
                    });
                  }
                }, 2000);
              } else {
                // 動画ファイル以外はすぐに完了ステータスを送信
                if (onProgress) {
                  onProgress({
                    uploadedBytes: totalSize,
                    totalBytes: totalSize,
                    percentage: 100,
                    currentChunk: 0,
                    totalChunks: 0,
                    speed: 0,
                    status: 'completed'
                  });
                }
              }
              
              isCompleted = true;
              cleanup();
              resolve(response.Data.file_path || response.Data.filename);
            } else {
              reject(new Error(`Upload completion failed: ${response.Data.message || 'Unknown error'}`));
            }
            break;
            
          case "error":
            reject(new Error(`WebSocket error: ${response.Data.message || 'Unknown error'}`));
            break;
            
          default:
            console.log("Unknown message:", response);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        reject(new Error("Failed to parse WebSocket message"));
      }
    };

    const errorHandler = (error: Event) => {
      console.error("WebSocket error during upload:", error);
      if (!isCompleted) {
        cleanup();
        reject(new Error("WebSocket connection error during upload"));
      }
    };

    const closeHandler = (event: CloseEvent) => {
      console.error("WebSocket closed during upload:", event);
      if (!isCompleted) {
        cleanup();
        reject(new Error("WebSocket connection closed during upload"));
      }
    };

    const cleanup = () => {
      client.removeEventListener('message', messageHandler);
      client.removeEventListener('error', errorHandler);
      client.removeEventListener('close', closeHandler);
    };

    // イベントリスナーの設定
    client.addEventListener('message', messageHandler);
    client.addEventListener('error', errorHandler);
    client.addEventListener('close', closeHandler);

    // ファイルアップロードの初期化
    const initMessage = {
      Event: "initialize_file_name",
      Data: { filename: file.name }
    };
    
    console.log("Sending initialization message:", initMessage);
    client.send(JSON.stringify(initMessage));

    // チャンクアップロードの開始
    const startChunkUpload = async () => {
      const chunkSize = getOptimalChunkSize(file.size, uploadConfig);
      const chunks: {start: number, end: number, index: number}[] = [];
      let uploadedBytes = 0;
      let completedChunks = 0;
      
      // チャンク情報を事前に計算
      for (let start = 0; start < file.size; start += chunkSize) {
        const end = Math.min(start + chunkSize, file.size);
        chunks.push({ start, end, index: chunks.length });
      }
      
      const concurrency = Math.min(uploadConfig.maxConcurrency, chunks.length);
      console.log(`Uploading ${chunks.length} chunks with concurrency ${concurrency}, chunk size: ${(chunkSize / 1024 / 1024).toFixed(1)}MB`);

      const uploadSingleChunk = async (chunkInfo: {start: number, end: number, index: number}): Promise<void> => {
        const maxRetries = uploadConfig.maxRetries || 3;
        const baseDelay = uploadConfig.retryDelay || 1000;
        let retryCount = 0;
        
        const attemptUpload = async (): Promise<void> => {
          return new Promise<void>((resolve, reject) => {
            const chunk = file.slice(chunkInfo.start, chunkInfo.end);
            
            const processChunk = async () => {
              try {
                const arrayBuffer = await chunk.arrayBuffer();
                const checksum = calculateChecksum(arrayBuffer);
                
                // バイナリメッセージを構築
                const checksumBuffer = new ArrayBuffer(8);
                const checksumView = new DataView(checksumBuffer);
                checksumView.setBigUint64(0, BigInt(checksum), false);
                
                const combinedBuffer = new ArrayBuffer(8 + arrayBuffer.byteLength);
                const combinedView = new Uint8Array(combinedBuffer);
                combinedView.set(new Uint8Array(checksumBuffer), 0);
                combinedView.set(new Uint8Array(arrayBuffer), 8);
                
                // WebSocket状態チェック
                if (client.readyState !== WebSocket.OPEN) {
                  throw new Error(`WebSocket not ready: readyState=${client.readyState}`);
                }
                
                // チェックサムミスマッチレスポンス用の一時リスナー
                const tempMessageHandler = (event: MessageEvent) => {
                  try {
                    const response = JSON.parse(event.data);
                    
                    if (response.Event === "upload_file_chunk") {
                      if (response.Data.status === "error" && response.Data.error_type === "checksum_mismatch") {
                        client.removeEventListener('message', tempMessageHandler);
                        
                        if (retryCount < maxRetries) {
                          retryCount++;
                          const delay = baseDelay * Math.pow(2, retryCount - 1); // 指数バックオフ
                          
                          console.log(`Checksum mismatch for chunk ${chunkInfo.index + 1}. Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
                          
                          setTimeout(() => {
                            attemptUpload().then(resolve).catch(reject);
                          }, delay);
                        } else {
                          reject(new Error(`チェックサムミスマッチ: 最大リトライ回数 (${maxRetries}) に達しました。チャンク ${chunkInfo.index + 1}`));
                        }
                      } else if (response.Data.status === "success") {
                        client.removeEventListener('message', tempMessageHandler);
                        
                        // プログレス更新（重複を避けるため、成功時のみ更新）
                        uploadedBytes += chunk.size;
                        completedChunks++;
                        const progress = (uploadedBytes / file.size) * 100;
                        
                        // プログレスコールバック呼び出し
                        if (onProgress) {
                          const elapsed = (Date.now() - startTime) / 1000;
                          const speed = elapsed > 0 ? uploadedBytes / elapsed : 0;
                          
                          onProgress({
                            uploadedBytes,
                            totalBytes: file.size,
                            percentage: progress,
                            currentChunk: completedChunks,
                            totalChunks: chunks.length,
                            speed,
                            status: 'uploading'
                          });
                        }
                        
                        console.log(`Chunk ${chunkInfo.index + 1}/${chunks.length} uploaded successfully (${progress.toFixed(1)}%) ${retryCount > 0 ? `after ${retryCount} retries` : ''}`);
                        resolve();
                      } else {
                        client.removeEventListener('message', tempMessageHandler);
                        reject(new Error(`Upload error: ${response.Data.message}`));
                      }
                    }
                  } catch (error) {
                    client.removeEventListener('message', tempMessageHandler);
                    reject(new Error(`Failed to parse response: ${error}`));
                  }
                };
                
                // 一時リスナーを追加
                client.addEventListener('message', tempMessageHandler);
                
                // 送信
                client.send(combinedBuffer);
                
              } catch (error) {
                reject(new Error(`Chunk processing error: ${error instanceof Error ? error.message : String(error)}`));
              }
            };
            
            processChunk();
          });
        };
        
        // 初回アップロード試行
        await attemptUpload();
      };
      
      // 並列アップロード実行
      const uploadPromises: Promise<void>[] = [];
      let chunkIndex = 0;
      
      while (chunkIndex < chunks.length || uploadPromises.length > 0) {
        // 新しいチャンクを並列処理キューに追加
        while (uploadPromises.length < concurrency && chunkIndex < chunks.length) {
          const promise = uploadSingleChunk(chunks[chunkIndex]);
          uploadPromises.push(promise);
          chunkIndex++;
        }
        
        // 最初に完了したプロミスを待機
        if (uploadPromises.length > 0) {
          try {
            await Promise.race(uploadPromises);
            
            // 完了したプロミスを削除（settled状態のプロミスを検索）
            const settledPromises = await Promise.allSettled(uploadPromises);
            for (let i = settledPromises.length - 1; i >= 0; i--) {
              if (settledPromises[i].status === 'fulfilled' || settledPromises[i].status === 'rejected') {
                if (settledPromises[i].status === 'rejected') {
                  const reason = settledPromises[i] as PromiseRejectedResult;
                  throw new Error(`Chunk upload failed: ${reason.reason}`);
                }
                uploadPromises.splice(i, 1);
              }
            }
          } catch (error) {
            // エラーをキャッチして適切に処理
            throw new Error(`Upload error: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
      
      console.log(`All ${chunks.length} chunks uploaded successfully`);
      
      // アップロード完了通知（セッションIDを含む）
      const finishMessage = {
        event: "finished_upload",
        data: sessionId
      };
      
      console.log("Sending finish message:", finishMessage);
      client.send(JSON.stringify(finishMessage));
    };
  });
};

// 複数ファイルを高速でアップロード（並列処理対応、各ファイル間で適切な初期化）
export const uploadFiles = async (
  wsClient: WebSocket,
  files: File[],
  config?: Partial<UploadConfig> & { enableParallelFiles?: boolean },
  onProgress?: (fileIndex: number, fileName: string, progress: {
    uploadedBytes: number;
    totalBytes: number;
    percentage: number;
    currentChunk: number;
    totalChunks: number;
    speed: number;
    status: 'uploading' | 'processing' | 'completed';
  }) => void
): Promise<string[]> => {
  const uploadConfig = { 
    ...DEFAULT_CONFIG, 
    ...config,
    enableParallelFiles: config?.enableParallelFiles ?? false 
  };
  
  const urls: string[] = [];
  
  console.log(`Starting upload of ${files.length} files with CRC32 high-speed settings`);
  console.log(`Parallel files enabled: ${uploadConfig.enableParallelFiles}`);
  
  if (uploadConfig.enableParallelFiles && files.length > 1) {
    // 並列ファイルアップロード（実験的）- 各ファイル独立して初期化
    console.log(`Uploading ${files.length} files in parallel with independent initialization...`);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`Starting parallel upload ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        
        const url = await uploadFile(wsClient, file, uploadConfig, (progress) => {
          if (onProgress) {
            onProgress(index, file.name, progress);
          }
        });
        console.log(`Successfully uploaded parallel file ${index + 1}/${files.length}: ${file.name}`);
        return url;
      } catch (error) {
        console.error(`Error uploading parallel file ${file.name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.all(uploadPromises);
    urls.push(...results);
    
  } else {
    // 順次ファイルアップロード（安定性重視）- 各ファイル間で明示的な初期化
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        console.log(`Uploading sequential file ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        
        const url = await uploadFile(wsClient, file, uploadConfig, (progress) => {
          if (onProgress) {
            onProgress(index, file.name, progress);
          }
        });
        urls.push(url);
        console.log(`Successfully uploaded sequential file ${index + 1}/${files.length}: ${file.name}`);
        
        // 次のファイルがある場合は少し待機（セッション切り替えのため）
        if (index < files.length - 1) {
          console.log(`Preparing for next file upload...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms待機
        }
        
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    }
  }
  
  console.log(`All ${files.length} files uploaded successfully with CRC32 high-speed mode`);
  return urls;
};

// プリセット設定関数（CRC32対応）
export const uploadFileWithTurboMode = async (
  client: WebSocket,
  file: File
): Promise<string> => {
  return uploadFile(client, file, {
    maxConcurrency: 5,
    adaptiveChunkSize: true,
    enableTurboMode: true,
    maxChunkSize: 100 * 1024 * 1024, // 100MB chunks with CRC32
    maxRetries: 5,                   // 高速モードでは多めのリトライ
    retryDelay: 500,                 // 短めの初期遅延
  });
};

export const uploadFilesWithParallelMode = async (
  wsClient: WebSocket,
  files: File[]
): Promise<string[]> => {
  return uploadFiles(wsClient, files, {
    maxConcurrency: 4,
    adaptiveChunkSize: true,
    enableTurboMode: true,
    maxChunkSize: 75 * 1024 * 1024, // 75MB chunks for parallel with CRC32
    enableParallelFiles: true,
    maxRetries: 4,                  // 並列処理では適度なリトライ
    retryDelay: 1000,               // 標準的な遅延
  });
};

export const uploadFileWithCustomConfig = async (
  client: WebSocket,
  file: File,
  customConfig: Partial<UploadConfig>
): Promise<string> => {
  return uploadFile(client, file, customConfig);
};
