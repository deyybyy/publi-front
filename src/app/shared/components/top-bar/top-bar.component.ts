import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur"
    >
      <div class="flex w-10 items-center">
        @if (backTo) {
          <a [routerLink]="backTo" class="btn btn-ghost btn-circle btn-sm" aria-label="Volver">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
        }
      </div>

      <h1 class="flex items-center justify-center gap-1.5 truncate text-base font-serif font-semibold text-base-content">
        @if (logo) {
          <span aria-hidden="true">{{ logo }}</span>
        }
        {{ title }}
      </h1>

      <div class="flex w-10 items-center justify-end">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
})
export class TopBarComponent {
  @Input() title = '';
  @Input() logo: string | null = null;
  @Input() backTo: string | string[] | null = null;
}
