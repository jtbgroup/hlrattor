import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProjectManagerChangePayload } from '../../../core/models/project.model';

export interface PmDialogData {
  projectManagers: { id: string; username: string }[];
  /** Pre-fill when editing an existing PM history entry */
  currentPmId?: string;
  startDate?: string;
}

export interface PmDialogResult extends ProjectManagerChangePayload {
  startDate: string;
}

@Component({
  selector: 'app-pm-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatInputModule,
    MatButtonModule, MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.currentPmId ? 'Edit Project Manager' : 'Change Project Manager' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Project Manager</mat-label>
          <mat-select formControlName="projectManagerId">
            @for (pm of data.projectManagers; track pm.id) {
              <mat-option [value]="pm.id">{{ pm.username }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Effective Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="startDate" />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button class="btn-save" (click)="confirm()" [disabled]="form.invalid">Apply</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; min-width: 340px; padding-top: 8px; }
    mat-form-field { width: 100%; }
  `],
})
export class PmDialogComponent {
  private readonly fb        = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PmDialogComponent>);
  readonly data              = inject<PmDialogData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    projectManagerId: this.fb.control<string | null>(this.data.currentPmId ?? null, Validators.required),
    startDate:        this.fb.control<Date | null>(
      this.data.startDate ? new Date(this.data.startDate) : null,
      Validators.required
    ),
  });

  confirm(): void {
    if (this.form.invalid) return;
    const { projectManagerId, startDate } = this.form.value;
    const result: PmDialogResult = {
      projectManagerId: projectManagerId!,
      startDate: this.toDateStr(startDate),
    };
    this.dialogRef.close(result);
  }

  close(): void { this.dialogRef.close(null); }

  private toDateStr(d: Date | null | undefined): string {
    if (!d) return '';
    return d.toISOString().substring(0, 10);
  }
}