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

export const uploadFile = async (
  client: WebSocket,
  file: File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let uploadProgress = 0;
    let sessionId = "";
    const totalSize = file.size;

    // WebSocketイベントハンドラの設定
    client.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        switch (response.event) {
          case "initialize_file_name":
            if (response.data.status === "initialized") {
              sessionId = response.data.session_id;
              console.log(`File upload initialized with session ID: ${sessionId}`);
              startChunkUpload();
            } else {
              reject(new Error("Failed to initialize file upload"));
            }
            break;
            
          case "upload_file_chunk":
            if (response.data.status === "error") {
              reject(new Error(`Upload error: ${response.data.message}`));
            } else {
              console.log(`Chunk uploaded successfully. Chunks received: ${response.data.chunks_received}`);
            }
            break;
            
          case "finished_upload":
            if (response.data.status === "completed") {
              console.log(`Upload completed. File: ${response.data.filename}, Size: ${response.data.total_size} bytes`);
              resolve(response.data.file_path || response.data.filename);
            } else {
              reject(new Error("Upload completion failed"));
            }
            break;
            
          default:
            console.log("Unknown message:", response);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        reject(error);
      }
    };

    client.onerror = (error) => {
      reject(new Error("WebSocket error: " + error));
    };

    // ファイルアップロードの初期化
    const initMessage = {
      event: "initialize_file_name",
      data: file.name
    };
    client.send(JSON.stringify(initMessage));

    // チャンクアップロードの開始
    const startChunkUpload = async () => {
      const chunkSize = 1024 * 1024 * 50; // 50MB chunks
      let start = 0;

      while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        try {
          const arrayBuffer = await chunk.arrayBuffer();
          const checksum = calculateChecksum(arrayBuffer);
          
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
          
          // バイナリメッセージとして送信
          client.send(combinedBuffer);
          
          uploadProgress += chunk.size;
          console.log(`Upload progress: ${(uploadProgress / totalSize * 100).toFixed(2)}%`);
          
          // チャンク間に小さな遅延を追加（サーバー側の処理を待つため）
          await new Promise(resolve => setTimeout(resolve, 10));
          
        } catch (error) {
          reject(new Error("Error processing chunk: " + error));
          return;
        }
        
        start = end;
      }
      
      // アップロード完了通知（セッションIDを含む）
      const finishMessage = {
        event: "finished_upload",
        data: sessionId
      };
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
  
  // 各ファイルを順番にアップロード
  for (const file of files) {
    try {
      const url = await uploadFile(wsClient, file);
      urls.push(url);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  }
  
  return urls;
};
