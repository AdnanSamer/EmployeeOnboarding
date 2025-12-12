import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    PasswordModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="register-container">
      <p-card class="register-card">
        <ng-template pTemplate="header">
          <h2>Register New User</h2>
        </ng-template>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="firstName">First Name *</label>
            <input 
              pInputText 
              id="firstName" 
              formControlName="firstName"
              [class.p-invalid]="isFieldInvalid('firstName')"
              class="w-full"
            />
            <small class="p-error" *ngIf="isFieldInvalid('firstName')">
              First name is required
            </small>
          </div>

          <div class="field">
            <label for="lastName">Last Name *</label>
            <input 
              pInputText 
              id="lastName" 
              formControlName="lastName"
              [class.p-invalid]="isFieldInvalid('lastName')"
              class="w-full"
            />
            <small class="p-error" *ngIf="isFieldInvalid('lastName')">
              Last name is required
            </small>
          </div>

          <div class="field">
            <label for="email">Email *</label>
            <input 
              pInputText 
              id="email" 
              type="email"
              formControlName="email"
              [class.p-invalid]="isFieldInvalid('email')"
              class="w-full"
            />
            <small class="p-error" *ngIf="isFieldInvalid('email')">
              Valid email is required
            </small>
          </div>

          <div class="field">
            <label for="password">Password *</label>
            <p-password 
              id="password" 
              formControlName="password"
              [class.p-invalid]="isFieldInvalid('password')"
              [feedback]="true"
              styleClass="w-full"
              [inputStyleClass]="'w-full'"
            ></p-password>
            <small class="p-error" *ngIf="isFieldInvalid('password')">
              Password must be at least 8 characters
            </small>
          </div>

          <div class="field">
            <label for="confirmPassword">Confirm Password *</label>
            <p-password 
              id="confirmPassword" 
              formControlName="confirmPassword"
              [class.p-invalid]="isFieldInvalid('confirmPassword') || passwordMismatch()"
              [feedback]="false"
              styleClass="w-full"
              [inputStyleClass]="'w-full'"
            ></p-password>
            <small class="p-error" *ngIf="passwordMismatch()">
              Passwords do not match
            </small>
          </div>

          <div class="field">
            <label for="role">Role *</label>
            <p-select
              id="role"
              [options]="roles"
              formControlName="role"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Role"
              styleClass="w-full"
            ></p-select>
          </div>

          <div class="button-group">
            <p-button 
              label="Register" 
              icon="pi pi-user-plus"
              type="submit"
              [disabled]="registerForm.invalid || loading"
              [loading]="loading"
            ></p-button>
            <p-button 
              label="Cancel" 
              icon="pi pi-times"
              severity="secondary"
              [outlined]="true"
              routerLink="/login"
            ></p-button>
          </div>

          <div class="text-center mt-3">
            <span>Already have an account? </span>
            <a routerLink="/login">Login here</a>
          </div>
        </form>
      </p-card>
    </div>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .register-card {
      width: 100%;
      max-width: 500px;

      ::ng-deep {
        .p-card-header {
          background: #1976D2;
          color: white;
          padding: 1.5rem;
          border-radius: 8px 8px 0 0;

          h2 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
            text-align: center;
          }
        }

        .p-card-body {
          padding: 2rem;
        }
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

      .p-error {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.875rem;
      }
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;

      ::ng-deep p-button {
        flex: 1;

        button {
          width: 100%;
        }
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  roles = [
    { label: 'HR', value: 0 },
    { label: 'Employee', value: 1 },
    { label: 'Admin', value: 2 }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: [1, Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  passwordMismatch(): boolean {
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    return !!(
      confirmPassword?.dirty &&
      password?.value !== confirmPassword?.value
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch()) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Registration successful! Please login.'
          });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Registration failed'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Registration failed'
        });
        this.loading = false;
      }
    });
  }
}


