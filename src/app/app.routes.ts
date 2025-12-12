import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [loginGuard]
  },
  // Dashboard (HR/Admin only)
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] } // Admin=1, HR=2
  },
  // Employee Management (HR/Admin only)
  {
    path: 'employees',
    loadComponent: () => import('./components/employees/employee-list.component').then(m => m.EmployeeListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  {
    path: 'employees/new',
    loadComponent: () => import('./components/employees/employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  {
    path: 'employees/:id',
    loadComponent: () => import('./components/employees/employee-details.component').then(m => m.EmployeeDetailsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  {
    path: 'employees/:id/edit',
    loadComponent: () => import('./components/employees/employee-form.component').then(m => m.EmployeeFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  // Task Templates (HR/Admin only)
  {
    path: 'task-templates',
    loadComponent: () => import('./components/task-templates/task-template-list.component').then(m => m.TaskTemplateListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  // Tasks
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/task-management.component').then(m => m.TaskManagementComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./components/tasks/task-details.component').then(m => m.TaskDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-tasks',
    loadComponent: () => import('./components/tasks/task-management.component').then(m => m.TaskManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] } // Employee
  },
  // Documents
  {
    path: 'documents',
    loadComponent: () => import('./components/documents/document-upload.component').then(m => m.DocumentUploadComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-documents',
    loadComponent: () => import('./components/documents/document-upload.component').then(m => m.DocumentUploadComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] }
  },
  // Employee Portal
  {
    path: 'employee/dashboard',
    loadComponent: () => import('./components/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] } // Employee
  },
  {
    path: 'employee/summary',
    loadComponent: () => import('./components/employee/employee-summary.component').then(m => m.EmployeeSummaryComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] } // Employee
  },
  // PDF Viewer
  {
    path: 'pdf-viewer',
    loadComponent: () => import('./components/pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pdf-viewer/:fileName',
    loadComponent: () => import('./components/pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent),
    canActivate: [authGuard]
  },
  // Overdue Tasks (HR/Admin only)
  {
    path: 'overdue-tasks',
    loadComponent: () => import('./components/tasks/overdue-tasks.component').then(m => m.OverdueTasksComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  // Reports (HR/Admin only)
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1, 2] }
  },
  // Admin Routes (Admin only - Role 2)
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] }
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./components/admin/system-settings.component').then(m => m.SystemSettingsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] }
  },
  {
    path: 'admin/activity-logs',
    loadComponent: () => import('./components/admin/activity-logs.component').then(m => m.ActivityLogsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] }
  },
  // Default redirects
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
