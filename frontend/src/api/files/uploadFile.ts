const MessageType = {
  File: 0,
  InitializeFileName: 1,
  FinishedUpload: 2,
} as const;

// CheckSum計算関数
const calculateChecksum = (data: ArrayBuffer): number => {
  const CHECKSUM_MODULUS = 1052;
  const bytes = new Uint8Array(data);
  let result = 0;
  
  for (let i = 0; i < bytes.length; i++) {
    result += bytes[i];
  }
  
  return result % CHECKSUM_MODULUS;
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
  file: File
): Promise<string> => {
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
      const chunkSize = 1024 * 1024 * 10; // 10MB chunks (以前の50MBから減らして安定性向上)
      let start = 0;

      console.log(`Starting chunk upload for ${file.name}, total size: ${totalSize} bytes`);

      while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        try {
          const arrayBuffer = await chunk.arrayBuffer();
          const checksum = calculateChecksum(arrayBuffer);
          
          console.log(`Uploading chunk: ${start}-${end}, size: ${arrayBuffer.byteLength} bytes, checksum: ${checksum}`);
          
          // CheckSumとチャンクデータを含むバイナリメッセージを作成
          const checksumBuffer = new ArrayBuffer(8);
          const checksumView = new DataView(checksumBuffer);
          checksumView.setBigUint64(0, BigInt(checksum), false); // Big Endian
          
          // CheckSumとチャンクデータを結合
          const combinedBuffer = new ArrayBuffer(8 + arrayBuffer.byteLength);
          const combinedView = new Uint8Array(combinedBuffer);
          
          // CheckSumを最初の8バイトにコピー
          combinedView.set(new Uint8Array(checksumBuffer), 0);
          // チャンクデータをその後にコピー
          combinedView.set(new Uint8Array(arrayBuffer), 8);
          
          // デバッグ用: バイナリデータの最初の部分をログ出力
          const debugData = new Uint8Array(combinedBuffer.slice(0, Math.min(16, combinedBuffer.byteLength)));
          console.log(`Binary data preview (first ${debugData.length} bytes):`, Array.from(debugData).map(b => b.toString(16).padStart(2, '0')).join(' '));
          console.log(`Total combined buffer size: ${combinedBuffer.byteLength} bytes`);
          console.log(`WebSocket readyState: ${client.readyState} (OPEN=${WebSocket.OPEN})`);
          
          // バイナリメッセージとして送信
          if (client.readyState !== WebSocket.OPEN) {
            throw new Error(`WebSocket not ready: readyState=${client.readyState}`);
          }
          
          try {
            console.log(`Sending binary message with ${combinedBuffer.byteLength} bytes...`);
            client.send(combinedBuffer);
            console.log(`Binary message sent successfully`);
          } catch (sendError) {
            console.error("Error sending binary message:", sendError);
            throw new Error(`Failed to send binary message: ${sendError}`);
          }
          
          uploadProgress += chunk.size;
          const progressPercentage = (uploadProgress / totalSize * 100).toFixed(2);
          console.log(`Upload progress: ${progressPercentage}%`);
          
          // チャンク間に遅延を追加（サーバー側の処理負荷軽減とバイナリメッセージ処理のため）
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error("Error processing chunk:", error);
          cleanup();
          reject(new Error("Error processing chunk: " + error));
          return;
        }
        
        start = end;
      }
      
      console.log(`All chunks uploaded for ${file.name}, sending finish message`);
      
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

// 複数ファイルを順番にアップロード（WebSocketの接続問題を避けるため）
export const uploadFiles = async (
  wsClient: WebSocket,
  files: File[]
): Promise<string[]> => {
  const urls: string[] = [];
  
  console.log(`Starting upload of ${files.length} files`);
  
  // 各ファイルを順番にアップロード
  for (const file of files) {
    try {
      console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
      const url = await uploadFile(wsClient, file);
      urls.push(url);
      console.log(`Successfully uploaded: ${file.name}`);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  }
  
  console.log(`All ${files.length} files uploaded successfully`);
  return urls;
};
