import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectService, ProjectSummary, ProjectStatus } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatDialogModule,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly zone = inject(NgZone);
  readonly i18n = inject(I18nService);

  readonly displayedColumns = ['reference', 'name', 'currentStatus', 'currentProjectManager',
    'currentDueDate', 'currentProgression', 'totalBudget'];

  projects: ProjectSummary[] = [];
  filteredProjects: ProjectSummary[] = [];
  error: string | null = null;

  selectedStatus: ProjectStatus | '' = '';
  pmFilter = '';

  isAdmin = this.authService.hasRole('ADMIN');

  readonly statuses: ProjectStatus[] = ['DRAFT', 'BIA', 'PROJECT', 'CANCELED', 'CLOSED'];
  readonly statusLabels: Record<ProjectStatus, string> = {
    DRAFT: 'Brouillon', BIA: 'BIA', PROJECT: 'Projet',
    CANCELED: 'Annulé', CLOSED: 'Clôturé',
  };

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.projectService.getProjects().subscribe({
      next: list => {
        this.zone.run(() => {
          this.projects = list;
          this.filteredProjects = [...list];
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = this.i18n.translate('projectList.errorLoad');
        });
      },
    });
  }

  onStatusChange(value: ProjectStatus | ''): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  onPmFilterChange(value: string): void {
    this.pmFilter = value;
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = this.projects;
    if (this.selectedStatus) list = list.filter(p => p.currentStatus === this.selectedStatus);
    if (this.pmFilter) list = list.filter(p =>
      p.currentProjectManager?.toLowerCase().includes(this.pmFilter.toLowerCase()));
    this.filteredProjects = [...list];
  }

  goToDetail(p: ProjectSummary): void {
    this.router.navigate(['/projects', p.id]);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProjectFormComponent, { width: '640px' });
    ref.afterClosed().subscribe(created => { if (created) this.reload(); });
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status as ProjectStatus] ?? status;
  }
}