import { encrypt } from '../lib/crypto'
import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

const messages = { en, ja } as const

function t(key: keyof typeof en, lang: string): string {
  const locale = lang === 'ja' ? 'ja' : 'en' as keyof typeof messages
  return messages[locale][key] ?? key
}

export function mountEncryptForm(root: HTMLElement): void {
  const lang = root.dataset.lang ?? 'ja'

  root.innerHTML = `
    <div class="space-y-6">
      <textarea
        id="plaintext"
        rows="6"
        class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        placeholder="${t('encrypt.placeholder', lang)}"
      ></textarea>
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest" for="passphrase">${t('encrypt.passphrase', lang)}</label>
        <input
          id="passphrase"
          type="password"
          class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        />
      </div>
      <button
        id="encrypt-btn"
        class="w-full border-4 border-black-neo bg-yellow-neo px-6 py-4 text-base font-bold uppercase tracking-wider hover:bg-black-neo hover:text-yellow-neo transition-colors active:translate-y-1"
      >${t('encrypt.button', lang)}</button>
      <div id="result" class="hidden space-y-4 border-4 border-black-neo bg-yellow-neo-light p-6">
        <label class="block text-xs font-bold uppercase tracking-widest">${t('encrypt.result', lang)}</label>
        <div class="flex gap-2">
          <input id="output-url" readonly class="flex-1 border-4 border-black-neo bg-white p-3 text-sm font-medium" />
          <button id="copy-btn" class="border-4 border-black-neo bg-white px-5 py-3 text-sm font-bold uppercase hover:bg-black-neo hover:text-white transition-colors">${t('encrypt.copy', lang)}</button>
        </div>
      </div>
    </div>
  `

  const plaintext = root.querySelector('#plaintext') as HTMLTextAreaElement
  const passphrase = root.querySelector('#passphrase') as HTMLInputElement
  const btn = root.querySelector('#encrypt-btn') as HTMLButtonElement
  const result = root.querySelector('#result') as HTMLDivElement
  const outputUrl = root.querySelector('#output-url') as HTMLInputElement
  const copyBtn = root.querySelector('#copy-btn') as HTMLButtonElement

  btn.addEventListener('click', async () => {
    const text = plaintext.value
    const pass = passphrase.value
    if (!text || !pass) return

    btn.disabled = true
    btn.textContent = '...'

    try {
      const params = await encrypt(text, pass)
      const url = `${window.location.origin}${window.location.pathname.replace(/\/?$/, '')}/decrypt?txt=${params}`
      outputUrl.value = url
      result.classList.remove('hidden')
    } catch (e) {
      console.error(e)
      alert('Encryption failed')
    } finally {
      btn.disabled = false
      btn.textContent = t('encrypt.button', lang)
    }
  })

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputUrl.value)
      copyBtn.textContent = t('encrypt.copied', lang)
      setTimeout(() => { copyBtn.textContent = t('encrypt.copy', lang) }, 2000)
    } catch { /* ignore */ }
  })
}

const root = document.getElementById('encrypt-root')
if (root) mountEncryptForm(root)
