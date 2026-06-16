import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATIONS_KEY } from '../hooks/useNotifications';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
      }
      return;
    }

    // Connect to backend Socket.IO
    // Assuming backend runs on the same origin or a specific configured API base
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // We strip /api/v1 from the URL if it's there to get the root server URL
    const rootUrl = backendUrl.replace(/\/api\/v\d+$/, '');

    const socketInstance = io(rootUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketInstance.on('new_notification', (data) => {
      console.log('New notification received via socket:', data);
      // Invalidate the notifications query to refetch data
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, accessToken, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
