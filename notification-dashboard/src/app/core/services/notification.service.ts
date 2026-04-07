import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  NotificationLog,
  NotificationFilter,
  PagedResult,
  NotificationSummary,
} from '../models/notification-log.model';
import { RequestTimeline, TimelineEvent } from '../models/timeline-event.model';

const MOCK_LOGS: NotificationLog[] = [
  {
    id: '1',
    requestId: 'REQ-001',
    type: 'email',
    mode: 'direct',
    status: 'delivered',
    recipient: 'alice@example.com',
    subject: 'Welcome Email',
    message: 'Welcome to our platform!',
    createdAt: '2025-04-06T08:00:00Z',
    updatedAt: '2025-04-06T08:00:05Z',
  },
  {
    id: '2',
    requestId: 'REQ-002',
    type: 'sms',
    mode: 'queue',
    status: 'sent',
    recipient: '+1234567890',
    message: 'Your OTP is 123456',
    createdAt: '2025-04-06T08:05:00Z',
    updatedAt: '2025-04-06T08:05:10Z',
  },
  {
    id: '3',
    requestId: 'REQ-003',
    type: 'email',
    mode: 'queue',
    status: 'failed',
    recipient: 'bob@example.com',
    subject: 'Order Confirmation',
    message: 'Your order #1001 has been confirmed.',
    createdAt: '2025-04-06T08:10:00Z',
    updatedAt: '2025-04-06T08:10:30Z',
    retryCount: 3,
    errorMessage: 'SMTP connection timeout',
  },
  {
    id: '4',
    requestId: 'REQ-004',
    type: 'sms',
    mode: 'direct',
    status: 'pending',
    recipient: '+0987654321',
    message: 'Your appointment is tomorrow at 10 AM.',
    createdAt: '2025-04-06T08:15:00Z',
    updatedAt: '2025-04-06T08:15:00Z',
  },
  {
    id: '5',
    requestId: 'REQ-005',
    type: 'email',
    mode: 'direct',
    status: 'processing',
    recipient: 'carol@example.com',
    subject: 'Invoice #2001',
    message: 'Please find your invoice attached.',
    createdAt: '2025-04-06T08:20:00Z',
    updatedAt: '2025-04-06T08:20:02Z',
  },
  {
    id: '6',
    requestId: 'REQ-006',
    type: 'sms',
    mode: 'queue',
    status: 'delivered',
    recipient: '+1122334455',
    message: 'Your package has been shipped.',
    createdAt: '2025-04-06T09:00:00Z',
    updatedAt: '2025-04-06T09:00:08Z',
  },
  {
    id: '7',
    requestId: 'REQ-007',
    type: 'email',
    mode: 'queue',
    status: 'sent',
    recipient: 'dave@example.com',
    subject: 'Password Reset',
    message: 'Click the link to reset your password.',
    createdAt: '2025-04-06T09:30:00Z',
    updatedAt: '2025-04-06T09:30:03Z',
  },
  {
    id: '8',
    requestId: 'REQ-008',
    type: 'sms',
    mode: 'direct',
    status: 'failed',
    recipient: '+5566778899',
    message: 'Payment received for order #2002.',
    createdAt: '2025-04-06T10:00:00Z',
    updatedAt: '2025-04-06T10:00:20Z',
    retryCount: 1,
    errorMessage: 'Invalid phone number',
  },
  {
    id: '9',
    requestId: 'REQ-009',
    type: 'email',
    mode: 'direct',
    status: 'delivered',
    recipient: 'eve@example.com',
    subject: 'Monthly Newsletter',
    message: 'Check out our latest updates.',
    createdAt: '2025-04-07T07:00:00Z',
    updatedAt: '2025-04-07T07:00:10Z',
  },
  {
    id: '10',
    requestId: 'REQ-010',
    type: 'sms',
    mode: 'queue',
    status: 'processing',
    recipient: '+9988776655',
    message: 'Verification code: 789456',
    createdAt: '2025-04-07T07:30:00Z',
    updatedAt: '2025-04-07T07:30:01Z',
  },
];

