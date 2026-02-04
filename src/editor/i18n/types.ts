export type Locale = 'ja' | 'en';
export type TranslationKeys = typeof import('./ja').default;

// Utility type: preserves key structure but allows any string values
export type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepStringify<T[K]> : string;
};
