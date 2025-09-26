import React, { createContext, useContext, useRef } from "react";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({ children }: any) => {
  const wsRef = useRef<WebSocket | null>(null);
  return (
    <WebSocketContext.Provider value={wsRef}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
