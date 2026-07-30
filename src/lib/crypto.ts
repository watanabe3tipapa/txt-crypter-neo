export type Algorithm = 'pbkdf2' | 'argon2id'

export const DEFAULT_ITERATIONS = 100_000
const KEY_SIZE = 256
const SALT_SIZE = 16
const IV_SIZE = 16

function hex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

function encodeText(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

function decodeText(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf)
}

async function deriveKeyPBKDF2(
  passphrase: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encodeText(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CBC', length: KEY_SIZE },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function deriveKeyArgon2id(
  passphrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const { argon2id } = await import('hash-wasm')
  const key = await argon2id({
    password: passphrase,
    salt,
    iterations: 3,
    parallelism: 1,
    memorySize: 65536,
    hashLength: 32,
    outputType: 'binary',
  })
  return crypto.subtle.importKey(
    'raw',
    key as Uint8Array,
    { name: 'AES-CBC', length: KEY_SIZE },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(
  plaintext: string,
  passphrase: string,
  algorithm: Algorithm = 'pbkdf2',
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE))
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE))

  let key: CryptoKey
  if (algorithm === 'argon2id') {
    key = await deriveKeyArgon2id(passphrase, salt)
  } else {
    key = await deriveKeyPBKDF2(passphrase, salt, DEFAULT_ITERATIONS)
  }

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    encodeText(plaintext),
  )

  const data = hex(salt) + hex(iv) + hex(encrypted)
  if (algorithm === 'argon2id') {
    return 'v1' + data
  }
  return 'v0' + data
}

export async function decrypt(
  url: string,
  passphrase: string,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<string> {
  const params = new URL(url).searchParams
  const message = params.get('txt')
  if (!message) throw new Error('No encrypted data found in URL')

  let algorithm: Algorithm
  let data: string

  if (message.startsWith('v1')) {
    algorithm = 'argon2id'
    data = message.slice(2)
  } else if (message.startsWith('v0')) {
    algorithm = 'pbkdf2'
    data = message.slice(2)
  } else {
    algorithm = 'pbkdf2'
    data = message
  }

  const salt = fromHex(data.slice(0, 32))
  const iv = fromHex(data.slice(32, 64))
  const encrypted = fromHex(data.slice(64))

  let key: CryptoKey
  if (algorithm === 'argon2id') {
    key = await deriveKeyArgon2id(passphrase, salt)
  } else {
    key = await deriveKeyPBKDF2(passphrase, salt, iterations)
  }

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    encrypted,
  )
  return decodeText(decrypted)
}
