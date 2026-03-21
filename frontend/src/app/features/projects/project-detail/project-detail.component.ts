import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  ProjectService, ProjectDetail, ProjectStatus,
  BudgetLineResponse,
} from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, UserManagementDto } from '../../../core/services/user.service';
import { BudgetLineFormComponent, BudgetLineDialogData } from '../budget-line-form/budget-line-form.component';
import { ProgressionFormComponent } from '../progression-form/progression-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
    MatDialogModule, MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  project = signal<ProjectDetail | null>(null);
  loading = signal(true);
  projectManagers = signal<UserManagementDto[]>([]);

  // Inline form visibility flags
  showStatusForm = false;
  showPmForm = false;
  showDueDateForm = false;
  showHeaderEdit = false;

  saving = signal(false);
  errorMessage = signal('');

  readonly statuses: ProjectStatus[] = ['DRAFT', 'BIA', 'PROJECT', 'CANCELED', 'CLOSED'];
  readonly statusLabels: Record<ProjectStatus, string> = {
    DRAFT: 'Brouillon', BIA: 'BIA', PROJECT: 'Projet',
    CANCELED: 'Annulé', CLOSED: 'Clôturé',
  };

  readonly budgetColumns = ['type', 'amount', 'date', 'createdBy', 'actions'];
  readonly statusColumns = ['status', 'businessDate', 'changedBy', 'changedAt'];
  readonly pmColumns = ['projectManager', 'startDate', 'endDate', 'assignedBy'];
  readonly dueDateColumns = ['dueDate', 'changedBy', 'changedAt'];
  readonly progressionColumns = ['value', 'progressionDate', 'recordedBy', 'recordedAt'];

  statusForm = this.fb.group({
    status: ['' as ProjectStatus, Validators.required],
    businessDate: [null as Date | null, Validators.required],
  });

  pmForm = this.fb.group({
    projectManagerId: ['', Validators.required],
  });

  dueDateForm = this.fb.group({
    dueDate: [null as Date | null, Validators.required],
  });

  headerForm = this.fb.group({
    name: ['', Validators.required],
    reference: ['', Validators.required],
    sciformaCode: ['', Validators.required],
    pordBia: [''],
    pordProject: [''],
  });

  get isAdmin(): boolean { return this.authService.hasRole('ADMIN'); }
  get currentUsername(): string { return this.authService.currentUser()?.username ?? ''; }

  get isAssignedPm(): boolean {
    return this.project()?.currentProjectManager === this.currentUsername;
  }

  get canEdit(): boolean { return this.isAdmin || this.isAssignedPm; }

  get isReadOnly(): boolean {
    const s = this.project()?.currentStatus;
    return s === 'CANCELED' || s === 'CLOSED';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadProject(id);
    this.userService.listUsers().subscribe(users => {
      this.projectManagers.set(users.filter(u => u.roles.includes('PROJECT_MANAGER') && u.enabled));
    });
  }

  loadProject(id: string): void {
    this.loading.set(true);
    this.projectService.getProject(id).subscribe({
      next: p => {
        this.project.set(p);
        this.patchHeaderForm(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchHeaderForm(p: ProjectDetail): void {
    this.headerForm.patchValue({
      name: p.name,
      reference: p.reference,
      sciformaCode: p.sciformaCode,
      pordBia: p.pordBia ?? '',
      pordProject: p.pordProject ?? '',
    });
  }

  // ── Header edit ──────────────────────────────────────────────────────────

  saveHeader(): void {
    if (this.headerForm.invalid) return;
    const v = this.headerForm.getRawValue();
    this.saving.set(true);
    this.projectService.updateProject(this.project()!.id, {
      name: this.isAdmin ? v.name! : undefined,
      reference: this.isAdmin ? v.reference! : undefined,
      sciformaCode: v.sciformaCode!,
      pordBia: v.pordBia || undefined,
      pordProject: v.pordProject || undefined,
    }).subscribe({
      next: p => { this.project.set(p); this.showHeaderEdit = false; this.saving.set(false); },
      error: err => { this.errorMessage.set(err.error?.message ?? 'Erreur'); this.saving.set(false); },
    });
  }

  // ── Status ───────────────────────────────────────────────────────────────

  saveStatus(): void {
    if (this.statusForm.invalid) return;
    const v = this.statusForm.getRawValue();
    this.saving.set(true);
    this.projectService.changeStatus(this.project()!.id, {
      status: v.status as ProjectStatus,
      businessDate: v.businessDate!.toISOString().substring(0, 10),
    }).subscribe({
      next: p => { this.project.set(p); this.showStatusForm = false; this.saving.set(false); },
      error: err => { this.errorMessage.set(err.error?.message ?? 'Erreur'); this.saving.set(false); },
    });
  }

  // ── Project manager ───────────────────────────────────────────────────────

  savePm(): void {
    if (this.pmForm.invalid) return;
    this.saving.set(true);
    this.projectService.changeProjectManager(this.project()!.id, this.pmForm.value.projectManagerId!).subscribe({
      next: p => { this.project.set(p); this.showPmForm = false; this.saving.set(false); },
      error: err => { this.errorMessage.set(err.error?.message ?? 'Erreur'); this.saving.set(false); },
    });
  }

  // ── Due date ──────────────────────────────────────────────────────────────

  saveDueDate(): void {
    if (this.dueDateForm.invalid) return;
    this.saving.set(true);
    const d = this.dueDateForm.value.dueDate!.toISOString().substring(0, 10);
    this.projectService.changeDueDate(this.project()!.id, d).subscribe({
      next: p => { this.project.set(p); this.showDueDateForm = false; this.saving.set(false); },
      error: err => { this.errorMessage.set(err.error?.message ?? 'Erreur'); this.saving.set(false); },
    });
  }

  // ── Budget lines ──────────────────────────────────────────────────────────

  openBudgetLineDialog(existing?: BudgetLineResponse): void {
    const data: BudgetLineDialogData = { projectId: this.project()!.id, existing };
    const ref = this.dialog.open(BudgetLineFormComponent, { width: '480px', data });
    ref.afterClosed().subscribe(result => { if (result) this.project.set(result); });
  }

  deleteBudgetLine(lineId: string): void {
    if (!confirm('Supprimer cette ligne budgétaire ?')) return;
    this.projectService.deleteBudgetLine(this.project()!.id, lineId).subscribe({
      next: p => this.project.set(p),
      error: err => this.errorMessage.set(err.error?.message ?? 'Erreur'),
    });
  }

  // ── Progression ───────────────────────────────────────────────────────────

  openProgressionDialog(): void {
    const ref = this.dialog.open(ProgressionFormComponent, {
      width: '420px',
      data: this.project()!.id,
    });
    ref.afterClosed().subscribe(result => { if (result) this.project.set(result); });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

getStatusLabel(status: string): string {
  return this.statusLabels[status as ProjectStatus] ?? status;
}

statusColor(status: string): string {
  const map: Record<ProjectStatus, string> = {
    DRAFT: 'default', BIA: 'primary', PROJECT: 'accent',
    CANCELED: 'warn', CLOSED: 'warn',
  };
  return map[status as ProjectStatus] ?? 'default';
}

  back(): void { this.router.navigate(['/projects']); }
}
