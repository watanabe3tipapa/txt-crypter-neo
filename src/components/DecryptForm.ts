import { decrypt, DEFAULT_ITERATIONS, type Algorithm } from '../lib/crypto'
import { showToast } from './toast'
import { addDecryption, getDecryptionHistory, clearDecryptionHistory } from '../lib/storage'
import { marked } from 'marked'
import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

const messages = { en, ja } as const

function escapeHtml(s: string): string {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

function t(key: keyof typeof en, lang: string): string {
  const locale = lang === 'ja' ? 'ja' : 'en' as keyof typeof messages
  return messages[locale][key] ?? key
}

export function mountDecryptForm(root: HTMLElement): void {
  const lang = root.dataset.lang ?? 'ja'

  root.innerHTML = `
    <div class="space-y-6">
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest" for="encrypted-url">${t('decrypt.placeholder', lang)}</label>
        <input
          id="encrypted-url"
          type="text"
          class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        />
      </div>
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest" for="passphrase">${t('decrypt.passphrase', lang)}</label>
        <input
          id="passphrase"
          type="password"
          class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        />
      </div>
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest" for="iterations">${t('decrypt.iterations', lang)}</label>
        <input
          id="iterations"
          type="number"
          value="${DEFAULT_ITERATIONS}"
          class="w-full border-4 border-black-neo bg-white p-4 text-base font-bold focus:outline-none focus:bg-yellow-neo-light"
        />
      </div>
      <div id="algo-badge" class="hidden">
        <span class="inline-block border-2 border-black-neo bg-yellow-neo-light px-3 py-1 text-xs font-bold uppercase"></span>
      </div>
      <button
        id="decrypt-btn"
        class="w-full border-4 border-black-neo bg-yellow-neo px-6 py-4 text-base font-bold uppercase tracking-wider hover:bg-black-neo hover:text-yellow-neo transition-colors active:translate-y-1"
      >${t('decrypt.button', lang)}</button>
      <div id="result" class="hidden space-y-3 border-4 border-black-neo bg-yellow-neo-light p-6">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase">${t('decrypt.algorithm', lang)}</span>
          <span id="result-algo" class="border-2 border-black-neo bg-white px-2 py-0.5 text-xs font-bold"></span>
        </div>
        <label class="block text-xs font-bold uppercase tracking-widest">${t('decrypt.result', lang)}</label>
        <div class="flex gap-2">
          <button id="preview-toggle-btn" class="border-4 border-black-neo bg-white px-3 py-2 text-xs font-bold uppercase hover:bg-black-neo hover:text-white transition-colors shrink-0">${t('decrypt.preview', lang)}</button>
          <pre id="output-text" class="flex-1 border-4 border-black-neo bg-white p-4 text-base font-medium whitespace-pre-wrap min-h-12"></pre>
          <button id="copy-result-btn" class="border-4 border-black-neo bg-white px-5 py-3 text-sm font-bold uppercase hover:bg-black-neo hover:text-white transition-colors shrink-0">${t('encrypt.copy', lang)}</button>
        </div>
        <div id="output-rendered" class="hidden w-full border-4 border-black-neo bg-white p-4 text-base prose prose-sm max-w-none"></div>
      </div>
      <div id="error" class="hidden border-4 border-black-neo bg-red-100 p-4 text-sm font-bold text-red-700"></div>
      <details class="border-4 border-black-neo bg-white">
        <summary class="cursor-pointer p-4 text-xs font-bold uppercase tracking-widest hover:bg-yellow-neo-light">${t('history.decrypt', lang)}</summary>
        <div id="dec-history" class="border-t-4 border-black-neo p-4 max-h-48 overflow-y-auto"></div>
      </details>
    </div>
  `

  const urlInput = root.querySelector('#encrypted-url') as HTMLInputElement
  const passphrase = root.querySelector('#passphrase') as HTMLInputElement
  const iterations = root.querySelector('#iterations') as HTMLInputElement
  const btn = root.querySelector('#decrypt-btn') as HTMLButtonElement
  const result = root.querySelector('#result') as HTMLDivElement
  const error = root.querySelector('#error') as HTMLDivElement
  const outputText = root.querySelector('#output-text') as HTMLPreElement
  const copyResultBtn = root.querySelector('#copy-result-btn') as HTMLButtonElement
  const decHistory = root.querySelector('#dec-history') as HTMLDivElement
  const algoBadge = root.querySelector('#algo-badge') as HTMLDivElement
  const algoBadgeSpan = algoBadge.querySelector('span')!
  const resultAlgo = root.querySelector('#result-algo') as HTMLSpanElement
  const previewToggleBtn = root.querySelector('#preview-toggle-btn') as HTMLButtonElement
  const outputRendered = root.querySelector('#output-rendered') as HTMLDivElement

  function detectAlgorithm(): void {
    const url = urlInput.value
    try {
      const params = new URL(url).searchParams
      const txt = params.get('txt')
      if (!txt) { algoBadge.classList.add('hidden'); return }
      const isArgon2 = txt.startsWith('v1')
      algoBadgeSpan.textContent = isArgon2 ? t('encrypt.algorithm_argon2id', lang) : t('encrypt.algorithm_pbkdf2', lang)
      algoBadge.classList.remove('hidden')
    } catch {
      algoBadge.classList.add('hidden')
    }
  }

  urlInput.addEventListener('input', detectAlgorithm)

  function renderHistory(): void {
    const list = getDecryptionHistory()
    if (!list.length) {
      decHistory.innerHTML = `<p class="text-xs text-gray-500">${t('history.empty', lang)}</p>`
      return
    }
    decHistory.innerHTML = `
      <div class="space-y-2">
        ${list.map(e => `
          <div class="border-2 border-black-neo bg-yellow-neo-light p-2 text-xs">
            <div class="font-medium truncate">${escapeHtml(e.text)}</div>
            <div class="text-gray-500 mt-1">${new Date(e.date).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
      <button id="clear-dec-history" class="mt-3 border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-200 transition-colors">${t('history.clear', lang)}</button>
    `
    decHistory.querySelector('#clear-dec-history')?.addEventListener('click', () => {
      clearDecryptionHistory()
      renderHistory()
    })
  }

  renderHistory()

  const params = new URLSearchParams(window.location.search)
  const txt = params.get('txt')
  if (txt) {
    urlInput.value = window.location.href
  }

  btn.addEventListener('click', async () => {
    const url = urlInput.value
    const pass = passphrase.value
    const iter = parseInt(iterations.value, 10) || DEFAULT_ITERATIONS
    if (!url || !pass) return

    btn.disabled = true
    btn.textContent = '...'
    result.classList.add('hidden')
    error.classList.add('hidden')

    try {
      const plaintext = await decrypt(url, pass, iter)
      outputText.textContent = plaintext
      resultAlgo.textContent = algoBadgeSpan.textContent || ''
      result.classList.remove('hidden')
      addDecryption(plaintext)
      renderHistory()
    } catch (e) {
      showToast(t('decrypt.failure', lang), 'error')
      error.textContent = t('decrypt.failure', lang)
      error.classList.remove('hidden')
    } finally {
      btn.disabled = false
      btn.textContent = t('decrypt.button', lang)
    }
  })

  copyResultBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputText.textContent ?? '')
      showToast(t('encrypt.copied', lang), 'success')
    } catch {
      showToast('Copy failed', 'error')
    }
  })

  let renderPreview = false
  previewToggleBtn.addEventListener('click', async () => {
    renderPreview = !renderPreview
    if (renderPreview) {
      previewToggleBtn.textContent = t('decrypt.raw', lang)
      outputText.classList.add('hidden')
      outputRendered.classList.remove('hidden')
      outputRendered.innerHTML = await marked.parse(outputText.textContent || '')
    } else {
      previewToggleBtn.textContent = t('decrypt.preview', lang)
      outputText.classList.remove('hidden')
      outputRendered.classList.add('hidden')
    }
  })
}

const root = document.getElementById('decrypt-root')
if (root) mountDecryptForm(root)
