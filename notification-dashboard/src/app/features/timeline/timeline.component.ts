import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../core/services/notification.service';
import { RequestTimeline, TimelineEvent, TimelineEventType } from '../../core/models/timeline-event.model';
import { NotificationStatus } from '../../core/models/notification-log.model';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TimelineModule,
    TagModule,
    ButtonModule,
    ToastModule,
    SkeletonModule,
    DividerModule,
    ChipModule,
  ],
  providers: [MessageService],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private messageService = inject(MessageService);

  requestId = signal('');
  timeline = signal<RequestTimeline | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('requestId') ?? '';
    this.requestId.set(id);
    this.loadTimeline(id);
  }

  loadTimeline(requestId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.notificationService.getTimeline(requestId).subscribe({
      next: (data) => {
        this.timeline.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message ?? 'Failed to load timeline');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load timeline for this request ID',
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getEventIcon(event: TimelineEventType): string {
    const icons: Record<TimelineEventType, string> = {
      received: 'pi pi-inbox',
      queued: 'pi pi-list',
      processing: 'pi pi-spinner',
      retry: 'pi pi-refresh',
      sent: 'pi pi-send',
      delivered: 'pi pi-check-circle',
      failed: 'pi pi-times-circle',
      cancelled: 'pi pi-ban',
    };
    return icons[event] ?? 'pi pi-circle';
  }

  getEventColor(event: TimelineEventType): string {
    const colors: Record<TimelineEventType, string> = {
      received: '#6366f1',
      queued: '#3b82f6',
      processing: '#f59e0b',
      retry: '#f97316',
      sent: '#06b6d4',
      delivered: '#22c55e',
      failed: '#ef4444',
      cancelled: '#6b7280',
    };
    return colors[event] ?? '#6366f1';
  }

  getEventSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      success: 'success',
      warning: 'warn',
      error: 'danger',
      info: 'info',
    };
    return map[status] ?? 'secondary';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<NotificationStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      delivered: 'success',
      sent: 'info',
      processing: 'warn',
      pending: 'secondary',
      failed: 'danger',
    };
    return map[status as NotificationStatus] ?? 'secondary';
  }

  getTypeIcon(type: string): string {
    return type === 'email' ? 'pi pi-envelope' : 'pi pi-mobile';
  }

  getModeLabel(mode: string): string {
    return mode === 'queue' ? 'Via Queue' : 'Direct';
  }

  formatDuration(ms?: number): string {
    if (ms == null || ms === 0) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  getDetailsEntries(details?: Record<string, unknown>): { key: string; value: string }[] {
    if (!details) return [];
    return Object.entries(details).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }
}
