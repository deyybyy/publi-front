import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Any 401 from an admin endpoint means the token is missing/expired/invalid —
 * the JWT middleware in the backend rejected it. Clear it and send the user
 * back to the login screen instead of leaving them looking at a stuck page.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.includes('/api/v1/admin')) {
        auth.logout();
        router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    }),
  );
};
