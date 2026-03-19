import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  PROJECT_STATUSES,
  ProjectStatus,
  ProjectSummary,
} from '../../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule,
    MatSelectModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatTooltipModule,
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  projects: ProjectSummary[] = [];
  filtered: ProjectSummary[] = [];

  displayedColumns = ['reference', 'name', 'currentStatus', 'currentProjectManager', 'currentDueDate', 'totalBudget', 'actions'];
  readonly statuses = PROJECT_STATUSES;

  filterStatus: ProjectStatus | '' = '';
  filterPm = '';

  isAdmin = false;
  error: string | null = null;

  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.load();
  }

  load(): void {
    this.projectService.getProjects().subscribe({
      next: data => {
        this.projects = data;
        this.applyFilter();
      },
      error: () => { this.error = 'Failed to load projects.'; },
    });
  }

  applyFilter(): void {
    this.filtered = this.projects.filter(p => {
      const matchStatus = !this.filterStatus || p.currentStatus === this.filterStatus;
      const matchPm = !this.filterPm ||
        (p.currentProjectManager ?? '').toLowerCase().includes(this.filterPm.toLowerCase());
      return matchStatus && matchPm;
    });
  }

  goToCreate(): void {
    this.router.navigate(['/projects', 'new']);
  }

  goToDetail(row: ProjectSummary): void {
    this.router.navigate(['/projects', row.id]);
  }
}