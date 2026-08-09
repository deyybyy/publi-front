import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'items' },
      {
        path: 'items',
        loadComponent: () =>
          import('./pages/admin-item-list/admin-item-list.component').then((m) => m.AdminItemListComponent),
      },
      {
        path: 'items/new',
        loadComponent: () =>
          import('./pages/admin-item-form/admin-item-form.component').then((m) => m.AdminItemFormComponent),
      },
      {
        path: 'items/:id/edit',
        loadComponent: () =>
          import('./pages/admin-item-form/admin-item-form.component').then((m) => m.AdminItemFormComponent),
      },
      {
        path: 'qr',
        loadComponent: () =>
          import('./pages/admin-qr-management/admin-qr-management.component').then(
            (m) => m.AdminQrManagementComponent,
          ),
      },
    ],
  },
];
