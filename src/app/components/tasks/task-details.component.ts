import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ReopenTaskModalComponent } from '../../shared/components/reopen-task-modal.component';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    SelectModule,
    TableModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    TooltipModule,
    ReopenTaskModalComponent
  ],
  providers: [MessageService],
  template: `
    <div class="task-details-container" *ngIf="task">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>{{ task.title }}</h1>
          <p-tag [severity]="getStatusSeverity(task.status)" [value]="getStatusLabel(task.status)"></p-tag>
        </div>
        <div class="action-buttons">
          <p-button
            *ngIf="isHR && task.status === 2"
            label="Reopen Task"
            icon="pi pi-refresh"
            severity="warn"
            [outlined]="true"
            (onClick)="showReopenModal = true"
          ></p-button>
        </div>
      </div>

      <!-- Task Information -->
      <p-card class="mb-3">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Task Information</h2>
          </div>
        </ng-template>

        <div class="info-grid">
          <div class="info-item">
            <strong>Assigned To:</strong>
            <span>
              <a *ngIf="isHR" [routerLink]="['/employees', task.employeeId]">
                {{ task.employeeName }}
              </a>
              <span *ngIf="!isHR">{{ task.employeeName }}</span>
            </span>
          </div>
          <div class="info-item">
            <strong>Assigned By:</strong>
            <span>{{ task.assignedByName || 'HR' }}</span>
          </div>
          <div class="info-item">
            <strong>Created Date:</strong>
            <span>{{ task.createdDate | date: 'medium' }}</span>
          </div>
          <div class="info-item">
            <strong>Due Date:</strong>
            <span [class.text-danger]="isOverdue()">
              {{ task.dueDate | date: 'medium' }}
              <span *ngIf="isOverdue()"> (Overdue)</span>
            </span>
          </div>
          <div class="info-item">
            <strong>Completion Date:</strong>
            <span>{{ task.completionDate ? (task.completionDate | date: 'medium') : 'Not completed' }}</span>
          </div>
          <div class="info-item">
            <strong>Priority:</strong>
            <div class="tag-container">
              <p-tag [severity]="getPrioritySeverity(task.priority)">
                {{ getPriorityLabel(task.priority) }}
              </p-tag>
            </div>
          </div>
        </div>

        <div class="description-section">
          <h3>Description</h3>
          <p>{{ task.description }}</p>
        </div>

        <div class="notes-section" *ngIf="task.notes">
          <h3>Notes</h3>
          <p>{{ task.notes }}</p>
        </div>
      </p-card>

      <!-- Status Update -->
      <p-card class="mb-3" *ngIf="task.status !== 2">
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Update Status</h2>
          </div>
        </ng-template>

        <div class="status-update">
          <label>Select New Status:</label>
          <div class="status-buttons">
            <p-button
              label="Pending"
              [outlined]="task.status !== 0"
              (onClick)="updateStatus(0)"
              [disabled]="task.status === 0"
            ></p-button>
            <p-button
              label="In Progress"
              severity="info"
              [outlined]="task.status !== 1"
              (onClick)="updateStatus(1)"
              [disabled]="task.status === 1"
            ></p-button>
            <p-button
              label="Completed"
              severity="success"
              [outlined]="task.status !== 2"
              (onClick)="updateStatus(2)"
              [disabled]="!canComplete()"
            ></p-button>
          </div>
        </div>
      </p-card>

      <!-- Documents Section -->
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>Documents</h2>
          </div>
        </ng-template>

        <!-- Documents List -->
        <p-table [value]="documents" [loading]="loadingDocuments" [paginator]="true" [rows]="10" styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>File Name</th>
              <th>File Size</th>
              <th>Upload Date</th>
              <th>Status</th>
              <th>Version</th>
              <th>Review Comments</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-doc>
            <tr>
              <td>{{ doc.originalFileName }}</td>
              <td>{{ formatFileSize(doc.fileSize) }}</td>
              <td>{{ doc.uploadDate | date: 'short' }}</td>
              <td>
                <p-tag [severity]="getDocStatusSeverity(doc.status)" [value]="getDocStatusLabel(doc.status)"></p-tag>
              </td>
              <td>{{ doc.version }}</td>
              <td>
                <div *ngIf="doc.reviewComments" class="review-comments">
                  <i class="pi pi-comment"></i>
                  <span>{{ doc.reviewComments }}</span>
                </div>
                <span *ngIf="!doc.reviewComments" class="text-muted">-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="previewDocument(doc)"
                    pTooltip="Preview"
                  ></p-button>
                  <p-button
                    *ngIf="isHR && (doc.status === 0 || doc.status === 'Pending')"
                    icon="pi pi-check-circle"
                    [rounded]="true"
                    [text]="true"
                    severity="success"
                    (onClick)="openReviewDialog(doc)"
                    pTooltip="Review Document"
                  ></p-button>
                  <p-button
                    icon="pi pi-download"
                    [rounded]="true"
                    [text]="true"
                    severity="success"
                    (onClick)="downloadDocument(doc.id, doc.originalFileName)"
                    pTooltip="Download"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="deleteDocument(doc.id)"
                    pTooltip="Delete"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center">No documents uploaded for this task</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Review Document Dialog -->
    <p-dialog [(visible)]="displayReviewDialog" [modal]="true" [style]="{ width: '600px' }" header="Review Document"
      [draggable]="false" [resizable]="false">
      <div *ngIf="selectedDocumentForReview" class="review-dialog">
        <div class="field mb-3">
          <label class="block mb-2">Document: {{ selectedDocumentForReview.originalFileName }}</label>
        </div>

        <div class="field mb-3">
          <label class="block mb-2">Review Status *</label>
          <p-select [(ngModel)]="reviewStatus" [options]="[
              { label: 'Approve', value: 1 },
              { label: 'Reject', value: 2 }
            ]" optionLabel="label" optionValue="value" placeholder="Select Status" styleClass="w-full"></p-select>
        </div>

        <div class="field mb-3">
          <label class="block mb-2">
            Comments
            <span *ngIf="reviewStatus === 2" class="text-danger">*</span>
          </label>
          <textarea pInputTextarea [(ngModel)]="reviewComments" rows="4" placeholder="Enter review comments..."
            [class.p-invalid]="reviewStatus === 2 && !reviewComments.trim()" class="w-full"></textarea>
          <small class="text-muted" *ngIf="reviewStatus === 2">
            Comments are required when rejecting a document
          </small>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button label="Cancel" icon="pi pi-times" [text]="true" (onClick)="displayReviewDialog = false"></p-button>
        <p-button label="Submit Review" icon="pi pi-check" (onClick)="submitReview()"
          [disabled]="reviewStatus === 0 || (reviewStatus === 2 && !reviewComments.trim())"></p-button>
      </ng-template>
    </p-dialog>

    <!-- Reopen Task Modal -->
    <app-reopen-task-modal
      [(visible)]="showReopenModal"
      [taskId]="task?.id || null"
      (taskReopened)="onTaskReopened()"
    ></app-reopen-task-modal>

    <p-toast position="top-right"></p-toast>
  `,
  styles: [`
    .task-details-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;

      h1 {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
        font-weight: 600;
        color: #333;
      }

      .action-buttons {
        display: flex;
        gap: 0.75rem;
      }
    }

    .review-comments {
      display: inline-flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f0f9ff;
      border-left: 3px solid #3b82f6;
      border-radius: 4px;
      font-size: 0.9rem;
      width: fit-content;
      max-width: 100%;

      i {
        color: #3b82f6;
        margin-top: 0.2rem;
        flex-shrink: 0;
      }

      span {
        color: #1e40af;
        line-height: 1.4;
      }
    }

    .text-muted {
      color: #999;
      font-style: italic;
    }

    .text-danger {
      color: #ef4444;
    }

    .review-dialog {
      .field {
        margin-bottom: 1rem;
      }

      .block {
        display: block;
      }

      .mb-2 {
        margin-bottom: 0.5rem;
      }

      .mb-3 {
        margin-bottom: 1rem;
      }

      .w-full {
        width: 100%;
      }
    }

    a {
      padding: 1rem;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        strong {
          color: #555;
          font-size: 0.9rem;
        }

        span {
          color: #333;
          font-size: 1rem;
        }

        .tag-container {
          display: inline-block;
          width: fit-content;
        }
      }
    }

    .description-section,
    .notes-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e0e0e0;

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
        line-height: 1.6;
      }
    }

    .status-update {
      label {
        display: block;
        margin-bottom: 1rem;
        font-weight: 500;
        color: #333;
      }

      .status-buttons {
        display: flex;
        gap: 1rem;
      }
    }

    .upload-section {
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .text-danger {
      color: #f44336;
    }

    a {
      color: #1976D2;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .status-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class TaskDetailsComponent implements OnInit {
  task: any = null;
  documents: any[] = [];
  loadingDocuments = false;
  showReopenModal = false;
  isHR = false;
  displayReviewDialog = false;
  selectedDocumentForReview: any = null;
  reviewStatus = 0;
  reviewComments = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private documentService: DocumentService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.isHR = this.authService.isHR();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(parseInt(id));
    }
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.task = response.data;
          this.loadDocuments();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load task'
        });
        this.router.navigate(['/tasks']);
      }
    });
  }

  loadDocuments(): void {
    if (!this.task) return;

    this.loadingDocuments = true;
    this.documentService.getTaskDocuments(this.task.id).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.documents = response.data;
        }
        this.loadingDocuments = false;
      },
      error: (error) => {
        this.loadingDocuments = false;
      }
    });
  }

  updateStatus(newStatus: number): void {
    if (!this.task) return;

    this.taskService.updateTaskStatus(this.task.id, newStatus).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task status updated'
          });
          this.loadTask(this.task.id);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update status'
        });
      }
    });
  }

  canComplete(): boolean {
    // Can complete if no documents required, or all required documents are approved
    return true; // Simplified - backend validates
  }

  isOverdue(): boolean {
    if (!this.task || this.task.status === 2) return false;
    return new Date(this.task.dueDate) < new Date();
  }

  onDocumentUploaded(): void {
    this.loadDocuments();
  }

  onTaskReopened(): void {
    this.loadTask(this.task.id);
  }

  previewDocument(doc: any): void {
    this.router.navigate(['/pdf-viewer'], {
      queryParams: { documentId: doc.id, fileName: doc.filePath }
    });
  }

  downloadDocument(docId: number, fileName: string): void {
    this.documentService.downloadDocument(docId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `document_${docId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to download document'
        });
      }
    });
  }

  deleteDocument(docId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(docId).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Document deleted successfully'
            });
            this.loadDocuments();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete document'
          });
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  openReviewDialog(document: any): void {
    this.selectedDocumentForReview = document;
    this.reviewStatus = 0;
    this.reviewComments = '';
    this.displayReviewDialog = true;
  }

  submitReview(): void {
    if (this.reviewStatus === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a review status'
      });
      return;
    }

    if (this.reviewStatus === 2 && !this.reviewComments.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Comments are required when rejecting a document'
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const reviewDto = {
      status: this.reviewStatus,
      comments: this.reviewComments,
      reviewedBy: currentUser?.userId || 0
    };

    this.documentService.reviewDocument(
      this.selectedDocumentForReview.id,
      reviewDto
    ).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document reviewed successfully'
          });
          this.displayReviewDialog = false;
          this.loadDocuments();
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to review document'
        });
      }
    });
  }

  getStatusSeverity(status: number): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    return status === 2 ? 'success' : status === 1 ? 'info' : 'warn';
  }

  getStatusLabel(status: number): string {
    const labels = ['Pending', 'In Progress', 'Completed', 'Canceled'];
    return labels[status] || 'Unknown';
  }

  getPrioritySeverity(priority: number): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    return priority === 2 ? 'danger' : priority === 1 ? 'warn' : 'info';
  }

  getPriorityLabel(priority: number): string {
    const labels = ['Low', 'Medium', 'High'];
    return labels[priority] || 'Unknown';
  }

  getDocStatusSeverity(status: number | string): 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger' {
    const numStatus = typeof status === 'string'
      ? (status === 'Approved' ? 1 : status === 'Rejected' ? 2 : 0)
      : status;
    return numStatus === 1 ? 'success' : numStatus === 2 ? 'danger' : 'warn';
  }

  getDocStatusLabel(status: number | string): string {
    if (typeof status === 'string') return status;
    const labels = ['Pending Review', 'Approved', 'Rejected'];
    return labels[status] || 'Unknown';
  }
}

