import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChangePasswordDto, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <!-- eslint-disable @angular-eslint/template/prefer-control-flow -->
    <div class="container">
      <h2>Change Password</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Current password</mat-label>
          <input matInput type="password" formControlName="currentPassword" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New password</mat-label>
          <input matInput type="password" formControlName="newPassword" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm new password</mat-label>
          <input matInput type="password" formControlName="confirmPassword" required />
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Change password</button>
        </div>

        <ng-container *ngIf="message">
          <div class="status">{{ message }}</div>
        </ng-container>
      </form>
    </div>
  `,
  styles: [
    `
      .container { max-width: 480px; margin: 24px auto; padding: 16px; }
      .full-width { width: 100%; }
      .actions { margin-top: 16px; }
      .status { margin-top: 16px; color: rgba(0, 0, 0, 0.7); }
    `
  ]
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  message = '';

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const payload = this.form.value as ChangePasswordDto;
    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.message = 'Password changed successfully.';
        this.form.reset();
      },
      error: () => {
        this.message = 'Unable to change password. Check your current password and try again.';
      }
    });
  }
}
