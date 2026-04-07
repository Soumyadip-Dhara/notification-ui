import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule, TablePageEvent } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { NotificationService } from '../../core/services/notification.service';
import {
  NotificationLog,
  NotificationFilter,
  NotificationSummary,
  NotificationType,
  NotificationMode,
  NotificationStatus,
} from '../../core/models/notification-log.model';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    TagModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    SkeletonModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  logs = signal<NotificationLog[]>([]);
  summary = signal<NotificationSummary | null>(null);
  totalRecords = signal(0);
  loading = signal(true);
  summaryLoading = signal(true);

  filter: NotificationFilter = {};
  searchRequestId = '';
  searchRecipient = '';

  page = 1;
  pageSize = 10;

  typeOptions: SelectOption[] = [
    { label: 'All Types', value: '' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
  ];

  modeOptions: SelectOption[] = [
    { label: 'All Modes', value: '' },
    { label: 'Queue', value: 'queue' },
    { label: 'Direct', value: 'direct' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Sent', value: 'sent' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Failed', value: 'failed' },
  ];

  selectedType = '';
  selectedMode = '';
  selectedStatus = '';

  successRate = computed(() => {
    const s = this.summary();
    if (!s || s.total === 0) return 0;
    return Math.round(((s.sent + s.delivered) / s.total) * 100);
  });

  ngOnInit(): void {
    this.loadSummary();
    this.loadLogs();
  }

  loadSummary(): void {
    this.summaryLoading.set(true);
    this.notificationService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.summaryLoading.set(false);
      },
      error: () => {
        this.summaryLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load summary' });
      },
    });
  }

  loadLogs(): void {
    this.loading.set(true);
    this.notificationService.getNotifications(this.buildFilter(), this.page, this.pageSize).subscribe({
      next: (result) => {
        this.logs.set(result.items);
        this.totalRecords.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notifications' });
      },
    });
  }

  onPageChange(event: TablePageEvent): void {
    this.page = (event.first ?? 0) / this.pageSize + 1;
    this.pageSize = event.rows ?? 10;
    this.loadLogs();
  }

  applyFilters(): void {
    this.page = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedMode = '';
    this.selectedStatus = '';
    this.searchRequestId = '';
    this.searchRecipient = '';
    this.filter = {};
    this.page = 1;
    this.loadLogs();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadLogs();
  }

  viewTimeline(requestId: string): void {
    this.router.navigate(['/timeline', requestId]);
  }

  getStatusSeverity(status: NotificationStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<NotificationStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      delivered: 'success',
      sent: 'info',
      processing: 'warn',
      pending: 'secondary',
      failed: 'danger',
    };
    return map[status] ?? 'secondary';
  }

  getTypeIcon(type: NotificationType): string {
    return type === 'email' ? 'pi pi-envelope' : 'pi pi-mobile';
  }

  getModeIcon(mode: NotificationMode): string {
    return mode === 'queue' ? 'pi pi-list' : 'pi pi-bolt';
  }

  private buildFilter(): NotificationFilter {
    return {
      type: this.selectedType as NotificationType || undefined,
      mode: this.selectedMode as NotificationMode || undefined,
      status: this.selectedStatus as NotificationStatus || undefined,
      requestId: this.searchRequestId || undefined,
      recipient: this.searchRecipient || undefined,
    };
  }
}
