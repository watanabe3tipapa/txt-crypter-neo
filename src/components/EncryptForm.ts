import { encrypt } from '../lib/crypto'
import { showToast } from './toast'
import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

const messages = { en, ja } as const

function t(key: keyof typeof en, lang: string): string {
  const locale = lang === 'ja' ? 'ja' : 'en' as keyof typeof messages
  return messages[locale][key] ?? key
}

const STRENGTH_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-neo', 'bg-green-400']

function estimateStrength(pass: string): { score: number; label: string } {
  let score = 0
  if (pass.length >= 6) score++
  if (pass.length >= 10) score++
  if (pass.length >= 14) score++
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
  if (/\d/.test(pass)) score++
  if (/[^a-zA-Z0-9]/.test(pass)) score++
  const normalized = Math.min(score, 3)
  const labels = ['strength.weak', 'strength.fair', 'strength.strong', 'strength.very_strong']
  return { score: normalized, label: labels[normalized]! }
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
          autocomplete="new-password"
          class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        />
        <div id="strength-meter" class="mt-2 hidden">
          <div class="h-2 border-2 border-black-neo bg-white">
            <div id="strength-bar" class="h-full transition-all" style="width:0%"></div>
          </div>
          <span id="strength-label" class="mt-1 block text-xs font-bold uppercase"></span>
        </div>
      </div>
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest" for="confirm-passphrase">${t('encrypt.confirm', lang)}</label>
        <input
          id="confirm-passphrase"
          type="password"
          autocomplete="new-password"
          class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        />
        <span id="confirm-error" class="mt-1 hidden block text-xs font-bold text-red-600"></span>
      </div>
      <button
        id="encrypt-btn"
        disabled
        class="w-full border-4 border-black-neo bg-yellow-neo px-6 py-4 text-base font-bold uppercase tracking-wider disabled:opacity-40 hover:bg-black-neo hover:text-yellow-neo transition-colors active:translate-y-1"
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
  const confirmPass = root.querySelector('#confirm-passphrase') as HTMLInputElement
  const confirmError = root.querySelector('#confirm-error') as HTMLSpanElement
  const strengthMeter = root.querySelector('#strength-meter') as HTMLDivElement
  const strengthBar = root.querySelector('#strength-bar') as HTMLDivElement
  const strengthLabel = root.querySelector('#strength-label') as HTMLSpanElement
  const btn = root.querySelector('#encrypt-btn') as HTMLButtonElement
  const result = root.querySelector('#result') as HTMLDivElement
  const outputUrl = root.querySelector('#output-url') as HTMLInputElement
  const copyBtn = root.querySelector('#copy-btn') as HTMLButtonElement

  function updateStrength(): void {
    const pass = passphrase.value
    if (!pass) {
      strengthMeter.classList.add('hidden')
      return
    }
    strengthMeter.classList.remove('hidden')
    const { score, label } = estimateStrength(pass)
    const pct = ((score + 1) / 4) * 100
    strengthBar.style.width = `${pct}%`
    strengthBar.className = `h-full transition-all ${STRENGTH_COLORS[score]!}`
    strengthLabel.textContent = t(label as keyof typeof en, lang)
  }

  function updateConfirmState(): void {
    const pass = passphrase.value
    const confirm = confirmPass.value
    if (!confirm) {
      confirmError.classList.add('hidden')
      confirmPass.className = 'w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light'
      btn.disabled = !plaintext.value || !pass
      return
    }
    const match = pass === confirm
    confirmError.classList.toggle('hidden', match)
    confirmError.textContent = match ? '' : t('encrypt.confirm_error', lang)
    confirmPass.className = match
      ? 'w-full border-4 border-green-500 bg-white p-4 text-base font-medium focus:outline-none'
      : 'w-full border-4 border-red-500 bg-white p-4 text-base font-medium focus:outline-none'
    btn.disabled = !plaintext.value || !pass || !match
  }

  function updateButtonState(): void {
    const pass = passphrase.value
    const confirm = confirmPass.value
    btn.disabled = !plaintext.value || !pass || !confirm || pass !== confirm
  }

  passphrase.addEventListener('input', () => {
    updateStrength()
    updateButtonState()
  })

  confirmPass.addEventListener('input', () => {
    updateConfirmState()
    updateButtonState()
  })

  plaintext.addEventListener('input', updateButtonState)

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
      showToast('Encrypted!', 'success')
    } catch (e) {
      console.error(e)
      showToast('Encryption failed', 'error')
    } finally {
      btn.disabled = false
      btn.textContent = t('encrypt.button', lang)
    }
  })

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputUrl.value)
      showToast(t('encrypt.copied', lang), 'success')
    } catch {
      showToast('Copy failed', 'error')
    }
  })
}

const root = document.getElementById('encrypt-root')
if (root) mountEncryptForm(root)
