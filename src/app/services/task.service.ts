import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaskTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  estimatedDays: number;
}

export interface OnboardingTask {
  id: number;
  taskTemplateId: number;
  employeeId: number;
  title: string;
  description: string;
  dueDate: string;
  status: number; // 0=Pending, 1=InProgress, 2=Completed, 3=Canceled
  assignedDate: string;
}

export interface AssignTaskDto {
  taskTemplateId: number;
  employeeId: number;
  title: string;
  description: string;
  dueDate: string;
  priority?: number;
  notes?: string;
  assignedBy?: number;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/OnboardingTasks`;
  private templateUrl = `${environment.apiUrl}/TaskTemplates`;

  constructor(private http: HttpClient) { }

  // Task Templates
  getTaskTemplates(): Observable<ApiResponse<TaskTemplate[]>> {
    return this.http.get<ApiResponse<TaskTemplate[]>>(this.templateUrl);
  }

  getTaskTemplateById(id: number): Observable<ApiResponse<TaskTemplate>> {
    return this.http.get<ApiResponse<TaskTemplate>>(`${this.templateUrl}/${id}`);
  }

  createTaskTemplate(template: Partial<TaskTemplate>): Observable<ApiResponse<TaskTemplate>> {
    return this.http.post<ApiResponse<TaskTemplate>>(this.templateUrl, template);
  }

  updateTaskTemplate(id: number, template: Partial<TaskTemplate>): Observable<ApiResponse<TaskTemplate>> {
    return this.http.put<ApiResponse<TaskTemplate>>(`${this.templateUrl}/${id}`, template);
  }

  deleteTaskTemplate(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.templateUrl}/${id}`);
  }

  // Onboarding Tasks
  assignTask(task: AssignTaskDto): Observable<ApiResponse<OnboardingTask>> {
    return this.http.post<ApiResponse<OnboardingTask>>(this.apiUrl, task);
  }

  getTaskById(id: number): Observable<ApiResponse<OnboardingTask>> {
    return this.http.get<ApiResponse<OnboardingTask>>(`${this.apiUrl}/${id}`);
  }

  getEmployeeTasks(employeeId: number): Observable<ApiResponse<OnboardingTask[]>> {
    return this.http.get<ApiResponse<OnboardingTask[]>>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getAllTasks(): Observable<ApiResponse<OnboardingTask[]>> {
    return this.http.get<ApiResponse<OnboardingTask[]>>(this.apiUrl);
  }

  getOverdueTasks(): Observable<ApiResponse<OnboardingTask[]>> {
    return this.http.get<ApiResponse<OnboardingTask[]>>(`${this.apiUrl}/overdue`);
  }

  updateTaskStatus(id: number, status: number): Observable<ApiResponse<OnboardingTask>> {
    return this.http.put<ApiResponse<OnboardingTask>>(`${this.apiUrl}/${id}/status`, { status });
  }

  getEnhancedEmployeeTasks(employeeId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/employee/${employeeId}/enhanced`);
  }

  reopenTask(id: number, data?: { reason?: string; newDueDate?: Date; reopenedBy: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/reopen`, data || {});
  }
}
