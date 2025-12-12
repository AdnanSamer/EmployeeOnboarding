import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-file-upload-drag-drop',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule],
  template: `
    <div class="file-upload-container">
      <div
        class="upload-area"
        [class.dragging]="isDragging"
        [class.has-file]="selectedFile"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          accept=".pdf,application/pdf"
          (change)="onFileSelected($event)"
          style="display: none"
        />

        @if (!selectedFile) {
          <div class="upload-placeholder">
            <i class="pi pi-cloud-upload"></i>
            <h3>Drag & Drop PDF File</h3>
            <p>or click to browse</p>
            <small>Maximum file size: 10 MB</small>
          </div>
        } @else {
          <div class="file-info">
            <div class="file-icon">
              <i class="pi pi-file-pdf"></i>
            </div>
            <div class="file-details">
              <h4>{{ selectedFile.name }}</h4>
              <p>{{ getFileSize(selectedFile.size) }}</p>
            </div>
            <button
              class="remove-button"
              (click)="removeFile($event)"
              type="button"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        }

        @if (uploading) {
          <div class="upload-progress">
            <p-progressBar [value]="uploadProgress"></p-progressBar>
            <span>Uploading... {{ uploadProgress }}%</span>
          </div>
        }

        @if (error) {
          <div class="error-message">
            <i class="pi pi-exclamation-circle"></i>
            {{ error }}
          </div>
        }
      </div>

      @if (selectedFile && !uploading) {
        <div class="upload-actions">
          <p-button
            label="Upload"
            icon="pi pi-upload"
            (onClick)="onUpload()"
            [disabled]="!selectedFile"
          ></p-button>
          <p-button
            label="Clear"
            icon="pi pi-times"
            severity="secondary"
            [outlined]="true"
            (onClick)="removeFile($event)"
          ></p-button>
        </div>
      }
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 3rem 2rem;
      text-align: center;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        border-color: #1976D2;
        background: #e3f2fd;
      }

      &.dragging {
        border-color: #1976D2;
        background: #e3f2fd;
        transform: scale(1.02);
      }

      &.has-file {
        background: white;
        padding: 2rem;
      }
    }

    .upload-placeholder {
      i {
        font-size: 4rem;
        color: #1976D2;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.25rem;
      }

      p {
        margin: 0;
        color: #757575;
      }

      small {
        display: block;
        margin-top: 0.5rem;
        color: #999;
      }
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;

      .file-icon {
        i {
          font-size: 3rem;
          color: #f44336;
        }
      }

      .file-details {
        flex: 1;
        text-align: left;

        h4 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1rem;
        }

        p {
          margin: 0;
          color: #757575;
          font-size: 0.9rem;
        }
      }

      .remove-button {
        background: transparent;
        border: none;
        color: #f44336;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background 0.2s;

        &:hover {
          background: rgba(244, 67, 54, 0.1);
        }
      }
    }

    .upload-progress {
      margin-top: 1rem;

      span {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #1976D2;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
      font-size: 0.9rem;

      i {
        font-size: 1.25rem;
      }
    }

    .upload-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
  `]
})
export class FileUploadDragDropComponent {
  @Input() taskId: number | null = null;
  @Output() fileUploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  isDragging = false;
  uploading = false;
  uploadProgress = 0;
  error = '';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    this.error = '';

    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.error = 'Only PDF files are allowed';
      this.selectedFile = null;
      return;
    }

    // Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.error = 'File size exceeds 10 MB limit';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.error = '';
    this.uploadProgress = 0;
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    
    // Emit event with file (parent component handles actual upload)
    this.fileUploaded.emit();
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  getFile(): File | null {
    return this.selectedFile;
  }

  setProgress(progress: number): void {
    this.uploadProgress = progress;
  }

  setUploading(uploading: boolean): void {
    this.uploading = uploading;
  }

  reset(): void {
    this.selectedFile = null;
    this.uploading = false;
    this.uploadProgress = 0;
    this.error = '';
  }
}


