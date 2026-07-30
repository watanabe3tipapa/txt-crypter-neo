# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Browser-only text encryption with Web Crypto API
- PBKDF2 + AES-CBC (backward compatible with original TXT-Crypter)
- Argon2id + AES-CBC (stronger key derivation via hash-wasm)
- File encryption / decryption with `.enc` file format
- PWA support (service worker, manifest, offline caching)
- QR code generation for encrypted URLs
- URL shortening via TinyURL API
- Markdown preview (encrypt and decrypt sides)
- Dark mode (system-aware, manual toggle, persistent)
- Multi-language support (Japanese and English)
- Language auto-detection and manual toggle
- Passphrase strength meter
- Passphrase confirmation field
- Toast notification system
- Encryption / decryption history (localStorage)
- Template save / load
- Neo-brutalism design with yellow (#FFD700) theme
- Tailwind CSS styling

### Changed

- n/a

### Fixed

- n/a

### Security

- All encryption performed client-side — no data sent to servers
- CSP headers configured
- Runtime caching for Google Fonts

[Unreleased]: https://github.com/watanabe3tipapa/txt-crypter-neo/compare/v1.0.0...HEAD
