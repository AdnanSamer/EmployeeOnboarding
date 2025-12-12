import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationPanelComponent } from './shared/components/notification-panel.component';
import { ChangePasswordDialogComponent } from './shared/components/change-password-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, ToastModule, TooltipModule, NotificationPanelComponent, ChangePasswordDialogComponent],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  title = 'Employee Onboarding';
  isAuthenticated = false;
  isLoginRoute = false;
  currentUser: any = null;
  isHR = false;
  isAdmin = false;
  isEmployee = false;
  sidebarCollapsed = false;
  userMenuVisible = false;
  notificationCount = 0;
  showPasswordChangeDialog = false; // For force password change
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check initial route
    this.isLoginRoute = this.router.url === '/login' || this.router.url === '/register';

    // Check authentication status
    this.updateAuthStatus();

    // Subscribe to user changes to update UI immediately on login
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = this.authService.isAuthenticated();
      this.isHR = this.authService.isHR();
      this.isAdmin = this.authService.isAdmin();
      this.isEmployee = this.authService.isEmployee();
    });

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginRoute = event.url === '/login' || event.url === '/register';
        this.updateAuthStatus();
        // Check if password change is required after navigation
        this.checkPasswordChangeRequired();
      });

    // Initial check for password change
    this.checkPasswordChangeRequired();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.isHR = this.authService.isHR();
    this.isAdmin = this.authService.isAdmin();
    this.isEmployee = this.authService.isEmployee();
  }

  private checkPasswordChangeRequired(): void {
    if (this.authService.isLoggedIn() && this.authService.mustChangePassword() && !this.isLoginRoute) {
      this.showPasswordChangeDialog = true;
    }
  }

  onPasswordChanged(): void {
    this.showPasswordChangeDialog = false;
    // Optionally reload to refresh user state
    window.location.reload();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
