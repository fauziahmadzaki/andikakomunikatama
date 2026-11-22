'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { SlaRealtimeAlertEvent } from '../types';

export function useSlaWebAlerts(onAlertReceived?: (event: SlaRealtimeAlertEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const onAlertReceivedRef = useRef(onAlertReceived);

  useEffect(() => {
    onAlertReceivedRef.current = onAlertReceived;
  }, [onAlertReceived]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.warning('Browser ini tidak mendukung Web Notifications.');
      return 'denied';
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        toast.success('Notifikasi web berhasil diaktifkan!');
      } else {
        toast.info('Notifikasi web belum diizinkan oleh browser.');
      }
      return res;
    } catch {
      return 'denied';
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const sseUrl = `${apiUrl}/monitoring/events`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.addEventListener('connected', () => {
          setIsConnected(true);
        });

        eventSource.addEventListener('sla_alert', (e) => {
          try {
            const data: SlaRealtimeAlertEvent = JSON.parse(e.data);
            const isDown = data.eventType === 'down';

            // 1. Native Web Browser Notification (even if tab is in background)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(data.title, {
                  body: data.message,
                  icon: '/favicon.ico',
                  tag: `sla-${data.targetId}-${Date.now()}`,
                });
              } catch (notifErr) {
                console.warn('Native notification failed:', notifErr);
              }
            }

            // 2. In-App Toast
            if (isDown) {
              toast.error(data.title, {
                description: data.message,
                duration: 9000,
              });
            } else {
              toast.success(data.title, {
                description: data.message,
                duration: 6000,
              });
            }

            // 3. Callback to refresh data tables
            if (onAlertReceivedRef.current) {
              onAlertReceivedRef.current(data);
            }
          } catch (parseErr) {
            console.error('Error handling SSE sla_alert:', parseErr);
          }
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto reconnect after 5 seconds
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return {
    isConnected,
    permission,
    requestPermission,
  };
}
