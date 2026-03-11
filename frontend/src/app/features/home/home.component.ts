import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <!-- eslint-disable @angular-eslint/template/prefer-control-flow -->
    <mat-toolbar color="primary">
      <span>hlrattor</span>
      <span class="spacer"></span>
      <button mat-icon-button *ngIf="authService.currentUser()?.role === 'ADMIN'" [routerLink]="['/users']" title="User management">
        <mat-icon>group</mat-icon>
      </button>
      <button mat-icon-button [routerLink]="['/me/change-password']" title="Change password">
        <mat-icon>lock</mat-icon>
      </button>
      <span class="username">{{ authService.currentUser()?.username }}</span>
      <button mat-icon-button (click)="authService.logout()" title="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="content">
      <h2>Welcome, {{ authService.currentUser()?.username }}</h2>
      <p>Role: {{ authService.currentUser()?.role }}</p>
    </div>
  `,
  styles: [`
    .spacer { flex: 1; }
    .username { margin-right: 8px; font-size: 0.9rem; }
    .content { padding: 32px; }
  `]
})
export class HomeComponent {
  authService = inject(AuthService);
}
