import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-2 py-16 px-6 text-center">
      <div class="text-4xl">{{ icon }}</div>
      <p class="font-serif text-lg text-base-content">{{ title }}</p>
      @if (message) {
        <p class="max-w-xs text-sm text-base-content/60">{{ message }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '🌸';
  @Input() title = '';
  @Input() message = '';
}
