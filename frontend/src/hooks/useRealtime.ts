import { useEffect, useRef, useState } from 'react';

interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface UseRealtimeOptions {
  onEvent?: (event: RealtimeEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoReconnect?: boolean;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { onEvent, onConnect, onDisconnect, autoReconnect = true } = options;

  const connect = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://masapp-backend.onrender.com/api';
    const eventsUrl = `${apiUrl}/events`;

    console.log('🔌 Connecting to SSE:', eventsUrl);
    console.log('🔌 Current origin:', typeof window !== 'undefined' ? window.location.origin : 'server');

    const eventSource = new EventSource(eventsUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
      setIsConnected(true);
      onConnect?.();
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 SSE Event received:', data);
        
        setLastEvent(data);
        onEvent?.(data);
      } catch (error) {
        console.error('❌ SSE Event parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      setIsConnected(false);
      onDisconnect?.();

      // Auto-reconnect after 5 seconds
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting SSE reconnection...');
          connect();
        }, 5000);
      }
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect
  };
};

export default useRealtime;
