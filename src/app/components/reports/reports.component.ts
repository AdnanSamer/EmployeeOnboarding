import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="reports-container">
      <h1>Reports & Analytics</h1>

      <div class="tab-buttons">
        <button
          pButton
          type="button"
          [label]="'Onboarding Summary'"
          [severity]="activeTab === 'onboarding' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'onboarding'"
          (click)="activeTab = 'onboarding'"
        ></button>
        <button
          pButton
          type="button"
          [label]="'Task Completion'"
          [severity]="activeTab === 'task' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'task'"
          (click)="activeTab = 'task'"
        ></button>
        <button
          pButton
          type="button"
          [label]="'Document Review'"
          [severity]="activeTab === 'document' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'document'"
          (click)="activeTab = 'document'"
        ></button>
      </div>

      @if (activeTab === 'onboarding') {
          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header">
                <h3>Onboarding Summary Report</h3>
              </div>
            </ng-template>

            <div class="filters">
              <div class="field">
                <label for="startDate">Start Date</label>
                <p-datepicker
                  id="startDate"
                  [(ngModel)]="onboardingFilter.startDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                ></p-datepicker>
              </div>

              <div class="field">
                <label for="endDate">End Date</label>
                <p-datepicker
                  id="endDate"
                  [(ngModel)]="onboardingFilter.endDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                ></p-datepicker>
              </div>

              <div class="field">
                <label for="department">Department</label>
                <p-select
                  id="department"
                  [options]="departments"
                  [(ngModel)]="onboardingFilter.department"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Departments"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="field-button">
                <p-button
                  label="Generate Report"
                  icon="pi pi-chart-bar"
                  (onClick)="generateOnboardingReport()"
                ></p-button>
              </div>
            </div>

            <div class="report-stats" *ngIf="onboardingStats">
              <div class="stat-card">
                <div class="stat-value">{{ onboardingStats.totalStarted }}</div>
                <div class="stat-label">Total Started</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ onboardingStats.totalCompleted }}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ onboardingStats.avgCompletionDays }} days</div>
                <div class="stat-label">Avg. Completion Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ onboardingStats.completionRate }}%</div>
                <div class="stat-label">Completion Rate</div>
              </div>
            </div>

            <div class="export-actions">
              <p-button
                label="Export to PDF"
                icon="pi pi-file-pdf"
                severity="secondary"
                [outlined]="true"
                (onClick)="exportToPDF('onboarding')"
              ></p-button>
              <p-button
                label="Export to Excel"
                icon="pi pi-file-excel"
                severity="success"
                [outlined]="true"
                (onClick)="exportToExcel('onboarding')"
              ></p-button>
            </div>
          </p-card>
      }

      @if (activeTab === 'task') {
          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header">
                <h3>Task Completion Report</h3>
              </div>
            </ng-template>

            <div class="filters">
              <div class="field">
                <label for="taskTemplate">Task Template</label>
                <p-select
                  id="taskTemplate"
                  [options]="taskTemplates"
                  [(ngModel)]="taskFilter.taskTemplateId"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="All Tasks"
                  styleClass="w-full"
                ></p-select>
              </div>

              <div class="field">
                <label for="taskStartDate">Start Date</label>
                <p-datepicker
                  id="taskStartDate"
                  [(ngModel)]="taskFilter.startDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                ></p-datepicker>
              </div>

              <div class="field">
                <label for="taskEndDate">End Date</label>
                <p-datepicker
                  id="taskEndDate"
                  [(ngModel)]="taskFilter.endDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                ></p-datepicker>
              </div>

              <div class="field-button">
                <p-button
                  label="Generate Report"
                  icon="pi pi-chart-bar"
                  (onClick)="generateTaskReport()"
                ></p-button>
              </div>
            </div>

            <div class="report-stats" *ngIf="taskStats">
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.totalAssigned }}</div>
                <div class="stat-label">Total Assigned</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.totalCompleted }}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.avgCompletionDays }} days</div>
                <div class="stat-label">Avg. Completion Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ taskStats.overdueRate }}%</div>
                <div class="stat-label">Overdue Rate</div>
              </div>
            </div>

            <div class="export-actions">
              <p-button
                label="Export to PDF"
                icon="pi pi-file-pdf"
                severity="secondary"
                [outlined]="true"
                (onClick)="exportToPDF('task')"
              ></p-button>
              <p-button
                label="Export to Excel"
                icon="pi pi-file-excel"
                severity="success"
                [outlined]="true"
                (onClick)="exportToExcel('task')"
              ></p-button>
            </div>
          </p-card>
      }

      @if (activeTab === 'document') {
          <p-card>
            <ng-template pTemplate="header">
              <div class="card-header">
                <h3>Document Review Report</h3>
              </div>
            </ng-template>

            <div class="filters">
              <div class="field">
                <label for="docStartDate">Start Date</label>
                <p-datepicker
                  id="docStartDate"
                  [(ngModel)]="documentFilter.startDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                ></p-datepicker>
              </div>

              <div class="field">
                <label for="docEndDate">End Date</label>
                <p-datepicker
                  id="docEndDate"
                  [(ngModel)]="documentFilter.endDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                ></p-datepicker>
              </div>

              <div class="field-button">
                <p-button
                  label="Generate Report"
                  icon="pi pi-chart-bar"
                  (onClick)="generateDocumentReport()"
                ></p-button>
              </div>
            </div>

            <div class="report-stats" *ngIf="documentStats">
              <div class="stat-card">
                <div class="stat-value">{{ documentStats.totalUploaded }}</div>
                <div class="stat-label">Total Uploaded</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ documentStats.totalReviewed }}</div>
                <div class="stat-label">Reviewed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ documentStats.approvalRate }}%</div>
                <div class="stat-label">Approval Rate</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ documentStats.avgReviewHours }} hrs</div>
                <div class="stat-label">Avg. Review Time</div>
              </div>
            </div>

            <div class="export-actions">
              <p-button
                label="Export to PDF"
                icon="pi pi-file-pdf"
                severity="secondary"
                [outlined]="true"
                (onClick)="exportToPDF('document')"
              ></p-button>
              <p-button
                label="Export to Excel"
                icon="pi pi-file-excel"
                severity="success"
                [outlined]="true"
                (onClick)="exportToExcel('document')"
              ></p-button>
            </div>
          </p-card>
      }
    </div>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .reports-container {
      max-width: 1400px;
      margin: 0 auto;

      h1 {
        margin: 0 0 1.5rem 0;
        font-size: 2rem;
        font-weight: 600;
        color: #333;
      }
    }

    .card-header {
      padding: 1rem;

      h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
      }
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;

      .field {
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
      }

      .field-button {
        display: flex;
        align-items: flex-end;
      }
    }

    .report-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;

      .stat-card {
        padding: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        text-align: center;
        color: white;

        &:nth-child(1) {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &:nth-child(2) {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        &:nth-child(3) {
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        }

        &:nth-child(4) {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }
      }
    }

    .export-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .filters {
        grid-template-columns: 1fr;
      }

      .report-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab: 'onboarding' | 'task' | 'document' = 'onboarding';
  // Onboarding Report
  onboardingFilter = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    department: null as string | null
  };
  onboardingStats: any = null;

  // Task Report
  taskFilter = {
    taskTemplateId: null as number | null,
    startDate: null as Date | null,
    endDate: null as Date | null
  };
  taskStats: any = null;

  // Document Report
  documentFilter = {
    startDate: null as Date | null,
    endDate: null as Date | null
  };
  documentStats: any = null;

  departments = [
    { label: 'All Departments', value: null },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Human Resources', value: 'Human Resources' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' }
  ];

  taskTemplates = [
    { label: 'All Tasks', value: null },
    { label: 'Submit ID', value: 1 },
    { label: 'Training Form', value: 2 }
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    // Initialize with current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.onboardingFilter.startDate = firstDay;
    this.onboardingFilter.endDate = lastDay;
    this.taskFilter.startDate = firstDay;
    this.taskFilter.endDate = lastDay;
    this.documentFilter.startDate = firstDay;
    this.documentFilter.endDate = lastDay;
  }

  generateOnboardingReport(): void {
    // Mock data - replace with actual API call
    this.onboardingStats = {
      totalStarted: 45,
      totalCompleted: 32,
      avgCompletionDays: 14,
      completionRate: 71
    };

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Onboarding report generated'
    });
  }

  generateTaskReport(): void {
    // Mock data - replace with actual API call
    this.taskStats = {
      totalAssigned: 360,
      totalCompleted: 285,
      avgCompletionDays: 7,
      overdueRate: 12
    };

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Task report generated'
    });
  }

  generateDocumentReport(): void {
    // Mock data - replace with actual API call
    this.documentStats = {
      totalUploaded: 520,
      totalReviewed: 480,
      approvalRate: 87,
      avgReviewHours: 24
    };

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Document report generated'
    });
  }

  exportToPDF(reportType: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: `Exporting ${reportType} report to PDF...`
    });
    // Implement PDF export logic
  }

  exportToExcel(reportType: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: `Exporting ${reportType} report to Excel...`
    });
    // Implement Excel export logic
  }
}

