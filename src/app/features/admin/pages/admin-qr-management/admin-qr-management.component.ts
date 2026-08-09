import { Component, OnInit, inject, signal } from '@angular/core';

import { ItemService } from '../../../../core/services/item.service';
import { QrService } from '../../../../core/services/qr.service';
import { AdminItem } from '../../../../core/models/item.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-qr-management',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="flex flex-col gap-6 p-4">
      <section class="card items-center bg-base-200 p-5 text-center">
        <p class="font-serif text-base font-semibold text-base-content">QR General</p>
        <img [src]="generalQrUrl" alt="Código QR general del catálogo" class="my-3 h-40 w-40 rounded-lg bg-white p-2" />
        <p class="break-all text-xs text-base-content/60">{{ generalTargetUrl() }}</p>
        <button type="button" class="btn btn-primary btn-sm mt-3 rounded-full" (click)="downloadGeneral()">
          Descargar
        </button>
      </section>

      <section>
        <h3 class="mb-3 font-serif text-base font-semibold text-base-content">QR por producto</h3>

        @if (loading()) {
          <app-loading-spinner />
        } @else {
          <ul class="flex flex-col divide-y divide-base-300 rounded-xl border border-base-300 bg-base-200">
            @for (item of items(); track item.id) {
              <li class="flex items-center gap-3 p-3">
                <div class="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-base-300">
                  @if (thumbnail(item)) {
                    <img [src]="thumbnail(item)" [alt]="item.title" class="h-full w-full object-cover" />
                  } @else {
                    <span class="flex h-full w-full items-center justify-center text-lg">🌷</span>
                  }
                </div>
                <p class="flex-1 truncate text-sm text-base-content">{{ item.title }}</p>
                <img [src]="qr.itemQrUrl(item.id, 96)" [alt]="'QR de ' + item.title" class="h-11 w-11 rounded bg-white p-0.5" />
                <button
                  type="button"
                  class="btn btn-ghost btn-circle btn-sm"
                  (click)="downloadItem(item)"
                  aria-label="Descargar QR"
                >
                  ⬇️
                </button>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
})
export class AdminQrManagementComponent implements OnInit {
  protected readonly qr = inject(QrService);
  private readonly itemService = inject(ItemService);

  protected readonly items = signal<AdminItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly generalTargetUrl = signal('');
  protected readonly generalQrUrl = this.qr.generalMenuQrUrl();

  ngOnInit(): void {
    this.qr.getGeneralMenuQr().subscribe(({ targetUrl }) => this.generalTargetUrl.set(targetUrl));

    this.itemService.listAdmin().subscribe((items) => {
      this.items.set(items.filter((item) => !item.deletedAt));
      this.loading.set(false);
    });
  }

  downloadGeneral(): void {
    this.qr.download(this.generalQrUrl, 'qr-menu-general.png').subscribe();
  }

  thumbnail(item: AdminItem): string {
    return item.presentationImage4x3 || item.presentationImage16x9 || '';
  }

  downloadItem(item: AdminItem): void {
    this.qr.download(this.qr.itemQrUrl(item.id), `qr-${item.id}.png`).subscribe();
  }
}
