import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { UserService, UserManagementDto } from '../../../core/services/user.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  users: UserManagementDto[] = [];
  displayedColumns = ['username', 'roles', 'enabled', 'actions'];
  error: string | null = null;

  ngOnInit() {
    this.reload();
  }

  goToCreate() {
    this.router.navigate(['/admin/users/new']);
  }

  goToEdit(user: UserManagementDto) {
    this.router.navigate(['/admin/users', user.id, 'edit']);
  }

  disable(user: UserManagementDto) {
    this.userService.disableUser(user.id).subscribe({
      next: () => this.reload(),
      error: () => (this.error = this.i18n.translate('userList.errorDisable')),
    });
  }

  private reload() {
    this.userService.listUsers().subscribe({
      next: users => (this.users = users),
      error: () => (this.error = this.i18n.translate('userList.errorLoad')),
    });
  }
}
