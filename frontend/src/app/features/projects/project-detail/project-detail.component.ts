import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  BudgetLineEntry,
  DueDateHistoryEntry,
  ProjectDetail,
  ProjectManagerHistoryEntry,
  ProjectStatusHistoryEntry,
  READ_ONLY_STATUSES,
} from '../../../core/models/project.model';
import { BudgetLineFormComponent } from '../budget-line-form/budget-line-form.component';
import { StatusDialogComponent, StatusDialogData } from '../dialogs/status-dialog.component';
import { PmDialogComponent, PmDialogData, PmDialogResult } from '../dialogs/pm-dialog.component';
import { DueDateDialogComponent, DueDateDialogData } from '../dialogs/due-date-dialog.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  project!: ProjectDetail;
  loading = true;

  isAdmin      = false;
  isAssignedPm = false;
  canEdit      = false;
  isReadOnly   = false;

  projectManagers: { id: string; username: string }[] = [];

  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly userService    = inject(UserService);
  private readonly authService    = inject(AuthService);
  private readonly dialog         = inject(MatDialog);
  private readonly snackBar       = inject(MatSnackBar);

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);

    if (this.isAdmin) {
      this.userService.listUsers().subscribe(users => {
        this.projectManagers = users
          .filter(u => u.roles?.includes('PROJECT_MANAGER') && u.enabled)
          .map(u => ({ id: u.id, username: u.username }));
      });
    }
  }

  load(id: string): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe(p => {
      this.project      = p;
      this.loading      = false;
      const me          = this.authService.currentUser();
      this.isAssignedPm = p.currentProjectManager === me?.username;
      this.canEdit      = this.isAdmin || this.isAssignedPm;
      this.isReadOnly   = READ_ONLY_STATUSES.includes(p.currentStatus);
    });
  }

  goBack(): void  { this.router.navigate(['/projects']); }
  goToEdit(): void { this.router.navigate(['/projects', this.project.id, 'edit']); }

  // ── Status ────────────────────────────────────────────────────────────────

  openStatusDialog(existing?: ProjectStatusHistoryEntry): void {
    const data: StatusDialogData = existing
      ? { status: existing.status, businessDate: existing.businessDate }
      : {};
    const ref = this.dialog.open(StatusDialogComponent, { width: '400px', data });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.projectService.changeStatus(this.project.id, payload).subscribe({
        next: p => {
          this.project    = p;
          this.isReadOnly = READ_ONLY_STATUSES.includes(p.currentStatus);
          this.snackBar.open('Status updated', 'Close', { duration: 3000 });
        },
        error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Close', { duration: 4000 }),
      });
    });
  }

  // ── Project Manager ───────────────────────────────────────────────────────

  openPmDialog(existing?: ProjectManagerHistoryEntry): void {
    const data: PmDialogData = {
      projectManagers: this.projectManagers,
      currentPmId:     existing ? this.pmIdByUsername(existing.projectManager) : undefined,
      startDate:       existing?.startDate,
    };
    const ref = this.dialog.open(PmDialogComponent, { width: '400px', data });
    ref.afterClosed().subscribe((result: PmDialogResult | null) => {
      if (!result) return;
      this.projectService.changeProjectManager(this.project.id, { projectManagerId: result.projectManagerId }).subscribe({
        next: p => { this.project = p; this.snackBar.open('Project manager updated', 'Close', { duration: 3000 }); },
        error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Close', { duration: 4000 }),
      });
    });
  }

  // ── Due Date ──────────────────────────────────────────────────────────────

  openDueDateDialog(existing?: DueDateHistoryEntry): void {
    const data: DueDateDialogData = { dueDate: existing?.dueDate };
    const ref = this.dialog.open(DueDateDialogComponent, { width: '400px', data });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.projectService.changeDueDate(this.project.id, payload).subscribe({
        next: p => { this.project = p; this.snackBar.open('Due date updated', 'Close', { duration: 3000 }); },
        error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Close', { duration: 4000 }),
      });
    });
  }

  // ── History delete ────────────────────────────────────────────────────────

  deleteStatusEntry(h: ProjectStatusHistoryEntry): void {
    if (!confirm(`Delete status entry "${h.status}" (${h.businessDate})?`)) return;
    // TODO: wire to DELETE /api/projects/:id/status/:historyId when available
    this.snackBar.open('History deletion not yet supported by the API', 'Close', { duration: 4000 });
  }

  deletePmEntry(h: ProjectManagerHistoryEntry): void {
    if (!confirm(`Delete PM entry "${h.projectManager}"?`)) return;
    // TODO: wire to DELETE /api/projects/:id/project-manager/:historyId when available
    this.snackBar.open('History deletion not yet supported by the API', 'Close', { duration: 4000 });
  }

  deleteDueDateEntry(h: DueDateHistoryEntry): void {
    if (!confirm(`Delete due date entry "${h.dueDate}"?`)) return;
    // TODO: wire to DELETE /api/projects/:id/due-date/:historyId when available
    this.snackBar.open('History deletion not yet supported by the API', 'Close', { duration: 4000 });
  }

  // ── Budget lines ──────────────────────────────────────────────────────────

  openAddBudgetLine(): void {
    const ref = this.dialog.open(BudgetLineFormComponent, { width: '480px', data: {} });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.projectService.addBudgetLine(this.project.id, payload).subscribe({
        next: p => { this.project = p; this.snackBar.open('Budget line added', 'Close', { duration: 3000 }); },
        error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Close', { duration: 4000 }),
      });
    });
  }

  openEditBudgetLine(line: BudgetLineEntry): void {
    const ref = this.dialog.open(BudgetLineFormComponent, { width: '480px', data: { line } });
    ref.afterClosed().subscribe(payload => {
      if (!payload) return;
      this.projectService.updateBudgetLine(this.project.id, line.id, payload).subscribe({
        next: p => { this.project = p; this.snackBar.open('Budget line updated', 'Close', { duration: 3000 }); },
        error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Close', { duration: 4000 }),
      });
    });
  }

  deleteBudgetLine(line: BudgetLineEntry): void {
    if (!confirm(`Delete budget line of ${line.amount} €?`)) return;
    this.projectService.deleteBudgetLine(this.project.id, line.id).subscribe({
      next: p => { this.project = p; this.snackBar.open('Budget line deleted', 'Close', { duration: 3000 }); },
      error: err => this.snackBar.open(err.error?.message ?? 'Error', 'Close', { duration: 4000 }),
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private pmIdByUsername(username: string): string | undefined {
    return this.projectManagers.find(pm => pm.username === username)?.id;
  }
}