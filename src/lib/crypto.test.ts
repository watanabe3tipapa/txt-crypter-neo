import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from './crypto'

describe('crypto', () => {
  it('should encrypt and decrypt a message', async () => {
    const text = 'Hello, World!'
    const passphrase = 'test-passphrase'
    const params = await encrypt(text, passphrase)
    expect(params).toBeTypeOf('string')
    expect(params.length).toBeGreaterThan(64) // salt(32) + iv(32) + ciphertext

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
