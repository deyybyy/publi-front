import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1`;

  /** GET /categories — public, used for the category tabs and the admin form's dropdown. */
  list(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }
}
