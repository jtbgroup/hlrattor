import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BudgetLinePayload,
  CreateProjectPayload,
  DueDateChangePayload,
  ProjectDetail,
  ProjectManagerChangePayload,
  ProjectSummary,
  StatusChangePayload,
  UpdateProjectPayload,
} from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/projects`;

  getProjects(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(this.base);
  }

  getProject(id: string): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.base}/${id}`);
  }

  createProject(payload: CreateProjectPayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(this.base, payload);
  }

  updateProject(id: string, payload: UpdateProjectPayload): Observable<ProjectDetail> {
    return this.http.put<ProjectDetail>(`${this.base}/${id}`, payload);
  }

  changeStatus(id: string, payload: StatusChangePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/status`, payload);
  }

  changeProjectManager(id: string, payload: ProjectManagerChangePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/project-manager`, payload);
  }

  changeDueDate(id: string, payload: DueDateChangePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/due-date`, payload);
  }

  addBudgetLine(id: string, payload: BudgetLinePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/budget-lines`, payload);
  }

  updateBudgetLine(id: string, lineId: string, payload: BudgetLinePayload): Observable<ProjectDetail> {
    return this.http.put<ProjectDetail>(`${this.base}/${id}/budget-lines/${lineId}`, payload);
  }

  deleteBudgetLine(id: string, lineId: string): Observable<ProjectDetail> {
    return this.http.delete<ProjectDetail>(`${this.base}/${id}/budget-lines/${lineId}`);
  }
}