import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-task-template-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TextareaModule,
    InputNumberModule,
    CheckboxModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  template: `
    <div class="task-templates-container">
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Task Templates</h2>
            <p-button
              label="Create Template"
              icon="pi pi-plus"
              (onClick)="openCreateDialog()"
            ></p-button>
          </div>
        </ng-template>

        <p-table [value]="templates" [loading]="loading">
          <ng-template pTemplate="header">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Required</th>
              <th>Requires Document</th>
              <th>Estimated Days</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-template>
            <tr>
              <td>{{ template.name }}</td>
              <td>{{ template.description }}</td>
              <td>
                <i class="pi" [ngClass]="template.isRequired ? 'pi-check text-green-500' : 'pi-times text-red-500'"></i>
              </td>
              <td>
                <i class="pi" [ngClass]="template.requiresDocument ? 'pi-check text-green-500' : 'pi-times text-red-500'"></i>
              </td>
              <td>{{ template.estimatedDays }}</td>
              <td>
                <div class="action-buttons">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="editTemplate(template)"
                    pTooltip="Edit"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="deleteTemplate(template)"
                    pTooltip="Delete"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No templates found</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Template Form Dialog -->
    <p-dialog
      [(visible)]="displayDialog"
      [header]="isEditMode ? 'Edit Template' : 'Create Template'"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="template-form">
        <div class="field">
          <label for="name">Template Name *</label>
          <input
            pInputText
            id="name"
            [(ngModel)]="currentTemplate.name"
            class="w-full"
          />
        </div>

        <div class="field">
          <label for="description">Description *</label>
          <textarea
            pTextarea
            id="description"
            [(ngModel)]="currentTemplate.description"
            rows="4"
            class="w-full"
          ></textarea>
        </div>

        <div class="field">
          <label for="estimatedDays">Estimated Days</label>
          <p-inputNumber
            id="estimatedDays"
            [(ngModel)]="currentTemplate.estimatedDays"
            [min]="1"
            [max]="365"
            styleClass="w-full"
          ></p-inputNumber>
        </div>

        <div class="field">
          <div class="checkbox-field">
            <p-checkbox
              [(ngModel)]="currentTemplate.isRequired"
              [binary]="true"
              inputId="isRequired"
            ></p-checkbox>
            <label for="isRequired">Is Required</label>
          </div>
        </div>

        <div class="field">
          <div class="checkbox-field">
            <p-checkbox
              [(ngModel)]="currentTemplate.requiresDocument"
              [binary]="true"
              inputId="requiresDocument"
            ></p-checkbox>
            <label for="requiresDocument">Requires Document Upload</label>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          [outlined]="true"
          (onClick)="displayDialog = false"
        ></p-button>
        <p-button
          [label]="isEditMode ? 'Update' : 'Create'"
          icon="pi pi-check"
          (onClick)="saveTemplate()"
          [disabled]="!isFormValid()"
        ></p-button>
      </ng-template>
    </p-dialog>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .task-templates-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .template-form {
      .field {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          label {
            margin: 0;
          }
        }
      }
    }

    .text-green-500 {
      color: #4CAF50;
    }

    .text-red-500 {
      color: #F44336;
    }

    .file-info {
      display: block;
      margin-top: 0.5rem;
      color: #667eea;
      font-size: 0.875rem;
      
      i {
        margin-right: 0.25rem;
      }
    }
  `]
})
export class TaskTemplateListComponent implements OnInit {
  templates: any[] = [];
  loading = false;
  displayDialog = false;
  isEditMode = false;
  currentTemplate: any = this.getEmptyTemplate();

  constructor(
    private taskService: TaskService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.taskService.getTaskTemplates().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.templates = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load templates'
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    this.isEditMode = false;
    this.currentTemplate = this.getEmptyTemplate();
    this.displayDialog = true;
  }

  editTemplate(template: any): void {
    this.isEditMode = true;
    this.currentTemplate = { ...template };
    this.displayDialog = true;
  }

  deleteTemplate(template: any): void {
    if (confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      this.taskService.deleteTaskTemplate(template.id).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Template deleted successfully'
            });
            this.loadTemplates();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete template'
          });
        }
      });
    }
  }

  saveTemplate(): void {
    if (!this.isFormValid()) return;

    const operation = this.isEditMode
      ? this.taskService.updateTaskTemplate(this.currentTemplate.id, this.currentTemplate)
      : this.taskService.createTaskTemplate(this.currentTemplate);

    operation.subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Template ${this.isEditMode ? 'updated' : 'created'} successfully`
          });
          this.displayDialog = false;
          this.loadTemplates();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Operation failed'
        });
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.currentTemplate.name && this.currentTemplate.description);
  }

  getEmptyTemplate(): any {
    return {
      name: '',
      description: '',
      isRequired: false,
      requiresDocument: false,
      estimatedDays: 7
    };
  }
}


