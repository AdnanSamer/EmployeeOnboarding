import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '500px' }"
      header="Change Password Required"
    >
      <div class="dialog-content">
        <p class="mb-4 text-warning">
          <i class="pi pi-exclamation-triangle mr-2"></i>
          For security reasons, you must change your password before continuing.
        </p>

        <form [formGroup]="passwordForm">
          <div class="field mb-3">
            <label for="currentPassword">Current Password *</label>
            <input
              pInputText
              id="currentPassword"
              type="password"
              formControlName="currentPassword"
              [class.p-invalid]="isFieldInvalid('currentPassword')"
              class="w-full"
            />
            <small class="p-error" *ngIf="isFieldInvalid('currentPassword')">
              Current password is required
            </small>
          </div>

          <div class="field mb-3">
            <label for="newPassword">New Password *</label>
            <input
              pInputText
              id="newPassword"
              type="password"
              formControlName="newPassword"
              [class.p-invalid]="isFieldInvalid('newPassword')"
              class="w-full"
            />
            <small class="p-error" *ngIf="isFieldInvalid('newPassword')">
              Password must be at least 8 characters
            </small>
          </div>

          <div class="field mb-3">
            <label for="confirmPassword">Confirm Password *</label>
            <input
              pInputText
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              [class.p-invalid]="isFieldInvalid('confirmPassword') || passwordMismatch()"
              class="w-full"
            />
            <small class="p-error" *ngIf="passwordMismatch()">
              Passwords do not match
            </small>
          </div>

          <div class="password-requirements">
            <small><strong>Password must:</strong></small>
            <ul>
              <li>Be at least 8 characters long</li>
              <li>Contain uppercase and lowercase letters</li>
              <li>Contain at least one number</li>
            </ul>
          </div>
        </form>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Change Password"
          icon="pi pi-check"
          (onClick)="onSubmit()"
          [disabled]="passwordForm.invalid || loading"
          [loading]="loading"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .dialog-content {
      padding: 1rem 0;
    }

    .text-warning {
      color: #f59e0b;
      font-weight: 500;
    }

    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .password-requirements {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #1976D2;

      small {
        font-weight: 600;
        color: #495057;
      }

      ul {
        margin: 0.5rem 0 0 1.5rem;
        padding: 0;

        li {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0.25rem 0;
        }
      }
    }
  `]
})
export class ChangePasswordDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() passwordChanged = new EventEmitter<void>();

  passwordForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  passwordMismatch(): boolean {
    const newPass = this.passwordForm.get('newPassword')?.value;
    const confirmPass = this.passwordForm.get('confirmPassword')?.value;
    const confirmField = this.passwordForm.get('confirmPassword');
    return !!(confirmField?.touched && confirmPass && newPass !== confirmPass);
  }

  onSubmit(): void {
    if (this.passwordForm.invalid || this.passwordMismatch()) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password changed successfully'
          });
          this.authService.clearPasswordChangeFlag();
          this.visible = false;
          this.visibleChange.emit(false);
          this.passwordChanged.emit();
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to change password'
        });
        this.loading = false;
      }
    });
  }
}
