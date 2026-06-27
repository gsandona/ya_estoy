import { Injectable, signal, computed } from '@angular/core';
import { es } from '../i18n/es';
import { en } from '../i18n/en';

export type Lang = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSignal = signal<Lang>(this.getInitialLang());

  currentLang = this.currentLangSignal.asReadonly();

  // Reactive computed translation signal
  translations = computed(() => {
    return this.currentLangSignal() === 'es' ? es : en;
  });

  private getInitialLang(): Lang {
    const saved = localStorage.getItem('app_lang');
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    // Detect browser default language
    const browserLang = navigator.language;
    return browserLang?.startsWith('en') ? 'en' : 'es';
  }

  setLanguage(lang: Lang) {
    this.currentLangSignal.set(lang);
    localStorage.setItem('app_lang', lang);
  }

  toggleLanguage() {
    this.setLanguage(this.currentLangSignal() === 'es' ? 'en' : 'es');
  }

  // Fallback direct translation helper function
  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations();
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  }
}
