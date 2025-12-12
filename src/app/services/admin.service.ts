import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PagedResponse<T> {
  succeeded: boolean;
  message?: string;
  data?: T[];
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
}

// User Management
export interface SystemUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: number; // 0=HR, 1=Employee, 2=Admin
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: number;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: number;
  isActive?: boolean;
}

export interface ResetPasswordDto {
  userId: number;
  newPassword: string;
}

// Role & Permission Management
export interface Role {
  roleId: number;
  roleName: string;
  permissions: Permission[];
}

export interface Permission {
  permissionId: number;
  permissionName: string;
  description: string;
}

export interface AssignPermissionDto {
  roleId: number;
  permissionIds: number[];
}

// System Settings
export interface SystemSettings {
  taskTemplateSettings: TaskTemplateSettings;
  documentSettings: DocumentSettings;
  notificationSettings: NotificationSettings;
  reportingSettings: ReportingSettings;
}

export interface TaskTemplateSettings {
  allowCustomTasks: boolean;
  requireDocumentUpload: boolean;
  defaultDueDays: number;
}

export interface DocumentSettings {
  maxFileSizeMB: number;
  allowedFileTypes: string[];
  storageType: 'Local' | 'AzureBlob';
  azureBlobConnectionString?: string;
  azureBlobContainerName?: string;
  metadataRetentionDays: number;
}

export interface NotificationSettings {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  enableSsl: boolean;
  enableOverdueTaskEmails: boolean;
  enableDailySummaryEmails: boolean;
  enableCompletionEmails: boolean;
}

export interface ReportingSettings {
  documentRetentionDays: number;
  exportFormats: string[]; // ['PDF', 'Excel']
  autoGenerateReports: boolean;
  reportSchedule?: string; // Cron expression
}

// Activity Logs
export interface ActivityLog {
  logId: number;
  userId: number;
  userName: string;
  action: string;
  entityType: string; // 'Task', 'Document', 'Employee', 'User', etc.
  entityId: number;
  entityName?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ActivityLogFilter {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Dashboard Charts Data
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/Admin`;

  constructor(private http: HttpClient) {}

  // User Management
  getUsers(pageNumber: number = 1, pageSize: number = 10, search?: string): Observable<PagedResponse<SystemUser>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<PagedResponse<SystemUser>>(`${this.apiUrl}/users`, { params });
  }

  getUserById(userId: number): Observable<ApiResponse<SystemUser>> {
    return this.http.get<ApiResponse<SystemUser>>(`${this.apiUrl}/users/${userId}`);
  }

  createUser(userData: CreateUserDto): Observable<ApiResponse<SystemUser>> {
    return this.http.post<ApiResponse<SystemUser>>(`${this.apiUrl}/users`, userData);
  }

  updateUser(userId: number, userData: UpdateUserDto): Observable<ApiResponse<SystemUser>> {
    return this.http.put<ApiResponse<SystemUser>>(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${userId}`);
  }

  resetPassword(resetData: ResetPasswordDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/users/reset-password`, resetData);
  }

  // Role & Permission Management
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/roles`);
  }

  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.apiUrl}/permissions`);
  }

  assignPermissions(assignData: AssignPermissionDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/roles/assign-permissions`, assignData);
  }

  // System Settings
  getSystemSettings(): Observable<ApiResponse<SystemSettings>> {
    return this.http.get<ApiResponse<SystemSettings>>(`${this.apiUrl}/settings`);
  }

  updateSystemSettings(settings: Partial<SystemSettings>): Observable<ApiResponse<SystemSettings>> {
    return this.http.put<ApiResponse<SystemSettings>>(`${this.apiUrl}/settings`, settings);
  }

  // Activity Logs
  getActivityLogs(filter: ActivityLogFilter): Observable<PagedResponse<ActivityLog>> {
    let params = new HttpParams();
    
    if (filter.userId) params = params.set('userId', filter.userId.toString());
    if (filter.action) params = params.set('action', filter.action);
    if (filter.entityType) params = params.set('entityType', filter.entityType);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    
    return this.http.get<PagedResponse<ActivityLog>>(`${this.apiUrl}/activity-logs`, { params });
  }

  // Dashboard Charts
  getOnboardingProgressChart(): Observable<ApiResponse<ChartData>> {
    return this.http.get<ApiResponse<ChartData>>(`${this.apiUrl}/dashboard/charts/onboarding-progress`);
  }

  getTaskCompletionChart(): Observable<ApiResponse<ChartData>> {
    return this.http.get<ApiResponse<ChartData>>(`${this.apiUrl}/dashboard/charts/task-completion`);
  }

  getFileUploadsChart(): Observable<ApiResponse<ChartData>> {
    return this.http.get<ApiResponse<ChartData>>(`${this.apiUrl}/dashboard/charts/file-uploads`);
  }

  // Dashboard Alerts
  getOverdueTasks(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/dashboard/alerts/overdue-tasks`);
  }

  getRejectedDocuments(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/dashboard/alerts/rejected-documents`);
  }
}

