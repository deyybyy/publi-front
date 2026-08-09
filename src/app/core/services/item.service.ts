import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AdminItem, ItemFormValue, PublicItem, PublicItemDetail } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1`;

  /** GET /menu — active items only, for the storefront's general view. */
  getPublicMenu(): Observable<PublicItem[]> {
    return this.http.get<PublicItem[]>(`${this.base}/menu`);
  }

  /**
   * GET /menu/items/{id} — the caller distinguishes two outcomes:
   * the request errors with status 404 (id never existed, render 404),
   * or it resolves with status: 'unavailable' (soft-deleted/disabled item).
   */
  getPublicItem(id: string): Observable<PublicItemDetail> {
    return this.http.get<PublicItemDetail>(`${this.base}/menu/items/${id}`);
  }

  /** GET /admin/items — every item, including soft-deleted ones. Never carries the gallery. */
  listAdmin(): Observable<AdminItem[]> {
    return this.http.get<AdminItem[]>(`${this.base}/admin/items`);
  }

  /** GET /admin/items/{id} — one item with every field, including the gallery, to prefill the edit form. */
  getAdminItem(id: string): Observable<AdminItem> {
    return this.http.get<AdminItem>(`${this.base}/admin/items/${id}`);
  }

  create(input: ItemFormValue): Observable<AdminItem> {
    return this.http.post<AdminItem>(`${this.base}/admin/items`, input);
  }

  update(id: string, input: ItemFormValue): Observable<AdminItem> {
    return this.http.put<AdminItem>(`${this.base}/admin/items/${id}`, input);
  }

  softDelete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/items/${id}`);
  }

  restore(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/admin/items/${id}/restore`, {});
  }
}
