import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';
import { TaskService } from '../../services/task.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AssignTaskModalComponent } from '../../shared/components/assign-task-modal.component';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ProgressBarModule,
    ToastModule,
    AssignTaskModalComponent
  ],
  providers: [MessageService],
  template: `
    <div class="employee-details-container" *ngIf="employee">
      <!-- Header Actions -->
      <div class="page-header">
        <h1>{{ employee.firstName }} {{ employee.lastName }}</h1>
        <div class="action-buttons">
          <p-button
            label="Edit"
            icon="pi pi-pencil"
            severity="secondary"
            [outlined]="true"
            [routerLink]="['/employees', employee.id, 'edit']"
          ></p-button>
          <p-button
            label="Assign Task"
            icon="pi pi-plus"
            (onClick)="showAssignTaskModal = true"
          ></p-button>
          <p-button
            label="Generate Summary"
            icon="pi pi-file-pdf"
            severity="info"
            [outlined]="true"
            (onClick)="generateSummary()"
            [disabled]="employee.onboardingStatus !== 2"
          ></p-button>
          <p-button
            label="Complete Onboarding"
            icon="pi pi-check-circle"
            severity="success"
            (onClick)="completeOnboarding()"
            [disabled]="employee.onboardingStatus === 2"
          ></p-button>
        </div>
      </div>

      <!-- Employee Info Card -->
      <p-card class="mb-3">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Employee Information</h2>
          </div>
        </ng-template>

        <div class="info-grid">
          <div class="info-item">
            <strong>Email:</strong>
            <span>{{ employee.email }}</span>
          </div>
          <div class="info-item">
            <strong>Department:</strong>
            <span>{{ employee.department }}</span>
          </div>
          <div class="info-item">
            <strong>Position:</strong>
            <span>{{ employee.position || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <strong>Hire Date:</strong>
            <span>{{ employee.hireDate | date: 'mediumDate' }}</span>
          </div>
          <div class="info-item">
            <strong>Employment Status:</strong>
            <div class="tag-container">
              <p-tag [severity]="getEmploymentStatusSeverity(employee.employmentStatus)">
                {{ getEmploymentStatusLabel(employee.employmentStatus) }}
              </p-tag>
            </div>
          </div>
          <div class="info-item">
            <strong>Onboarding Status:</strong>
            <div class="tag-container">
              <p-tag [severity]="getOnboardingStatusSeverity(employee.onboardingStatus)">
                {{ getOnboardingStatusLabel(employee.onboardingStatus) }}
              </p-tag>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Progress Card -->
      <p-card class="mb-3">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Onboarding Progress</h2>
          </div>
        </ng-template>

        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-value">{{ taskStats.total }}</span>
            <span class="stat-label">Total Tasks</span>
          </div>
          <div class="stat-item success">
            <span class="stat-value">{{ taskStats.completed }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat-item warning">
            <span class="stat-value">{{ taskStats.pending }}</span>
            <span class="stat-label">Pending</span>
          </div>
          <div class="stat-item danger">
            <span class="stat-value">{{ taskStats.overdue }}</span>
            <span class="stat-label">Overdue</span>
          </div>
        </div>

        <div class="progress-bar-container">
          <p-progressBar [value]="taskStats.percentage"></p-progressBar>
          <span class="progress-text">{{ taskStats.percentage }}% Complete</span>
        </div>
      </p-card>

      <!-- Tasks Table -->
      <p-card class="mb-3">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Assigned Tasks</h2>
          </div>
        </ng-template>

        <p-table [value]="tasks" [loading]="loadingTasks">
          <ng-template pTemplate="header">
            <tr>
              <th>Task Title</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Completion Date</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-task>
            <tr>
              <td>{{ task.title }}</td>
              <td>
                <p-tag [severity]="getTaskStatusSeverity(task.status)">
                  {{ getTaskStatusLabel(task.status) }}
                </p-tag>
              </td>
              <td [class.text-danger]="isOverdue(task)">
                {{ task.dueDate | date: 'shortDate' }}
                <span *ngIf="isOverdue(task)"> (Overdue)</span>
              </td>
              <td>{{ task.completionDate ? (task.completionDate | date: 'shortDate') : '-' }}</td>
              <td>{{ task.documentCount || 0 }}</td>
              <td>
                <p-button
                  label="View"
                  icon="pi pi-eye"
                  [text]="true"
                  size="small"
                  [routerLink]="['/tasks', task.id]"
                ></p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No tasks assigned</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Documents Table -->
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Uploaded Documents</h2>
          </div>
        </ng-template>

        <p-table [value]="documents" [loading]="loadingDocuments">
          <ng-template pTemplate="header">
            <tr>
              <th>Document Name</th>
              <th>Task</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-doc>
            <tr>
              <td>{{ doc.originalFileName }}</td>
              <td>{{ doc.taskTitle || 'N/A' }}</td>
              <td>{{ doc.uploadDate | date: 'short' }}</td>
              <td>
                <p-tag [severity]="getDocStatusSeverity(doc.status)">
                  {{ getDocStatusLabel(doc.status) }}
                </p-tag>
              </td>
              <td>
                <p-button
                  label="Preview"
                  icon="pi pi-eye"
                  [text]="true"
                  size="small"
                  (onClick)="previewDocument(doc)"
                ></p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">No documents uploaded</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Assign Task Modal -->
    <app-assign-task-modal
      [(visible)]="showAssignTaskModal"
      [selectedEmployeeId]="employee?.id || null"
      (taskAssigned)="onTaskAssigned()"
    ></app-assign-task-modal>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .employee-details-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;

      h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: #1f2937;
      }

      .action-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
    }

    ::ng-deep {
      .p-card {
        background: white;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;

        .p-card-header {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 0;
        }

        .p-card-body {
          padding: 1.5rem;
        }
      }

      // Make p-tag fit content width
      .info-item p-tag,
      .info-item p-tag .p-tag {
        display: inline-block;
        width: auto;
        max-width: fit-content;
      }
    }

    .card-header {
      padding: 1rem 1.5rem;
      background: #f9fafb;

      h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        strong {
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        span {
          color: #1f2937;
          font-size: 0.95rem;
        }

        .tag-container {
          display: inline-block;
          width: fit-content;
        }

        // Reduce width for status badges
        &:has(p-tag) {
          span {
            display: inline-block;
            max-width: fit-content;
          }
        }
      }
    }

    .progress-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;

      .stat-item {
        padding: 1.25rem;
        background: white;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #e5e7eb;

        &.success {
          background: #d1fae5;
          border-color: #6ee7b7;
        }

        &.warning {
          background: #fef3c7;
          border-color: #fcd34d;
        }

        &.danger {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
      }
    }

    .progress-bar-container {
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;

      ::ng-deep .p-progressbar {
        height: 20px;
        border-radius: 10px;
        background: #e5e7eb;

        .p-progressbar-value {
          background: #667eea;
          border-radius: 10px;
        }
      }

      .progress-text {
        display: block;
        margin-top: 0.75rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: #1f2937;
      }
    }

    ::ng-deep {
      .p-datatable {
        .p-datatable-thead > tr > th {
          background: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
        }

        .p-datatable-tbody > tr {
          &:hover {
            background: #f9fafb;
          }

          > td {
            padding: 0.875rem 1rem;
            border-bottom: 1px solid #f3f4f6;
            color: #1f2937;
            font-size: 0.875rem;
          }
        }
      }
    }

    .text-danger {
      color: #ef4444;
      font-weight: 500;
    }

    .text-center {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
    }

    .mb-3 {
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .employee-details-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        h1 {
          font-size: 1.5rem;
        }

        .action-buttons {
          width: 100%;
          
          ::ng-deep p-button {
            flex: 1;
          }
        }
      }

      .progress-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeDetailsComponent implements OnInit {
  employee: Employee | null = null;
  tasks: any[] = [];
  documents: any[] = [];
  loadingTasks = false;
  loadingDocuments = false;
  showAssignTaskModal = false;

  taskStats = {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    percentage: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private documentService: DocumentService,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(parseInt(id));
    }
  }

  loadEmployee(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.employee = response.data;
          this.loadTasks(id);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employee'
        });
        this.router.navigate(['/employees']);
      }
    });
  }

  loadTasks(employeeId: number): void {
    this.loadingTasks = true;
    this.taskService.getEmployeeTasks(employeeId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.tasks = response.data;
          this.calculateTaskStats();
        }
        this.loadingTasks = false;
      },
      error: (error) => {
        this.loadingTasks = false;
      }
    });
  }

  calculateTaskStats(): void {
    this.taskStats.total = this.tasks.length;
    this.taskStats.completed = this.tasks.filter(t => t.status === 2).length;
    this.taskStats.pending = this.tasks.filter(t => t.status === 0 || t.status === 1).length;
    this.taskStats.overdue = this.tasks.filter(t => this.isOverdue(t)).length;
    this.taskStats.percentage = this.taskStats.total > 0
      ? Math.round((this.taskStats.completed / this.taskStats.total) * 100)
      : 0;
  }

  completeOnboarding(): void {
    if (!this.employee) return;

    this.employeeService.completeOnboarding(this.employee.id).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Onboarding completed! Generating summary PDF...'
          });
          this.generateSummary();
          this.loadEmployee(this.employee!.id);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to complete onboarding'
        });
      }
    });
  }

  generateSummary(): void {
    if (!this.employee) return;

    this.documentService.generateOnboardingSummary(this.employee.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `OnboardingSummary_${this.employee!.id}_${Date.now()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Summary PDF downloaded'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to generate summary'
        });
      }
    });
  }

  onTaskAssigned(): void {
    if (this.employee) {
      this.loadTasks(this.employee.id);
    }
  }

  previewDocument(doc: any): void {
    this.router.navigate(['/pdf-viewer'], {
      queryParams: { documentId: doc.id, fileName: doc.filePath }
    });
  }

  isOverdue(task: any): boolean {
    if (task.status === 2) return false; // Completed tasks can't be overdue
    return new Date(task.dueDate) < new Date();
  }

  getEmploymentStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    return status === 0 ? 'success' : status === 1 ? 'warn' : 'danger';
  }

  getEmploymentStatusLabel(status: number): string {
    const labels = ['Active', 'On Leave', 'Terminated'];
    return labels[status] || 'Unknown';
  }

  getOnboardingStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    return status === 0 ? 'info' : status === 1 ? 'warn' : 'success';
  }

  getOnboardingStatusLabel(status: number): string {
    const labels = ['Not Started', 'In Progress', 'Completed'];
    return labels[status] || 'Unknown';
  }

  getTaskStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    return status === 2 ? 'success' : status === 1 ? 'info' : 'warn';
  }

  getTaskStatusLabel(status: number): string {
    const labels = ['Pending', 'In Progress', 'Completed', 'Canceled'];
    return labels[status] || 'Unknown';
  }

  getDocStatusSeverity(status: number | string): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    const numStatus = typeof status === 'string'
      ? (status === 'Approved' ? 1 : status === 'Rejected' ? 2 : 0)
      : status;
    return numStatus === 1 ? 'success' : numStatus === 2 ? 'danger' : 'warn';
  }

  getDocStatusLabel(status: number | string): string {
    if (typeof status === 'string') return status;
    const labels = ['Pending Review', 'Approved', 'Rejected'];
    return labels[status] || 'Unknown';
  }
}

