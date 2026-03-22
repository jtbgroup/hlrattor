export type ProjectStatus = 'DRAFT' | 'BIA' | 'PROJECT' | 'CANCELED' | 'CLOSED';
export type BudgetLineType = 'ENGAGEMENT_INITIAL' | 'COMMANDE_COMPLEMENTAIRE' | 'TRANSFERT';

export const PROJECT_STATUSES: ProjectStatus[] = ['DRAFT', 'BIA', 'PROJECT', 'CANCELED', 'CLOSED'];
export const BUDGET_LINE_TYPES: BudgetLineType[] = ['ENGAGEMENT_INITIAL', 'COMMANDE_COMPLEMENTAIRE', 'TRANSFERT'];
export const READ_ONLY_STATUSES: ProjectStatus[] = ['CANCELED', 'CLOSED'];

export interface ProjectSummary {
  id: string;
  reference: string;
  name: string;
  currentStatus: ProjectStatus;
  currentProjectManager: string | null;
  currentDueDate: string | null;
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

export interface BudgetLineEntry {
  id: string;
  type: BudgetLineType;
  amount: number;
  date: string;
  pordReference: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface ProjectDetail {
  id: string;
  reference: string;
  name: string;
  imputationCode: string;
  pordBia: string | null;
  pordProject: string | null;
  createdBy: string;
  createdAt: string;
  currentStatus: ProjectStatus;
  currentProjectManager: string | null;
  currentDueDate: string | null;
  totalBudget: number;
  statusHistory: ProjectStatusHistoryEntry[];
  managerHistory: ProjectManagerHistoryEntry[];
  dueDateHistory: DueDateHistoryEntry[];
  budgetLines: BudgetLineEntry[];
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

export interface ProjectManagerChangePayload {
  projectManagerId: string;
}

export interface DueDateChangePayload {
  dueDate: string;
}

export interface BudgetLinePayload {
  type: BudgetLineType;
  amount: number;
  date: string;
  pordReference?: string;
}
