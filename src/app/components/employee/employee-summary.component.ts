import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmployeeDashboardService, OnboardingSummary } from '../../services/employee-dashboard.service';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-employee-summary',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        TimelineModule,
        TagModule,
        ButtonModule,
        ProgressBarModule,
        SkeletonModule
    ],
    templateUrl: './employee-summary.component.html',
    styleUrl: './employee-summary.component.scss'
})
export class EmployeeSummaryComponent implements OnInit {
    summary: OnboardingSummary | null = null;
    loading = true;
    error: string | null = null;
    employeeId: number | null = null;

    constructor(
        private dashboardService: EmployeeDashboardService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
            this.employeeId = currentUser.userId;
            this.loadSummary();
        }
    }

    loadSummary(): void {
        if (!this.employeeId) return;

        this.loading = true;
        this.error = null;

        this.dashboardService.getOnboardingSummary(this.employeeId).subscribe({
            next: (response) => {
                if (response.succeeded && response.data) {
                    this.summary = response.data;
                } else {
                    this.error = response.message || 'Failed to load summary';
                }
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load onboarding summary';
                this.loading = false;
                console.error('Summary error:', err);
            }
        });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
        const map: any = {
            'Completed': 'success',
            'InProgress': 'info',
            'Pending': 'warn',
            'Overdue': 'danger'
        };
        return map[status] || 'info';
    }

    getDocumentStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
        const map: any = {
            'Approved': 'success',
            'Pending': 'warn',
            'Rejected': 'danger'
        };
        return map[status] || 'info';
    }

    getTimelineIcon(type: string): string {
        const map: any = {
            'milestone': 'pi-flag',
            'task': 'pi-check-circle',
            'document': 'pi-file'
        };
        return map[type] || 'pi-circle';
    }

    getTimelineColor(type: string): string {
        const map: any = {
            'milestone': '#1976D2',
            'task': '#4caf50',
            'document': '#ff9800'
        };
        return map[type] || '#999';
    }

    downloadPDF(): void {
        // TODO: Implement PDF download
        console.log('Download PDF summary');
    }
}
