import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  NotificationLog,
  NotificationFilter,
  PagedResult,
  NotificationSummary,
  IApiResponce,
} from '../models/notification-log.model';
import { RequestTimeline, TimelineEvent } from '../models/timeline-event.model';

// const MOCK_LOGS: NotificationLog[] = [
//   {
//     id: '1',
//     requestId: 'REQ-001',
//     type: 'email',
//     mode: 'direct',
//     status: 'delivered',
//     recipient: 'alice@example.com',
//     subject: 'Welcome Email',
//     message: 'Welcome to our platform!',
//     createdAt: '2025-04-06T08:00:00Z',
//     updatedAt: '2025-04-06T08:00:05Z',
//   },
//   {
//     id: '2',
//     requestId: 'REQ-002',
//     type: 'sms',
//     mode: 'queue',
//     status: 'sent',
//     recipient: '+1234567890',
//     message: 'Your OTP is 123456',
//     createdAt: '2025-04-06T08:05:00Z',
//     updatedAt: '2025-04-06T08:05:10Z',
//   },
//   {
//     id: '3',
//     requestId: 'REQ-003',
//     type: 'email',
//     mode: 'queue',
//     status: 'failed',
//     recipient: 'bob@example.com',
//     subject: 'Order Confirmation',
//     message: 'Your order #1001 has been confirmed.',
//     createdAt: '2025-04-06T08:10:00Z',
//     updatedAt: '2025-04-06T08:10:30Z',
//     retryCount: 3,
//     errorMessage: 'SMTP connection timeout',
//   },
//   {
//     id: '4',
//     requestId: 'REQ-004',
//     type: 'sms',
//     mode: 'direct',
//     status: 'pending',
//     recipient: '+0987654321',
//     message: 'Your appointment is tomorrow at 10 AM.',
//     createdAt: '2025-04-06T08:15:00Z',
//     updatedAt: '2025-04-06T08:15:00Z',
//   },
//   {
//     id: '5',
//     requestId: 'REQ-005',
//     type: 'email',
//     mode: 'direct',
//     status: 'processing',
//     recipient: 'carol@example.com',
//     subject: 'Invoice #2001',
//     message: 'Please find your invoice attached.',
//     createdAt: '2025-04-06T08:20:00Z',
//     updatedAt: '2025-04-06T08:20:02Z',
//   },
//   {
//     id: '6',
//     requestId: 'REQ-006',
//     type: 'sms',
//     mode: 'queue',
//     status: 'delivered',
//     recipient: '+1122334455',
//     message: 'Your package has been shipped.',
//     createdAt: '2025-04-06T09:00:00Z',
//     updatedAt: '2025-04-06T09:00:08Z',
//   },
//   {
//     id: '7',
//     requestId: 'REQ-007',
//     type: 'email',
//     mode: 'queue',
//     status: 'sent',
//     recipient: 'dave@example.com',
//     subject: 'Password Reset',
//     message: 'Click the link to reset your password.',
//     createdAt: '2025-04-06T09:30:00Z',
//     updatedAt: '2025-04-06T09:30:03Z',
//   },
//   {
//     id: '8',
//     requestId: 'REQ-008',
//     type: 'sms',
//     mode: 'direct',
//     status: 'failed',
//     recipient: '+5566778899',
//     message: 'Payment received for order #2002.',
//     createdAt: '2025-04-06T10:00:00Z',
//     updatedAt: '2025-04-06T10:00:20Z',
//     retryCount: 1,
//     errorMessage: 'Invalid phone number',
//   },
//   {
//     id: '9',
//     requestId: 'REQ-009',
//     type: 'email',
//     mode: 'direct',
//     status: 'delivered',
//     recipient: 'eve@example.com',
//     subject: 'Monthly Newsletter',
//     message: 'Check out our latest updates.',
//     createdAt: '2025-04-07T07:00:00Z',
//     updatedAt: '2025-04-07T07:00:10Z',
//   },
//   {
//     id: '10',
//     requestId: 'REQ-010',
//     type: 'sms',
//     mode: 'queue',
//     status: 'processing',
//     recipient: '+9988776655',
//     message: 'Verification code: 789456',
//     createdAt: '2025-04-07T07:30:00Z',
//     updatedAt: '2025-04-07T07:30:01Z',
//   },
// ];

