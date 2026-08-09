import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { BrandService } from '../../../../core/services/brand.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ItemService } from '../../../../core/services/item.service';
import { Category } from '../../../../core/models/category.model';
import { PublicItem } from '../../../../core/models/item.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ItemCardComponent } from '../../../../shared/components/item-card/item-card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TopBarComponent } from '../../../../shared/components/top-bar/top-bar.component';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [TopBarComponent, LoadingSpinnerComponent, EmptyStateComponent, ItemCardComponent],
  template: `
    <app-top-bar [title]="brand.name" [logo]="brand.logo" />

    @if (loading()) {
      <app-loading-spinner message="Cargando el catálogo…" />
    } @else if (errorMsg()) {
      <app-empty-state icon="⚠️" title="No pudimos cargar el catálogo" [message]="errorMsg()" />
    } @else {
      <nav class="scrollbar-none flex gap-2 overflow-x-auto border-b border-base-300 px-4 py-3">
        <button
          type="button"
          class="btn btn-sm shrink-0 rounded-full"
          [class.btn-primary]="activeCategoryId() === null"
          [class.btn-ghost]="activeCategoryId() !== null"
          (click)="activeCategoryId.set(null)"
        >
          Todos
        </button>
        @for (category of categories(); track category.id) {
          <button
            type="button"
            class="btn btn-sm shrink-0 rounded-full"
            [class.btn-primary]="activeCategoryId() === category.id"
            [class.btn-ghost]="activeCategoryId() !== category.id"
            (click)="activeCategoryId.set(category.id)"
          >
            {{ category.name }}
          </button>
        }
      </nav>

      @if (filteredItems().length === 0) {
        <app-empty-state icon="🌼" title="Nada por aquí todavía" message="Pronto agregaremos productos a esta categoría." />
      } @else {
        <div class="grid grid-cols-2 gap-3 p-4 pb-10">
          @for (item of filteredItems(); track item.id) {
            <app-item-card [item]="item" />
          }
        </div>
      }
    }
  `,
})
export class MenuListComponent implements OnInit {
  private readonly itemService = inject(ItemService);
  private readonly categoryService = inject(CategoryService);
  protected readonly brand = inject(BrandService);

  protected readonly items = signal<PublicItem[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly activeCategoryId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMsg = signal('');

  protected readonly filteredItems = computed(() => {
    const categoryId = this.activeCategoryId();
    const items = this.items();
    return categoryId ? items.filter((item) => item.categoryId === categoryId) : items;
  });

  ngOnInit(): void {
    forkJoin({
      items: this.itemService.getPublicMenu(),
      categories: this.categoryService.list(),
    }).subscribe({
      next: ({ items, categories }) => {
        this.items.set(items);
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Verifica tu conexión e intenta de nuevo en un momento.');
        this.loading.set(false);
      },
    });
  }
}
