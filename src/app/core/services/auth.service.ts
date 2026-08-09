import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';

const TOKEN_KEY = 'publi_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1`;

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.base}/auth/login`, { username, password })
      .pipe(tap(({ token }) => localStorage.setItem(TOKEN_KEY, token)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Cheap client-side check so the guard doesn't need a round trip: decodes
   * the JWT payload and compares `exp` to now. This is a UX shortcut only —
   * the token's signature is always re-verified server-side on every admin
   * request, and a 401 there logs the user out regardless of this check.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;
    return payload.exp * 1000 > Date.now();
  }
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}
