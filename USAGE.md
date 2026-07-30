# USAGE

## 概要

**TXT-Crypter Neo** は、テキストやファイルを暗号化して共有できるブラウザ専用ツールです。
パスフレーズを知る人だけが復号できます。登録不要、データはサーバーに保存されません。

### 特徴

- 暗号化・復号は全てブラウザ上で実行（サーバー送信なし）
- パスフレーズベースの暗号化（PBKDF2 + AES-CBC または Argon2id + AES-CBC）
- テキスト暗号化（URL で共有）/ ファイル暗号化（`.enc` ファイル出力）
- 元サービス [TXT-Crypter](https://tc.chigusa-web.com/) との互換性維持
- パスフレーズ強度表示・確認フィールドによる入力ミス防止
- QR コード生成 / Web Share API / URL 短縮 (TinyURL)
- マークダウンプレビュー対応（暗号化前・復号後）
- テンプレート保存・読み込み
- 暗号化/復号履歴（localStorage、最大50件）
- ダークモード（システム検出 + 手動切替）
- 多言語対応（日本語 / English）、ブラウザ言語自動検出
- PWA 対応（インストール可能、オフライン動作）
- Neo-Brutalism デザイン

---

## セットアップ

### 必要条件

- Node.js >= 22
- pnpm >= 10

### インストール

```bash
git clone <repository-url>
cd txt-crypter-neo
pnpm install
```

### 開発サーバー起動

```bash
pnpm run dev
```

http://localhost:4321 でアクセスできます。

### ビルド

```bash
pnpm run build
```

`dist/` に静的ファイルが出力されます。

### テスト

```bash
pnpm run test
```

---

## 使い方

### テキスト暗号化

1. トップページ（`/` または `/en/`）を開く
2. 暗号化したいテキストを入力（Markdown プレビュー可）
3. 任意のパスフレーズを設定（強度バーと確認フィールドあり）
4. アルゴリズムを選択（PBKDF2: 互換性重視 / Argon2id: セキュリティ重視）
5. 「URLを生成」ボタンをクリック
6. 生成されたURLをコピー・QR表示・共有・短縮して送信

生成されるURLの例:

```
https://example.com/decrypt?txt=v1a8c2d...ff
```

先頭の `v0` = PBKDF2、`v1` = Argon2id を表します。

### テキスト復号

1. 復号ページ（`/decrypt` または `/en/decrypt`）を開く
2. 暗号化されたURLをペースト（自動入力 / アルゴリズム自動判別）
3. 暗号化時に使用したパスフレーズを入力
4. 「復号」ボタンをクリック
5. 結果をコピーまたは Markdown プレビュー表示

PBKDF2 iterations はデフォルト 100,000 ですが、元サービス互換のため変更可能です。

### ファイル暗号化

1. 暗号化ページで「File」タブに切替
2. 暗号化するファイルを選択
3. パスフレーズを設定
4. 「Encrypt & Download」で `.enc` ファイルをダウンロード

### ファイル復号

1. 復号ページで「File」タブに切替
2. `.enc` ファイルを選択
3. パスフレーズを入力
4. 「Decrypt & Download」で元のファイルを復元

### テンプレート機能

- よく使うテキストを名前付きで保存可能
- 暗号化フォーム上部のプルダウンから読み込み
- 保存済みテンプレートは削除可能

### 履歴

- 暗号化・復号の履歴は折りたたみパネルに表示
- それぞれ最大50件まで自動保存（localStorage）
- 「Clear」ボタンで個別に削除可能

### Notion での利用

暗号化で生成したURLを Notion の任意のページに貼り付けて保存できます。
必要なときに開いてパスフレーズを入力すれば復号できます。

---

## 暗号化仕様

| 項目 | PBKDF2 | Argon2id |
|------|--------|----------|
| 鍵導出 | PBKDF2 (SHA-256, 100,000 iterations) | Argon2id (t=3, p=1, m=65536) |
| 暗号化 | AES-CBC (256bit) | AES-CBC (256bit) |
| ソルト | 16 bytes (ランダム) | 16 bytes (ランダム) |
| IV | 16 bytes (ランダム) | 16 bytes (ランダム) |
| URL形式 | `?txt=v0` + salt + iv + ciphertext (hex) | `?txt=v1` + salt + iv + ciphertext (hex) |
| ファイル形式 | 先頭バイト `0x00` | 先頭バイト `0x01` |

### 元サービスとの互換性

PBKDF2 モードの暗号化スキームは元の [TXT-Crypter](https://tc.chigusa-web.com/) と同一のため、
どちらのサービスで暗号化したデータも相互に復号可能です。

復号ページの「PBKDF2 iterations」でイテレーション数を指定できるため、
元サービスと異なる設定値（例: 1000）で暗号化されたデータも復号できます。

---

## デプロイ

### GitHub Pages

1. リポジトリの `Settings → Pages` で Source を **GitHub Actions** に設定
2. `main` ブランチにプッシュすると自動デプロイ

### Cloudflare Pages

1. Cloudflare Dashboard でリポジトリと連携
2. ビルド設定:
   - ビルドコマンド: `pnpm run build`
   - 出力ディレクトリ: `dist`
3. `main` ブランチにプッシュすると自動デプロイ

Cloudflare Pages は `public/_redirects` によりパス書き換えが自動適用されます。

---

## プロジェクト構成

```
txt-crypter-neo/
├── src/
│   ├── pages/
│   │   ├── index.astro          # 暗号化ページ (ja)
│   │   ├── decrypt.astro        # 復号ページ (ja)
│   │   └── en/
│   │       ├── index.astro      # 暗号化ページ (en)
│   │       └── decrypt.astro    # 復号ページ (en)
│   ├── components/
│   │   ├── EncryptForm.ts       # 暗号化フォーム (クライアントJS)
│   │   ├── DecryptForm.ts       # 復号フォーム (クライアントJS)
│   │   └── toast.ts             # トースト通知
│   ├── lib/
│   │   ├── crypto.ts            # Web Crypto API ラッパー
│   │   ├── crypto.test.ts       # 暗号化モジュールのテスト
│   │   └── storage.ts           # localStorage 履歴/テンプレート
│   ├── i18n/
│   │   ├── index.ts             # 翻訳ヘルパー
│   │   ├── en.json              # 英語翻訳 (64 keys)
│   │   └── ja.json              # 日本語翻訳 (64 keys)
│   ├── layouts/
│   │   └── BaseLayout.astro     # ベースレイアウト (nav, テーマ, 言語切替)
│   └── styles/
│       └── globals.css          # Tailwind v4 + テーマ + アニメーション
├── public/
│   ├── favicon.svg
│   ├── icon.svg                 # PWA アイコン
│   └── _redirects               # Cloudflare Pages パス書き換え
├── .github/workflows/
│   └── deploy-github-pages.yml  # GitHub Pages CI/CD
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

---

## 開発

### 技術スタック

| カテゴリ | 採用技術 |
|----------|----------|
| フレームワーク | Astro 5 (static output) |
| 言語 | TypeScript |
| UI | Tailwind CSS v4 (Neo-Brutalism) |
| 暗号化 | Web Crypto API (PBKDF2) / hash-wasm (Argon2id) |
| Markdown | marked |
| QR コード | qrcode |
| PWA | vite-plugin-pwa + Workbox |
| テスティング | Vitest |
| パッケージ管理 | pnpm |
| デプロイ | GitHub Pages / Cloudflare Pages |

### コマンド一覧

| コマンド | 説明 |
|----------|------|
| `pnpm run dev` | 開発サーバー起動 (port 4321) |
| `pnpm run build` | プロダクションビルド |
| `pnpm run preview` | ビルド結果のプレビュー |
| `pnpm run test` | 全テスト実行 (13 tests) |
| `pnpm run astro` | Astro CLI |

---

## ライセンス

MIT