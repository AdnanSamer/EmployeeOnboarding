import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { DashboardService, DashboardStats, EmployeeProgress } from '../../services/dashboard.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ProgressBarModule,
    TableModule,
    TagModule,
    SkeletonModule,
    ChartModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  progress: EmployeeProgress[] = [];
  loading: boolean = true;
  currentUser: any;
  statsError: string | null = null;
  progressError: string | null = null;
  isAdmin: boolean = false;
  
  // Admin-specific data
  onboardingChartData: any = null;
  taskCompletionChartData: any = null;
  fileUploadsChartData: any = null;
  overdueTasks: any[] = [];
  rejectedDocuments: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadDashboardData();
    if (this.isAdmin) {
      this.loadAdminDashboardData();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        console.log('Dashboard Stats Response:', response);
        if (response.succeeded && response.data) {
          this.stats = response.data;
        } else {
          console.warn('Stats response not successful:', response.message || 'Unknown error');
          // Initialize with zeros if API fails
          this.stats = {
            totalEmployees: 0,
            activeOnboarding: 0,
            completedOnboarding: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            totalDocuments: 0
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        
        // Set error message for user
        if (error.status === 500) {
          this.statsError = 'Backend server error. Please check backend logs.';
        } else if (error.status === 404) {
          this.statsError = 'Dashboard stats endpoint not found. Backend may need implementation.';
        } else {
          this.statsError = `Failed to load statistics: ${error.statusText || 'Unknown error'}`;
        }
        
        // Initialize with zeros on error
        this.stats = {
          totalEmployees: 0,
          activeOnboarding: 0,
          completedOnboarding: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          totalDocuments: 0
        };
        this.loading = false;
      }
    });

    this.dashboardService.getProgress().subscribe({
      next: (response) => {
        console.log('Dashboard Progress Response:', response);
        if (response.succeeded && response.data) {
          this.progress = response.data;
        } else {
          console.warn('Progress response not successful:', response.message || 'Unknown error');
          this.progress = [];
        }
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        
        if (error.status === 500) {
          this.progressError = 'Backend server error. Please check backend logs.';
        } else if (error.status === 404) {
          this.progressError = 'Progress endpoint not found. Backend may need implementation.';
        } else {
          this.progressError = `Failed to load progress: ${error.statusText || 'Unknown error'}`;
        }
        
        this.progress = [];
      }
    });
  }

  loadAdminDashboardData(): void {
    // Load charts
    this.adminService.getOnboardingProgressChart().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.onboardingChartData = this.convertToChartJsFormat(response.data);
        }
      },
      error: (error) => console.error('Error loading onboarding chart:', error)
    });

    this.adminService.getTaskCompletionChart().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.taskCompletionChartData = this.convertToChartJsFormat(response.data);
        }
      },
      error: (error) => console.error('Error loading task completion chart:', error)
    });

    this.adminService.getFileUploadsChart().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.fileUploadsChartData = this.convertToChartJsFormat(response.data);
        }
      },
      error: (error) => console.error('Error loading file uploads chart:', error)
    });

    // Load alerts
    this.adminService.getOverdueTasks().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.overdueTasks = response.data;
        }
      },
      error: (error) => console.error('Error loading overdue tasks:', error)
    });

    this.adminService.getRejectedDocuments().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.rejectedDocuments = response.data;
        }
      },
      error: (error) => console.error('Error loading rejected documents:', error)
    });
  }

  convertToChartJsFormat(chartData: any): any {
    return {
      labels: chartData.labels || [],
      datasets: chartData.datasets?.map((dataset: any) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || this.getDefaultColors(dataset.data.length),
        borderColor: dataset.borderColor || dataset.backgroundColor || this.getDefaultColors(dataset.data.length),
        borderWidth: 1
      })) || []
    };
  }

  getDefaultColors(count: number): string[] {
    const colors = [
      '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
      '#26A69A', '#FFCA28', '#5C6BC0', '#EC407A', '#78909C'
    ];
    return colors.slice(0, count);
  }

  getSeverity(percentage: number): 'success' | 'warn' | 'danger' {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warn';
    return 'danger';
  }
}

