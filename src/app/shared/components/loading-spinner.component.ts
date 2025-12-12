import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div class="loading-overlay" *ngIf="visible">
      <div class="loading-content">
        <p-progressSpinner
          [style]="{ width: '50px', height: '50px' }"
          strokeWidth="4"
          fill="transparent"
          animationDuration="1s"
        ></p-progressSpinner>
        <p *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;

      p {
        margin: 1rem 0 0 0;
        color: #333;
        font-size: 1rem;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() visible = false;
  @Input() message = '';
}


