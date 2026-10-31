import { Injectable, Inject, PLATFORM_ID, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface BrandingState {
  restauranteId?: string;
  appName?: string;
  logo?: string;
  primary?: string;
  secondary?: string;
  background?: string;
}

const BRANDING_STORAGE_KEY = 'mozo_go_branding_state';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  logo = signal<string>('logo.png');
  appName = signal<string>('MozoGo');
  restauranteId = signal<string | null>(null);
  private currentColors: { primary?: string; secondary?: string; background?: string } = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreFromStorage();

      effect(() => {
        const currentName = this.appName();
        const currentLogo = this.logo();
        const currentRestId = this.restauranteId();
        if (currentName) {
          document.title = currentName;
        }
        const hasCustomColors = !!(this.currentColors.primary || this.currentColors.secondary || this.currentColors.background);
        if (currentRestId || hasCustomColors || (currentName && currentName !== 'MozoGo') || (currentLogo && currentLogo !== 'logo.png')) {
          this.saveToStorage({
            restauranteId: currentRestId || undefined,
            appName: currentName,
            logo: currentLogo,
            ...this.currentColors
          });
        }
      });
    }
  }

  private restoreFromStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (!raw) return;
      const saved: BrandingState = JSON.parse(raw);
      if (saved.restauranteId) {
        this.restauranteId.set(saved.restauranteId);
      }
      if (saved.logo) {
        this.logo.set(saved.logo);
      }
      if (saved.appName) {
        this.appName.set(saved.appName);
        document.title = saved.appName;
      }
      if (saved.primary || saved.secondary || saved.background) {
        this.currentColors = {
          primary: saved.primary,
          secondary: saved.secondary,
          background: saved.background
        };
        this.applyCssVariables(this.currentColors);
      }
    } catch (e) {
      console.warn('Could not restore branding state from localStorage:', e);
    }
  }

  private saveToStorage(state: BrandingState) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save branding state to localStorage:', e);
    }
  }

  private applyCssVariables(colors: { primary?: string; secondary?: string; background?: string }) {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary || '#0f5132');
    root.style.setProperty('--color-accent', colors.secondary || '#198754');
    root.style.setProperty('--color-sand', colors.background || '#f4f9f4');
  }

  hasCachedRestaurantBranding(restauranteId: string): boolean {
    if (!restauranteId) return false;
    return this.restauranteId() === restauranteId;
  }

  setRestaurantBranding(data: {
    id?: string;
    nombre?: string;
    logoUrl?: string;
    primary?: string;
    secondary?: string;
    background?: string;
  }) {
    if (data.id) {
      this.restauranteId.set(data.id);
    }
    if (data.logoUrl) {
      this.logo.set(data.logoUrl);
    }
    if (data.nombre) {
      this.appName.set(data.nombre);
      if (isPlatformBrowser(this.platformId)) {
        document.title = data.nombre;
      }
    }
    this.applyBranding({
      primary: data.primary,
      secondary: data.secondary,
      background: data.background
    });
  }

  applyBranding(colors: { primary?: string; secondary?: string; background?: string }) {
    this.currentColors = {
      primary: colors.primary || '#0f5132',
      secondary: colors.secondary || '#198754',
      background: colors.background || '#f4f9f4'
    };
    this.applyCssVariables(this.currentColors);
    this.saveToStorage({
      restauranteId: this.restauranteId() || undefined,
      appName: this.appName(),
      logo: this.logo(),
      ...this.currentColors
    });
  }

  resetBranding() {
    this.restauranteId.set(null);
    this.currentColors = {};
    this.logo.set('logo.png');
    this.appName.set('MozoGo');
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(BRANDING_STORAGE_KEY);
      } catch (e) {}
      document.title = 'MozoGo';
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
      root.style.removeProperty('--color-sand');
    }
  }
}
