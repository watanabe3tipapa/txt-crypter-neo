import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, encryptFile, decryptFile } from './crypto'

describe('crypto PBKDF2', () => {
  it('should encrypt and decrypt a message', async () => {
    const text = 'Hello, World!'
    const passphrase = 'test-passphrase'
    const params = await encrypt(text, passphrase)
    expect(params).toBeTypeOf('string')
    expect(params.length).toBeGreaterThan(64)

    const decrypted = await decrypt(`https://example.com/decrypt?txt=${params}`, passphrase)
    expect(decrypted).toBe(text)
  })

  it('should fail with wrong passphrase', async () => {
    const params = await encrypt('secret', 'correct-pass')
    await expect(
      decrypt(`https://example.com/decrypt?txt=${params}`, 'wrong-pass'),
    ).rejects.toThrow()
  })

  it('should produce different output each time', async () => {
    const p1 = await encrypt('same text', 'pass')
    const p2 = await encrypt('same text', 'pass')
    expect(p1).not.toBe(p2)
  })

  it('should handle Japanese text', async () => {
    const text = 'こんにちは世界'
    const params = await encrypt(text, 'password')
    const decrypted = await decrypt(`https://example.com/decrypt?txt=${params}`, 'password')
    expect(decrypted).toBe(text)
  })

  it('should handle empty string', async () => {
    const params = await encrypt('', 'pass')
    const decrypted = await decrypt(`https://example.com/decrypt?txt=${params}`, 'pass')
    expect(decrypted).toBe('')
  })
})

describe('crypto Argon2id', () => {
  it('should encrypt and decrypt with argon2id', async () => {
    const text = 'Hello Argon2id!'
    const passphrase = 'test-pass'
    const params = await encrypt(text, passphrase, 'argon2id')
    expect(params).toMatch(/^v1/)
    const decrypted = await decrypt(`https://example.com/decrypt?txt=${params}`, passphrase)
    expect(decrypted).toBe(text)
  })

  it('should fail with wrong passphrase (argon2id)', async () => {
    const params = await encrypt('secret', 'correct-pass', 'argon2id')
    await expect(
      decrypt(`https://example.com/decrypt?txt=${params}`, 'wrong-pass'),
    ).rejects.toThrow()
  })

  it('should handle Japanese text with argon2id', async () => {
    const params = await encrypt('日本語もOK', 'pass', 'argon2id')
    const decrypted = await decrypt(`https://example.com/decrypt?txt=${params}`, 'pass')
    expect(decrypted).toBe('日本語もOK')
  })

  it('should produce v1-prefixed output', async () => {
    const params = await encrypt('prefix-test', 'pass', 'argon2id')
    expect(params.startsWith('v1')).toBe(true)
  })
})

describe('crypto file', () => {
  it('should encrypt and decrypt file data (PBKDF2)', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5])
    const passphrase = 'file-pass'
    const encrypted = await encryptFile(data, passphrase, 'pbkdf2')
    expect(encrypted[0]).toBe(0)
    const result = await decryptFile(encrypted, passphrase)
    expect(result.algorithm).toBe('pbkdf2')
    expect(Array.from(result.data)).toEqual([1, 2, 3, 4, 5])
  })

  it('should encrypt and decrypt file data (Argon2id)', async () => {
    const data = new Uint8Array([10, 20, 30])
    const passphrase = 'argon-file'
    const encrypted = await encryptFile(data, passphrase, 'argon2id')
    expect(encrypted[0]).toBe(1)
    const result = await decryptFile(encrypted, passphrase)
    expect(result.algorithm).toBe('argon2id')
    expect(Array.from(result.data)).toEqual([10, 20, 30])
  })

  it('should fail with wrong passphrase', async () => {
    const data = new Uint8Array([99])
    const encrypted = await encryptFile(data, 'correct', 'pbkdf2')
    await expect(decryptFile(encrypted, 'wrong')).rejects.toThrow()
  })

  it('should handle large binary data', async () => {
    const data = new Uint8Array(1024).map((_, i) => i % 256)
    const encrypted = await encryptFile(data, 'large-pass', 'argon2id')
    const result = await decryptFile(encrypted, 'large-pass')
    expect(result.data.length).toBe(1024)
    expect(Array.from(result.data)).toEqual(Array.from(data))
  })
})
