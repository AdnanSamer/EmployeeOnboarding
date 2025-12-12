import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeDashboardService, DashboardData } from '../../services/employee-dashboard.service';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitCamelCasePipe } from '../../shared/pipes/split-camel-case.pipe';

@Component({
    selector: 'app-employee-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ProgressBarModule,
        TagModule,
        ButtonModule,
        SkeletonModule,
        SplitCamelCasePipe
    ],
    templateUrl: './employee-dashboard.component.html',
    styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent implements OnInit {
    dashboardData: DashboardData | null = null;
    loading = true;
    error: string | null = null;

    constructor(private dashboardService: EmployeeDashboardService) { }

    ngOnInit(): void {
        this.loadDashboard();
    }

    loadDashboard(): void {
        this.loading = true;
        this.error = null;

        this.dashboardService.getDashboard().subscribe({
            next: (response) => {
                if (response.succeeded && response.data) {
                    this.dashboardData = response.data;
                } else {
                    this.error = response.message || 'Failed to load dashboard';
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load dashboard data';
                this.loading = false;
                console.error('Dashboard error:', err);
            }
        });
    }

    getSeverity(severity: string): 'success' | 'info' | 'warn' | 'danger' {
        const map: any = {
            'success': 'success',
            'warning': 'warn',
            'danger': 'danger',
            'info': 'info'
        };
        return map[severity] || 'info';
    }

    getDeadlineSeverity(days: number): 'success' | 'info' | 'warn' | 'danger' {
        if (days <= 0) return 'danger';
        if (days <= 2) return 'warn';
        if (days <= 5) return 'info';
        return 'success';
    }

    getProgressColor(): string {
        if (!this.dashboardData) return '#1976D2';
        const percentage = this.dashboardData.onboardingProgress.progressPercentage;
        if (percentage >= 80) return '#4caf50';
        if (percentage >= 50) return '#2196f3';
        if (percentage >= 25) return '#ff9800';
        return '#f44336';
    }
}
