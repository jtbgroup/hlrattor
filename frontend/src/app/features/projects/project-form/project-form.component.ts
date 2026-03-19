import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CreateProjectPayload,
  ProjectDetail,
  UpdateProjectPayload,
} from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly userService    = inject(UserService);
  private readonly authService    = inject(AuthService);

  form!: FormGroup;
  projectManagers: { id: string; username: string }[] = [];
  error = '';
  saving = false;
  loading = false;

  isEdit  = false;
  isAdmin = false;
  private projectId: string | null = null;

  readonly today = new Date();

  ngOnInit(): void {
    this.isAdmin   = this.authService.hasRole('ADMIN');
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isEdit    = !!this.projectId;

    this.userService.listUsers().subscribe(users => {
      this.projectManagers = users
        .filter(u => u.roles?.includes('PROJECT_MANAGER') && u.enabled)
        .map(u => ({ id: u.id, username: u.username }));
    });

    if (this.isEdit && this.projectId) {
      this.loading = true;
      this.projectService.getProject(this.projectId).subscribe({
        next: p => { this.loading = false; this.buildForm(p); },
        error: () => { this.loading = false; this.buildForm(null); },
      });
    } else {
      this.buildForm(null);
    }
  }

  private buildForm(p: ProjectDetail | null): void {
    this.form = this.fb.group({
      name:         [p?.name ?? '', Validators.required],
      sciformaCode: [p?.sciformaCode ?? ''],
      pordBia:      [p?.pordBia ?? ''],
      pordProject:  [p?.pordProject ?? ''],
      ...(!this.isEdit ? { projectManagerId: ['', Validators.required] } : {}),
    });

    if (this.isEdit && !this.isAdmin) {
      this.form.get('name')?.disable();
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.error  = '';

    if (this.isEdit && this.projectId) {
      const payload: UpdateProjectPayload = this.form.getRawValue();
      this.projectService.updateProject(this.projectId, payload).subscribe({
        next: (p: ProjectDetail) => this.router.navigate(['/projects', p.id]),
        error: err => { this.error = err.error?.message ?? 'An error occurred'; this.saving = false; },
      });
    } else {
      const raw = this.form.value as Omit<CreateProjectPayload, 'initialStatus' | 'statusDate'>;
      const payload: CreateProjectPayload = {
        ...raw,
        initialStatus: 'DRAFT',
        statusDate:    this.formatDate(this.today),
      };
      this.projectService.createProject(payload).subscribe({
        next: (p: ProjectDetail) => this.router.navigate(['/projects', p.id]),
        error: err => { this.error = err.error?.message ?? 'An error occurred'; this.saving = false; },
      });
    }
  }

  cancel(): void {
    if (this.isEdit && this.projectId) {
      this.router.navigate(['/projects', this.projectId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }
}