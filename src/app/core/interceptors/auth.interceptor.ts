import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

/** Attaches the admin's bearer token only to requests aimed at protected routes. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/v1/admin')) {
    return next(req);
  }

  const token = inject(AuthService).getToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
