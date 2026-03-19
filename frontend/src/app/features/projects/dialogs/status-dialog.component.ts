import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PROJECT_STATUSES, ProjectStatus, StatusChangePayload } from '../../../core/models/project.model';

export interface StatusDialogData {
  /** Pre-fill values when editing an existing history entry */
  status?: ProjectStatus;
  businessDate?: string;
}

@Component({
  selector: 'app-status-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatButtonModule, MatDatepickerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.status ? 'Edit Status Entry' : 'Change Status' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{ s }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Business Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="businessDate" />
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
export class StatusDialogComponent {
  private readonly fb        = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<StatusDialogComponent>);
  readonly data              = inject<StatusDialogData>(MAT_DIALOG_DATA);

  readonly statuses = PROJECT_STATUSES;

  form = this.fb.group({
    status:       this.fb.control<ProjectStatus | null>(
      (this.data?.status ?? null) as ProjectStatus | null,
      Validators.required
    ),
    businessDate: this.fb.control<Date | null>(
      this.data?.businessDate ? new Date(this.data.businessDate) : null,
      Validators.required
    ),
  });

  confirm(): void {
    if (this.form.invalid) return;
    const { status, businessDate } = this.form.value;
    const payload: StatusChangePayload = {
      status:       status!,
      businessDate: this.toDateStr(businessDate),
    };
    this.dialogRef.close(payload);
  }

  close(): void { this.dialogRef.close(null); }

  private toDateStr(d: Date | null | undefined): string {
    if (!d) return '';
    return d.toISOString().substring(0, 10);
  }
}