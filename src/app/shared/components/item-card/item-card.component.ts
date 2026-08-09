import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { desktopPresentationImage, mobilePresentationImage } from '../../../core/utils/image.util';
import { PublicItem } from '../../../core/models/item.model';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a
      [routerLink]="['/menu/item', item.id]"
      class="card bg-base-200 shadow-sm transition hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
    >
      <figure class="aspect-[4/3] overflow-hidden bg-base-300 md:aspect-video">
        <!-- 4:3 on phone-width screens, 16:9 on desktop-width ones — pure
             CSS so it stays correct on resize without any JS. -->
        @if (mobileImg) {
          <img [src]="mobileImg" [alt]="item.title" class="block h-full w-full object-cover md:hidden" loading="lazy" />
        }
        @if (desktopImg) {
          <img [src]="desktopImg" [alt]="item.title" class="hidden h-full w-full object-cover md:block" loading="lazy" />
        }
        @if (!mobileImg && !desktopImg) {
          <span class="flex h-full w-full items-center justify-center text-3xl">🌷</span>
        }
      </figure>
      <div class="card-body gap-1 p-3">
        <h3 class="line-clamp-1 text-sm font-medium text-base-content">{{ item.title }}</h3>
        <p class="line-clamp-2 text-xs text-base-content/60">{{ item.description }}</p>
        <p class="mt-1 text-sm font-semibold text-primary">
          {{ item.price | currency: item.currency : 'symbol-narrow' : '1.0-0' }}
        </p>
      </div>
    </a>
  `,
})
export class ItemCardComponent {
  @Input({ required: true }) item!: PublicItem;

  protected get mobileImg(): string {
    return mobilePresentationImage(this.item);
  }

  protected get desktopImg(): string {
    return desktopPresentationImage(this.item);
  }
}
