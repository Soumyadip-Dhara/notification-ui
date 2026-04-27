export type NotificationType = 'SMS' | 'EMAIL';
export type NotificationMode = 'VIA QUEUE' | 'DIRECT';
export type NotificationStatus = 2 | 1 | 0 ;

// export interface NotificationLog {
//   id: string;
//   requestId: string;
//   type: NotificationType;
//   mode: NotificationMode;
//   status: NotificationStatus;
//   recipient: string;
//   subject?: string;
//   message: string;
//   createdAt: string;
//   updatedAt: string;
//   retryCount?: number;
//   errorMessage?: string;
//   metadata?: Record<string, unknown>;
// }

export interface NotificationLog {
  id: number;
  requestId?: string;

  type: string;
  mode?: string;
  status?: number;

  recipients: string[];   // FIXED

  message: string;

  createdAt: string;
  updatedAt?: string;

  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilter {
  type?: NotificationType;
  mode?: NotificationMode;
  status?: NotificationStatus;
  fromDate?: string;
  toDate?: string;
  recipient?: string;
  service?: string;
  // requestId?: string;
}

export interface IApiResponce<T> {
  status: number;
  result: T;
  message?: string;
}
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface NotificationSummary {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  processing: number;
  delivered: number;
  byType: { sms: number; email: number };
  byMode: { queue: number; direct: number };
  lastEmailSuccessAt?: string;
  lastSmsSuccessAt?: string;
}
