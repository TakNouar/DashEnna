import { fr } from './locales/fr';
import { en } from './locales/en';
import { ar } from './locales/ar';

export const LOCALES = [
  { id: 'fr', label: 'FR', name: 'Français', dir: 'ltr' },
  { id: 'ar', label: 'ع', name: 'العربية', dir: 'rtl' },
  { id: 'en', label: 'EN', name: 'English', dir: 'ltr' },
];

export const dictionaries = { fr, en, ar };
export const DEFAULT_LOCALE = 'fr';
