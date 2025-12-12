import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { AdminService, ActivityLog, ActivityLogFilter } from '../../services/admin.service';

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TagModule
  ],
  template: `
    <div class="activity-logs-container">
      <h1>Activity Logs</h1>

      <p-card>
        <div class="filters mb-3">
          <div class="filter-row">
            <div class="filter-item">
              <label>Action</label>
              <input pInputText type="text" [(ngModel)]="filter.action" 
                    placeholder="Search action..." />
            </div>

            <div class="filter-item">
              <label>Entity Type</label>
              <p-select [(ngModel)]="filter.entityType" [options]="entityTypes" 
                       optionLabel="label" optionValue="value" 
                       placeholder="All Types" styleClass="w-full"></p-select>
            </div>

            <div class="filter-item">
              <label>Start Date</label>
              <p-datepicker [(ngModel)]="filter.startDate" [showIcon]="true" 
                           dateFormat="yy-mm-dd" styleClass="w-full"></p-datepicker>
            </div>

            <div class="filter-item">
              <label>End Date</label>
              <p-datepicker [(ngModel)]="filter.endDate" [showIcon]="true" 
                           dateFormat="yy-mm-dd" styleClass="w-full"></p-datepicker>
            </div>

            <div class="filter-item">
              <p-button label="Search" icon="pi pi-search" (click)="loadLogs()"></p-button>
              <p-button label="Clear" icon="pi pi-times" severity="secondary" 
                       (click)="clearFilters()" class="ml-2"></p-button>
            </div>
          </div>
        </div>

        <p-table [value]="logs" [paginator]="true" [rows]="20" [loading]="loading"
          [totalRecords]="totalRecords" [lazy]="true" (onLazyLoad)="loadLogs($event)"
          [rowsPerPageOptions]="[10, 20, 50, 100]">
          <ng-template pTemplate="header">
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity Name</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-log>
            <tr>
              <td>{{ log.timestamp | date:'short' }}</td>
              <td>{{ log.userName }}</td>
              <td>
                <p-tag [value]="log.action" [severity]="getActionSeverity(log.action)"></p-tag>
              </td>
              <td>
                <p-tag [value]="log.entityType" severity="info"></p-tag>
              </td>
              <td>{{ log.entityName || 'N/A' }}</td>
              <td>
                <span [title]="log.details">{{ log.details ? (log.details | slice:0:50) + '...' : 'N/A' }}</span>
              </td>
              <td>{{ log.ipAddress || 'N/A' }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center">No activity logs found</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .activity-logs-container {
      padding: 2rem;
    }
    .filters {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
    }
    .filter-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }
    .filter-item label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class ActivityLogsComponent implements OnInit {
  logs: ActivityLog[] = [];
  loading = false;
  totalRecords = 0;
  filter: ActivityLogFilter = {
    pageNumber: 1,
    pageSize: 20
  };

  entityTypes = [
    { label: 'All Types', value: null },
    { label: 'Task', value: 'Task' },
    { label: 'Document', value: 'Document' },
    { label: 'Employee', value: 'Employee' },
    { label: 'User', value: 'User' },
    { label: 'Settings', value: 'Settings' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(event?: any): void {
    this.loading = true;
    const pageNumber = event ? (event.first / event.rows) + 1 : 1;
    const pageSize = event ? event.rows : 20;

    const filter: ActivityLogFilter = {
      ...this.filter,
      pageNumber,
      pageSize,
      startDate: this.filter.startDate ? new Date(this.filter.startDate).toISOString() : undefined,
      endDate: this.filter.endDate ? new Date(this.filter.endDate).toISOString() : undefined
    };

    this.adminService.getActivityLogs(filter).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.logs = response.data;
          this.totalRecords = response.totalRecords || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activity logs:', error);
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filter = {
      pageNumber: 1,
      pageSize: 20
    };
    this.loadLogs();
  }

  getActionSeverity(action: string): 'success' | 'info' | 'warn' | 'danger' | null | undefined {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('add')) return 'success';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return 'info';
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return 'danger';
    if (lowerAction.includes('reject') || lowerAction.includes('fail')) return 'danger';
    return 'info';
  }
}

