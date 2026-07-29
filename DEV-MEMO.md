# DEV-MEMO

## プロジェクト概要

テキスト暗号化サービス TXT-Crypter-Neo。
パスフレーズを知る人のみ復号可能なURLを生成し、サーバーにデータを保存せずに共有できる。

参考:
- https://tc.chigusa-web.com/
- https://github.com/chigusa-web/TXT-Crypter-decryption

## 技術スタック

| カテゴリ | 採用技術 |
|----------|----------|
| フレームワーク | Astro (static output) |
| 言語 | TypeScript |
| UI | Tailwind CSS |
| 暗号化 | Web Crypto API (PBKDF2 + AES-CBC) |
| テスト | Vitest |
| パッケージ管理 | pnpm |
| デプロイ | GitHub Pages + Cloudflare Pages |

## 暗号化スキーム (元サービス互換)

- 鍵導出: PBKDF2 (SHA-256, 100,000 iterations, 256bit)
- 暗号化: AES-CBC (256bit)
- URL形式: `?txt=` に salt(32) + iv(32) + ciphertext をhex格納

---

## 作業フェーズ

### Phase 1 ✅ プロジェクトスキャフォールディング
- [x] DEV-MEMO.md 作成
- [x] 手動セットアップ (Astro + Tailwind CSS + TypeScript + pnpm)
- [x] ディレクトリ構成作成 (pages, components, lib, i18n, layouts)
- [x] package.json, astro.config.mjs, tsconfig.json 作成
- [x] `pnpm install` 依存関係インストール
- [x] `pnpm run build` 成功 (4ページ生成)

### Phase 2 ✅ 暗号化モジュール実装
- [x] `src/lib/crypto.ts` 実装 (Web Crypto API: PBKDF2 + AES-CBC)
- [x] `src/lib/crypto.test.ts` テスト作成 (5 tests)
- [x] 全テスト合格

### Phase 3 ✅ ページ・コンポーネント実装
- [x] `src/layouts/BaseLayout.astro`
- [x] `src/pages/index.astro` + `src/pages/en/index.astro` (暗号化ページ)
- [x] `src/pages/decrypt.astro` + `src/pages/en/decrypt.astro` (復号ページ)
- [x] `src/components/EncryptForm.ts`
- [x] `src/components/DecryptForm.ts`
- [x] `pnpm run build` で4ページ生成確認

### Phase 4 ✅ i18n (en/ja)
- [x] Astro i18n ルーティング設定 (`prefixDefaultLocale: false`)
- [x] `src/i18n/en.json`, `src/i18n/ja.json`
- [x] 英語ページ: `/en/`, `/en/decrypt/`
- [x] 日本語ページ: `/`, `/decrypt/`
- [ ] 言語切替UIの改善 (リンクのみ現状)

### Phase 5 ✅ デプロイ構成
- [x] `.github/workflows/deploy-github-pages.yml`
- [x] `.github/workflows/deploy-cloudflare-pages.yml`
- [x] 両方とも `pnpm run build` → `dist/` をデプロイ
- [ ] 実際のデプロイ実行は別途 (token/secret設定後)

---

## 決定事項ログ

| 日付 | 決定内容 |
|------|----------|
| 2026-07-30 | 技術スタック確定 (Astro + Web Crypto API + Tailwind + pnpm) |
| 2026-07-30 | デプロイ先: GitHub Pages + Cloudflare Pages 両対応 |
| 2026-07-30 | 多言語: en/ja 対応 |
| 2026-07-30 | 暗号化ライブラリ: CryptoJS → Web Crypto API (開発終了のため) |
| 2026-07-30 | ページ構成: Astro static + クライアントサイドJS (EncryptForm.ts / DecryptForm.ts) |
| 2026-07-30 | Routing: Astro i18n, ja=root, en=/en/ |
| 2026-07-30 | 全テスト合格 (5/5) |
| 2026-07-30 | UIデザイン: neo-brutalism + 黄色基調 (#FFD700) |
| 2026-07-30 | フォント: Space Grotesk |
