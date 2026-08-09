import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import { BrandService } from './core/services/brand.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  private readonly brand = inject(BrandService);
  private readonly titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`${this.brand.name} — Catálogo`);
  }
}
