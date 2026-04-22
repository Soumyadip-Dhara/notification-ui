export type TimelineEventType =
  | 'received'
  | 'queued'
  | 'processing'
  | 'retry'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'api_initiated'
  | 'api_terminated'
  | 'background_service';

export interface TimelineEvent {
  id: number;
  requestId: string;
  event: TimelineEventType;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  eventType?: string;
  level?: string;
  finYear?: number;
  month?: number;
  details?: Record<string, unknown>;
  durationMs?: number;
}

export interface RequestTimeline {
  requestId: string;
  type: string;
  mode: string;
  recipients: string[];
  subject?: string;
  currentStatus: string;
  events: TimelineEvent[];
  finYear?: number;
  month?: number;
}
