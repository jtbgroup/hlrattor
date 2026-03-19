import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import {
  ProjectDetail,
  ProjectStatus,
  PROJECT_STATUSES,
  READ_ONLY_STATUSES,
} from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly router         = inject(Router);
  private readonly route          = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly userService    = inject(UserService);
  private readonly authService    = inject(AuthService);
  readonly i18n                   = inject(I18nService);

  isEdit = false;
  loading = false;
  saving = false;
  error: string | null = null;

  projectManagers: { id: string; username: string }[] = [];
  readonly statuses = PROJECT_STATUSES;

  form = this.fb.group({
    name:            ['', Validators.required],
    reference:       ['', Validators.required],
    sciformaCode:    ['', Validators.required],
    pordBia:         [''],
    pordProject:     [''],
    // Creation-only fields
    projectManagerId: ['', Validators.required],
    initialStatus:   [('DRAFT' as ProjectStatus), Validators.required],
    statusDate:      [new Date(), Validators.required],
  });

  private editingProject: ProjectDetail | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    // Load project managers (needed for create; shown for info in edit)
    this.userService.listUsers().subscribe({
      next: users => {
        this.projectManagers = users
          .filter(u => u.roles?.includes('PROJECT_MANAGER') && u.enabled)
          .map(u => ({ id: u.id, username: u.username }));
      },
    });

    if (this.isEdit && id) {
      this.loading = true;
      this.projectService.getProject(id).subscribe({
        next: project => {
          this.editingProject = project;
          this.loading = false;

          // In edit mode, creation-only fields are not needed
          this.form.get('projectManagerId')?.clearValidators();
          this.form.get('projectManagerId')?.updateValueAndValidity();
          this.form.get('initialStatus')?.clearValidators();
          this.form.get('initialStatus')?.updateValueAndValidity();
          this.form.get('statusDate')?.clearValidators();
          this.form.get('statusDate')?.updateValueAndValidity();

          this.form.patchValue({
            name:         project.name,
            reference:    project.reference,
            sciformaCode: project.sciformaCode,
            pordBia:      project.pordBia ?? '',
            pordProject:  project.pordProject ?? '',
          });

          // Lock if project is in a read-only status
          if (READ_ONLY_STATUSES.includes(project.currentStatus)) {
            this.form.disable();
          }
        },
        error: () => {
          this.loading = false;
          this.error = this.i18n.translate('projectForm.errorLoad');
        },
      });
    }
  }

  get isReadOnly(): boolean {
    return !!this.editingProject && READ_ONLY_STATUSES.includes(this.editingProject.currentStatus);
  }

  cancel(): void {
    if (this.isEdit && this.editingProject) {
      this.router.navigate(['/projects', this.editingProject.id]);
    } else {
      this.router.navigate(['/projects']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.error = null;

    const v = this.form.value;

    if (this.isEdit && this.editingProject) {
      this.projectService.updateProject(this.editingProject.id, {
        name:         v.name ?? undefined,
        reference:    v.reference ?? undefined,
        sciformaCode: v.sciformaCode ?? undefined,
        pordBia:      v.pordBia || undefined,
        pordProject:  v.pordProject || undefined,
      }).subscribe({
        next: project => {
          this.saving = false;
          this.router.navigate(['/projects', project.id]);
        },
        error: () => {
          this.saving = false;
          this.error = this.i18n.translate('projectForm.errorLoad');
        },
      });
    } else {
      const statusDate = v.statusDate instanceof Date
        ? v.statusDate.toISOString().substring(0, 10)
        : String(v.statusDate ?? '').substring(0, 10);

      this.projectService.createProject({
        name:             v.name ?? '',
        reference:        v.reference ?? '',
        sciformaCode:     v.sciformaCode ?? '',
        pordBia:          v.pordBia || undefined,
        pordProject:      v.pordProject || undefined,
        projectManagerId: v.projectManagerId ?? '',
        initialStatus:    (v.initialStatus as ProjectStatus) ?? 'DRAFT',
        statusDate,
      }).subscribe({
        next: project => {
          this.saving = false;
          this.router.navigate(['/projects', project.id]);
        },
        error: () => {
          this.saving = false;
          this.error = this.i18n.translate('projectForm.errorLoad');
        },
      });
    }
  }
}