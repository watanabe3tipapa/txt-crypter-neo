import { decrypt, DEFAULT_ITERATIONS } from '../lib/crypto'
import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

const messages = { en, ja } as const

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
      <button
        id="decrypt-btn"
        class="w-full border-4 border-black-neo bg-yellow-neo px-6 py-4 text-base font-bold uppercase tracking-wider hover:bg-black-neo hover:text-yellow-neo transition-colors active:translate-y-1"
      >${t('decrypt.button', lang)}</button>
      <div id="result" class="hidden space-y-2 border-4 border-black-neo bg-yellow-neo-light p-6">
        <label class="block text-xs font-bold uppercase tracking-widest">${t('decrypt.result', lang)}</label>
        <pre id="output-text" class="border-4 border-black-neo bg-white p-4 text-base font-medium whitespace-pre-wrap"></pre>
      </div>
      <div id="error" class="hidden border-4 border-black-neo bg-red-100 p-4 text-sm font-bold text-red-700"></div>
    </div>
  `

  const urlInput = root.querySelector('#encrypted-url') as HTMLInputElement
  const passphrase = root.querySelector('#passphrase') as HTMLInputElement
  const iterations = root.querySelector('#iterations') as HTMLInputElement
  const btn = root.querySelector('#decrypt-btn') as HTMLButtonElement
  const result = root.querySelector('#result') as HTMLDivElement
  const error = root.querySelector('#error') as HTMLDivElement
  const outputText = root.querySelector('#output-text') as HTMLPreElement

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
      result.classList.remove('hidden')
    } catch (e) {
      error.textContent = t('decrypt.failure', lang)
      error.classList.remove('hidden')
    } finally {
      btn.disabled = false
      btn.textContent = t('decrypt.button', lang)
    }
  })
}

const root = document.getElementById('decrypt-root')
if (root) mountDecryptForm(root)
