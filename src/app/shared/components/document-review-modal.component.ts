import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, Document, ReviewDocumentDto } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';
import { PdfViewerComponent } from '../../components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-document-review-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    RadioButtonModule,
    PdfViewerComponent
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      header="Review Document"
      [modal]="true"
      [style]="{ width: '90vw', height: '90vh' }"
      [draggable]="false"
      [resizable]="false"
      [maximizable]="true"
      (onHide)="onCancel()"
    >
      <div class="review-container">
        <!-- Left: PDF Viewer -->
        <div class="pdf-section">
          <app-pdf-viewer
            [documentId]="document?.id ?? null"
            [fileName]="document?.filePath || document?.fileName || 'Document.pdf'"
            [isReadOnly]="false"
          ></app-pdf-viewer>
        </div>

        <!-- Right: Review Form -->
        <div class="review-section">
          <div class="document-info">
            <h3>Document Information</h3>
            <div class="info-row">
              <strong>Filename:</strong>
              <span>{{ document?.originalFileName }}</span>
            </div>
            <div class="info-row">
              <strong>File Size:</strong>
              <span>{{ getFileSize(document?.fileSize || 0) }}</span>
            </div>
            <div class="info-row">
              <strong>Uploaded By:</strong>
              <span>{{ document?.uploadedBy }}</span>
            </div>
            <div class="info-row">
              <strong>Upload Date:</strong>
              <span>{{ document?.uploadDate | date: 'medium' }}</span>
            </div>
            <div class="info-row">
              <strong>Version:</strong>
              <span>v{{ document?.version }}</span>
            </div>
          </div>

          <div class="review-form">
            <h3>Review Decision</h3>
            
            <div class="field">
              <label class="block mb-3">Review Status *</label>
              <div class="radio-group">
                <div class="radio-item">
                  <p-radioButton
                    [(ngModel)]="reviewStatus"
                    name="reviewStatus"
                    value="1"
                    inputId="approve"
                  ></p-radioButton>
                  <label for="approve" class="ml-2">
                    <i class="pi pi-check-circle text-green"></i>
                    Approve
                  </label>
                </div>
                <div class="radio-item">
                  <p-radioButton
                    [(ngModel)]="reviewStatus"
                    name="reviewStatus"
                    value="2"
                    inputId="reject"
                  ></p-radioButton>
                  <label for="reject" class="ml-2">
                    <i class="pi pi-times-circle text-red"></i>
                    Reject
                  </label>
                </div>
              </div>
            </div>

            <div class="field">
              <label for="comments">
                Comments
                @if (reviewStatus === '2') {
                  <span class="required">*</span>
                }
              </label>
              <textarea
                pTextarea
                id="comments"
                [(ngModel)]="reviewComments"
                rows="6"
                placeholder="Enter your review comments..."
                [class.p-invalid]="reviewStatus === '2' && !reviewComments.trim()"
                class="w-full"
              ></textarea>
              @if (reviewStatus === '2') {
                <small class="text-warning">
                  <i class="pi pi-info-circle"></i>
                  Comments are required when rejecting a document
                </small>
              }
            </div>

            <div class="info-box">
              <i class="pi pi-info-circle"></i>
              <div>
                <p *ngIf="reviewStatus === '1'">
                  This document will be marked as <strong>Approved</strong> and will become read-only.
                </p>
                <p *ngIf="reviewStatus === '2'">
                  The employee will be notified and can re-upload a corrected version.
                </p>
              </div>
            </div>
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
          [label]="reviewStatus === '1' ? 'Approve Document' : 'Reject Document'"
          [icon]="reviewStatus === '1' ? 'pi pi-check' : 'pi pi-times'"
          [severity]="reviewStatus === '1' ? 'success' : 'danger'"
          (onClick)="onSubmitReview()"
          [disabled]="!isFormValid() || loading"
          [loading]="loading"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .review-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      height: calc(90vh - 200px);
    }

    .pdf-section {
      overflow: hidden;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .review-section {
      overflow-y: auto;
      padding: 0 0.5rem;

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #333;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #1976D2;
      }
    }

    .document-info {
      margin-bottom: 2rem;

      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f0f0f0;

        strong {
          color: #555;
          font-size: 0.9rem;
        }

        span {
          color: #333;
          font-size: 0.9rem;
        }
      }
    }

    .review-form {
      .field {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;

          .required {
            color: #f44336;
          }
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .radio-item {
            display: flex;
            align-items: center;

            label {
              margin: 0;
              cursor: pointer;
              font-weight: 400;

              i {
                margin-right: 0.5rem;

                &.text-green {
                  color: #4CAF50;
                }

                &.text-red {
                  color: #f44336;
                }
              }
            }
          }
        }

        .text-warning {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #ff9800;

          i {
            margin-right: 0.25rem;
          }
        }
      }

      .info-box {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #f5f5f5;
        border-left: 4px solid #2196F3;
        border-radius: 4px;
        margin-top: 1rem;

        i {
          color: #2196F3;
          font-size: 1.25rem;
        }

        p {
          margin: 0;
          font-size: 0.9rem;
          color: #555;
        }
      }
    }

    @media (max-width: 1024px) {
      .review-container {
        grid-template-columns: 1fr;
        
        .pdf-section {
          height: 400px;
        }
      }
    }
  `]
})
export class DocumentReviewModalComponent implements OnInit {
  @Input() visible = false;
  @Input() document: Document | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() reviewSubmitted = new EventEmitter<void>();

  reviewStatus: string = '1'; // '1'=Approve, '2'=Reject
  reviewComments = '';
  loading = false;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    if (this.document) {
      // Default to approve
      this.reviewStatus = '1';
      this.reviewComments = '';
    }
  }

  isFormValid(): boolean {
    if (this.reviewStatus === '2') {
      return this.reviewComments.trim().length > 0;
    }
    return true;
  }

  onSubmitReview(): void {
    if (!this.document || !this.isFormValid()) return;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not authenticated'
      });
      return;
    }

    this.loading = true;

    const reviewData: ReviewDocumentDto = {
      status: parseInt(this.reviewStatus),
      comments: this.reviewComments.trim() || undefined,
      reviewedBy: user.userId || 0
    };

    this.documentService.reviewDocument(this.document.id, reviewData).subscribe({
      next: (response) => {
        if (response.succeeded) {
          const statusText = this.reviewStatus === '1' ? 'approved' : 'rejected';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Document ${statusText} successfully`
          });
          this.reviewSubmitted.emit();
          this.resetForm();
          this.visible = false;
          this.visibleChange.emit(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Review submission failed'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to submit review'
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
    this.reviewStatus = '1';
    this.reviewComments = '';
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}


