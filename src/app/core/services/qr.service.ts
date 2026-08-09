import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

interface QrJsonResponse {
  targetUrl: string;
  pngBase64: string;
}

@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/v1/qr`;

  /** Direct <img [src]> URL — the API streams a PNG for this endpoint. */
  generalMenuQrUrl(size = 256): string {
    return `${this.base}/menu?size=${size}`;
  }

  /** Direct <img [src]> URL for a single item's QR. */
  itemQrUrl(itemId: string, size = 256): string {
    return `${this.base}/items/${itemId}?size=${size}`;
  }

  /** format=json variant — used to read the encoded target URL for display. */
  getGeneralMenuQr(size = 256): Observable<QrJsonResponse> {
    return this.http.get<QrJsonResponse>(`${this.base}/menu?size=${size}&format=json`);
  }

  getItemQr(itemId: string, size = 256): Observable<QrJsonResponse> {
    return this.http.get<QrJsonResponse>(`${this.base}/items/${itemId}?size=${size}&format=json`);
  }

  /**
   * Downloads a QR PNG and saves it. The API lives on a different origin
   * than the app, and browsers ignore the `download` attribute on
   * cross-origin links — so this fetches the bytes as a blob and saves
   * those instead of pointing an <a> straight at the API URL.
   */
  download(url: string, filename: string): Observable<void> {
    return new Observable<void>((subscriber) => {
      const sub = this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(objectUrl);
          subscriber.next();
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
      return () => sub.unsubscribe();
    });
  }
}
