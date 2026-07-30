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
- [x] 言語切替UIの改善 (navボタン、JSで同ページ切替)

### Phase 5 ✅ デプロイ構成
- [x] `.github/workflows/deploy-github-pages.yml`
- [x] 削除: `.github/workflows/deploy-cloudflare-pages.yml` (ネイティブGitHub連携に移行)
- [x] GitHub Pages: 自動デプロイ完了 (https://watanabe3tipapa.github.io/txt-crypter-neo/)
- [x] Cloudflare Pages: GitHub連携設定済 (https://txt-crypter-neo.pages.dev/、push時に自動デプロイ)

### Phase A ✅ コアUX強化
- [x] A-1: パスフレーズ強度表示 (簡易エントロピー計算 + バー)
- [x] A-2: パスフレーズ確認フィールド (一致チェック + 視覚的フィードバック)
- [x] A-3: 復号結果コピーボタン
- [x] A-4: トースト通知 (`src/components/toast.ts`)
- [x] A-5: ブラウザ言語自動検出 (初回アクセス時のみ)
- [x] A-6: ダークモード (システム検出 + 手動切替 + localStorage永続化)

### Phase B ✅ PWA対応
- [x] `vite-plugin-pwa` 導入 (v1.3.0)
- [x] manifest.webmanifest / アイコン設定 (SVG)
- [x] Service Worker (12エントリ precache, 25.8KiB)
- [x] Google Fonts ランタイムキャッシュ設定

### Phase C ✅ QR・シェア・短縮
- [x] QRコード生成 (`qrcode` v1.5.4, canvas出力)
- [x] Share API (`navigator.share`)
- [x] URL短縮 (TinyURL API)

### Phase D ✅ ストレージ機能
- [x] 暗号化/復号履歴 (`src/lib/storage.ts`, localStorage, 最大50件)
- [x] テンプレート保存 (名前付き保存/読込/削除)
- [x] 履歴パネル (details/summary 折り畳み)

### Phase E ✅ 高度な暗号化
- [x] `hash-wasm` v4.12.0 導入
- [x] `crypto.ts` に Argon2id 版鍵導出 (`deriveKeyArgon2id`)
- [x] URL プレフィックス識別 (v0=PBKDF2, v1=Argon2id)
- [x] EncryptForm: アルゴリズム選択 (select) UI
- [x] DecryptForm: URL 入力から自動判別 + バッジ表示
- [x] 9 tests 合格 (PBKDF2 5 + Argon2id 4)

### Phase F ✅ 発展的機能
- [x] マークダウンプレビュー (`marked`, EncryptForm/DecryptForm 両方に切替UI)
- [x] ファイル暗号化/復号 (encryptFile/decryptFile, TabUI, .enc ファイル ダウンロード/アップロード)
- [x] 13 tests 合格 (PBKDF2 5 + Argon2id 4 + File 4)

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
| 2026-07-30 | Phase A〜F 全機能追加計画策定 |
| 2026-07-30 | Phase A: パスフレーズ強度/確認/トースト/言語自動検出/ダークモード実装 |
| 2026-07-30 | Phase B: PWA対応 (vite-plugin-pwa, SW, manifest, precache 12 entries) |
| 2026-07-30 | Phase C: QRコード/qrcode, Share API, URL短縮/TinyURL 実装 |
| 2026-07-30 | Phase D: 暗号化/復号履歴 (localStorage), テンプレート保存 |
| 2026-07-30 | Phase E: Argon2id 対応 (hash-wasm), アルゴリズム選択UI, 自動判別 |
| 2026-07-30 | Phase F: マークダウンプレビュー (marked), ファイル暗号化保留中 |
