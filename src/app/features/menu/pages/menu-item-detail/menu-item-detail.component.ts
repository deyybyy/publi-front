import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ItemService } from '../../../../core/services/item.service';
import { QrService } from '../../../../core/services/qr.service';
import { desktopPresentationImage, mobilePresentationImage } from '../../../../core/utils/image.util';
import { PublicItemDetail } from '../../../../core/models/item.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { LinkifyPipe } from '../../../../shared/pipes/linkify.pipe';
import { TopBarComponent } from '../../../../shared/components/top-bar/top-bar.component';

@Component({
  selector: 'app-menu-item-detail',
  standalone: true,
  imports: [CurrencyPipe, TopBarComponent, LoadingSpinnerComponent, LinkifyPipe],
  template: `
    <app-top-bar [title]="item()?.title ?? 'Detalle'" backTo="/menu" />

    @if (loading()) {
      <app-loading-spinner message="Cargando…" />
    } @else if (item(); as item) {
      @if (item.status === 'unavailable') {
        <div role="alert" class="alert alert-warning m-4 rounded-xl text-sm">
          <span>🚫 Este producto no está disponible por el momento.</span>
        </div>
      }

      <!-- Carrusel: slide 0 es la imagen de presentación (4:3 en móvil, 16:9
           en escritorio, elegido por CSS). Las siguientes son la galería
           (siempre 4:3). Desliza en móvil; en escritorio hay flechas porque
           deslizar no es un gesto natural con mouse. -->
      <div class="relative" [class.grayscale]="item.status === 'unavailable'" [class.opacity-60]="item.status === 'unavailable'">
        <div
          #scrollContainer
          class="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          (scroll)="onScroll()"
        >
          <div class="aspect-[4/3] w-full shrink-0 snap-center overflow-hidden bg-base-300 md:aspect-video">
            @if (mobilePresentation) {
              <img [src]="mobilePresentation" [alt]="item.title" class="block h-full w-full object-cover md:hidden" />
            }
            @if (desktopPresentation) {
              <img [src]="desktopPresentation" [alt]="item.title" class="hidden h-full w-full object-cover md:block" />
            }
            @if (!mobilePresentation && !desktopPresentation) {
              <span class="flex h-full w-full items-center justify-center text-6xl">🌷</span>
            }
          </div>

          @for (photo of galleryImages; track $index) {
            <div class="aspect-[4/3] w-full shrink-0 snap-center overflow-hidden bg-base-300 md:aspect-video">
              <img [src]="photo" [alt]="item.title + ' — foto ' + ($index + 2)" class="h-full w-full object-cover" />
            </div>
          }
        </div>

        @if (totalSlides > 1) {
          <button
            type="button"
            class="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 border-none bg-base-100/70 backdrop-blur"
            (click)="goTo(activeIndex() - 1)"
            [disabled]="activeIndex() === 0"
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            class="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 border-none bg-base-100/70 backdrop-blur"
            (click)="goTo(activeIndex() + 1)"
            [disabled]="activeIndex() === totalSlides - 1"
            aria-label="Foto siguiente"
          >
            ›
          </button>

          <div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            @for (i of slideIndexes; track i) {
              <button
                type="button"
                class="h-1.5 w-1.5 rounded-full transition-all"
                [class.w-4]="i === activeIndex()"
                [class.bg-primary]="i === activeIndex()"
                [class.bg-base-100/60]="i !== activeIndex()"
                (click)="goTo(i)"
                [attr.aria-label]="'Ir a la foto ' + (i + 1)"
              ></button>
            }
          </div>
        }
      </div>

      <div class="space-y-4 p-4">
        <div>
          <h2 class="font-serif text-2xl font-semibold text-base-content">{{ item.title }}</h2>
          <p class="mt-1 text-xl font-semibold text-primary">
            {{ item.price | currency: item.currency : 'symbol-narrow' : '1.0-0' }}
          </p>
        </div>

        <p class="text-sm leading-relaxed text-base-content/70" [innerHTML]="item.description | linkify"></p>

        <div class="divider my-2"></div>

        <div class="rounded-xl border border-base-300 bg-base-200 p-4">
          <p class="mb-3 text-sm font-medium text-base-content">Comparte este ramo</p>
          <div class="flex items-center gap-4">
            <img [src]="qrUrl" alt="Código QR de este producto" class="h-24 w-24 rounded-lg border border-base-300 bg-white p-1" />
            <div class="flex flex-col gap-2">
              <p class="text-xs text-base-content/60">Cualquiera puede escanear este código para ver este producto directamente.</p>
              <button type="button" class="btn btn-outline btn-sm" (click)="downloadQr(item)">Descargar QR</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class MenuItemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemService = inject(ItemService);
  private readonly qrService = inject(QrService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  protected readonly item = signal<PublicItemDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly activeIndex = signal(0);
  protected qrUrl = '';
  protected galleryImages: string[] = [];
  protected mobilePresentation = '';
  protected desktopPresentation = '';

  protected get totalSlides(): number {
    return 1 + this.galleryImages.length;
  }

  protected get slideIndexes(): number[] {
    return Array.from({ length: this.totalSlides }, (_, i) => i);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/404']);
      return;
    }

    this.qrUrl = this.qrService.itemQrUrl(id);
    this.itemService.getPublicItem(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.galleryImages = item.galleryImages ?? [];
        this.mobilePresentation = mobilePresentationImage(item);
        this.desktopPresentation = desktopPresentationImage(item);
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/404']),
    });
  }

  goTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.totalSlides - 1));
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
    this.activeIndex.set(clamped);
  }

  onScroll(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el || el.clientWidth === 0) return;
    this.activeIndex.set(Math.round(el.scrollLeft / el.clientWidth));
  }

  downloadQr(item: PublicItemDetail): void {
    this.qrService.download(this.qrUrl, `qr-${item.id}.png`).subscribe();
  }
}
