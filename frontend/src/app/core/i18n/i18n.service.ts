import { Injectable, signal, computed } from '@angular/core';
import { en, TranslationKeys } from './en';
import { fr } from './fr';

export type SupportedLang = 'en' | 'fr';

const TRANSLATIONS: Record<SupportedLang, TranslationKeys> = { en, fr };
const STORAGE_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class I18nService {

  private readonly _lang = signal<SupportedLang>(this._loadLang());

  /** Current language key (reactive) */
  readonly lang = this._lang.asReadonly();

  /** Current translation object (reactive) */
  readonly t = computed<TranslationKeys>(() => TRANSLATIONS[this._lang()]);

  /** Translate a dot-path key, e.g. t('login.signIn') */
  translate(path: string): string {
    const keys = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = TRANSLATIONS[this._lang()];
    for (const key of keys) {
      value = value?.[key];
    }
    return typeof value === 'string' ? value : path;
  }

  setLang(lang: SupportedLang): void {
    this._lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  private _loadLang(): SupportedLang {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (saved && saved in TRANSLATIONS) return saved;
    const browser = navigator.language.slice(0, 2) as SupportedLang;
    return browser in TRANSLATIONS ? browser : 'en';
  }
}
