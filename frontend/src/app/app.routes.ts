import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    // Shell layout: header + router-outlet for all protected pages
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'me/change-password',
        loadComponent: () =>
          import('./features/users/change-password/change-password.component').then(
            m => m.ChangePasswordComponent
          )
      },
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'admin/users/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'admin/users/:id/edit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];