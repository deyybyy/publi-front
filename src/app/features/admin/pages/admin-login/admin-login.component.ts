import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { BrandService } from '../../../../core/services/brand.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-dvh items-center justify-center bg-base-100 p-6">
      <form class="card w-full max-w-sm bg-base-200 shadow-lg" (ngSubmit)="submit()">
        <div class="card-body gap-4">
          <div class="text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-2xl" aria-hidden="true">{{ brand.logo }}</div>
            <h1 class="mt-3 font-serif text-xl font-semibold text-base-content">Panel de administración</h1>
            <p class="text-xs text-base-content/60">{{ brand.name }}</p>
          </div>

          <label class="form-control">
            <span class="label-text mb-1 text-sm">Usuario</span>
            <input
              type="text"
              name="username"
              class="input input-bordered w-full"
              [(ngModel)]="username"
              autocomplete="username"
              required
            />
          </label>

          <label class="form-control">
            <span class="label-text mb-1 text-sm">Contraseña</span>
            <input
              type="password"
              name="password"
              class="input input-bordered w-full"
              [(ngModel)]="password"
              autocomplete="current-password"
              required
            />
          </label>

          @if (errorMsg()) {
            <p class="text-sm text-error">{{ errorMsg() }}</p>
          }

          <button type="submit" class="btn btn-primary mt-2" [disabled]="submitting()">
            @if (submitting()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            Ingresar
          </button>
        </div>
      </form>
    </div>
  `,
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly brand = inject(BrandService);

  protected username = '';
  protected password = '';
  protected readonly submitting = signal(false);
  protected readonly errorMsg = signal('');

  submit(): void {
    if (!this.username || !this.password) return;

    this.submitting.set(true);
    this.errorMsg.set('');

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/admin/items';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.errorMsg.set('Usuario o contraseña incorrectos.');
        this.submitting.set(false);
      },
    });
  }
}
