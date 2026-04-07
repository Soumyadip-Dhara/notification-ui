export type TimelineEventType =
  | 'received'
  | 'queued'
  | 'processing'
  | 'retry'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface TimelineEvent {
  id: string;
  requestId: string;
  event: TimelineEventType;
  status: string;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
  durationMs?: number;
}

export interface RequestTimeline {
  requestId: string;
  type: string;
  mode: string;
  recipient: string;
  subject?: string;
  currentStatus: string;
  events: TimelineEvent[];
}
