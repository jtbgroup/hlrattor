import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  PROJECT_STATUSES,
  ProjectStatus,
  ProjectSummary,
} from '../../../core/models/project.model';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatButtonModule,
    MatChipsModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatDialogModule, MatIconModule,
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

  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.load();
  }

  load(): void {
    this.projectService.getProjects().subscribe(data => {
      this.projects = data;
      this.applyFilter();
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

  openCreate(): void {
    const ref = this.dialog.open(ProjectFormComponent, { width: '640px' });
    ref.afterClosed().subscribe(created => { if (created) this.load(); });
  }

  goToDetail(row: ProjectSummary): void {
    this.router.navigate(['/projects', row.id]);
  }

  sortData(sort: Sort): void {
    const data = [...this.filtered];
    if (!sort.active || sort.direction === '') {
      this.filtered = data;
      return;
    }
    this.filtered = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'reference': return compare(a.reference, b.reference, isAsc);
        case 'name': return compare(a.name, b.name, isAsc);
        case 'currentStatus': return compare(a.currentStatus, b.currentStatus, isAsc);
        case 'totalBudget': return compare(a.totalBudget, b.totalBudget, isAsc);
        default: return 0;
      }
    });
  }

  statusColor(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      DRAFT: 'default', BIA: 'accent', PROJECT: 'primary',
      CANCELED: 'warn', CLOSED: '',
    };
    return map[status] ?? '';
  }
}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}