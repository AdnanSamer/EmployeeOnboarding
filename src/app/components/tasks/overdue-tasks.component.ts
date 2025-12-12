import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-overdue-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="overdue-tasks-container">
      <h1>⚠️ Overdue Tasks</h1>
      
      <p-card>
        <p-table [value]="overdueTasks" [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Task</th>
              <th>Due Date</th>
              <th>Days Overdue</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-task>
            <tr>
              <td>
                <a [routerLink]="['/employees', task.employeeId]">
                  {{ task.employeeName }}
                </a>
              </td>
              <td>{{ task.department }}</td>
              <td>{{ task.title }}</td>
              <td>{{ task.dueDate | date: 'shortDate' }}</td>
              <td>
                <p-tag severity="danger">
                  {{ getDaysOverdue(task.dueDate) }} days
                </p-tag>
              </td>
              <td>
                <p-tag [severity]="getPrioritySeverity(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <p-button
                    label="View"
                    icon="pi pi-eye"
                    [text]="true"
                    size="small"
                    [routerLink]="['/tasks', task.id]"
                  ></p-button>
                  <p-button
                    label="Send Reminder"
                    icon="pi pi-send"
                    [text]="true"
                    size="small"
                    severity="info"
                    (onClick)="sendReminder(task)"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-check-circle"></i>
                  <p>No overdue tasks - Great job!</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .overdue-tasks-container {
      max-width: 1400px;
      margin: 0 auto;

      h1 {
        margin: 0 0 1.5rem 0;
        font-size: 2rem;
        font-weight: 600;
        color: #f44336;
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .empty-state {
      padding: 3rem 2rem;
      text-align: center;

      i {
        font-size: 4rem;
        color: #4CAF50;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
        font-size: 1.25rem;
        color: #666;
      }
    }

    a {
      color: #1976D2;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  `]
})
export class OverdueTasksComponent implements OnInit {
  overdueTasks: any[] = [];
  loading = false;

  constructor(
    private taskService: TaskService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOverdueTasks();
  }

  loadOverdueTasks(): void {
    this.loading = true;
    this.taskService.getOverdueTasks().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.overdueTasks = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load overdue tasks'
        });
        this.loading = false;
      }
    });
  }

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getPrioritySeverity(priority: number): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    return priority === 2 ? 'danger' : priority === 1 ? 'warn' : 'info';
  }

  getPriorityLabel(priority: number): string {
    const labels = ['Low', 'Medium', 'High'];
    return labels[priority] || 'Unknown';
  }

  sendReminder(task: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Reminder Sent',
      detail: `Reminder sent to ${task.employeeName}`
    });
    // Backend would handle actual email sending
  }
}

