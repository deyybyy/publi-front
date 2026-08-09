/**
 * Reads an image file, downsizes it to at most `maxWidth` (keeping aspect
 * ratio) and re-encodes it as JPEG via <canvas>, returning a compact base64
 * data URI. A phone camera photo can be several MB straight off the
 * sensor — compressing client-side before it ever reaches the API/DB is
 * the cheapest way to keep "store it as base64" viable for this catalog's
 * size, without standing up a real image-processing pipeline server-side.
 */
export function fileToCompressedDataUrl(file: File, maxWidth: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error('Este navegador no puede procesar imágenes.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer el archivo de imagen.'));
    };
    img.src = objectUrl;
  });
}

interface PresentationImages {
  presentationImage4x3?: string;
  presentationImage16x9?: string;
}

/** Picks the phone-width crop, falling back to the other one if only it was uploaded. */
export function mobilePresentationImage(item: PresentationImages): string {
  return item.presentationImage4x3 || item.presentationImage16x9 || '';
}

/** Picks the desktop-width crop, falling back to the other one if only it was uploaded. */
export function desktopPresentationImage(item: PresentationImages): string {
  return item.presentationImage16x9 || item.presentationImage4x3 || '';
}
