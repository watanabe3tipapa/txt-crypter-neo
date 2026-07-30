import { encrypt, encryptFile, type Algorithm } from '../lib/crypto'
import { showToast } from './toast'
import { addEncryption, getEncryptionHistory, clearEncryptionHistory, getTemplates, saveTemplate, deleteTemplate } from '../lib/storage'
import QRCode from 'qrcode'
import { marked } from 'marked'
import en from '../i18n/en.json'
import ja from '../i18n/ja.json'

const messages = { en, ja } as const

function t(key: keyof typeof en, lang: string): string {
  const locale = lang === 'ja' ? 'ja' : 'en' as keyof typeof messages
  return messages[locale][key] ?? key
}

const STRENGTH_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-yellow-neo', 'bg-green-400']

function escapeHtml(s: string): string {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

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

  const templates = getTemplates()

  root.innerHTML = `
    <div class="space-y-6">
      <div class="flex border-4 border-black-neo bg-white">
        <button id="text-tab" class="tab-btn flex-1 p-3 text-xs font-bold uppercase border-r-4 border-black-neo bg-yellow-neo">${t('encrypt.text_mode', lang)}</button>
        <button id="file-tab" class="tab-btn flex-1 p-3 text-xs font-bold uppercase">${t('encrypt.file_mode', lang)}</button>
      </div>
      <div id="text-content">
      ${templates.length ? `
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest">${t('encrypt.template_load', lang)}</label>
        <select id="template-select" class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium">
          <option value="">—</option>
          ${templates.map(tmpl => `<option value="${tmpl.name}">${tmpl.name}</option>`).join('')}
        </select>
      </div>` : ''}
      <div class="flex justify-end">
        <button id="preview-btn" class="border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-black-neo hover:text-white transition-colors">${t('encrypt.preview', lang)}</button>
      </div>
      <textarea
        id="plaintext"
        rows="6"
        class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium focus:outline-none focus:bg-yellow-neo-light"
        placeholder="${t('encrypt.placeholder', lang)}"
      ></textarea>
      <div id="md-preview" class="hidden w-full border-4 border-black-neo bg-white p-4 text-base prose prose-sm max-w-none"></div>
      </div>
      <div id="file-content" class="hidden space-y-4">
        <div class="border-4 border-dashed border-black-neo bg-white p-8 text-center">
          <input id="file-input" type="file" class="hidden" />
          <button id="file-select-btn" class="border-4 border-black-neo bg-yellow-neo px-6 py-3 text-sm font-bold uppercase hover:bg-black-neo hover:text-yellow-neo transition-colors">${t('encrypt.file_select', lang)}</button>
          <p id="file-info" class="mt-3 text-xs text-gray-500"></p>
        </div>
      </div>
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
      <div>
        <label class="mb-2 block text-xs font-bold uppercase tracking-widest">${t('encrypt.algorithm', lang)}</label>
        <select id="algorithm-select" class="w-full border-4 border-black-neo bg-white p-4 text-base font-medium">
          <option value="pbkdf2">${t('encrypt.algorithm_pbkdf2', lang)}</option>
          <option value="argon2id">${t('encrypt.algorithm_argon2id', lang)}</option>
        </select>
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
          <button id="copy-btn" class="border-4 border-black-neo bg-white px-5 py-3 text-sm font-bold uppercase hover:bg-black-neo hover:text-white transition-colors shrink-0">${t('encrypt.copy', lang)}</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button id="qr-btn" class="border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-black-neo hover:text-white transition-colors">${t('encrypt.qr', lang)}</button>
          <button id="share-btn" class="border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-black-neo hover:text-white transition-colors">${t('encrypt.share', lang)}</button>
          <button id="shorten-btn" class="border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-black-neo hover:text-white transition-colors">${t('encrypt.shorten', lang)}</button>
          <button id="save-template-btn" class="border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-black-neo hover:text-white transition-colors">${t('encrypt.template_save', lang)}</button>
        </div>
        <div id="qr-area" class="hidden flex justify-center border-4 border-black-neo bg-white p-4">
          <canvas id="qr-canvas"></canvas>
        </div>
      </div>
      <details class="border-4 border-black-neo bg-white">
        <summary class="cursor-pointer p-4 text-xs font-bold uppercase tracking-widest hover:bg-yellow-neo-light">${t('history.encrypt', lang)}</summary>
        <div id="enc-history" class="border-t-4 border-black-neo p-4 max-h-48 overflow-y-auto"></div>
      </details>
      <div id="file-result" class="hidden border-4 border-black-neo bg-yellow-neo-light p-6">
        <p class="text-xs font-bold uppercase tracking-widest">${t('encrypt.file_saved', lang)}</p>
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
  const qrBtn = root.querySelector('#qr-btn') as HTMLButtonElement
  const shareBtn = root.querySelector('#share-btn') as HTMLButtonElement
  const shortenBtn = root.querySelector('#shorten-btn') as HTMLButtonElement
  const saveTemplateBtn = root.querySelector('#save-template-btn') as HTMLButtonElement
  const qrArea = root.querySelector('#qr-area') as HTMLDivElement
  const qrCanvas = root.querySelector('#qr-canvas') as HTMLCanvasElement
  const algorithmSelect = root.querySelector('#algorithm-select') as HTMLSelectElement
  const templateSelect = root.querySelector('#template-select') as HTMLSelectElement | null
  const encHistory = root.querySelector('#enc-history') as HTMLDivElement
  const previewBtn = root.querySelector('#preview-btn') as HTMLButtonElement
  const mdPreview = root.querySelector('#md-preview') as HTMLDivElement
  const textTab = root.querySelector('#text-tab') as HTMLButtonElement
  const fileTab = root.querySelector('#file-tab') as HTMLButtonElement
  const textContent = root.querySelector('#text-content') as HTMLDivElement
  const fileContent = root.querySelector('#file-content') as HTMLDivElement
  const fileInput = root.querySelector('#file-input') as HTMLInputElement
  const fileSelectBtn = root.querySelector('#file-select-btn') as HTMLButtonElement
  const fileInfo = root.querySelector('#file-info') as HTMLParagraphElement
  const fileResult = root.querySelector('#file-result') as HTMLDivElement

  let currentMode: 'text' | 'file' = 'text'
  let selectedFile: File | null = null

  function setMode(mode: 'text' | 'file'): void {
    currentMode = mode
    textContent.classList.toggle('hidden', mode === 'file')
    fileContent.classList.toggle('hidden', mode === 'text')
    textTab.className = `tab-btn flex-1 p-3 text-xs font-bold uppercase border-r-4 border-black-neo ${mode === 'text' ? 'bg-yellow-neo' : 'bg-white'}`
    fileTab.className = `tab-btn flex-1 p-3 text-xs font-bold uppercase ${mode === 'file' ? 'bg-yellow-neo' : 'bg-white'}`
    btn.textContent = mode === 'file' ? t('encrypt.file_encrypt', lang) : t('encrypt.button', lang)
    result.classList.add('hidden')
    fileResult.classList.add('hidden')
    updateButtonState()
  }

  textTab.addEventListener('click', () => setMode('text'))
  fileTab.addEventListener('click', () => setMode('file'))

  fileSelectBtn.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    selectedFile = fileInput.files?.[0] ?? null
    fileInfo.textContent = selectedFile
      ? `${t('encrypt.file_selected', lang)} ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
      : ''
    updateButtonState()
  })

  function renderHistory(): void {
    const list = getEncryptionHistory()
    if (!list.length) {
      encHistory.innerHTML = `<p class="text-xs text-gray-500">${t('history.empty', lang)}</p>`
      return
    }
    encHistory.innerHTML = `
      <div class="space-y-2">
        ${list.map(e => `
          <div class="border-2 border-black-neo bg-yellow-neo-light p-2 text-xs">
            <div class="font-medium truncate">${escapeHtml(e.text)}</div>
            <div class="text-gray-500 mt-1">${new Date(e.date).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
      <button id="clear-enc-history" class="mt-3 border-4 border-black-neo bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-200 transition-colors">${t('history.clear', lang)}</button>
    `
    encHistory.querySelector('#clear-enc-history')?.addEventListener('click', () => {
      clearEncryptionHistory()
      renderHistory()
    })
  }

  renderHistory()

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
    if (currentMode === 'file') {
      btn.disabled = !selectedFile || !pass || !confirm || pass !== confirm
    } else {
      btn.disabled = !plaintext.value || !pass || !confirm || pass !== confirm
    }
  }

  if (templateSelect) {
    templateSelect.addEventListener('change', () => {
      const tmpl = getTemplates().find(t => t.name === templateSelect.value)
      if (tmpl) plaintext.value = tmpl.text
      updateButtonState()
    })
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

  let previewVisible = false
  previewBtn.addEventListener('click', async () => {
    previewVisible = !previewVisible
    if (previewVisible) {
      previewBtn.textContent = t('encrypt.edit', lang)
      plaintext.classList.add('hidden')
      mdPreview.classList.remove('hidden')
      mdPreview.innerHTML = await marked.parse(plaintext.value || '*empty*')
    } else {
      previewBtn.textContent = t('encrypt.preview', lang)
      plaintext.classList.remove('hidden')
      mdPreview.classList.add('hidden')
    }
  })

  btn.addEventListener('click', async () => {
    const pass = passphrase.value
    if (!pass) return

    btn.disabled = true
    btn.textContent = '...'

    if (currentMode === 'file') {
      if (!selectedFile) return
      try {
        const buf = await selectedFile.arrayBuffer()
        const encrypted = await encryptFile(new Uint8Array(buf), pass, algorithmSelect.value as Algorithm)
        const blob = new Blob([encrypted], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedFile.name}.enc`
        a.click()
        URL.revokeObjectURL(url)
        fileResult.classList.remove('hidden')
        showToast(t('encrypt.file_saved', lang), 'success')
      } catch (e) {
        console.error(e)
        showToast('Encryption failed', 'error')
      } finally {
        btn.disabled = false
        btn.textContent = t('encrypt.file_encrypt', lang)
      }
      return
    }

    const text = plaintext.value
    if (!text) return

    try {
      const params = await encrypt(text, pass, algorithmSelect.value as Algorithm)
      const baseUrl = `${window.location.origin}${window.location.pathname.replace(/\/?$/, '')}`
      const url = `${baseUrl}/decrypt?txt=${params}`
      outputUrl.value = url
      result.classList.remove('hidden')
      addEncryption(text, url)
      renderHistory()
      showToast('Encrypted!', 'success')
    } catch (e) {
      console.error(e)
      showToast('Encryption failed', 'error')
    } finally {
      btn.disabled = false
      btn.textContent = t('encrypt.button', lang)
    }
  })

  saveTemplateBtn.addEventListener('click', () => {
    const name = prompt(t('encrypt.template_name', lang))
    if (name && name.trim()) {
      saveTemplate(name.trim(), plaintext.value)
      showToast(t('encrypt.template_saved', lang), 'success')
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

  let qrVisible = false
  qrBtn.addEventListener('click', async () => {
    qrVisible = !qrVisible
    qrArea.classList.toggle('hidden', !qrVisible)
    qrBtn.textContent = qrVisible ? t('encrypt.qr_hide', lang) : t('encrypt.qr', lang)
    if (qrVisible && outputUrl.value) {
      await QRCode.toCanvas(qrCanvas, outputUrl.value, {
        width: 200,
        margin: 1,
        color: { dark: '#111', light: '#fff' },
      })
    }
  })

  shareBtn.addEventListener('click', async () => {
    if (!navigator.share) {
      showToast('Share not supported', 'error')
      return
    }
    try {
      await navigator.share({ url: outputUrl.value })
    } catch { /* user cancelled */ }
  })

  shortenBtn.addEventListener('click', async () => {
    shortenBtn.disabled = true
    shortenBtn.textContent = '...'
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(outputUrl.value)}`)
      if (!res.ok) throw new Error()
      const short = await res.text()
      outputUrl.value = short
      showToast('URL shortened!', 'success')
    } catch {
      showToast(t('encrypt.shorten_error', lang), 'error')
    } finally {
      shortenBtn.disabled = false
      shortenBtn.textContent = t('encrypt.shorten', lang)
    }
  })
}

const root = document.getElementById('encrypt-root')
if (root) mountEncryptForm(root)
