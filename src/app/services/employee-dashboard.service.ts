import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
    onboardingProgress: {
        totalTasks: number;
        completedTasks: number;
        pendingTasks: number;
        inProgressTasks: number;
        overdueTasks: number;
        progressPercentage: number;
        estimatedCompletionDate: string;
    };
    documentSummary: {
        totalDocuments: number;
        approvedDocuments: number;
        pendingDocuments: number;
        rejectedDocuments: number;
    };
    recentActivity: Array<{
        type: string;
        message: string;
        date: string;
        severity: string;
        comments?: string; // Optional: HR review comments
    }>;
    upcomingDeadlines: Array<{
        taskId: number;
        taskTitle: string;
        dueDate: string;
        daysRemaining: number;
    }>;
}

export interface OnboardingSummary {
    employee: {
        id: number;
        name: string;
        email: string;
        hireDate: string;
        department: string;
        position: string;
    };
    onboardingProgress: {
        startDate: string;
        completionDate: string | null;
        daysElapsed: number;
        progressPercentage: number;
        status: string;
    };
    tasks: Array<{
        title: string;
        status: string;
        dueDate: string;
        completedDate: string | null;
        documents: Array<{
            fileName: string;
            status: string;
            reviewComments: string;
        }>;
    }>;
    timeline: Array<{
        date: string;
        event: string;
        type: string;
    }>;
}

export interface ApiResponse<T> {
    succeeded: boolean;
    message?: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeDashboardService {
    private apiUrl = `${environment.apiUrl}/Employee`;

    constructor(private http: HttpClient) { }

    getDashboard(): Observable<ApiResponse<DashboardData>> {
        return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`);
    }

    getOnboardingSummary(employeeId: number): Observable<ApiResponse<OnboardingSummary>> {
        return this.http.get<ApiResponse<OnboardingSummary>>(`${this.apiUrl}/${employeeId}/onboarding-summary`);
    }
}
