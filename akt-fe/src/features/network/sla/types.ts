export type TargetType =
  | 'gateway'
  | 'olt'
  | 'switch'
  | 'server'
  | 'customer_pppoe'
  | 'customer_antena'
  | 'customer_dedicated'
  | 'other';

export interface UptimeBarItem {
  key: string;
  label: string;
  date: string;
  status: 'up' | 'down' | 'mixed' | 'pending';
  uptimePercent: number;
  downtimeSeconds: number;
  incidentCount: number;
}

export interface MonitoringIncident {
  id: string;
  targetId: string;
  startedAt: string;
  resolvedAt?: string | null;
  durationSeconds?: number | null;
  status: 'ongoing' | 'resolved';
  cause?: string;
  createdAt: string;
}

export interface MonitoringTarget {
  id: string;
  name: string;
  host: string;
  routerId: string;
  routerName?: string;
  intervalSeconds: number;
  timeoutMs: number;
  type: TargetType;
  currentStatus: 'up' | 'down' | 'pending';
  lastSeenAt?: string | null;
  lastDownAt?: string | null;
  netwatchComment?: string | null;
  netwatchSynced: boolean;
  netwatchCli?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TargetSlaSummary {
  target: MonitoringTarget;
  currentStatus: 'up' | 'down' | 'pending';
  uptimePercent: number;
  totalDowntimeSeconds: number;
  lastIncident?: MonitoringIncident;
  bars: UptimeBarItem[];
  windowMinutes?: number;
}

export interface TelegramChannel {
  id: string;
  name: string;
  botToken: string;
  chatId: string;
  threadId?: number | null;
  notifyDown: boolean;
  notifyUp: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTelegramChannelInput {
  name: string;
  botToken: string;
  chatId: string;
  threadId?: number | null;
  notifyDown: boolean;
  notifyUp: boolean;
  isEnabled: boolean;
}

export interface WebNotification {
  id: string;
  targetId?: string | null;
  type: 'sla_down' | 'sla_up' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SlaRealtimeAlertEvent {
  id: string;
  targetId: string;
  targetName: string;
  targetHost: string;
  eventType: 'down' | 'up';
  title: string;
  message: string;
  routerName?: string;
  timestamp: string;
}

