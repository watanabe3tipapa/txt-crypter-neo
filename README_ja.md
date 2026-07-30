[![TXT-Crypter-Neo](https://img.shields.io/badge/TXT--Crypter--Neo-FFD700?style=for-the-badge)](https://github.com/watanabe3tipapa/txt-crypter-neo)

<!-- badges -->
[![License](https://img.shields.io/github/license/watanabe3tipapa/txt-crypter-neo.svg)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/watanabe3tipapa/txt-crypter-neo/main.svg)](https://github.com/watanabe3tipapa/txt-crypter-neo/commits/main)
[![Deploy to GitHub Pages](https://github.com/watanabe3tipapa/txt-crypter-neo/actions/workflows/deploy-github-pages.yml/badge.svg)](https://github.com/watanabe3tipapa/txt-crypter-neo/actions)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Maintenance](https://img.shields.io/badge/Maintenance-Active-brightgreen.svg)](https://github.com/watanabe3tipapa/txt-crypter-neo)

[English](README.md) | [日本語](README_ja.md)

# TXT-Crypter-Neo

ブラウザだけで動作するテキスト・ファイル暗号化ツール。サーバー不要 — すべての暗号化処理は Web Crypto API を使用してブラウザ上でローカルに実行されます。暗号化したメッセージはURLで、ファイルは `.enc` 形式でパスフレーズを知る人と安全に共有できます。

## 特徴

- **ブラウザのみで動作** — 全てクライアントサイドで実行。データがサーバーに送信されることはありません。
- **2つの暗号化アルゴリズム** — PBKDF2 + AES-CBC (元サービス互換) と Argon2id + AES-CBC (より強固な鍵導出)。
- **ファイル暗号化** — 任意のファイルを暗号化して `.enc` ファイルとして共有。正しいパスフレーズで復号可能。
- **PWA対応** — プログレッシブウェブアプリとしてインストール可能。初回訪問後はオフラインでも動作。
- **QRコード生成** — 暗号化URLのQRコードを生成。
- **URL短縮** — TinyURL経由で暗号化URLを短縮。
- **マークダウンプレビュー** — 暗号化前に書式をプレビュー、復号後もマークダウンとして表示。
- **ダークモード** — システム設定に連動 + 手動切替 + 設定保存。
- **多言語対応** — 日本語と英語。

## スクリーンショット

![スクリーンショット](assets/SS.jpg)

## 動作デモ

- **GitHub Pages**: [https://watanabe3tipapa.github.io/txt-crypter-neo/](https://watanabe3tipapa.github.io/txt-crypter-neo/)
- **Cloudflare Pages**: [https://txt-crypter-neo.pages.dev/](https://txt-crypter-neo.pages.dev/)

## 使い方

インストールは不要です。デモサイトを開き、テキストを入力（またはファイルを選択）、パスフレーズを設定してURLを共有するか暗号化ファイルをダウンロードするだけです。

### テキストの暗号化

1. 暗号化ページを開く
2. メッセージを入力
3. アルゴリズムを選択（互換性重視ならPBKDF2、より強固ならArgon2id）
4. パスフレーズを入力して確認
5. 「URLを生成」をクリック
6. URLをパスフレーズを知る人と共有

### テキストの復号

1. 復号ページを開く
2. 暗号化URLをペースト
3. パスフレーズを入力
4. 「復号」をクリック

### ファイルの暗号化

1. 暗号化ページで「ファイル」タブに切替
2. ファイルを選択
3. パスフレーズを入力
4. 「暗号化してダウンロード」をクリックして `.enc` ファイルを保存

### ファイルの復号

1. 復号ページで「ファイル」タブに切替
2. `.enc` ファイルを選択
3. パスフレーズを入力
4. 「復号してダウンロード」をクリックして元のファイルを取得

## 技術スタック

| カテゴリ | 採用技術 |
|----------|----------|
| フレームワーク | Astro (static output) |
| 言語 | TypeScript |
| UI | Tailwind CSS + neo-brutalism |
| 暗号化 | Web Crypto API (PBKDF2 / Argon2id via hash-wasm) |
| テスト | Vitest |
| パッケージ管理 | pnpm |
| デプロイ | GitHub Pages + Cloudflare Pages |

## ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/watanabe3tipapa/txt-crypter-neo.git

# ディレクトリに移動
cd txt-crypter-neo

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm run dev

# テストを実行
pnpm run test

# プロダクションビルド
pnpm run build
```

## コントリビューション

コントリビューションは大歓迎です！まず[CONTRIBUTING.md](CONTRIBUTING.md)と[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)をお読みください。

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## ライセンス

MITライセンス — 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 連絡先

GitHub: [https://github.com/watanabe3tipapa/txt-crypter-neo](https://github.com/watanabe3tipapa/txt-crypter-neo)
