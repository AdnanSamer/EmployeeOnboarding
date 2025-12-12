import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: number; // 0=HR, 1=Employee, 2=Admin
}

export interface AuthResponse {
  succeeded: boolean;
  message: string;
  data: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: number;
    token: string;
    expires: string;
    mustChangePassword?: boolean; // Flag for force password change
  };
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.succeeded) {
            this.setToken(response.data.token);
            this.setUser(response.data);
            // Store mustChangePassword flag if present
            if (response.data.mustChangePassword) {
              localStorage.setItem('mustChangePassword', 'true');
            }
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.succeeded) {
            this.setToken(response.data.token);
            this.setUser(response.data);
          }
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }

  // Check if user must change password
  mustChangePassword(): boolean {
    return localStorage.getItem('mustChangePassword') === 'true';
  }

  // Clear password change flag after successful change
  clearPasswordChangeFlag(): void {
    localStorage.removeItem('mustChangePassword');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  // Admin = 1, HR = 2, Employee = 3 (backend enum)
  isHR(): boolean {
    const user = this.getCurrentUser();
    // Allow Admin to access HR features
    return user?.role === 2 || user?.role === 1;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 1;
  }

  isEmployee(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 3;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.userKey);
    if (userData) {
      try {
        this.currentUserSubject.next(JSON.parse(userData));
      } catch (e) {
        console.error('Error loading user from storage', e);
      }
    }
  }
}

