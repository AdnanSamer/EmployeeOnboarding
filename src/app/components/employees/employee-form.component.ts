import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="employee-form-container">
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>{{ isEditMode ? 'Edit Employee' : 'Create New Employee' }}</h2>
          </div>
        </ng-template>

        <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
          <!-- Personal Information Section -->
          <div class="section">
            <h3>Personal Information</h3>
            
            <div class="form-grid">
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
                  [readonly]="isEditMode"
                  class="w-full"
                />
                <small class="p-error" *ngIf="isFieldInvalid('email')">
                  Valid email is required
                </small>
              </div>

              <div class="field">
                <label for="phoneNumber">Phone Number</label>
                <input 
                  pInputText 
                  id="phoneNumber" 
                  formControlName="phoneNumber"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Employment Information Section -->
          <div class="section">
            <h3>Employment Information</h3>
            
            <div class="form-grid">
              <div class="field">
                <label for="employeeNumber">Employee Number</label>
                <input 
                  pInputText 
                  id="employeeNumber" 
                  formControlName="employeeNumber"
                  [readonly]="isEditMode"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="department">Department *</label>
                <p-select
                  id="department"
                  [options]="departments"
                  formControlName="department"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Department"
                  styleClass="w-full"
                ></p-select>
                <small class="p-error" *ngIf="isFieldInvalid('department')">
                  Department is required
                </small>
              </div>

              <div class="field">
                <label for="position">Position *</label>
                <input 
                  pInputText 
                  id="position" 
                  formControlName="position"
                  [class.p-invalid]="isFieldInvalid('position')"
                  class="w-full"
                />
                <small class="p-error" *ngIf="isFieldInvalid('position')">
                  Position is required
                </small>
              </div>

              <div class="field">
                <label for="hireDate">Hire Date *</label>
                <p-datepicker
                  id="hireDate"
                  formControlName="hireDate"
                  [showIcon]="true"
                  dateFormat="yy-mm-dd"
                  [maxDate]="today"
                  styleClass="w-full"
                ></p-datepicker>
                <small class="p-error" *ngIf="isFieldInvalid('hireDate')">
                  Hire date is required
                </small>
              </div>
            </div>
          </div>

          <!-- Address Information Section -->
          <div class="section">
            <h3>Address Information</h3>
            
            <div class="form-grid address-grid">
              <div class="field col-span-2">
                <label for="streetAddress">Street Address</label>
                <input 
                  pInputText 
                  id="streetAddress" 
                  formControlName="streetAddress"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="city">City</label>
                <input 
                  pInputText 
                  id="city" 
                  formControlName="city"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="state">State/Province</label>
                <input 
                  pInputText 
                  id="state" 
                  formControlName="state"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="postalCode">Postal Code</label>
                <input 
                  pInputText 
                  id="postalCode" 
                  formControlName="postalCode"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label for="country">Country</label>
                <input 
                  pInputText 
                  id="country" 
                  formControlName="country"
                  class="w-full"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <p-button 
              [label]="isEditMode ? 'Update Employee' : 'Create Employee'"
              icon="pi pi-save"
              type="submit"
              [disabled]="employeeForm.invalid || loading"
              [loading]="loading"
            ></p-button>
            <p-button 
              label="Cancel" 
              icon="pi pi-times"
              severity="secondary"
              [outlined]="true"
              routerLink="/employees"
            ></p-button>
          </div>
        </form>
      </p-card>
    </div>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .employee-form-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .card-header {
      padding: 1.5rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }
    }

    .section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #e0e0e0;

      &:last-of-type {
        border-bottom: none;
      }

      h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
        padding-bottom: 0.75rem;
        border-bottom: 2px solid #e0e0e0;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      &.address-grid {
        grid-template-columns: 2fr 1fr 1fr;
        
        .field.col-span-2 {
          grid-column: span 3;
        }
      }

      .col-span-2 {
        grid-column: span 2;
      }
    }

    .field {
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
      justify-content: flex-start;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;

        .col-span-2 {
          grid-column: span 1;
        }
      }

      .button-group {
        flex-direction: column;

        ::ng-deep p-button button {
          width: 100%;
        }
      }
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  loading = false;
  today = new Date();

  departments = [
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Human Resources', value: 'Human Resources' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Sales', value: 'Sales' },
    { label: 'Operations', value: 'Operations' },
    { label: 'IT', value: 'IT' }
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      employeeNumber: [''],
      department: ['', Validators.required],
      position: ['', Validators.required],
      hireDate: [new Date(), Validators.required],
      streetAddress: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      country: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employeeId = parseInt(id);
      this.loadEmployee();
    }
  }

  loadEmployee(): void {
    if (!this.employeeId) return;

    this.loading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Convert hireDate string to Date object for the datepicker
          const employeeData = {
            ...response.data,
            hireDate: response.data.hireDate ? new Date(response.data.hireDate) : null
          };
          this.employeeForm.patchValue(employeeData);
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employee data'
        });
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const employeeData = this.employeeForm.value;

    const operation = this.isEditMode && this.employeeId
      ? this.employeeService.updateEmployee(this.employeeId, employeeData)
      : this.employeeService.createEmployee(employeeData);

    operation.subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Employee ${this.isEditMode ? 'updated' : 'created'} successfully`
          });
          setTimeout(() => {
            this.router.navigate(['/employees']);
          }, 1000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Operation failed'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Operation failed'
        });
        this.loading = false;
      }
    });
  }
}


