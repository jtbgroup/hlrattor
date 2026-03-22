import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ProjectStatus = 'DRAFT' | 'BIA' | 'PROJECT' | 'CANCELED' | 'CLOSED';
export type BudgetLineType = 'ENGAGEMENT_INITIAL' | 'COMMANDE_COMPLEMENTAIRE' | 'TRANSFERT';

export interface ProjectSummary {
  id: string;
  reference: string;
  name: string;
  currentStatus: ProjectStatus;
  currentProjectManager: string | null;
  currentDueDate: string | null;
  currentProgression: number | null;
  totalBudget: number;
}

export interface ProjectStatusHistoryEntry {
  id: string;
  status: ProjectStatus;
  businessDate: string;
  changedBy: string;
  changedAt: string;
}

export interface ProjectManagerHistoryEntry {
  id: string;
  projectManager: string;
  startDate: string;
  endDate: string | null;
  assignedBy: string;
  assignedAt: string;
}

export interface DueDateHistoryEntry {
  id: string;
  dueDate: string;
  changedBy: string;
  changedAt: string;
}

export interface BudgetLineResponse {
  id: string;
  type: BudgetLineType;
  amount: number;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface ProgressionResponse {
  id: string;
  value: number;
  progressionDate: string;
  recordedBy: string;
  recordedAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  imputationCode: string;
  pordBia: string | null;
  pordProject: string | null;
  createdBy: string;
  createdAt: string;
  statusHistory: ProjectStatusHistoryEntry[];
  projectManagerHistory: ProjectManagerHistoryEntry[];
  dueDateHistory: DueDateHistoryEntry[];
  budgetLines: BudgetLineResponse[];
  progressionHistory: ProgressionResponse[];
}

export interface CreateProjectPayload {
  name: string;
  reference: string;
  imputationCode: string;
  pordBia?: string;
  pordProject?: string;
  projectManagerId: string;
  initialStatus: ProjectStatus;
  statusDate: string;
}

export interface UpdateProjectPayload {
  name?: string;
  reference?: string;
  imputationCode?: string;
  pordBia?: string;
  pordProject?: string;
}

export interface StatusChangePayload {
  status: ProjectStatus;
  businessDate: string;
}

export interface BudgetLinePayload {
  type: BudgetLineType;
  amount: number;
  date: string;
}

export interface ProgressionPayload {
  progressionValue: number;
  progressionDate: string;
}

const OPT = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/projects`;

  getProjects(): Observable<ProjectSummary[]> {
    return this.http.get<ProjectSummary[]>(this.base, OPT);
  }

  getProject(id: string): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(`${this.base}/${id}`, OPT);
  }

  createProject(payload: CreateProjectPayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(this.base, payload, OPT);
  }

  updateProject(id: string, payload: UpdateProjectPayload): Observable<ProjectDetail> {
    return this.http.put<ProjectDetail>(`${this.base}/${id}`, payload, OPT);
  }

  changeStatus(id: string, payload: StatusChangePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/status`, payload, OPT);
  }

  changeProjectManager(id: string, projectManagerId: string): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/project-manager`, { projectManagerId }, OPT);
  }

  changeDueDate(id: string, dueDate: string): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/due-date`, { dueDate }, OPT);
  }

  addBudgetLine(id: string, payload: BudgetLinePayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/budget-lines`, payload, OPT);
  }

  updateBudgetLine(id: string, lineId: string, payload: BudgetLinePayload): Observable<ProjectDetail> {
    return this.http.put<ProjectDetail>(`${this.base}/${id}/budget-lines/${lineId}`, payload, OPT);
  }

  deleteBudgetLine(id: string, lineId: string): Observable<ProjectDetail> {
    return this.http.delete<ProjectDetail>(`${this.base}/${id}/budget-lines/${lineId}`, OPT);
  }

  addProgression(id: string, payload: ProgressionPayload): Observable<ProjectDetail> {
    return this.http.post<ProjectDetail>(`${this.base}/${id}/progressions`, payload, OPT);
  }
}