const MOCK_TIMELINES: Record<string, RequestTimeline> = {
  'REQ-001': {
    requestId: 'REQ-001',
    type: 'email',
    mode: 'direct',
    recipient: 'alice@example.com',
    subject: 'Welcome Email',
    currentStatus: 'delivered',
    events: [
      {
        id: 'e1',
        requestId: 'REQ-001',
        event: 'received',
        status: 'success',
        message: 'Notification request received',
        timestamp: '2025-04-06T08:00:00Z',
        durationMs: 0,
      },
      {
        id: 'e2',
        requestId: 'REQ-001',
        event: 'processing',
        status: 'success',
        message: 'Processing email request',
        timestamp: '2025-04-06T08:00:01Z',
        durationMs: 1000,
      },
      {
        id: 'e3',
        requestId: 'REQ-001',
        event: 'sent',
        status: 'success',
        message: 'Email sent to alice@example.com',
        timestamp: '2025-04-06T08:00:03Z',
        durationMs: 2000,
        details: { smtpServer: 'smtp.example.com', messageId: 'msg-001' },
      },
      {
        id: 'e4',
        requestId: 'REQ-001',
        event: 'delivered',
        status: 'success',
        message: 'Email delivered successfully',
        timestamp: '2025-04-06T08:00:05Z',
        durationMs: 2000,
      },
    ],
  },
  'REQ-002': {
    requestId: 'REQ-002',
    type: 'sms',
    mode: 'queue',
    recipient: '+1234567890',
    currentStatus: 'sent',
    events: [
      {
        id: 'e1',
        requestId: 'REQ-002',
        event: 'received',
        status: 'success',
        message: 'SMS notification request received',
        timestamp: '2025-04-06T08:05:00Z',
        durationMs: 0,
      },
      {
        id: 'e2',
        requestId: 'REQ-002',
        event: 'queued',
        status: 'success',
        message: 'Message queued for delivery',
        timestamp: '2025-04-06T08:05:02Z',
        durationMs: 2000,
        details: { queueName: 'sms-notifications', position: 3 },
      },
      {
        id: 'e3',
        requestId: 'REQ-002',
        event: 'processing',
        status: 'success',
        message: 'Message dequeued and processing',
        timestamp: '2025-04-06T08:05:05Z',
        durationMs: 3000,
      },
      {
        id: 'e4',
        requestId: 'REQ-002',
        event: 'sent',
        status: 'success',
        message: 'SMS sent via gateway',
        timestamp: '2025-04-06T08:05:10Z',
        durationMs: 5000,
        details: { gateway: 'Twilio', sid: 'SM-abc123' },
      },
    ],
  },
  'REQ-003': {
    requestId: 'REQ-003',
    type: 'email',
    mode: 'queue',
    recipient: 'bob@example.com',
    subject: 'Order Confirmation',
    currentStatus: 'failed',
    events: [
      {
        id: 'e1',
        requestId: 'REQ-003',
        event: 'received',
        status: 'success',
        message: 'Email notification request received',
        timestamp: '2025-04-06T08:10:00Z',
        durationMs: 0,
      },
      {
        id: 'e2',
        requestId: 'REQ-003',
        event: 'queued',
        status: 'success',
        message: 'Email queued for delivery',
        timestamp: '2025-04-06T08:10:01Z',
        durationMs: 1000,
      },
      {
        id: 'e3',
        requestId: 'REQ-003',
        event: 'processing',
        status: 'success',
        message: 'Processing email',
        timestamp: '2025-04-06T08:10:05Z',
        durationMs: 4000,
      },
      {
        id: 'e4',
        requestId: 'REQ-003',
        event: 'retry',
        status: 'warning',
        message: 'Attempt 1 failed, retrying...',
        timestamp: '2025-04-06T08:10:10Z',
        durationMs: 5000,
        details: { error: 'SMTP timeout', attempt: 1 },
      },
      {
        id: 'e5',
        requestId: 'REQ-003',
        event: 'retry',
        status: 'warning',
        message: 'Attempt 2 failed, retrying...',
        timestamp: '2025-04-06T08:10:20Z',
        durationMs: 10000,
        details: { error: 'SMTP timeout', attempt: 2 },
      },
      {
        id: 'e6',
        requestId: 'REQ-003',
        event: 'failed',
        status: 'error',
        message: 'All retry attempts exhausted',
        timestamp: '2025-04-06T08:10:30Z',
        durationMs: 10000,
        details: { error: 'SMTP connection timeout', totalAttempts: 3 },
      },
    ],
  },
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getNotifications(filter?: NotificationFilter, page = 1, pageSize = 20): Observable<PagedResult<NotificationLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.type) params = params.set('type', filter.type);
      if (filter.mode) params = params.set('mode', filter.mode);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
      if (filter.toDate) params = params.set('toDate', filter.toDate);
      if (filter.recipient) params = params.set('recipient', filter.recipient);
      if (filter.requestId) params = params.set('requestId', filter.requestId);
    }

    return this.http
      .get<PagedResult<NotificationLog>>(`${this.baseUrl}/api/notifications`, { params })
      .pipe(catchError(() => of(this.getMockPagedLogs(filter, page, pageSize))));
  }

  getNotificationByRequestId(requestId: string): Observable<NotificationLog[]> {
    return this.http
      .get<NotificationLog[]>(`${this.baseUrl}/api/notifications/${requestId}`)
      .pipe(catchError(() => of(MOCK_LOGS.filter((l) => l.requestId === requestId))));
  }

  getTimeline(requestId: string): Observable<RequestTimeline> {
    return this.http
      .get<RequestTimeline>(`${this.baseUrl}/api/notifications/${requestId}/timeline`)
      .pipe(
        catchError(() => {
          const timeline = MOCK_TIMELINES[requestId];
          if (timeline) return of(timeline);
          const log = MOCK_LOGS.find((l) => l.requestId === requestId);
          if (log) return of(this.buildMockTimeline(log));
          return throwError(() => new Error(`Request ID ${requestId} not found`));
        }),
      );
  }

  getSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.baseUrl}/api/notifications/summary`).pipe(
      catchError(() => of(this.computeMockSummary())),
    );
  }

  private getMockPagedLogs(
    filter: NotificationFilter | undefined,
    page: number,
    pageSize: number,
  ): PagedResult<NotificationLog> {
    let filtered = [...MOCK_LOGS];
    if (filter?.type) filtered = filtered.filter((l) => l.type === filter.type);
    if (filter?.mode) filtered = filtered.filter((l) => l.mode === filter.mode);
    if (filter?.status) filtered = filtered.filter((l) => l.status === filter.status);
    if (filter?.recipient)
      filtered = filtered.filter((l) =>
        l.recipient.toLowerCase().includes(filter.recipient!.toLowerCase()),
      );
    if (filter?.requestId)
      filtered = filtered.filter((l) =>
        l.requestId.toLowerCase().includes(filter.requestId!.toLowerCase()),
      );
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      totalCount: filtered.length,
      page,
      pageSize,
    };
  }

  private buildMockTimeline(log: NotificationLog): RequestTimeline {
    const events: TimelineEvent[] = [
      {
        id: 'e1',
        requestId: log.requestId,
        event: 'received',
        status: 'success',
        message: 'Notification request received',
        timestamp: log.createdAt,
        durationMs: 0,
      },
    ];
    if (log.mode === 'queue') {
      events.push({
        id: 'e2',
        requestId: log.requestId,
        event: 'queued',
        status: 'success',
        message: 'Queued for delivery',
        timestamp: new Date(new Date(log.createdAt).getTime() + 1000).toISOString(),
        durationMs: 1000,
      });
    }
    if (['processing', 'sent', 'delivered', 'failed'].includes(log.status)) {
      events.push({
        id: 'e3',
        requestId: log.requestId,
        event: 'processing',
        status: 'success',
        message: `Processing ${log.type} notification`,
        timestamp: new Date(new Date(log.createdAt).getTime() + 2000).toISOString(),
        durationMs: 2000,
      });
    }
    if (log.status === 'sent' || log.status === 'delivered') {
      events.push({
        id: 'e4',
        requestId: log.requestId,
        event: 'sent',
        status: 'success',
        message: `${log.type === 'email' ? 'Email' : 'SMS'} sent successfully`,
        timestamp: log.updatedAt,
        durationMs: 3000,
      });
    }
    if (log.status === 'delivered') {
      events.push({
        id: 'e5',
        requestId: log.requestId,
        event: 'delivered',
        status: 'success',
        message: 'Notification delivered',
        timestamp: log.updatedAt,
        durationMs: 0,
      });
    }
    if (log.status === 'failed') {
      events.push({
        id: 'e4',
        requestId: log.requestId,
        event: 'failed',
        status: 'error',
        message: log.errorMessage ?? 'Delivery failed',
        timestamp: log.updatedAt,
        durationMs: 3000,
        details: { retryCount: log.retryCount },
      });
    }
    return {
      requestId: log.requestId,
      type: log.type,
      mode: log.mode,
      recipient: log.recipient,
      subject: log.subject,
      currentStatus: log.status,
      events,
    };
  }

  private computeMockSummary(): NotificationSummary {
    const summary: NotificationSummary = {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
      byType: { sms: 0, email: 0 },
      byMode: { queue: 0, direct: 0 },
    };
    for (const log of MOCK_LOGS) {
      summary.total++;
      summary[log.status]++;
      summary.byType[log.type]++;
      summary.byMode[log.mode]++;
    }
    return summary;
  }
}
