import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CategoryService } from '../../../../core/services/category.service';
import { ItemService } from '../../../../core/services/item.service';
import { AdminItem } from '../../../../core/models/item.model';
import { Category } from '../../../../core/models/category.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-item-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="relative min-h-[calc(100dvh-104px)] p-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-serif text-lg font-semibold text-base-content">Gestión del catálogo</h2>
        <a routerLink="/admin/items/new" class="btn btn-primary btn-sm rounded-full">+ Nuevo</a>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Cargando ítems…" />
      } @else if (items().length === 0) {
        <app-empty-state icon="🌷" title="Aún no hay productos" message="Crea el primero con el botón de arriba." />
      } @else {
        <ul class="flex flex-col divide-y divide-base-300 rounded-xl border border-base-300 bg-base-200">
          @for (item of items(); track item.id) {
            <li class="flex items-center gap-3 p-3">
              <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-base-300">
                @if (thumbnail(item)) {
                  <img [src]="thumbnail(item)" [alt]="item.title" class="h-full w-full object-cover" />
                } @else {
                  <span class="flex h-full w-full items-center justify-center text-lg">🌷</span>
                }
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-base-content">{{ item.title }}</p>
                <p class="text-xs text-base-content/60">
                  {{ item.price | currency: item.currency : 'symbol-narrow' : '1.0-0' }}
                  · {{ categoryName(item.categoryId) }}
                </p>
              </div>

              @if (item.deletedAt) {
                <span class="badge badge-error badge-outline shrink-0 text-xs">Eliminado</span>
                <button type="button" class="btn btn-ghost btn-xs shrink-0" (click)="restore(item)">Restaurar</button>
              } @else {
                <input
                  type="checkbox"
                  class="toggle toggle-primary toggle-sm shrink-0"
                  [checked]="item.available"
                  (change)="toggleAvailable(item)"
                  [attr.aria-label]="'Disponibilidad de ' + item.title"
                />
                <a
                  [routerLink]="['/admin/items', item.id, 'edit']"
                  class="btn btn-ghost btn-circle btn-xs shrink-0"
                  aria-label="Editar"
                >
                  ✏️
                </a>
                <button
                  type="button"
                  class="btn btn-ghost btn-circle btn-xs shrink-0 text-error"
                  (click)="softDelete(item)"
                  aria-label="Eliminar"
                >
                  🗑️
                </button>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AdminItemListComponent implements OnInit {
  private readonly itemService = inject(ItemService);
  private readonly categoryService = inject(CategoryService);

  protected readonly items = signal<AdminItem[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      items: this.itemService.listAdmin(),
      categories: this.categoryService.list(),
    }).subscribe(({ items, categories }) => {
      this.items.set(items);
      this.categories.set(categories);
      this.loading.set(false);
    });
  }

  categoryName(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.name ?? categoryId;
  }

  /** The list row doesn't carry the gallery (see ItemService.listAdmin), so
   * toggling from here re-fetches the full item first — sending this row's
   * data straight back would silently wipe out its gallery on every PUT. */
  toggleAvailable(item: AdminItem): void {
    this.itemService.getAdminItem(item.id).subscribe((full) => {
      this.itemService
        .update(item.id, {
          title: full.title,
          description: full.description,
          price: full.price,
          currency: full.currency,
          categoryId: full.categoryId,
          available: !full.available,
          presentationImage4x3: full.presentationImage4x3,
          presentationImage16x9: full.presentationImage16x9,
          galleryImages: full.galleryImages,
        })
        .subscribe(() => this.load());
    });
  }

  thumbnail(item: AdminItem): string {
    return item.presentationImage4x3 || item.presentationImage16x9 || '';
  }

  softDelete(item: AdminItem): void {
    if (!confirm(`¿Eliminar "${item.title}"? Podrás restaurarlo después.`)) return;
    this.itemService.softDelete(item.id).subscribe(() => this.load());
  }

  restore(item: AdminItem): void {
    this.itemService.restore(item.id).subscribe(() => this.load());
  }
}
