import en from './en.json'
import ja from './ja.json'

const messages = { en, ja } as const

export type Locale = keyof typeof messages
export type TranslationKey = keyof typeof en

export function t(key: TranslationKey, locale: string): string {
  const lang = (locale === 'ja' ? 'ja' : 'en') as Locale
  return messages[lang][key] ?? key
}
