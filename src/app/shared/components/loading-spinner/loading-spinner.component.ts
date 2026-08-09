import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      @if (message) {
        <p class="text-sm text-base-content/60">{{ message }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message = '';
}
