import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

/**
 * Single source of truth for white-label identity. Every component that
 * shows the business name or logo reads it from here instead of hardcoding
 * it, so re-skinning this app for a different business is a two-line edit
 * in environment.ts, not a find-and-replace across templates.
 */
@Injectable({ providedIn: 'root' })
export class BrandService {
  readonly name = environment.brandName;
  readonly logo = environment.brandLogo;
}
