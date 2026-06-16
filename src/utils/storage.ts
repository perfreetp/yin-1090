const PREFIX = 'osa_screening_'

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(PREFIX + key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    console.error('Failed to remove from localStorage')
  }
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dateStr = formatDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}`
}
