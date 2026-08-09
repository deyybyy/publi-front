import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Deliberately simple — this catalog's descriptions are short, admin-authored
// text, not arbitrary user input needing an RFC-3986-grade URL parser.
const URL_PATTERN = /(https?:\/\/[^\s<]+)/g;

/**
 * Renders plain text with any http(s) URL turned into a classic blue,
 * underlined link — recognizable as a link the way the web has looked for
 * 30 years, on purpose, rather than styled to match the brand accent.
 *
 * Everything is HTML-escaped before URLs are wrapped, so this is safe to
 * mark as trusted HTML even though the source text is admin-controlled,
 * not sanitized user input.
 */
@Pipe({ name: 'linkify', standalone: true })
export class LinkifyPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(text: string | null | undefined): SafeHtml {
    const escaped = escapeHtml(text ?? '');
    const linked = escaped.replace(
      URL_PATTERN,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">${url}</a>`,
    );
    return this.sanitizer.bypassSecurityTrustHtml(linked.replace(/\n/g, '<br>'));
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
