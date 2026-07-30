const KEYS = {
  encHistory: 'txtcrypt_enc_history',
  decHistory: 'txtcrypt_dec_history',
  templates: 'txtcrypt_templates',
}

export interface HistoryEntry {
  text: string
  url?: string
  date: string
}

export interface Template {
  name: string
  text: string
}

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export function addEncryption(text: string, url: string): void {
  const list = read<HistoryEntry>(KEYS.encHistory)
  list.unshift({ text: text.slice(0, 100), url, date: new Date().toISOString() })
  if (list.length > 50) list.length = 50
  write(KEYS.encHistory, list)
}

export function addDecryption(text: string): void {
  const list = read<HistoryEntry>(KEYS.decHistory)
  list.unshift({ text: text.slice(0, 100), date: new Date().toISOString() })
  if (list.length > 50) list.length = 50
  write(KEYS.decHistory, list)
}

export function getEncryptionHistory(): HistoryEntry[] {
  return read<HistoryEntry>(KEYS.encHistory)
}

export function getDecryptionHistory(): HistoryEntry[] {
  return read<HistoryEntry>(KEYS.decHistory)
}

export function clearEncryptionHistory(): void {
  localStorage.removeItem(KEYS.encHistory)
}

export function clearDecryptionHistory(): void {
  localStorage.removeItem(KEYS.decHistory)
}

export function saveTemplate(name: string, text: string): void {
  const list = read<Template>(KEYS.templates)
  const existing = list.findIndex(t => t.name === name)
  if (existing >= 0) {
    list[existing]!.text = text
  } else {
    list.push({ name, text })
  }
  write(KEYS.templates, list)
}

export function getTemplates(): Template[] {
  return read<Template>(KEYS.templates)
}

export function deleteTemplate(name: string): void {
  const list = read<Template>(KEYS.templates).filter(t => t.name !== name)
  write(KEYS.templates, list)
}
