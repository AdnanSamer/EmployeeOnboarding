import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, OnboardingTask, TaskTemplate } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    ToastModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.scss'
})
export class TaskManagementComponent implements OnInit {
  tasks: OnboardingTask[] = [];
  taskTemplates: TaskTemplate[] = [];
  employees: any[] = [];
  loading: boolean = false;
  displayAssignDialog: boolean = false;
  displayStatusDialog: boolean = false;
  selectedTask: OnboardingTask | null = null;
  currentUser: any;
  employeeId: number | null = null;
  selectedEmployee: any = null;
  selectedTaskTemplate: any = null;

  newTask: {
    taskTemplateId: number | null;
    employeeId: number | null;
    dueDate: Date | null;
    title: string;
    description: string;
    priority: number;
    notes: string;
  } = {
      taskTemplateId: null,
      employeeId: null,
      dueDate: null,
      title: '',
      description: '',
      priority: 1,
      notes: ''
    };

  statusOptions = [
    { label: 'Pending', value: 0 },
    { label: 'In Progress', value: 1 },
    { label: 'Completed', value: 2 },
    { label: 'Canceled', value: 3 }
  ];

  constructor(
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    // If employee (role 3), set their ID to show only their tasks
    // HR (role 1) and Admin (role 2) will see all tasks
    if (this.currentUser?.role === 3) {
      this.employeeId = this.currentUser.userId;
    }
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadTaskTemplates();
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.employees = response.data.map((emp: any) => ({
            label: `${emp.firstName} ${emp.lastName} (${emp.department})`,
            value: emp.id,
            ...emp
          }));
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  loadTasks(): void {
    this.loading = true;
    if (this.employeeId) {
      // Load enhanced tasks for current employee (with overdue info, documents, etc.)
      this.taskService.getEnhancedEmployeeTasks(this.employeeId).subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.tasks = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
    } else {
      // HR/Admin - load all tasks
      this.taskService.getAllTasks().subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.tasks = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
    }
  }

  loadTaskTemplates(): void {
    this.taskService.getTaskTemplates().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.taskTemplates = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading task templates:', error);
      }
    });
  }

  openAssignDialog(): void {
    this.displayAssignDialog = true;
    this.selectedEmployee = null;
    this.selectedTaskTemplate = null;
    this.newTask = {
      taskTemplateId: null,
      employeeId: null,
      dueDate: null,
      title: '',
      description: '',
      priority: 1,
      notes: ''
    };
  }

  onTaskTemplateChange(): void {
    if (this.selectedTaskTemplate) {
      this.newTask.taskTemplateId = this.selectedTaskTemplate.id;
      this.newTask.title = this.selectedTaskTemplate.title;
      this.newTask.description = this.selectedTaskTemplate.description;
    }
  }

  onEmployeeChange(): void {
    if (this.selectedEmployee) {
      this.newTask.employeeId = this.selectedEmployee.value;
    }
  }

  assignTask(): void {
    if (!this.newTask.taskTemplateId || !this.newTask.employeeId || !this.newTask.dueDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill all required fields'
      });
      return;
    }

    const assignDto = {
      taskTemplateId: this.newTask.taskTemplateId,
      employeeId: this.newTask.employeeId,
      title: this.newTask.title || 'Task',
      description: this.newTask.description || '',
      priority: this.newTask.priority ?? 1,
      notes: this.newTask.notes || '',
      dueDate: this.newTask.dueDate.toISOString(),
      assignedBy: this.currentUser?.userId || 0
    };

    this.taskService.assignTask(assignDto).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task assigned successfully'
          });
          this.displayAssignDialog = false;
          this.loadTasks();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to assign task'
        });
      }
    });
  }

  openStatusDialog(task: OnboardingTask): void {
    // Check if task is completed (status = 2)
    if (task.status === 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Change Status',
        detail: 'This task has been completed and sent to HR for review. Only HR can reopen this task for you.',
        life: 5000
      });
      return;
    }

    this.selectedTask = { ...task };
    this.displayStatusDialog = true;
  }

  updateTaskStatus(): void {
    if (!this.selectedTask) return;

    this.taskService.updateTaskStatus(this.selectedTask.id, this.selectedTask.status).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task status updated successfully'
          });
          this.displayStatusDialog = false;
          this.loadTasks();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to update task status'
        });
      }
    });
  }

  getStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'danger' {
    if (status === 0) return 'info';
    if (status === 1) return 'warn';
    if (status === 2) return 'success';
    if (status === 3) return 'danger';
    return 'info';
  }

  getStatusLabel(status: number): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : '';
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date() && this.selectedTask?.status !== 2;
  }
}

