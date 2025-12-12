import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../../services/document.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="pdf-viewer-container">
      <div class="pdf-header">
        <h2>{{ fileName }}</h2>
        <p-button 
          label="Close" 
          icon="pi pi-times" 
          (onClick)="close()"
          severity="secondary"
        ></p-button>
      </div>
      
      <div class="pdf-content" *ngIf="pdfUrl">
        <iframe 
          [src]="pdfUrl" 
          width="100%" 
          height="100%"
          frameborder="0"
        ></iframe>
      </div>
      
      <div class="loading" *ngIf="!pdfUrl && !error">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
        <p>Loading PDF...</p>
      </div>

      <div class="error" *ngIf="error">
        <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
        <p>{{ error }}</p>
        <p-button 
          label="Go Back" 
          icon="pi pi-arrow-left" 
          (onClick)="close()"
        ></p-button>
      </div>
    </div>
  `,
  styles: [`
    .pdf-viewer-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f5f5f5;
    }

    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);

      h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #1f2937;
        font-weight: 600;
      }
    }

    .pdf-content {
      flex: 1;
      padding: 1rem;
      overflow: hidden;

      iframe {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        background: white;
      }
    }

    .loading,
    .error {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      color: #6b7280;

      p {
        margin: 0;
        font-size: 1rem;
      }
    }

    .error {
      color: #ef4444;
    }
  `]
})
export class PdfViewerComponent implements OnInit {
  @Input() documentId: number | null = null;
  @Input() fileName: string = 'Document';
  @Input() isReadOnly: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.documentId = params['documentId'] ? parseInt(params['documentId']) : null;
      this.fileName = params['fileName'] || 'Document.pdf';

      if (this.documentId) {
        this.loadPdf();
      } else {
        this.error = 'No document ID provided';
      }
    });
  }

  loadPdf(): void {
    if (!this.documentId) return;

    this.documentService.downloadDocument(this.documentId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: (error) => {
        console.error('Error loading PDF:', error);
        this.error = 'Failed to load PDF. Please try again.';
      }
    });
  }

  close(): void {
    // Navigate back to previous page or dashboard
    window.history.back();
  }
}
