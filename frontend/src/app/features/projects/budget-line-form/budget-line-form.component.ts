import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BUDGET_LINE_TYPES, BudgetLineEntry } from '../../../core/models/project.model';

export interface BudgetLineDialogData {
  line?: BudgetLineEntry;
}

@Component({
  selector: 'app-budget-line-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
  ],
  templateUrl: './budget-line-form.component.html',
  styleUrls: ['./budget-line-form.component.scss'],
})
export class BudgetLineFormComponent implements OnInit {
  private readonly fb        = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BudgetLineFormComponent>);
  readonly data              = inject<BudgetLineDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  readonly types = BUDGET_LINE_TYPES;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data?.line;
    const line = this.data?.line;

    this.form = this.fb.group({
      type:          [line?.type ?? '', Validators.required],
      amount:        [line?.amount ?? null, [Validators.required, Validators.min(0)]],
      date:          [line?.date ? new Date(line.date) : '', Validators.required],
      pordReference: [line?.pordReference ?? ''],
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    this.dialogRef.close({
      ...value,
      date: this.formatDate(value.date),
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  private formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().substring(0, 10);
  }
}