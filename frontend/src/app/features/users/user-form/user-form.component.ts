import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService, UserManagementDto } from '../../../core/services/user.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

const ALL_ROLES = ['ADMIN', 'PROJECT_MANAGER'];

@Component({
  selector: 'app-user-form',
  standalone: true,
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    TranslatePipe,
  ],
})
export class UserFormComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly availableRoles = ALL_ROLES;

  editingUser: UserManagementDto | null = null;
  error: string | null = null;

  userForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    roles: this.fb.control<string[]>([], Validators.required),
    enabled: [true],
  });

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userService.listUsers().subscribe({
        next: users => {
          const user = users.find(u => u.id === userId);
          if (!user) { this.router.navigate(['/admin/users']); return; }
          this.editingUser = user;
          this.userForm.reset({
            username: user.username,
            password: '',
            roles: [...user.roles],
            enabled: user.enabled,
          });
          this.userForm.get('password')?.clearValidators();
          this.userForm.get('password')?.updateValueAndValidity();
        },
        error: () => this.router.navigate(['/admin/users']),
      });
    } else {
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  get isEdit(): boolean {
    return !!this.editingUser;
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    const { username, password, roles, enabled } = this.userForm.value;

    if (this.editingUser) {
      this.userService.updateUser(this.editingUser.id, {
        roles: roles ?? [],
        enabled: enabled ?? false,
      }).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: () => { this.error = this.i18n.translate('userList.errorUpdate'); },
      });
      return;
    }

    this.userService.createUser({
      username: username ?? '',
      password: password ?? '',
      roles: roles ?? [],
      enabled: enabled ?? true,
    }).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: () => { this.error = this.i18n.translate('userList.errorCreate'); },
    });
  }
}
