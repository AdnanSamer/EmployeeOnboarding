import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminService, SystemUser, CreateUserDto, UpdateUserDto, ResetPasswordDto } from '../../services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    PasswordModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="user-management-container">
      <div class="header">
        <h1>User & Role Management</h1>
        <p-button label="Create New User" icon="pi pi-plus" (click)="showCreateDialog()"></p-button>
      </div>

      <p-card>
        <div class="search-bar mb-3">
          <input pInputText type="text" placeholder="Search users..." [(ngModel)]="searchTerm" (input)="loadUsers()" />
        </div>

        <p-table [value]="users" [paginator]="true" [rows]="10" [loading]="loading"
          [totalRecords]="totalRecords" [lazy]="true" (onLazyLoad)="loadUsers($event)"
          [rowsPerPageOptions]="[10, 25, 50]">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <p-tag [value]="getRoleName(user.role)" [severity]="getRoleSeverity(user.role)"></p-tag>
              </td>
              <td>
                <p-tag [value]="user.isActive ? 'Active' : 'Inactive'" 
                       [severity]="user.isActive ? 'success' : 'danger'"></p-tag>
              </td>
              <td>{{ user.createdAt | date:'short' }}</td>
              <td>{{ user.lastLogin ? (user.lastLogin | date:'short') : 'Never' }}</td>
              <td>
                <p-button icon="pi pi-pencil" [text]="true" severity="info" 
                         (click)="editUser(user)" pTooltip="Edit"></p-button>
                <p-button icon="pi pi-key" [text]="true" severity="warn" 
                         (click)="showResetPasswordDialog(user)" pTooltip="Reset Password"></p-button>
                <p-button icon="pi pi-trash" [text]="true" severity="danger" 
                         (click)="deleteUser(user)" pTooltip="Delete"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <!-- Create/Edit User Dialog -->
      <p-dialog [(visible)]="userDialogVisible" [header]="editingUser ? 'Edit User' : 'Create User'" 
                [modal]="true" [style]="{width: '500px'}" [closable]="true">
        <form [formGroup]="userForm" (ngSubmit)="saveUser()">
          <div class="field mb-3">
            <label>First Name *</label>
            <input pInputText formControlName="firstName" class="w-full" />
            <small class="p-error" *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched">
              First name is required
            </small>
          </div>

          <div class="field mb-3">
            <label>Last Name *</label>
            <input pInputText formControlName="lastName" class="w-full" />
            <small class="p-error" *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched">
              Last name is required
            </small>
          </div>

          <div class="field mb-3">
            <label>Email *</label>
            <input pInputText type="email" formControlName="email" class="w-full" />
            <small class="p-error" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
              Valid email is required
            </small>
          </div>

          <div class="field mb-3" *ngIf="!editingUser">
            <label>Password *</label>
            <p-password formControlName="password" [feedback]="true" styleClass="w-full" 
                       [inputStyleClass]="'w-full'"></p-password>
            <small class="p-error" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
              Password must be at least 8 characters
            </small>
          </div>

          <div class="field mb-3">
            <label>Role *</label>
            <p-select formControlName="role" [options]="roles" optionLabel="label" optionValue="value" 
                     styleClass="w-full"></p-select>
          </div>

          <div class="field mb-3" *ngIf="editingUser">
            <label>Status</label>
            <p-select formControlName="isActive" [options]="statusOptions" optionLabel="label" optionValue="value" 
                     styleClass="w-full"></p-select>
          </div>

          <div class="flex justify-content-end gap-2 mt-3">
            <p-button label="Cancel" severity="secondary" (click)="cancelEdit()"></p-button>
            <p-button label="Save" type="submit" [disabled]="userForm.invalid"></p-button>
          </div>
        </form>
      </p-dialog>

      <!-- Reset Password Dialog -->
      <p-dialog [(visible)]="resetPasswordDialogVisible" header="Reset Password" [modal]="true" 
                [style]="{width: '400px'}">
        <form [formGroup]="resetPasswordForm" (ngSubmit)="resetPassword()">
          <div class="field mb-3">
            <label>New Password *</label>
            <p-password formControlName="newPassword" [feedback]="true" styleClass="w-full" 
                       [inputStyleClass]="'w-full'"></p-password>
            <small class="p-error" *ngIf="resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched">
              Password must be at least 8 characters
            </small>
          </div>

          <div class="flex justify-content-end gap-2 mt-3">
            <p-button label="Cancel" severity="secondary" (click)="resetPasswordDialogVisible = false"></p-button>
            <p-button label="Reset" type="submit" [disabled]="resetPasswordForm.invalid"></p-button>
          </div>
        </form>
      </p-dialog>
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [`
    .user-management-container {
      padding: 2rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: SystemUser[] = [];
  loading = false;
  totalRecords = 0;
  searchTerm = '';
  userDialogVisible = false;
  resetPasswordDialogVisible = false;
  editingUser: SystemUser | null = null;
  userForm: FormGroup;
  resetPasswordForm: FormGroup;
  selectedUserId: number | null = null;

  // Backend enum: Admin=1, HR=2, Employee=3
  roles = [
    { label: 'Admin', value: 1 },
    { label: 'HR', value: 2 },
    { label: 'Employee', value: 3 }
  ];

  statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: [1, Validators.required],
      isActive: [true]
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(event?: any): void {
    this.loading = true;
    const pageNumber = event ? (event.first / event.rows) + 1 : 1;
    const pageSize = event ? event.rows : 10;

    this.adminService.getUsers(pageNumber, pageSize, this.searchTerm).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.users = response.data;
          this.totalRecords = response.totalRecords || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
        this.loading = false;
      }
    });
  }

  showCreateDialog(): void {
    this.editingUser = null;
    this.userForm.reset({
      role: 1,
      isActive: true
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userDialogVisible = true;
  }

  editUser(user: SystemUser): void {
    this.editingUser = user;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userDialogVisible = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    if (this.editingUser) {
      const updateData: UpdateUserDto = this.userForm.value;
      delete (updateData as any).password;

      this.adminService.updateUser(this.editingUser.userId, updateData).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User updated successfully'
            });
            this.userDialogVisible = false;
            this.loadUsers();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update user'
          });
        }
      });
    } else {
      const createData: CreateUserDto = this.userForm.value;
      this.adminService.createUser(createData).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User created successfully'
            });
            this.userDialogVisible = false;
            this.loadUsers();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create user'
          });
        }
      });
    }
  }

  deleteUser(user: SystemUser): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user ${user.firstName} ${user.lastName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.deleteUser(user.userId).subscribe({
          next: (response) => {
            if (response.succeeded) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'User deleted successfully'
              });
              this.loadUsers();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Failed to delete user'
            });
          }
        });
      }
    });
  }

  showResetPasswordDialog(user: SystemUser): void {
    this.selectedUserId = user.userId;
    this.resetPasswordForm.reset();
    this.resetPasswordDialogVisible = true;
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid || !this.selectedUserId) return;

    const resetData: ResetPasswordDto = {
      userId: this.selectedUserId,
      newPassword: this.resetPasswordForm.value.newPassword
    };

    this.adminService.resetPassword(resetData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset successfully'
          });
          this.resetPasswordDialogVisible = false;
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to reset password'
        });
      }
    });
  }

  cancelEdit(): void {
    this.userDialogVisible = false;
    this.editingUser = null;
  }

  getRoleName(role: number): string {
    return this.roles.find(r => r.value === role)?.label || 'Unknown';
  }

  getRoleSeverity(role: number): 'success' | 'info' | 'warn' | 'danger' | null | undefined {
    if (role === 1) return 'danger';    // Admin - Red
    if (role === 2) return 'warn';      // HR - Orange
    if (role === 3) return 'success';   // Employee - Green
    return 'info';
  }
}

