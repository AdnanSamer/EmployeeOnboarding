import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  employeeNumber?: string;
  department: string;
  position?: string;
  hireDate: string; // ISO string
  employmentStatus: number;
  onboardingStatus: number;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  hireDate: string;
}

export interface EmployeeFilterDto {
  department?: string;
  employmentStatus?: number;
  onboardingStatus?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  succeeded: boolean;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
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
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employees`;

  constructor(private http: HttpClient) {}

  getEmployees(filter?: EmployeeFilterDto): Observable<PagedResponse<Employee>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.department) params = params.set('department', filter.department);
      if (filter.employmentStatus !== undefined) 
        params = params.set('employmentStatus', filter.employmentStatus.toString());
      if (filter.onboardingStatus !== undefined) 
        params = params.set('onboardingStatus', filter.onboardingStatus.toString());
      if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<PagedResponse<Employee>>(this.apiUrl, { params });
  }

  getEmployeeById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: CreateEmployeeDto): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Partial<CreateEmployeeDto>): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  completeOnboarding(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/complete-onboarding`, {});
  }

  generateOnboardingSummary(employeeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${employeeId}/generate-summary`, {
      responseType: 'blob'
    });
  }
}

