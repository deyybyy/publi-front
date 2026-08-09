import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CategoryService } from '../../../../core/services/category.service';
import { ItemService } from '../../../../core/services/item.service';
import { Category } from '../../../../core/models/category.model';
import { ItemFormValue } from '../../../../core/models/item.model';
import { fileToCompressedDataUrl } from '../../../../core/utils/image.util';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

const MAX_GALLERY_IMAGES = 3;
const PRESENTATION_MAX_WIDTH = 1600;
const GALLERY_MAX_WIDTH = 1200;

@Component({
  selector: 'app-admin-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="p-4">
      <div class="mb-4 flex items-center gap-2">
        <a routerLink="/admin/items" class="btn btn-ghost btn-circle btn-sm" aria-label="Volver">←</a>
        <h2 class="font-serif text-lg font-semibold text-base-content">
          {{ itemId ? 'Editar producto' : 'Nuevo producto' }}
        </h2>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" class="flex max-w-md flex-col gap-5">
          <label class="form-control">
            <span class="label-text mb-1 text-sm">Título</span>
            <input type="text" class="input input-bordered w-full" formControlName="title" />
          </label>

          <label class="form-control">
            <span class="label-text mb-1 text-sm">Descripción</span>
            <textarea class="textarea textarea-bordered w-full" rows="3" formControlName="description"></textarea>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="form-control">
              <span class="label-text mb-1 text-sm">Precio</span>
              <input type="number" min="0" step="1" class="input input-bordered w-full" formControlName="price" />
            </label>
            <label class="form-control">
              <span class="label-text mb-1 text-sm">Moneda</span>
              <select class="select select-bordered w-full" formControlName="currency">
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>

          <label class="form-control">
            <span class="label-text mb-1 text-sm">Categoría</span>
            <select class="select select-bordered w-full" formControlName="categoryId">
              @for (category of categories(); track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>

          <div class="divider my-0 text-xs text-base-content/50">Imágenes de presentación (tarjetas del catálogo)</div>

          <div class="flex flex-col gap-2">
            <span class="label-text text-sm">Formato 4:3 — se ve en teléfonos</span>
            <div class="flex items-center gap-3">
              <div class="aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-lg border border-base-300 bg-base-300">
                @if (presentation4x3()) {
                  <img [src]="presentation4x3()" class="h-full w-full object-cover" alt="Vista previa 4:3" />
                } @else {
                  <span class="flex h-full w-full items-center justify-center text-xl">🌷</span>
                }
              </div>
              <input
                type="file"
                accept="image/*"
                class="file-input file-input-bordered file-input-sm w-full max-w-[14rem]"
                (change)="onPresentationSelected($event, '4x3')"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="label-text text-sm">Formato 16:9 — se ve en pantallas de PC</span>
            <div class="flex items-center gap-3">
              <div class="aspect-video w-36 shrink-0 overflow-hidden rounded-lg border border-base-300 bg-base-300">
                @if (presentation16x9()) {
                  <img [src]="presentation16x9()" class="h-full w-full object-cover" alt="Vista previa 16:9" />
                } @else {
                  <span class="flex h-full w-full items-center justify-center text-xl">🌷</span>
                }
              </div>
              <input
                type="file"
                accept="image/*"
                class="file-input file-input-bordered file-input-sm w-full max-w-[14rem]"
                (change)="onPresentationSelected($event, '16x9')"
              />
            </div>
          </div>

          <div class="divider my-0 text-xs text-base-content/50">Galería adicional — hasta {{ maxGallery }} fotos, formato 4:3</div>

          <div class="flex flex-wrap gap-2">
            @for (img of galleryImages(); track $index) {
              <div class="relative">
                <img [src]="img" class="aspect-[4/3] w-24 rounded-lg border border-base-300 object-cover" alt="Foto de galería" />
                <button
                  type="button"
                  class="btn btn-circle btn-error btn-xs absolute -right-2 -top-2"
                  (click)="removeGalleryImage($index)"
                  aria-label="Quitar imagen"
                >
                  ✕
                </button>
              </div>
            }
          </div>
          @if (galleryImages().length < maxGallery) {
            <input
              type="file"
              accept="image/*"
              class="file-input file-input-bordered file-input-sm w-full max-w-xs"
              (change)="onGalleryImageSelected($event)"
            />
          } @else {
            <p class="text-xs text-base-content/60">Ya agregaste el máximo de {{ maxGallery }} fotos.</p>
          }

          @if (imageError()) {
            <p class="text-sm text-error">{{ imageError() }}</p>
          }

          @if (itemId) {
            <label class="flex cursor-pointer items-center gap-3">
              <input type="checkbox" class="toggle toggle-primary" formControlName="available" />
              <span class="text-sm text-base-content">Disponible en el catálogo</span>
            </label>
          }

          @if (errorMsg()) {
            <p class="text-sm text-error">{{ errorMsg() }}</p>
          }

          <div class="mt-2 flex gap-3">
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Guardar
            </button>
            <a routerLink="/admin/items" class="btn btn-ghost">Cancelar</a>
          </div>
        </form>
      }
    </div>
  `,
})
export class AdminItemFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly itemService = inject(ItemService);
  private readonly categoryService = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly errorMsg = signal('');
  protected readonly imageError = signal('');
  protected itemId: string | null = null;
  protected readonly maxGallery = MAX_GALLERY_IMAGES;

  protected readonly presentation4x3 = signal('');
  protected readonly presentation16x9 = signal('');
  protected readonly galleryImages = signal<string[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['COP', Validators.required],
    categoryId: ['', Validators.required],
    available: [true],
  });

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');

    const categories$ = this.categoryService.list();
    if (!this.itemId) {
      categories$.subscribe((categories) => {
        this.categories.set(categories);
        if (categories[0]) this.form.patchValue({ categoryId: categories[0].id });
        this.loading.set(false);
      });
      return;
    }

    forkJoin({ categories: categories$, item: this.itemService.getAdminItem(this.itemId) }).subscribe({
      next: ({ categories, item }) => {
        this.categories.set(categories);
        this.form.patchValue(item);
        this.presentation4x3.set(item.presentationImage4x3 ?? '');
        this.presentation16x9.set(item.presentationImage16x9 ?? '');
        this.galleryImages.set(item.galleryImages ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('No se encontró el producto.');
        this.loading.set(false);
      },
    });
  }

  async onPresentationSelected(event: Event, format: '4x3' | '16x9'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToCompressedDataUrl(file, PRESENTATION_MAX_WIDTH);
      if (format === '4x3') {
        this.presentation4x3.set(dataUrl);
      } else {
        this.presentation16x9.set(dataUrl);
      }
      this.imageError.set('');
    } catch (err) {
      this.imageError.set((err as Error).message);
    } finally {
      input.value = '';
    }
  }

  async onGalleryImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (this.galleryImages().length >= MAX_GALLERY_IMAGES) {
      this.imageError.set(`Máximo ${MAX_GALLERY_IMAGES} imágenes en la galería.`);
      input.value = '';
      return;
    }

    try {
      const dataUrl = await fileToCompressedDataUrl(file, GALLERY_MAX_WIDTH);
      this.galleryImages.update((images) => [...images, dataUrl]);
      this.imageError.set('');
    } catch (err) {
      this.imageError.set((err as Error).message);
    } finally {
      input.value = '';
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryImages.update((images) => images.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const value: ItemFormValue = {
      ...this.form.getRawValue(),
      presentationImage4x3: this.presentation4x3(),
      presentationImage16x9: this.presentation16x9(),
      galleryImages: this.galleryImages(),
    };

    const request = this.itemId ? this.itemService.update(this.itemId, value) : this.itemService.create(value);

    request.subscribe({
      next: () => this.router.navigate(['/admin/items']),
      error: () => {
        this.errorMsg.set('No se pudo guardar el producto. Revisa los datos e intenta de nuevo.');
        this.saving.set(false);
      },
    });
  }
}
