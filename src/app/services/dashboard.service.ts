import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalEmployees: number;
  activeOnboarding: number;
  completedOnboarding: number;
  pendingTasks: number;
  overdueTasks: number;
  totalDocuments: number;
}

export interface EmployeeProgress {
  employeeId: number;
  employeeName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionPercentage: number;
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
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/stats`);
  }

  getProgress(): Observable<ApiResponse<EmployeeProgress[]>> {
    return this.http.get<ApiResponse<EmployeeProgress[]>>(`${this.apiUrl}/progress`);
  }
}

