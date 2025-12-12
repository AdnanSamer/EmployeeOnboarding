import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-assign-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    InputTextModule
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="'Assign Task' + (selectedEmployeeId ? ' to Employee' : '')"
      [modal]="true"
      [style]="{ width: '700px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <div class="assign-task-form">
        <div class="field">
          <label for="employee">Employee *</label>
          <p-select
            id="employee"
            [options]="employees"
            [(ngModel)]="taskData.employeeId"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Employee"
            [filter]="true"
            filterBy="label"
            styleClass="w-full"
            [disabled]="!!selectedEmployeeId"
          ></p-select>
        </div>

        <div class="field">
          <label for="template">Task Template *</label>
          <p-select
            id="template"
            [options]="templates"
            [(ngModel)]="selectedTemplateId"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Template"
            (onChange)="onTemplateSelect()"
            styleClass="w-full"
          ></p-select>
        </div>

        <div class="field">
          <label for="title">Task Title *</label>
          <input
            pInputText
            id="title"
            [(ngModel)]="taskData.title"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="description">Description *</label>
          <textarea
            pTextarea
            id="description"
            [(ngModel)]="taskData.description"
            rows="4"
            class="w-full"
          ></textarea>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="dueDate">Due Date *</label>
            <p-datepicker
              id="dueDate"
              [(ngModel)]="taskData.dueDate"
              [showIcon]="true"
              [showTime]="false"
              dateFormat="yy-mm-dd"
              [minDate]="today"
              styleClass="w-full"
            ></p-datepicker>
          </div>

          <div class="field">
            <label for="priority">Priority</label>
            <p-select
              id="priority"
              [options]="priorities"
              [(ngModel)]="taskData.priority"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Priority"
              styleClass="w-full"
            ></p-select>
          </div>
        </div>

        <div class="field">
          <label for="notes">Notes</label>
          <textarea
            pTextarea
            id="notes"
            [(ngModel)]="taskData.notes"
            rows="3"
            placeholder="Additional instructions or notes..."
            class="w-full"
          ></textarea>
        </div>

        <div class="info-box" *ngIf="selectedTemplate">
          <i class="pi pi-info-circle"></i>
          <div>
            <strong>Template Info:</strong>
            <p>{{ selectedTemplate.description }}</p>
            <p *ngIf="selectedTemplate.requiresDocument">
              <i class="pi pi-file-pdf"></i> Requires document upload
            </p>
            <p *ngIf="selectedTemplate.isRequired">
              <i class="pi pi-exclamation-triangle"></i> Required task
            </p>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          [outlined]="true"
          (onClick)="onCancel()"
        ></p-button>
        <p-button
          label="Assign Task"
          icon="pi pi-check"
          (onClick)="onAssign()"
          [disabled]="!isFormValid() || loading"
          [loading]="loading"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .assign-task-form {
      .field {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      .info-box {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #e3f2fd;
        border-left: 4px solid #2196F3;
        border-radius: 4px;
        margin-top: 1rem;

        i.pi-info-circle {
          color: #2196F3;
          font-size: 1.5rem;
        }

        p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #555;

          i {
            margin-right: 0.5rem;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AssignTaskModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() selectedEmployeeId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() taskAssigned = new EventEmitter<void>();

  employees: any[] = [];
  templates: any[] = [];
  selectedTemplateId: number | null = null;
  selectedTemplate: any = null;
  loading = false;
  today = new Date();

  taskData = {
    employeeId: null as number | null,
    taskTemplateId: null as number | null,
    title: '',
    description: '',
    dueDate: null as Date | null,
    priority: 1,
    notes: ''
  };

  priorities = [
    { label: 'Low', value: 0 },
    { label: 'Medium', value: 1 },
    { label: 'High', value: 2 }
  ];

  constructor(
    private employeeService: EmployeeService,
    private taskService: TaskService,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadData();
    if (this.selectedEmployeeId) {
      this.taskData.employeeId = this.selectedEmployeeId;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload data when dialog becomes visible
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.loadData();
      if (this.selectedEmployeeId) {
        this.taskData.employeeId = this.selectedEmployeeId;
      }
    }
  }

  loadData(): void {
    // Load employees
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.employees = response.data.map((emp: any) => ({
            label: `${emp.firstName} ${emp.lastName} (${emp.department})`,
            value: emp.id
          }));
        }
      }
    });

    // Load templates
    this.taskService.getTaskTemplates().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.templates = response.data;
        }
      }
    });
  }

  onTemplateSelect(): void {
    if (this.selectedTemplateId) {
      const template = this.templates.find(t => t.id === this.selectedTemplateId);
      if (template) {
        this.selectedTemplate = template;
        this.taskData.title = template.name;
        this.taskData.description = template.description;
        this.taskData.taskTemplateId = template.id;

        // Auto-calculate due date based on estimated days
        if (template.estimatedDays) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + template.estimatedDays);
          this.taskData.dueDate = dueDate;
        }
      }
    }
  }

  isFormValid(): boolean {
    return !!(
      this.taskData.employeeId &&
      this.selectedTemplateId &&
      this.taskData.title &&
      this.taskData.description &&
      this.taskData.dueDate
    );
  }

  onAssign(): void {
    if (!this.isFormValid()) return;

    this.loading = true;
    const user = this.authService.getCurrentUser();

    const assignData = {
      ...this.taskData,
      taskTemplateId: this.selectedTemplateId as number,
      employeeId: this.taskData.employeeId as number,
      assignedBy: user?.userId || 0,
      dueDate: this.taskData.dueDate ? new Date(this.taskData.dueDate).toISOString() : new Date().toISOString()
    };

    this.taskService.assignTask(assignData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task assigned successfully'
          });
          this.taskAssigned.emit();
          this.resetForm();
          this.visible = false;
          this.visibleChange.emit(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to assign task'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to assign task'
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.resetForm();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  resetForm(): void {
    this.taskData = {
      employeeId: this.selectedEmployeeId,
      taskTemplateId: null,
      title: '',
      description: '',
      dueDate: null,
      priority: 1,
      notes: ''
    };
    this.selectedTemplateId = null;
    this.selectedTemplate = null;
  }
}

