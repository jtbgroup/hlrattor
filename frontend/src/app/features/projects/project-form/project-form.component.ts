import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';

import { ProjectService, ProjectStatus } from '../../../core/services/project.service';
import { UserService, UserManagementDto } from '../../../core/services/user.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<ProjectFormComponent>);

  projectManagers: UserManagementDto[] = [];
  saving = false;
  errorMessage = '';

  readonly statuses: ProjectStatus[] = ['DRAFT', 'BIA', 'PROJECT', 'CANCELED', 'CLOSED'];
  readonly statusLabels: Record<ProjectStatus, string> = {
    DRAFT: 'Brouillon', BIA: 'BIA', PROJECT: 'Projet',
    CANCELED: 'Annulé', CLOSED: 'Clôturé',
  };

  form = this.fb.group({
    name: ['', Validators.required],
    reference: ['', Validators.required],
    sciformaCode: ['', Validators.required],
    pordBia: [''],
    pordProject: [''],
    projectManagerId: ['', Validators.required],
    initialStatus: ['' as ProjectStatus, Validators.required],
    statusDate: [null as Date | null, Validators.required],
  });

  ngOnInit(): void {
    this.userService.listUsers().subscribe(users => {
      this.projectManagers = users.filter(u => u.roles.includes('PROJECT_MANAGER') && u.enabled);
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const v = this.form.getRawValue();
    this.projectService.createProject({
      name: v.name!,
      reference: v.reference!,
      sciformaCode: v.sciformaCode!,
      pordBia: v.pordBia || undefined,
      pordProject: v.pordProject || undefined,
      projectManagerId: v.projectManagerId!,
      initialStatus: v.initialStatus as ProjectStatus,
      statusDate: this.toIsoDate(v.statusDate!),
    }).subscribe({
      next: project => { this.saving = false; this.dialogRef.close(project); },
      error: err => {
        this.saving = false;
        this.errorMessage = err.error?.message ?? 'Une erreur est survenue.';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().substring(0, 10);
  }
}
