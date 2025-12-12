import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminService, SystemSettings } from '../../services/admin.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="settings-container">
      <h1>System Settings</h1>

      <div class="tab-buttons">
        <button
          pButton
          type="button"
          [label]="'Task Templates'"
          [severity]="activeTab === 'task' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'task'"
          (click)="activeTab = 'task'"
        ></button>
        <button
          pButton
          type="button"
          [label]="'Document Settings'"
          [severity]="activeTab === 'document' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'document'"
          (click)="activeTab = 'document'"
        ></button>
        <button
          pButton
          type="button"
          [label]="'Notification Settings'"
          [severity]="activeTab === 'notification' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'notification'"
          (click)="activeTab = 'notification'"
        ></button>
        <button
          pButton
          type="button"
          [label]="'Reporting Settings'"
          [severity]="activeTab === 'reporting' ? 'primary' : 'secondary'"
          [outlined]="activeTab !== 'reporting'"
          (click)="activeTab = 'reporting'"
        ></button>
      </div>

      @if (activeTab === 'task') {
        <!-- Task Template Settings -->
          <p-card>
            <form [formGroup]="taskTemplateForm" (ngSubmit)="saveTaskTemplateSettings()">
              <div class="field mb-3">
                <p-checkbox formControlName="allowCustomTasks" inputId="allowCustom"></p-checkbox>
                <label for="allowCustom" class="ml-2">Allow Custom Tasks</label>
              </div>

              <div class="field mb-3">
                <p-checkbox formControlName="requireDocumentUpload" inputId="requireDoc"></p-checkbox>
                <label for="requireDoc" class="ml-2">Require Document Upload</label>
              </div>

              <div class="field mb-3">
                <label>Default Due Days</label>
                <p-inputNumber formControlName="defaultDueDays" [min]="1" [max]="365" 
                              styleClass="w-full"></p-inputNumber>
              </div>

              <p-button label="Save" type="submit" [disabled]="taskTemplateForm.invalid"></p-button>
            </form>
          </p-card>
      }

      @if (activeTab === 'document') {
        <!-- Document Settings -->
          <p-card>
            <form [formGroup]="documentForm" (ngSubmit)="saveDocumentSettings()">
              <div class="field mb-3">
                <label>Max File Size (MB) *</label>
                <p-inputNumber formControlName="maxFileSizeMB" [min]="1" [max]="100" 
                              styleClass="w-full"></p-inputNumber>
              </div>

              <div class="field mb-3">
                <label>Allowed File Types</label>
                <p-multiSelect formControlName="allowedFileTypes" [options]="fileTypes" 
                               styleClass="w-full"></p-multiSelect>
              </div>

              <div class="field mb-3">
                <label>Storage Type *</label>
                <p-select formControlName="storageType" [options]="storageTypes" 
                         optionLabel="label" optionValue="value" styleClass="w-full"></p-select>
              </div>

              <div class="field mb-3" *ngIf="documentForm.get('storageType')?.value === 'AzureBlob'">
                <label>Azure Blob Connection String</label>
                <input pInputText formControlName="azureBlobConnectionString" class="w-full" />
              </div>

              <div class="field mb-3" *ngIf="documentForm.get('storageType')?.value === 'AzureBlob'">
                <label>Azure Blob Container Name</label>
                <input pInputText formControlName="azureBlobContainerName" class="w-full" />
              </div>

              <div class="field mb-3">
                <label>Metadata Retention (Days)</label>
                <p-inputNumber formControlName="metadataRetentionDays" [min]="1" 
                              styleClass="w-full"></p-inputNumber>
              </div>

              <p-button label="Save" type="submit" [disabled]="documentForm.invalid"></p-button>
            </form>
          </p-card>
      }

      @if (activeTab === 'notification') {
        <!-- Notification Settings -->
          <p-card>
            <form [formGroup]="notificationForm" (ngSubmit)="saveNotificationSettings()">
              <h3>SMTP Configuration</h3>
              <div class="field mb-3">
                <label>SMTP Server *</label>
                <input pInputText formControlName="smtpServer" class="w-full" />
              </div>

              <div class="field mb-3">
                <label>SMTP Port *</label>
                <p-inputNumber formControlName="smtpPort" [min]="1" [max]="65535" 
                              styleClass="w-full"></p-inputNumber>
              </div>

              <div class="field mb-3">
                <label>SMTP Username</label>
                <input pInputText formControlName="smtpUsername" class="w-full" />
              </div>

              <div class="field mb-3">
                <label>SMTP Password</label>
                <input pInputText type="password" formControlName="smtpPassword" class="w-full" />
              </div>

              <div class="field mb-3">
                <label>From Email *</label>
                <input pInputText type="email" formControlName="smtpFromEmail" class="w-full" />
              </div>

              <div class="field mb-3">
                <label>From Name</label>
                <input pInputText formControlName="smtpFromName" class="w-full" />
              </div>

              <div class="field mb-3">
                <p-checkbox formControlName="enableSsl" inputId="enableSsl"></p-checkbox>
                <label for="enableSsl" class="ml-2">Enable SSL</label>
              </div>

              <h3 class="mt-4">Email Notifications</h3>
              <div class="field mb-3">
                <p-checkbox formControlName="enableOverdueTaskEmails" inputId="overdue"></p-checkbox>
                <label for="overdue" class="ml-2">Enable Overdue Task Emails</label>
              </div>

              <div class="field mb-3">
                <p-checkbox formControlName="enableDailySummaryEmails" inputId="daily"></p-checkbox>
                <label for="daily" class="ml-2">Enable Daily Summary Emails</label>
              </div>

              <div class="field mb-3">
                <p-checkbox formControlName="enableCompletionEmails" inputId="completion"></p-checkbox>
                <label for="completion" class="ml-2">Enable Completion Confirmation Emails</label>
              </div>

              <p-button label="Save" type="submit" [disabled]="notificationForm.invalid"></p-button>
            </form>
          </p-card>
      }

      @if (activeTab === 'reporting') {
        <!-- Reporting Settings -->
          <p-card>
            <form [formGroup]="reportingForm" (ngSubmit)="saveReportingSettings()">
              <div class="field mb-3">
                <label>Document Retention Period (Days)</label>
                <p-inputNumber formControlName="documentRetentionDays" [min]="1" 
                              styleClass="w-full"></p-inputNumber>
              </div>

              <div class="field mb-3">
                <label>Export Formats</label>
                <p-multiSelect formControlName="exportFormats" [options]="exportFormats" 
                               styleClass="w-full"></p-multiSelect>
              </div>

              <div class="field mb-3">
                <p-checkbox formControlName="autoGenerateReports" inputId="autoGen"></p-checkbox>
                <label for="autoGen" class="ml-2">Auto Generate Reports</label>
              </div>

              <div class="field mb-3" *ngIf="reportingForm.get('autoGenerateReports')?.value">
                <label>Report Schedule (Cron Expression)</label>
                <input pInputText formControlName="reportSchedule" 
                      placeholder="0 0 * * * (Daily at midnight)" class="w-full" />
                <small class="text-muted">Example: 0 0 * * * for daily at midnight</small>
              </div>

              <p-button label="Save" type="submit" [disabled]="reportingForm.invalid"></p-button>
            </form>
          </p-card>
      }
    </div>

    <p-toast></p-toast>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
    }
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    h3 {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  activeTab: 'task' | 'document' | 'notification' | 'reporting' = 'task';
  taskTemplateForm: FormGroup;
  documentForm: FormGroup;
  notificationForm: FormGroup;
  reportingForm: FormGroup;

  fileTypes = ['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'];
  storageTypes = [
    { label: 'Local Storage', value: 'Local' },
    { label: 'Azure Blob Storage', value: 'AzureBlob' }
  ];
  exportFormats = ['PDF', 'Excel'];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.taskTemplateForm = this.fb.group({
      allowCustomTasks: [false],
      requireDocumentUpload: [false],
      defaultDueDays: [7, [Validators.required, Validators.min(1)]]
    });

    this.documentForm = this.fb.group({
      maxFileSizeMB: [10, [Validators.required, Validators.min(1)]],
      allowedFileTypes: [['PDF'], Validators.required],
      storageType: ['Local', Validators.required],
      azureBlobConnectionString: [''],
      azureBlobContainerName: [''],
      metadataRetentionDays: [365, Validators.required]
    });

    this.notificationForm = this.fb.group({
      smtpServer: ['', Validators.required],
      smtpPort: [587, [Validators.required, Validators.min(1)]],
      smtpUsername: [''],
      smtpPassword: [''],
      smtpFromEmail: ['', [Validators.required, Validators.email]],
      smtpFromName: [''],
      enableSsl: [true],
      enableOverdueTaskEmails: [true],
      enableDailySummaryEmails: [false],
      enableCompletionEmails: [true]
    });

    this.reportingForm = this.fb.group({
      documentRetentionDays: [365, Validators.required],
      exportFormats: [['PDF', 'Excel'], Validators.required],
      autoGenerateReports: [false],
      reportSchedule: ['']
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.adminService.getSystemSettings().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const settings = response.data;
          
          if (settings.taskTemplateSettings) {
            this.taskTemplateForm.patchValue(settings.taskTemplateSettings);
          }
          
          if (settings.documentSettings) {
            this.documentForm.patchValue(settings.documentSettings);
          }
          
          if (settings.notificationSettings) {
            this.notificationForm.patchValue(settings.notificationSettings);
          }
          
          if (settings.reportingSettings) {
            this.reportingForm.patchValue(settings.reportingSettings);
          }
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load settings'
        });
      }
    });
  }

  saveTaskTemplateSettings(): void {
    const settings = {
      taskTemplateSettings: this.taskTemplateForm.value
    };
    this.saveSettings(settings, 'Task template settings saved');
  }

  saveDocumentSettings(): void {
    const settings = {
      documentSettings: this.documentForm.value
    };
    this.saveSettings(settings, 'Document settings saved');
  }

  saveNotificationSettings(): void {
    const settings = {
      notificationSettings: this.notificationForm.value
    };
    this.saveSettings(settings, 'Notification settings saved');
  }

  saveReportingSettings(): void {
    const settings = {
      reportingSettings: this.reportingForm.value
    };
    this.saveSettings(settings, 'Reporting settings saved');
  }

  private saveSettings(settings: Partial<SystemSettings>, successMessage: string): void {
    this.adminService.updateSystemSettings(settings).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: successMessage
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to save settings'
        });
      }
    });
  }
}

