import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Document {
  id: number;
  onboardingTaskId?: number;
  taskId?: number; // Alias for onboardingTaskId for backward compatibility
  fileName: string;
  originalFileName: string;
  filePath?: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  uploadedBy: number;
  version: number;
  isCurrentVersion?: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | number; // Backend may return string or number
  reviewedBy?: number;
  reviewedDate?: string;
  reviewComments?: string;
}

export interface ReviewDocumentDto {
  status: number; // 1=Approved, 2=Rejected
  comments?: string;
  reviewedBy: number;
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
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/Documents`;

  constructor(private http: HttpClient) {}

  uploadDocument(taskId: number, file: File, uploadedBy: number): Observable<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy.toString());

    return this.http.post<ApiResponse<Document>>(`${this.apiUrl}/upload/${taskId}`, formData);
  }

  getDocumentById(id: number): Observable<ApiResponse<Document>> {
    return this.http.get<ApiResponse<Document>>(`${this.apiUrl}/${id}`);
  }

  getTaskDocuments(taskId: number): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.apiUrl}/task/${taskId}`);
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  previewDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/preview`, {
      responseType: 'blob'
    });
  }

  reviewDocument(id: number, review: ReviewDocumentDto): Observable<ApiResponse<Document>> {
    return this.http.put<ApiResponse<Document>>(`${this.apiUrl}/${id}/review`, review);
  }

  deleteDocument(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  generateOnboardingSummary(employeeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/generate-summary/${employeeId}`, {
      responseType: 'blob'
    });
  }
}

