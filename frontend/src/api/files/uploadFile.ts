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
}

const DEFAULT_CONFIG: UploadConfig = {
  maxConcurrency: 3,           // 同時送信チャンク数
  adaptiveChunkSize: true,     // ファイルサイズに応じた動的チャンクサイズ
  enableTurboMode: true,       // 高速モード（遅延なし）
  maxChunkSize: 100 * 1024 * 1024  // 最大チャンクサイズ（100MB）
};

// 高速化されたCheckSum計算関数
const calculateChecksum = (data: ArrayBuffer): number => {
  const CHECKSUM_MODULUS = 1052;
  const bytes = new Uint8Array(data);
  let result = 0;
  
  // Uint32Arrayを使用して4バイトずつ処理（高速化）
  const uint32Array = new Uint32Array(data.slice(0, Math.floor(data.byteLength / 4) * 4));
  for (let i = 0; i < uint32Array.length; i++) {
    result += uint32Array[i];
  }
  
  // 残りのバイトを処理
  const remainder = data.byteLength % 4;
  const remainderStart = data.byteLength - remainder;
  for (let i = remainderStart; i < data.byteLength; i++) {
    result += bytes[i];
  }
  
  return result % CHECKSUM_MODULUS;
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

export const uploadFile = async (
  client: WebSocket,
  file: File,
  config?: Partial<UploadConfig>
): Promise<string> => {
  const uploadConfig = { ...DEFAULT_CONFIG, ...config };
  
  return new Promise(async (resolve, reject) => {
    try {
      // WebSocket接続を待つ
      await waitForConnection(client);
    } catch (error) {
      reject(error);
      return;
    }

    let uploadProgress = 0;
    let sessionId = "";
    const totalSize = file.size;
    let isCompleted = false;

    console.log(`Starting high-speed upload for ${file.name} (${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
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
              reject(new Error(`Upload error: ${response.Data.message}`));
            } else {
              console.log(`Chunk uploaded successfully. Chunks received: ${response.Data.chunks_received}`);
            }
            break;
            
          case "finished_upload":
            if (response.Data.status === "completed") {
              console.log(`Upload completed. File: ${response.Data.filename}, Size: ${response.Data.total_size} bytes`);
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
        reject(new Error("WebSocket error during upload"));
      }
    };

    const closeHandler = (event: CloseEvent) => {
      console.log("WebSocket closed during upload:", event.code, event.reason);
      if (!isCompleted) {
        cleanup();
        reject(new Error(`WebSocket connection closed unexpectedly: ${event.reason || 'Unknown reason'}`));
      }
    };

    const cleanup = () => {
      client.removeEventListener('message', messageHandler);
      client.removeEventListener('error', errorHandler);
      client.removeEventListener('close', closeHandler);
    };

    // イベントリスナーを登録
    client.addEventListener('message', messageHandler);
    client.addEventListener('error', errorHandler);
    client.addEventListener('close', closeHandler);

    // ファイルアップロードの初期化
    const initMessage = {
      event: "initialize_file_name",
      data: file.name
    };
    
    console.log("Sending initialization message:", initMessage);
    client.send(JSON.stringify(initMessage));

    // チャンクアップロードの開始
    const startChunkUpload = async () => {
      const chunkSize = getOptimalChunkSize(file.size, uploadConfig);
      const concurrency = uploadConfig.maxConcurrency; // 同時に送信するチャンク数
      const chunks: Array<{start: number, end: number, index: number}> = [];
      
      // チャンクリストを作成
      for (let start = 0; start < file.size; start += chunkSize) {
        const end = Math.min(start + chunkSize, file.size);
        chunks.push({ start, end, index: chunks.length });
      }
      
      console.log(`File divided into ${chunks.length} chunks of ~${(chunkSize / 1024 / 1024).toFixed(1)}MB each`);
      
      let uploadedBytes = 0;
      
      const uploadSingleChunk = async (chunkInfo: {start: number, end: number, index: number}): Promise<void> => {
        const chunk = file.slice(chunkInfo.start, chunkInfo.end);
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
        
        // 送信
        client.send(combinedBuffer);
        
        // プログレス更新
        uploadedBytes += chunk.size;
        uploadProgress = uploadedBytes;
        const progress = (uploadedBytes / file.size) * 100;
        
        console.log(`Chunk ${chunkInfo.index + 1}/${chunks.length} uploaded (${progress.toFixed(1)}%)`);
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

// 複数ファイルを高速でアップロード（並列処理対応）
export const uploadFiles = async (
  wsClient: WebSocket,
  files: File[],
  config?: Partial<UploadConfig> & { enableParallelFiles?: boolean }
): Promise<string[]> => {
  const uploadConfig = { 
    ...DEFAULT_CONFIG, 
    ...config,
    enableParallelFiles: config?.enableParallelFiles ?? false 
  };
  
  const urls: string[] = [];
  
  console.log(`Starting upload of ${files.length} files with high-speed settings`);
  console.log(`Parallel files enabled: ${uploadConfig.enableParallelFiles}`);
  
  if (uploadConfig.enableParallelFiles && files.length > 1) {
    // 並列ファイルアップロード（実験的）
    console.log(`Uploading ${files.length} files in parallel...`);
    
    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`Starting parallel upload ${index + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        const url = await uploadFile(wsClient, file, uploadConfig);
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
    // 順次ファイルアップロード（安定性重視）
    for (const file of files) {
      try {
        console.log(`Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        const url = await uploadFile(wsClient, file, uploadConfig);
        urls.push(url);
        console.log(`Successfully uploaded: ${file.name}`);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    }
  }
  
  console.log(`All ${files.length} files uploaded successfully in high-speed mode`);
  return urls;
};

// プリセット設定関数
export const uploadFileWithTurboMode = async (
  client: WebSocket,
  file: File
): Promise<string> => {
  return uploadFile(client, file, {
    maxConcurrency: 5,
    adaptiveChunkSize: true,
    enableTurboMode: true,
    maxChunkSize: 100 * 1024 * 1024 // 100MB chunks
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
    maxChunkSize: 75 * 1024 * 1024, // 75MB chunks for parallel
    enableParallelFiles: true
  });
};

export const uploadFileWithCustomConfig = async (
  client: WebSocket,
  file: File,
  customConfig: Partial<UploadConfig>
): Promise<string> => {
  return uploadFile(client, file, customConfig);
};
