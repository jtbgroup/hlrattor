import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-progression-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  templateUrl: './progression-form.component.html',
  styleUrl: './progression-form.component.scss',
})
export class ProgressionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly dialogRef = inject(MatDialogRef<ProgressionFormComponent>);

  readonly projectId: string = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';

  form = this.fb.group({
    progressionValue: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    progressionDate: [null as Date | null, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const v = this.form.getRawValue();
    this.projectService.addProgression(this.projectId, {
      progressionValue: v.progressionValue!,
      progressionDate: v.progressionDate!.toISOString().substring(0, 10),
    }).subscribe({
      next: result => { this.saving = false; this.dialogRef.close(result); },
      error: err => { this.saving = false; this.errorMessage = err.error?.message ?? 'Une erreur est survenue.'; },
    });
  }

  cancel(): void { this.dialogRef.close(null); }
}
