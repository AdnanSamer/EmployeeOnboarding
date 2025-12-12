import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  isRead: boolean;
  created: string;
  actionUrl: string | null;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/Notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  getNotifications(unreadOnly: boolean = false): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(`${this.apiUrl}/employee?unreadOnly=${unreadOnly}`);
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/unread-count`).pipe(
      tap((response) => {
        if (response.succeeded) {
          this.unreadCountSubject.next(response.data);
        }
      })
    );
  }

  markAsRead(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/mark-read`, {}).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAllAsRead(): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      error: (err) => console.error('Error loading unread count:', err)
    });
  }
}
