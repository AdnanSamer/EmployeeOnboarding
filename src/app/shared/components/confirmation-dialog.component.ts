import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="header"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onCancel()"
    >
      <div class="confirmation-content">
        <i class="pi" [ngClass]="iconClass"></i>
        <p>{{ message }}</p>
        <small *ngIf="details" class="details">{{ details }}</small>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          [label]="cancelLabel"
          icon="pi pi-times"
          severity="secondary"
          [outlined]="true"
          (onClick)="onCancel()"
        ></p-button>
        <p-button
          [label]="confirmLabel"
          [icon]="confirmIcon"
          [severity]="severity"
          (onClick)="onConfirm()"
        ></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .confirmation-content {
      text-align: center;
      padding: 1rem;

      i {
        font-size: 4rem;
        margin-bottom: 1rem;

        &.pi-exclamation-triangle {
          color: #ff9800;
        }

        &.pi-question-circle {
          color: #2196F3;
        }

        &.pi-times-circle {
          color: #f44336;
        }

        &.pi-info-circle {
          color: #2196F3;
        }
      }

      p {
        margin: 0 0 1rem 0;
        font-size: 1.125rem;
        color: #333;
      }

      .details {
        display: block;
        color: #666;
        font-size: 0.9rem;
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  @Input() visible = false;
  @Input() header = 'Confirmation';
  @Input() message = 'Are you sure?';
  @Input() details = '';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmIcon = 'pi pi-check';
  @Input() severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' = 'warn';
  @Input() iconClass = 'pi-exclamation-triangle';
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}


