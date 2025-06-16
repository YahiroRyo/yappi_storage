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
    
    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      wsRef.current = null;
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
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
