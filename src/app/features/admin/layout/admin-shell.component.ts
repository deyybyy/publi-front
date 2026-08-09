import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { BrandService } from '../../../core/services/brand.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-dvh flex-col bg-base-100">
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur">
        <div class="flex items-center gap-2">
          <span class="text-xl" aria-hidden="true">{{ brand.logo }}</span>
          <span class="font-serif font-semibold text-base-content">{{ brand.name }} Admin</span>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" (click)="logout()">Salir</button>
      </header>

      <nav class="flex gap-1 border-b border-base-300 px-4">
        <a
          routerLink="/admin/items"
          routerLinkActive="border-primary text-primary"
          class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-base-content/60"
        >
          Menú
        </a>
        <a
          routerLink="/admin/qr"
          routerLinkActive="border-primary text-primary"
          class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-base-content/60"
        >
          Códigos QR
        </a>
      </nav>

      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly brand = inject(BrandService);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
