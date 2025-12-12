import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, EmployeeFilterDto } from '../../services/employee.service';
import { DocumentService } from '../../services/document.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule } from '@angular/router';
import { AssignTaskModalComponent } from '../../shared/components/assign-task-modal.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DialogModule,
    ToastModule,
    SkeletonModule,
    TooltipModule,
    AssignTaskModalComponent
  ],
  providers: [MessageService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading: boolean = false;
  filter: EmployeeFilterDto = {
    pageNumber: 1,
    pageSize: 10
  };
  totalRecords: number = 0;
  displayDialog: boolean = false;
  selectedEmployee: Employee | null = null;
  showAssignTaskModal = false;
  selectedEmployeeForTask: number | null = null;

  departments = [
    { label: 'All Departments', value: null },
    { label: 'IT', value: 'IT' },
    { label: 'HR', value: 'HR' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Operations', value: 'Operations' }
  ];

  employmentStatuses = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 0 },
    { label: 'Inactive', value: 1 }
  ];

  onboardingStatuses = [
    { label: 'All Onboarding', value: null },
    { label: 'Not Started', value: 0 },
    { label: 'In Progress', value: 1 },
    { label: 'Completed', value: 2 }
  ];

  constructor(
    private employeeService: EmployeeService,
    private documentService: DocumentService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees(this.filter).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.employees = response.data;
          this.totalRecords = response.totalRecords;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees'
        });
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filter.pageNumber = 1;
    this.loadEmployees();
  }

  onPageChange(event: any): void {
    this.filter.pageNumber = (event.first / event.rows) + 1;
    this.filter.pageSize = event.rows;
    this.loadEmployees();
  }

  getEmploymentStatusSeverity(status: number): 'success' | 'danger' {
    return status === 0 ? 'success' : 'danger';
  }

  getEmploymentStatusLabel(status: number): string {
    return status === 0 ? 'Active' : 'Inactive';
  }

  getOnboardingStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' {
    if (status === 0) return 'info';
    if (status === 1) return 'warn';
    if (status === 2) return 'success';
    return 'info';
  }

  getOnboardingStatusLabel(status: number): string {
    if (status === 0) return 'Not Started';
    if (status === 1) return 'In Progress';
    if (status === 2) return 'Completed';
    return '';
  }

  viewEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    this.displayDialog = true;
  }

  assignTask(employee: Employee): void {
    this.selectedEmployeeForTask = employee.id;
    this.showAssignTaskModal = true;
  }

  onTaskAssigned(): void {
    this.loadEmployees();
  }

  completeOnboarding(employeeId: number): void {
    this.employeeService.completeOnboarding(employeeId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Onboarding completed successfully. Generating summary PDF...'
          });
          
          // Generate and download onboarding summary PDF
          this.documentService.generateOnboardingSummary(employeeId).subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `OnboardingSummary_${employeeId}_${new Date().getTime()}.pdf`;
              link.click();
              window.URL.revokeObjectURL(url);
              
              this.messageService.add({
                severity: 'success',
                summary: 'PDF Generated',
                detail: 'Onboarding summary PDF downloaded successfully'
              });
            },
            error: (error) => {
              console.error('Error generating summary PDF:', error);
              this.messageService.add({
                severity: 'warn',
                summary: 'PDF Generation',
                detail: 'Onboarding completed but PDF generation failed. You can generate it later.'
              });
            }
          });
          
          this.loadEmployees();
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

  deactivateEmployee(employeeId: number): void {
    if (confirm('Are you sure you want to deactivate this employee? All documents will be archived for compliance.')) {
      this.employeeService.deleteEmployee(employeeId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee deactivated successfully'
            });
            this.loadEmployees();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to deactivate employee'
          });
        }
      });
    }
  }
}