// const MOCK_TIMELINES: Record<string, RequestTimeline> = {
//   'REQ-001': {
//     requestId: 'REQ-001',
//     type: 'email',
//     mode: 'direct',
//     recipient: 'alice@example.com',
//     subject: 'Welcome Email',
//     currentStatus: 'delivered',
//     events: [
//       {
//         id: 'e1',
//         requestId: 'REQ-001',
//         event: 'received',
//         status: 'success',
//         message: 'Notification request received',
//         timestamp: '2025-04-06T08:00:00Z',
//         durationMs: 0,
//       },
//       {
//         id: 'e2',
//         requestId: 'REQ-001',
//         event: 'processing',
//         status: 'success',
//         message: 'Processing email request',
//         timestamp: '2025-04-06T08:00:01Z',
//         durationMs: 1000,
//       },
//       {
//         id: 'e3',
//         requestId: 'REQ-001',
//         event: 'sent',
//         status: 'success',
//         message: 'Email sent to alice@example.com',
//         timestamp: '2025-04-06T08:00:03Z',
//         durationMs: 2000,
//         details: { smtpServer: 'smtp.example.com', messageId: 'msg-001' },
//       },
//       {
//         id: 'e4',
//         requestId: 'REQ-001',
//         event: 'delivered',
//         status: 'success',
//         message: 'Email delivered successfully',
//         timestamp: '2025-04-06T08:00:05Z',
//         durationMs: 2000,
//       },
//     ],
//   },
//   'REQ-002': {
//     requestId: 'REQ-002',
//     type: 'sms',
//     mode: 'queue',
//     recipient: '+1234567890',
//     currentStatus: 'sent',
//     events: [
//       {
//         id: 'e1',
//         requestId: 'REQ-002',
//         event: 'received',
//         status: 'success',
//         message: 'SMS notification request received',
//         timestamp: '2025-04-06T08:05:00Z',
//         durationMs: 0,
//       },
//       {
//         id: 'e2',
//         requestId: 'REQ-002',
//         event: 'queued',
//         status: 'success',
//         message: 'Message queued for delivery',
//         timestamp: '2025-04-06T08:05:02Z',
//         durationMs: 2000,
//         details: { queueName: 'sms-notifications', position: 3 },
//       },
//       {
//         id: 'e3',
//         requestId: 'REQ-002',
//         event: 'processing',
//         status: 'success',
//         message: 'Message dequeued and processing',
//         timestamp: '2025-04-06T08:05:05Z',
//         durationMs: 3000,
//       },
//       {
//         id: 'e4',
//         requestId: 'REQ-002',
//         event: 'sent',
//         status: 'success',
//         message: 'SMS sent via gateway',
//         timestamp: '2025-04-06T08:05:10Z',
//         durationMs: 5000,
//         details: { gateway: 'Twilio', sid: 'SM-abc123' },
//       },
//     ],
//   },
//   'REQ-003': {
//     requestId: 'REQ-003',
//     type: 'email',
//     mode: 'queue',
//     recipient: 'bob@example.com',
//     subject: 'Order Confirmation',
//     currentStatus: 'failed',
//     events: [
//       {
//         id: 'e1',
//         requestId: 'REQ-003',
//         event: 'received',
//         status: 'success',
//         message: 'Email notification request received',
//         timestamp: '2025-04-06T08:10:00Z',
//         durationMs: 0,
//       },
//       {
//         id: 'e2',
//         requestId: 'REQ-003',
//         event: 'queued',
//         status: 'success',
//         message: 'Email queued for delivery',
//         timestamp: '2025-04-06T08:10:01Z',
//         durationMs: 1000,
//       },
//       {
//         id: 'e3',
//         requestId: 'REQ-003',
//         event: 'processing',
//         status: 'success',
//         message: 'Processing email',
//         timestamp: '2025-04-06T08:10:05Z',
//         durationMs: 4000,
//       },
//       {
//         id: 'e4',
//         requestId: 'REQ-003',
//         event: 'retry',
//         status: 'warning',
//         message: 'Attempt 1 failed, retrying...',
//         timestamp: '2025-04-06T08:10:10Z',
//         durationMs: 5000,
//         details: { error: 'SMTP timeout', attempt: 1 },
//       },
//       {
//         id: 'e5',
//         requestId: 'REQ-003',
//         event: 'retry',
//         status: 'warning',
//         message: 'Attempt 2 failed, retrying...',
//         timestamp: '2025-04-06T08:10:20Z',
//         durationMs: 10000,
//         details: { error: 'SMTP timeout', attempt: 2 },
//       },
//       {
//         id: 'e6',
//         requestId: 'REQ-003',
//         event: 'failed',
//         status: 'error',
//         message: 'All retry attempts exhausted',
//         timestamp: '2025-04-06T08:10:30Z',
//         durationMs: 10000,
//         details: { error: 'SMTP connection timeout', totalAttempts: 3 },
//       },
//     ],
//   },
// };

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  getNotifications(filter?: NotificationFilter, page = 1, pageSize = 20): Observable<IApiResponce<PagedResult<NotificationLog>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      // if (filter.type) params = params.set('type', filter.type);
      if (filter.type) params = params.set('eventType', filter.type);
      // if (filter.mode) params = params.set('mode', filter.mode);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
      if (filter.toDate) params = params.set('toDate', filter.toDate);
      if (filter.recipient) params = params.set('recipient', filter.recipient);
      if (filter.requestId) params = params.set('requestId', filter.requestId);
    }

    return this.http
      .get<IApiResponce<PagedResult<NotificationLog>>>(`${this.baseUrl}/api/Dashboard/notifications`, { params })
      .pipe(catchError(() => of({ status: 200, result: { items: [], totalCount: 0, page, pageSize } })));
  }

  // getNotificationByRequestId(requestId: string): Observable<NotificationLog[]> {
  //   return this.http
  //     .get<NotificationLog[]>(`${this.baseUrl}/api/notifications/${requestId}`)
  //     .pipe(catchError(() => of(MOCK_LOGS.filter((l) => l.requestId === requestId))));
  // }

  getTimeline(requestId: string): Observable<RequestTimeline> {
    return this.http
      .get<any>(`${this.baseUrl}/api/Dashboard/${requestId}/timeline`)
      .pipe(
        map((response) => {
          const timelineData = response?.result || response;
          return this.transformTimelineResponse(timelineData);
        }),
        catchError(() => {
          // Fallback: try fetching logs and building timeline
          return this.getNotificationsByRequestId(requestId).pipe(
            catchError(() => {
              return throwError(() => new Error(`Request ID ${requestId} not found`));
            }),
          );
        }),
      );
  }

  /**
   * Fetch all logs for a specific request ID and transform into timeline
   */
  private getNotificationsByRequestId(requestId: string): Observable<RequestTimeline> {
    return this.http
      .get<IApiResponce<PagedResult<NotificationLog>>>(
        `${this.baseUrl}/api/Dashboard/notifications`,
        { params: new HttpParams().set('requestId', requestId).set('pageSize', '1000') }
      )
      .pipe(
        map((response) => {
          const logs = response?.result?.items || [];
          const timeline = this.buildTimelineFromLogs(logs);
          if (!timeline) {
            throw new Error(`No logs found for ${requestId}`);
          }
          return timeline;
        }),
        catchError(() => throwError(() => new Error(`Failed to load logs for ${requestId}`))),
      );
  }

  getSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.baseUrl}/api/notifications/summary`).pipe(
      catchError(() => of(this.computeMockSummary())),
    );
  }

  // private getMockPagedLogs(
    // filter: NotificationFilter | undefined,
    // page: number,
    // pageSize: number,
  // ): PagedResult<NotificationLog> {
    // let filtered = [...MOCK_LOGS];
    // if (filter?.type) filtered = filtered.filter((l) => l.type === filter.type);
    // if (filter?.mode) filtered = filtered.filter((l) => l.mode === filter.mode);
    // if (filter?.status) filtered = filtered.filter((l) => l.status === filter.status)
     
    // const start = (page - 1) * pageSize;
    // return {
    //   items: filtered.slice(start, start + pageSize),
    //   totalCount: filtered.length,
    //   page,
    //   pageSize,
    // };
  // }

  // private buildMockTimeline(log: NotificationLog): RequestTimeline {
  //   const events: TimelineEvent[] = [
  //     {
  //       id: 'e1',
  //       requestId: log.requestId,
  //       event: 'received',
  //       status: 'success',
  //       message: 'Notification request received',
  //       timestamp: log.createdAt,
  //       durationMs: 0,
  //     },
  //   ];
  //   if (log.mode === 'queue') {
  //     events.push({
  //       id: 'e2',
  //       requestId: log.requestId,
  //       event: 'queued',
  //       status: 'success',
  //       message: 'Queued for delivery',
  //       timestamp: new Date(new Date(log.createdAt).getTime() + 1000).toISOString(),
  //       durationMs: 1000,
  //     });
  //   }
  //   if (['processing', 'sent', 'delivered', 'failed'].includes(log.status)) {
  //     events.push({
  //       id: 'e3',
  //       requestId: log.requestId,
  //       event: 'processing',
  //       status: 'success',
  //       message: `Processing ${log.type} notification`,
  //       timestamp: new Date(new Date(log.createdAt).getTime() + 2000).toISOString(),
  //       durationMs: 2000,
  //     });
  //   }
  //   if (log.status === 'sent' || log.status === 'delivered') {
  //     events.push({
  //       id: 'e4',
  //       requestId: log.requestId,
  //       event: 'sent',
  //       status: 'success',
  //       message: `${log.type === 'email' ? 'Email' : 'SMS'} sent successfully`,
  //       timestamp: log.updatedAt,
  //       durationMs: 3000,
  //     });
  //   }
  //   if (log.status === 'delivered') {
  //     events.push({
  //       id: 'e5',
  //       requestId: log.requestId,
  //       event: 'delivered',
  //       status: 'success',
  //       message: 'Notification delivered',
  //       timestamp: log.updatedAt,
  //       durationMs: 0,
  //     });
  //   }
  //   if (log.status === 'failed') {
  //     events.push({
  //       id: 'e4',
  //       requestId: log.requestId,
  //       event: 'failed',
  //       status: 'error',
  //       message: log.errorMessage ?? 'Delivery failed',
  //       timestamp: log.updatedAt,
  //       durationMs: 3000,
  //       details: { retryCount: log.retryCount },
  //     });
  //   }
  //   return {
  //     requestId: log.requestId,
  //     type: log.type,
  //     mode: log.mode,
  //     recipient: log.recipient,
  //     subject: log.subject,
  //     currentStatus: log.status,
  //     events,
  //   };
  // }

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
    // for (const log of MOCK_LOGS) {
    //   summary.total++;
    //   // summary[log.status]++;
    //   // summary.byType[log.type]++;
    //   // summary.byMode[log.mode]++;
    // }
    return summary;
  }

  /**
   * Transform notification logs into a RequestTimeline
   * Fallback method for when timeline endpoint isn't used
   */
  private buildTimelineFromLogs(logs: NotificationLog[]): RequestTimeline | null {
    if (!logs.length) return null;

    // Convert logs to timeline event format
    const timelineData = {
      requestId: logs[0].requestId || '',
      type: logs[0].type?.toLowerCase() || 'sms',
      mode: logs[0].mode?.toLowerCase() || 'direct',
      recipients: logs[0].recipients || [],
      events: logs.map((log) => ({
        id: log.id,
        requestId: log.requestId,
        event: log.type || '',
        status: 'unknown',
        message: log.message,
        timestamp: log.createdAt,
        eventType: log.type,
        level: 'Information',
        details: typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata),
        finYear: 0,
        month: 0,
      })),
      finYear: 0,
      month: 1,
    };

    return this.transformTimelineResponse(timelineData);
  }

  /**
   * Transform API response into RequestTimeline
   * Handles the actual backend API response format
   */
  private transformTimelineResponse(data: any): RequestTimeline {
    if (!data.events || data.events.length === 0) {
      throw new Error('No events found in timeline');
    }

    // Transform events and parse details
    const events: TimelineEvent[] = data.events.map((event: any, index: number) => {
      // Parse details if it's a string
      let details: any = {};
      if (typeof event.details === 'string') {
        try {
          details = JSON.parse(event.details);
        } catch {
          details = {};
        }
      } else {
        details = event.details || {};
      }

      // Get status from details.Status if available, otherwise from event.status
      let status: any = event.status;
      if (!status || status === 'unknown') {
        const statusNum = details.Status;
        status = this.mapStatusToEventStatus(statusNum);
      }

      // Map event type
      const timelineEventType = this.mapEventType(event.eventType || event.event);

      // Calculate duration from previous event
      let durationMs: number | undefined;
      if (index > 0) {
        const prevTime = new Date(data.events[index - 1].timestamp).getTime();
        const currTime = new Date(event.timestamp).getTime();
        durationMs = Math.max(0, currTime - prevTime);
      }

      // Extract fin_year and month from details or top-level
      let finYear = data.finYear;
      let month = data.month;

      if (details && typeof details === 'object') {
        if (details['fin_year']) finYear = details['fin_year'];
        if (details['month']) month = details['month'];
      }

      return {
        id: event.id,
        requestId: event.requestId || data.requestId,
        event: timelineEventType,
        status,
        message: event.message || '',
        timestamp: event.timestamp,
        eventType: event.eventType || event.event,
        level: event.level || 'Information',
        finYear,
        month,
        details: this.extractEventDetails(details),
        durationMs,
      };
    });

    // Determine final status from the last event
    const lastEvent = events[events.length - 1];
    let currentStatus = 'unknown';
    if (lastEvent.status === 'success') {
      currentStatus = 'delivered';
    } else if (lastEvent.status === 'error') {
      currentStatus = 'failed';
    } else if (lastEvent.status === 'warning') {
      currentStatus = 'processing';
    }

    // Get mode from details - check if QueueName exists
    let mode = data.mode?.toLowerCase() || 'direct';
    if (data.events.length > 0) {
      const firstEventDetails = typeof data.events[0].details === 'string'
        ? JSON.parse(data.events[0].details)
        : data.events[0].details;

      if (firstEventDetails?.QueueName) {
        mode = 'queue';
      }
    }

    return {
      requestId: data.requestId,
      type: data.type?.toLowerCase() || 'sms',
      mode,
      recipients: data.recipients || [],
      currentStatus,
      events,
      finYear: data.finYear,
      month: data.month,
    };
  }

  /**
   * Map database event type to timeline event type
   */
  private mapEventType(eventType: string): any {
    const typeMap: Record<string, any> = {
      'API_CALLED_INITIATED': 'api_initiated',
      'API CALLED INITIATED': 'api_initiated',
      'API_CALLED_TERMINATED': 'api_terminated',
      'API CALLED TERMINATED': 'api_terminated',
      'SMS_BACKGROUND_SERVICE_INITIATED': 'background_service',
      'SMS BACKGROUND SERVICE INITIATED': 'background_service',
      'EMAIL_BACKGROUND_SERVICE_INITIATED': 'background_service',
      'EMAIL BACKGROUND SERVICE INITIATED': 'background_service',
      'QUEUED': 'queued',
      'PROCESSING': 'processing',
      'SENT': 'sent',
      'DELIVERED': 'delivered',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
    };
    return typeMap[eventType] || 'processing';
  }

  /**
   * Map numeric status to event status string
   */
  private mapStatusToEventStatus(status: number | null | undefined): 'success' | 'error' | 'warning' | 'info' {
    switch (status) {
      case 0: return 'error';
      case 1: return 'success';
      case 2: return 'warning';
      default: return 'info';
    }
  }

  /**
   * Extract details from properties JSON
   */
  private extractEventDetails(properties: any): Record<string, unknown> | undefined {
    if (!properties) return undefined;

    const details: Record<string, unknown> = {};
    const keyMap: Record<string, string> = {
      'Result': 'Result',
      'Status': 'Status',
      'Message': 'Message',
      'Service': 'Service',
      'EndPoint': 'EndPoint',
      'EventType': 'EventType',
      'ProcessId': 'ProcessId',
      'QueueName': 'QueueName',
      'ResponseTime': 'ResponseTime',
      'FailureCount': 'FailureCount',
    };

    for (const [key, displayKey] of Object.entries(keyMap)) {
      if (properties[key] !== undefined && properties[key] !== null) {
        details[displayKey] = properties[key];
      }
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }

  /**
   * Get human-readable status label
   */
  private getStatusLabel(status: number | null | undefined): string {
    switch (status) {
      case 0: return 'failed';
      case 1: return 'delivered';
      case 2: return 'processing';
      default: return 'pending';
    }
  }
}
