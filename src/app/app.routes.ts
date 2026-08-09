import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'menu' },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/pages/menu-list/menu-list.component').then((m) => m.MenuListComponent),
  },
  {
    path: 'menu/item/:id',
    loadComponent: () =>
      import('./features/menu/pages/menu-item-detail/menu-item-detail.component').then(
        (m) => m.MenuItemDetailComponent,
      ),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  { path: '**', redirectTo: '404' },
];
