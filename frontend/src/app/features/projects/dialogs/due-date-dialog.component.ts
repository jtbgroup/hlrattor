import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DueDateChangePayload } from '../../../core/models/project.model';

export interface DueDateDialogData {
  /** Pre-fill when editing an existing due-date history entry */
  dueDate?: string;
}

@Component({
  selector: 'app-due-date-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.dueDate ? 'Edit Due Date Entry' : 'Set Due Date' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate" />
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
export class DueDateDialogComponent {
  private readonly fb        = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DueDateDialogComponent>);
  readonly data              = inject<DueDateDialogData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    dueDate: this.fb.control<Date | null>(
      this.data.dueDate ? new Date(this.data.dueDate) : null,
      Validators.required
    ),
  });

  confirm(): void {
    if (this.form.invalid) return;
    const payload: DueDateChangePayload = {
      dueDate: this.toDateStr(this.form.value.dueDate),
    };
    this.dialogRef.close(payload);
  }

  close(): void { this.dialogRef.close(null); }

  private toDateStr(d: Date | null | undefined): string {
    if (!d) return '';
    return d.toISOString().substring(0, 10);
  }
}