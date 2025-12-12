import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard to redirect authenticated users away from login/register pages
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    // Redirect based on role
    if (user?.role === 0 || user?.role === 2) {
      // HR or Admin
      router.navigate(['/dashboard']);
    } else {
      // Employee
      router.navigate(['/my-tasks']);
    }
    return false; // Prevent access to login page
  }
  
  return true; // Allow access to login page
};

