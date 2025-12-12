import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reopen-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    TextareaModule
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      header="Reopen Task"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <div class="reopen-form">
        <div class="warning-box">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <strong>This will reopen a completed task</strong>
            <p>The task status will change from Completed to Pending, and the employee will be notified.</p>
          </div>
        </div>

        <div class="field">
          <label for="reason">Reason for Reopening *</label>
          <textarea
            pTextarea
            id="reason"
            [(ngModel)]="reopenData.reason"
            rows="4"
            placeholder="e.g., Please re-upload ID with clearer image"
            class="w-full"
          ></textarea>
          <small class="text-muted">This reason will be visible to the employee</small>
        </div>

        <div class="field">
          <label for="newDueDate">New Due Date (Optional)</label>
          <p-datepicker
            id="newDueDate"
            [(ngModel)]="reopenData.newDueDate"
            [showIcon]="true"
            [showTime]="false"
            dateFormat="yy-mm-dd"
            [minDate]="today"
            placeholder="Leave empty to keep original due date"
            styleClass="w-full"
          ></p-datepicker>
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
          label="Reopen Task"
          icon="pi pi-refresh"
          severity="warn"
          (onClick)="onReopen()"
          [disabled]="!isValid() || loading"
          [loading]="loading"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .reopen-form {
      .warning-box {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #fff3cd;
        border: 1px solid #ffc107;
        border-radius: 4px;
        margin-bottom: 1.5rem;

        i {
          color: #ff9800;
          font-size: 1.5rem;
        }

        strong {
          color: #856404;
        }

        p {
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
          color: #856404;
        }
      }

      .field {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .text-muted {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #757575;
        }
      }
    }
  `]
})
export class ReopenTaskModalComponent {
  @Input() visible = false;
  @Input() taskId: number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() taskReopened = new EventEmitter<void>();

  loading = false;
  today = new Date();

  reopenData = {
    reason: '',
    newDueDate: null as Date | null
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  isValid(): boolean {
    return !!this.reopenData.reason.trim();
  }

  onReopen(): void {
    if (!this.taskId || !this.isValid()) return;

    this.loading = true;
    const user = this.authService.getCurrentUser();

    const data = {
      reason: this.reopenData.reason,
      newDueDate: this.reopenData.newDueDate || undefined,
      reopenedBy: user?.userId || 0
    };

    this.taskService.reopenTask(this.taskId, data).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task reopened successfully'
          });
          this.taskReopened.emit();
          this.resetForm();
          this.visible = false;
          this.visibleChange.emit(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to reopen task'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to reopen task'
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
    this.reopenData = {
      reason: '',
      newDueDate: null
    };
  }
}


