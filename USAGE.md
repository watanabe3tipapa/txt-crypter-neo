# USAGE

## 概要

**TXT-Crypter Neo** は、テキストを暗号化してURLで共有できるブラウザ専用ツールです。
パスフレーズを知る人だけが復号できます。登録不要、データはサーバーに保存されません。

### 特徴

- 暗号化・復号は全てブラウザ上で実行（サーバー送信なし）
- パスフレーズベースの暗号化（PBKDF2 + AES-CBC）
- 元サービス [TXT-Crypter](https://tc.chigusa-web.com/) との互換性維持
- Notion など任意のアプリに埋め込み可能
- 多言語対応（日本語 / English）
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

### 暗号化

1. トップページ（`/` または `/en/`）を開く
2. 暗号化したいテキストを入力
3. 任意のパスフレーズを設定
4. 「URLを生成」ボタンをクリック
5. 生成されたURLをコピーして共有

生成されるURLの例:

```
https://example.com/decrypt?txt=5a8c2d...ff
```

### 復号

1. 復号ページ（`/decrypt` または `/en/decrypt`）を開く
2. 暗号化されたURLをペースト（自動入力されます）
3. 暗号化時に使用したパスフレーズを入力
4. 「復号」ボタンをクリック

### Notion での利用

暗号化で生成したURLを Notion の任意のページに貼り付けて保存できます。
必要なときに開いてパスフレーズを入力すれば復号できます。

---

## 暗号化仕様

| 項目 | 仕様 |
|------|------|
| 鍵導出 | PBKDF2 (SHA-256, 100,000 iterations) |
| 暗号化アルゴリズム | AES-CBC (256bit) |
| ソルト | 16 bytes (ランダム) |
| IV | 16 bytes (ランダム) |
| URLパラメータ | `?txt=` |
| データ形式 | `salt(32)` + `iv(32)` + `ciphertext` (hex) |

### 元サービスとの互換性

暗号化スキームは元の [TXT-Crypter](https://tc.chigusa-web.com/) と同一のため、
どちらのサービスで暗号化したデータも相互に復号可能です。

復号ページの「PBKDF2 iterations」でイテレーション数を指定できるため、
元サービスと異なる設定値（例: 1000）で暗号化されたデータも復号できます。

---

## デプロイ

### GitHub Pages

1. リポジトリの `Settings → Pages` で Source を **GitHub Actions** に設定
2. `main` ブランチにプッシュすると自動デプロイ

### Cloudflare Pages

1. リポジトリの Secrets に以下を設定:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. `main` ブランチにプッシュすると自動デプロイ

---

## プロジェクト構成

```
txt-crypter-neo/
├── src/
│   ├── pages/
│   │   ├── index.astro        # 暗号化ページ (日本語)
│   │   ├── decrypt.astro      # 復号ページ (日本語)
│   │   └── en/                # 英語ページ
│   ├── components/
│   │   ├── EncryptForm.ts     # 暗号化フォーム (クライアントJS)
│   │   └── DecryptForm.ts     # 復号フォーム (クライアントJS)
│   ├── lib/
│   │   ├── crypto.ts          # Web Crypto API ラッパー
│   │   └── crypto.test.ts     # 暗号化モジュールのテスト
│   ├── i18n/
│   │   ├── index.ts           # 翻訳ヘルパー
│   │   ├── en.json
│   │   └── ja.json
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── styles/
│       └── globals.css        # Tailwind + テーマ設定
├── .github/workflows/         # CI/CD
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

---

## 開発

### 技術スタック

| カテゴリ | 採用技術 |
|----------|----------|
| フレームワーク | Astro (static output) |
| 言語 | TypeScript |
| UI | Tailwind CSS (Neo-Brutalism) |
| 暗号化 | Web Crypto API |
| テスティング | Vitest |
| パッケージ管理 | pnpm |
| デプロイ | GitHub Pages / Cloudflare Pages |

### コマンド一覧

| コマンド | 説明 |
|----------|------|
| `pnpm run dev` | 開発サーバー起動 |
| `pnpm run build` | プロダクションビルド |
| `pnpm run preview` | ビルド結果のプレビュー |
| `pnpm run test` | テスト実行 |
| `pnpm run astro` | Astro CLI |

---

## ライセンス

MIT
