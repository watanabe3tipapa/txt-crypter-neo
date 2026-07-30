export type ToastType = 'success' | 'error' | 'info'

const COLORS: Record<ToastType, string> = {
  success: 'bg-yellow-neo text-black-neo',
  error: 'bg-red-200 text-red-800',
  info: 'bg-white text-black-neo',
}

function ensureContainer(): HTMLDivElement {
  let el = document.getElementById('toast-container') as HTMLDivElement | null
  if (!el) {
    el = document.createElement('div')
    el.id = 'toast-container'
    el.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none'
    document.body.appendChild(el)
  }
  return el
}

export function showToast(message: string, type: ToastType = 'info'): void {
  const container = ensureContainer()
  const toast = document.createElement('div')
  toast.className = `border-4 border-black-neo ${COLORS[type]} px-5 py-3 text-sm font-bold pointer-events-auto animate-slide-in`
  toast.textContent = message
  container.appendChild(toast)
  setTimeout(() => {
    toast.classList.add('animate-slide-out')
    toast.addEventListener('animationend', () => toast.remove())
  }, 2500)
}
