import { useMemo, useEffect, useRef } from "react";

export const useWsClient = () => {
  const wsRef = useRef<WebSocket | null>(null);
  
  const createWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    
    console.log('Creating new WebSocket connection to:', `${wsUrl}/ws`);
    const ws = new WebSocket(`${wsUrl}/ws`);
    
    // バイナリメッセージ送信のために必要な設定
    ws.binaryType = 'arraybuffer';
    
    ws.onopen = () => {
      console.log('WebSocket connection opened');
      console.log('WebSocket binaryType:', ws.binaryType);
      
      // WebSocketバッファリング最適化のためのヒント
      console.log('WebSocket ready for high-speed binary transfers');
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      wsRef.current = null;
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };
    
    // 高速化のためのヒント：メッセージキューの管理
    ws.onmessage = (event) => {
      // メッセージ処理の高速化のため、イベントの即座の転送
      if (wsRef.current && wsRef.current !== ws) {
        wsRef.current.dispatchEvent(new MessageEvent('message', { data: event.data }));
      }
    };
    
    wsRef.current = ws;
    return ws;
  };

  // コンポーネントのアンマウント時にWebSocketを閉じる
  useEffect(() => {
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('Closing WebSocket connection on unmount');
        wsRef.current.close();
      }
    };
  }, []);

  return useMemo(() => createWebSocket(), []);
};
