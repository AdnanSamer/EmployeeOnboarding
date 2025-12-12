import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, BadgeModule],
  template: `
    <div class="notification-panel">
      <button
        class="notification-button"
        (click)="togglePanel($event)"
        pBadge
        [value]="unreadCount > 0 ? unreadCount.toString() : ''"
        severity="danger"
      >
        <i class="pi pi-bell"></i>
      </button>

      <div class="panel" *ngIf="panelOpen" (click)="$event.stopPropagation()">
        <div class="notification-panel-header">
          <h3>Notifications</h3>
          <button class="text-button" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
            Mark all as read
          </button>
        </div>

        <div class="notification-list">
          @if (notifications.length > 0) {
            @for (notification of notifications; track notification.id) {
              <div
                class="notification-item"
                [class.unread]="!notification.isRead"
                (click)="onNotificationClick(notification)"
              >
                <div class="notification-icon" [ngClass]="'type-' + notification.severity">
                  <i class="pi" [ngClass]="getDefaultIcon(notification.severity)"></i>
                </div>
                <div class="notification-content">
                  <h4>{{ notification.title }}</h4>
                  <p>{{ notification.message }}</p>
                  <span class="timestamp">{{ getTimeAgo(notification.created) }}</span>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <i class="pi pi-bell"></i>
              <p>No notifications</p>
            </div>
          }
        </div>

        <div class="notification-panel-footer" *ngIf="notifications.length > 5">
          <button class="text-button" routerLink="/notifications">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-button {
      position: relative;
      background: transparent;
      border: none;
      color: white;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      ::ng-deep .p-badge {
        min-width: 1.2rem;
        height: 1.2rem;
        line-height: 1.2rem;
      }
    }

    .notification-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #333;
      }

      .text-button {
        background: transparent;
        border: none;
        color: #1976D2;
        cursor: pointer;
        font-size: 0.875rem;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f5f5f5;
      }

      &.unread {
        background: #e3f2fd;

        &:hover {
          background: #bbdefb;
        }
      }

      .notification-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;

        i {
          font-size: 1.25rem;
        }

        &.type-info {
          background: #e3f2fd;
          color: #2196F3;
        }

        &.type-success {
          background: #e8f5e9;
          color: #4CAF50;
        }

        &.type-warning {
          background: #fff3e0;
          color: #ff9800;
        }

        &.type-danger {
          background: #ffebee;
          color: #f44336;
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
        }

        p {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #666;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .timestamp {
          font-size: 0.75rem;
          color: #999;
        }
      }
    }

    .empty-state {
      padding: 3rem 2rem;
      text-align: center;

      i {
        font-size: 3rem;
        color: #ccc;
        margin-bottom: 1rem;
      }

      p {
        margin: 0;
        color: #999;
      }
    }

    .notification-panel-footer {
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
      text-align: center;

      .text-button {
        background: transparent;
        border: none;
        color: #1976D2;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .panel {
      position: absolute;
      right: 0;
      top: 120%;
      width: 400px;
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      z-index: 1000;
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  panelOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();

    // Subscribe to unread count updates
    const countSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.push(countSub);

    // Refresh every 30 seconds
    const intervalId = setInterval(() => {
      this.loadNotifications();
      this.loadUnreadCount();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(false).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.notifications = response.data.slice(0, 10); // Show latest 10
        }
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe();
  }

  onNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        if (notification.actionUrl) {
          this.router.navigate([notification.actionUrl]);
          this.panelOpen = false;
        }
      },
      error: (err) => console.error('Error marking as read:', err)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.loadUnreadCount();
      },
      error: (err) => console.error('Error marking all as read:', err)
    });
  }

  getDefaultIcon(severity: string): string {
    const icons = {
      info: 'pi-info-circle',
      success: 'pi-check-circle',
      warning: 'pi-exclamation-triangle',
      danger: 'pi-times-circle'
    };
    return icons[severity as keyof typeof icons] || 'pi-bell';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  togglePanel(event: Event): void {
    event.stopPropagation();
    this.panelOpen = !this.panelOpen;
    if (this.panelOpen) {
      this.loadNotifications();
    }
  }
}
