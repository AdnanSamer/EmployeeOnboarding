import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, Document } from '../../services/document.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FileUploadModule,
    ButtonModule,
    InputNumberModule,
    TableModule,
    TagModule,
    DialogModule,
    ToastModule,
    ProgressBarModule,
    TooltipModule,
    TextareaModule,
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent implements OnInit {
  selectedFile: File | null = null;
  taskId: number | null = null;
  uploading: boolean = false;
  documents: Document[] = [];
  loading: boolean = false;
  displayPreviewDialog: boolean = false;
  displayReviewDialog: boolean = false;
  selectedDocumentForReview: Document | null = null;
  reviewComments: string = '';
  reviewStatus: number = 0;
  currentUser: any;
  isHR: boolean = false;
  previewUrl: string | null = null;
  showReviewModal = false;

  tasks: any[] = [];
  selectedTask: any = null;
  loadingTasks: boolean = false;

  constructor(
    private documentService: DocumentService,
    private taskService: TaskService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isHR = this.currentUser?.role === 1 || this.currentUser?.role === 2;
  }

  ngOnInit(): void {
    this.loadEmployeeTasks();
  }

  loadEmployeeTasks(): void {
    const userId = this.currentUser?.userId;
    console.log('[Document Center] Loading tasks for userId:', userId, 'role:', this.currentUser?.role);

    if (!userId) {
      console.error('[Document Center] No userId found, cannot load tasks');
      return;
    }

    this.loadingTasks = true;

    const apiCall = this.isHR
      ? this.taskService.getAllTasks()
      : this.taskService.getEnhancedEmployeeTasks(userId);

    console.log('[Document Center] Loading tasks as:', this.isHR ? 'HR/Admin (all tasks)' : 'Employee (my tasks)');

    apiCall.subscribe({
      next: (response) => {
        console.log('[Document Center] API Response:', response);
        if (response.succeeded && response.data) {
          console.log('[Document Center] Tasks found:', response.data.length);

          this.tasks = response.data.map((task: any) => {
            const taskName = task.taskTemplateName || task.title || 'Untitled Task';
            const employeeName = task.employeeName ? ` (${task.employeeName})` : '';
            const label = this.isHR
              ? `${taskName}${employeeName} - Due: ${new Date(task.dueDate).toLocaleDateString()}`
              : `${taskName} - Due: ${new Date(task.dueDate).toLocaleDateString()}`;

            return {
              id: task.id,
              label: label,
              value: task.id,
              dueDate: task.dueDate,
              description: task.taskDescription || task.description || '',
              status: task.status,
              isOverdue: task.isOverdue || false,
              employeeId: task.employeeId,
              employeeName: task.employeeName
            };
          });

          console.log('[Document Center] Mapped tasks:', this.tasks);
        } else {
          console.warn('[Document Center] No tasks in response or unsuccessful');
          this.tasks = [];
        }
        this.loadingTasks = false;
      },
      error: (error) => {
        console.error('[Document Center] Error loading tasks:', error);
        this.tasks = [];
        this.loadingTasks = false;
      }
    });
  }

  onTaskSelect(event: any): void {
    if (this.selectedTask) {
      this.taskId = this.selectedTask.value;
      this.loadDocuments();
    }
  }

  onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Only PDF files are allowed'
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'File size must be less than 10MB'
        });
        return;
      }

      this.selectedFile = file;
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.taskId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please select a file and enter task ID'
      });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication',
        detail: 'User not authenticated'
      });
      return;
    }

    this.uploading = true;

    this.documentService.uploadDocument(
      this.taskId,
      this.selectedFile,
      user.userId
    ).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document uploaded successfully!'
          });
          this.loadDocuments();
          this.selectedFile = null;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Upload failed'
          });
        }
        this.uploading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'An error occurred during upload'
        });
        this.uploading = false;
      }
    });
  }

  loadDocuments(): void {
    if (!this.taskId) return;

    this.loading = true;
    this.documentService.getTaskDocuments(this.taskId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.documents = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.loading = false;
      }
    });
  }

  previewDocument(document: Document): void {
    if (document.id) {
      this.router.navigate(['/pdf-viewer'], {
        queryParams: {
          documentId: document.id,
          fileName: document.filePath || document.originalFileName || document.fileName
        }
      });
    } else {
      const fileName = document.filePath || document.originalFileName || document.fileName;
      this.router.navigate(['/pdf-viewer', fileName]);
    }
  }

  openReviewDialog(document: Document): void {
    this.selectedDocumentForReview = document;
    this.reviewComments = '';
    const statusValue = typeof document.status === 'string'
      ? (document.status === 'Approved' ? 1 : document.status === 'Rejected' ? 2 : 0)
      : document.status;
    this.reviewStatus = statusValue === 0 ? 1 : statusValue;
    this.displayReviewDialog = true;
  }

  submitReview(): void {
    if (!this.selectedDocumentForReview) return;

    if (this.reviewStatus === 2 && !this.reviewComments.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Comments are required when rejecting a document'
      });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication',
        detail: 'User not authenticated'
      });
      return;
    }

    this.documentService.reviewDocument(this.selectedDocumentForReview.id, {
      status: this.reviewStatus,
      comments: this.reviewComments,
      reviewedBy: user.userId || 0
    }).subscribe({
      next: (response) => {
        if (response.succeeded) {
          const statusText = this.reviewStatus === 1 ? 'approved' : 'rejected';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Document ${statusText} successfully`
          });
          this.displayReviewDialog = false;
          this.loadDocuments();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Review submission failed'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to submit review'
        });
      }
    });
  }

  downloadDocument(documentId: number, fileName: string): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
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

  deleteDocument(documentId: number): void {
    this.documentService.deleteDocument(documentId).subscribe({
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
          detail: error.error?.message || 'Failed to delete document'
        });
      }
    });
  }

  getStatusSeverity(status: number): 'success' | 'warn' | 'danger' {
    if (status === 0) return 'warn';
    if (status === 1) return 'success';
    if (status === 2) return 'danger';
    return 'warn';
  }

  getStatusLabel(status: number): string {
    if (status === 0) return 'Pending';
    if (status === 1) return 'Approved';
    if (status === 2) return 'Rejected';
    return '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onTaskIdChange(): void {
    if (this.taskId) {
      this.loadDocuments();
    } else {
      this.documents = [];
    }
  }

  closePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    this.displayPreviewDialog = false;
  }
}

