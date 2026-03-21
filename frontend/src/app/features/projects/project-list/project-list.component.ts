import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ProjectService, ProjectSummary, ProjectStatus } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatChipsModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatFormFieldModule,
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

  readonly displayedColumns = ['reference', 'name', 'currentStatus', 'currentProjectManager',
    'currentDueDate', 'currentProgression', 'totalBudget'];

  projects = signal<ProjectSummary[]>([]);
  loading = signal(true);
  filterStatus = signal<ProjectStatus | ''>('');
  filterPm = signal('');

  isAdmin = this.authService.hasRole('ADMIN');

  filteredProjects = computed(() => {
    let list = this.projects();
    if (this.filterStatus()) {
      list = list.filter(p => p.currentStatus === this.filterStatus());
    }
    if (this.filterPm()) {
      list = list.filter(p =>
        p.currentProjectManager?.toLowerCase().includes(this.filterPm().toLowerCase()));
    }
    return list;
  });

  readonly statuses: ProjectStatus[] = ['DRAFT', 'BIA', 'PROJECT', 'CANCELED', 'CLOSED'];

  readonly statusLabels: Record<ProjectStatus, string> = {
    DRAFT: 'Brouillon', BIA: 'BIA', PROJECT: 'Projet',
    CANCELED: 'Annulé', CLOSED: 'Clôturé',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.projectService.getProjects().subscribe({
      next: list => { this.projects.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToDetail(project: ProjectSummary): void {
    this.router.navigate(['/projects', project.id]);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProjectFormComponent, { width: '640px' });
    ref.afterClosed().subscribe(created => { if (created) this.load(); });
  }

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
}
