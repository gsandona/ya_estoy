import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  logo = signal<string>('logo.png');
  appName = signal<string>('MozoGo');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  applyBranding(colors: { primary?: string, secondary?: string, background?: string }) {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      
      // We set the CSS custom properties, falling back to default values if not provided.
      root.style.setProperty('--color-primary', colors.primary || '#0f5132');
      root.style.setProperty('--color-accent', colors.secondary || '#198754');
      root.style.setProperty('--color-sand', colors.background || '#f4f9f4');
    }
  }

  resetBranding() {
    this.logo.set('logo.png');
    this.appName.set('MozoGo');
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-sand');
    }
  }
}
