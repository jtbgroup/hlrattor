import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProjectService, BudgetLinePayload, BudgetLineResponse, BudgetLineType } from '../../../core/services/project.service';

export interface BudgetLineDialogData {
  projectId: string;
  existing?: BudgetLineResponse;
}

@Component({
  selector: 'app-budget-line-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './budget-line-form.component.html',
  styleUrl: './budget-line-form.component.scss',
})
export class BudgetLineFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly dialogRef = inject(MatDialogRef<BudgetLineFormComponent>);

  readonly data: BudgetLineDialogData = inject(MAT_DIALOG_DATA);

  saving = false;
  errorMessage = '';
  isEdit = !!this.data.existing;

  readonly types: BudgetLineType[] = ['ENGAGEMENT_INITIAL', 'COMMANDE_COMPLEMENTAIRE', 'TRANSFERT'];
  readonly typeLabels: Record<BudgetLineType, string> = {
    ENGAGEMENT_INITIAL: 'Engagement initial',
    COMMANDE_COMPLEMENTAIRE: 'Commande complémentaire',
    TRANSFERT: 'Transfert',
  };

  form = this.fb.group({
    type: [this.data.existing?.type ?? ('' as BudgetLineType), Validators.required],
    amount: [this.data.existing?.amount ?? null, [Validators.required, Validators.min(0.01)]],
    date: [this.data.existing ? new Date(this.data.existing.date) : null as Date | null, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';

    const v = this.form.getRawValue();
    const payload: BudgetLinePayload = {
      type: v.type as BudgetLineType,
      amount: v.amount!,
      date: this.toIsoDate(v.date!),
    };

    const call = this.isEdit
      ? this.projectService.updateBudgetLine(this.data.projectId, this.data.existing!.id, payload)
      : this.projectService.addBudgetLine(this.data.projectId, payload);

    call.subscribe({
      next: result => { this.saving = false; this.dialogRef.close(result); },
      error: err => { this.saving = false; this.errorMessage = err.error?.message ?? 'Une erreur est survenue.'; },
    });
  }

  cancel(): void { this.dialogRef.close(null); }

  private toIsoDate(d: Date): string { return d.toISOString().substring(0, 10); }
}
