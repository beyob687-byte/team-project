import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { QueryClient, useQueryClient } from '@tanstack/react-query'; // Assuming React Query is used

const SOCKET_URL = 'http://localhost:4000'; // Your backend socket URL

const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true, // Important for sending cookies
    });

    socketRef.current.on('notification', (data: any) => {
      console.log('New notification received:', data);
      queryClient.invalidateQueries(['notifications']); // Invalidate notifications query to refetch
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [queryClient]);

  return socketRef.current;
};

export default useSocket;