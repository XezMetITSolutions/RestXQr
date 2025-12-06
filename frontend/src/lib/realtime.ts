export type RealtimeEvent = {
  id: string;
  type: string;
  payload: any;
  ts: number;
};

const CHANNEL_KEY = 'masapp_realtime_channel';

export function publish(type: string, payload: any) {
  const evt: RealtimeEvent = {
    id: Math.random().toString(36).slice(2),
    type,
    payload,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(CHANNEL_KEY, JSON.stringify(evt));
    // Clean quickly
    setTimeout(() => localStorage.removeItem(CHANNEL_KEY), 0);
  } catch {}
}

export function subscribe(handler: (evt: RealtimeEvent) => void) {
  const listener = (e: StorageEvent) => {
    if (e.key !== CHANNEL_KEY || !e.newValue) return;
    try {
      const evt = JSON.parse(e.newValue) as RealtimeEvent;
      handler(evt);
    } catch {}
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
