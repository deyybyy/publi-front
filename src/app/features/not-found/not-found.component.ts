import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <span class="text-6xl">🥀</span>
      <h1 class="font-serif text-3xl font-semibold text-base-content">Página no encontrada</h1>
      <p class="max-w-xs text-sm text-base-content/60">
        El enlace o código QR que escaneaste no corresponde a ningún producto de nuestro catálogo.
      </p>
      <a routerLink="/menu" class="btn btn-primary mt-2 rounded-full px-6">Ver catálogo</a>
    </div>
  `,
})
export class NotFoundComponent {}
