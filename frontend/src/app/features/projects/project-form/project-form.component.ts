import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { PROJECT_STATUSES } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly dialogRef = inject(MatDialogRef<ProjectFormComponent>);

  form!: FormGroup;
  projectManagers: { id: string; username: string }[] = [];
  readonly statuses = PROJECT_STATUSES;
  error = '';
  saving = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      reference: ['', Validators.required],
      sciformaCode: ['', Validators.required],
      pordBia: [''],
      pordProject: [''],
      projectManagerId: ['', Validators.required],
      initialStatus: ['', Validators.required],
      statusDate: ['', Validators.required],
    });

    this.userService.listUsers().subscribe(users => {
      this.projectManagers = users
        .filter(u => u.roles?.includes('PROJECT_MANAGER') && u.enabled)
        .map(u => ({ id: u.id, username: u.username }));
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.error = '';

    const value = this.form.value;
    const payload = {
      ...value,
      statusDate: this.formatDate(value.statusDate),
    };

    this.projectService.createProject(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => {
        this.error = err.error?.message ?? 'An error occurred';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().substring(0, 10);
  }
}