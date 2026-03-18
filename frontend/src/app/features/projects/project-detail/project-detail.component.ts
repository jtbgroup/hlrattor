import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  BudgetLineEntry,
  ProjectDetail,
  PROJECT_STATUSES,
  ProjectStatus,
  READ_ONLY_STATUSES,
} from '../../../core/models/project.model';
import { BudgetLineFormComponent } from '../budget-line-form/budget-line-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatTableModule, MatDividerModule,
    MatDatepickerModule, MatNativeDateModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  project!: ProjectDetail;
  loading = true;

  isAdmin = false;
  isAssignedPm = false;
  canEdit = false;
  isReadOnly = false;

  // Forms
  headerForm!: FormGroup;
  statusForm!: FormGroup;
  pmForm!: FormGroup;
  dueDateForm!: FormGroup;

  // UI state
  editingHeader = false;
  showStatusForm = false;
  showPmForm = false;
  showDueDateForm = false;

  readonly statuses = PROJECT_STATUSES;
  readonly readOnlyStatuses = READ_ONLY_STATUSES;

  projectManagers: { id: string; username: string }[] = [];

  // Table columns
  statusColumns = ['status', 'businessDate', 'changedBy', 'changedAt'];
  pmColumns = ['projectManager', 'startDate', 'endDate', 'assignedBy'];
  dueDateColumns = ['dueDate', 'changedBy', 'changedAt'];
  budgetColumns = ['type', 'amount', 'date', 'pordReference', 'createdBy', 'actions'];

  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadProject(id);

    this.isAdmin = this.authService.hasRole('ADMIN');

    if (this.isAdmin) {
      this.userService.listUsers().subscribe(users => {
        this.projectManagers = users
          .filter(u => u.roles?.includes('PROJECT_MANAGER') && u.enabled)
          .map(u => ({ id: u.id, username: u.username }));
      });
    }
  }

  loadProject(id: string): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe(p => {
      this.project = p;
      this.loading = false;

      const currentUser = this.authService.currentUser();
      this.isAssignedPm = p.currentProjectManager === currentUser?.username;
      this.canEdit = this.isAdmin || this.isAssignedPm;
      this.isReadOnly = READ_ONLY_STATUSES.includes(p.currentStatus);

      this.initForms();
    });
  }

  // -------------------------------------------------------------------------
  // Form initialization
  // -------------------------------------------------------------------------

  initForms(): void {
    const p = this.project;

    this.headerForm = this.fb.group({
      name: [{ value: p.name, disabled: !this.isAdmin }, this.isAdmin ? Validators.required : []],
      reference: [{ value: p.reference, disabled: !this.isAdmin }, this.isAdmin ? Validators.required : []],
      sciformaCode: [p.sciformaCode, Validators.required],
      pordBia: [p.pordBia ?? ''],
      pordProject: [p.pordProject ?? ''],
    });

    this.statusForm = this.fb.group({
      status: ['', Validators.required],
      businessDate: ['', Validators.required],
    });

    this.pmForm = this.fb.group({
      projectManagerId: ['', Validators.required],
    });

    this.dueDateForm = this.fb.group({
      dueDate: ['', Validators.required],
    });
  }

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  saveHeader(): void {
    if (this.headerForm.invalid) return;
    const raw = this.headerForm.getRawValue();
    this.projectService.updateProject(this.project.id, raw).subscribe({
      next: p => {
        this.project = p;
        this.editingHeader = false;
        this.snackBar.open('Project updated', 'Close', { duration: 3000 });
        this.initForms();
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Error updating project', 'Close', { duration: 4000 }),
    });
  }

  cancelHeader(): void {
    this.editingHeader = false;
    this.initForms();
  }

  // -------------------------------------------------------------------------
  // Status
  // -------------------------------------------------------------------------

  submitStatus(): void {
    if (this.statusForm.invalid) return;
    const value = this.statusForm.value;
    const payload = {
      status: value.status,
      businessDate: this.formatDate(value.businessDate),
    };
    this.projectService.changeStatus(this.project.id, payload).subscribe({
      next: p => {
        this.project = p;
        this.showStatusForm = false;
        this.isReadOnly = READ_ONLY_STATUSES.includes(p.currentStatus);
        this.snackBar.open('Status updated', 'Close', { duration: 3000 });
        this.statusForm.reset();
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Error updating status', 'Close', { duration: 4000 }),
    });
  }

  // -------------------------------------------------------------------------
  // Project Manager
  // -------------------------------------------------------------------------

  submitPm(): void {
    if (this.pmForm.invalid) return;
    this.projectService.changeProjectManager(this.project.id, this.pmForm.value).subscribe({
      next: p => {
        this.project = p;
        this.showPmForm = false;
        this.snackBar.open('Project manager updated', 'Close', { duration: 3000 });
        this.pmForm.reset();
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Error updating project manager', 'Close', { duration: 4000 }),
    });
  }

  // -------------------------------------------------------------------------
  // Due Date
  // -------------------------------------------------------------------------

  submitDueDate(): void {
    if (this.dueDateForm.invalid) return;
    const payload = { dueDate: this.formatDate(this.dueDateForm.value.dueDate) };
    this.projectService.changeDueDate(this.project.id, payload).subscribe({
      next: p => {
        this.project = p;
        this.showDueDateForm = false;
        this.snackBar.open('Due date updated', 'Close', { duration: 3000 });
        this.dueDateForm.reset();
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Error updating due date', 'Close', { duration: 4000 }),
    });
  }

  // -------------------------------------------------------------------------
  // Budget Lines
  // -------------------------------------------------------------------------

  openAddBudgetLine(): void {
    const ref = this.dialog.open(BudgetLineFormComponent, {
      width: '480px',
      data: {},
    });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.projectService.addBudgetLine(this.project.id, payload).subscribe({
        next: p => {
          this.project = p;
          this.snackBar.open('Budget line added', 'Close', { duration: 3000 });
        },
        error: err => this.snackBar.open(err.error?.message ?? 'Error adding budget line', 'Close', { duration: 4000 }),
      });
    });
  }

  openEditBudgetLine(line: BudgetLineEntry): void {
    const ref = this.dialog.open(BudgetLineFormComponent, {
      width: '480px',
      data: { line },
    });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.projectService.updateBudgetLine(this.project.id, line.id, payload).subscribe({
        next: p => {
          this.project = p;
          this.snackBar.open('Budget line updated', 'Close', { duration: 3000 });
        },
        error: err => this.snackBar.open(err.error?.message ?? 'Error updating budget line', 'Close', { duration: 4000 }),
      });
    });
  }

  deleteBudgetLine(line: BudgetLineEntry): void {
    if (!confirm(`Delete budget line of ${line.amount} €?`)) return;
    this.projectService.deleteBudgetLine(this.project.id, line.id).subscribe({
      next: p => {
        this.project = p;
        this.snackBar.open('Budget line deleted', 'Close', { duration: 3000 });
      },
      error: err => this.snackBar.open(err.error?.message ?? 'Error deleting budget line', 'Close', { duration: 4000 }),
    });
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  statusColor(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      DRAFT: 'default', BIA: 'accent', PROJECT: 'primary',
      CANCELED: 'warn', CLOSED: '',
    };
    return map[status] ?? '';
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().substring(0, 10);
  }
}