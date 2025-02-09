import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { websocketService } from '../services/websocket.service';

interface WebSocketContextType {
  isConnected: boolean;
  ws: WebSocket | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  useEffect(() => {
   /*  // Connect when the provider mounts
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    }; */
  }, []);

  const value: WebSocketContextType = {
    isConnected: websocketService.isConnected,
    ws: websocketService.ws
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 