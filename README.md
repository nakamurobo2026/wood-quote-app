# Wood Quote MVP

木工加工業向けの見積専用アプリです。業務管理、CRM、カンバン、請求書、Fusion/DXF/Gコード連携は実装していません。

## 技術構成

- Next.js App Router
- TypeScript
- Prisma
- SQLite
- Tailwind CSS

## セットアップ

通常の Node.js / npm 環境では以下で起動できます。

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

起動後、以下を開きます。

```txt
http://localhost:3000
```

## GitHub Codespaces でのセットアップ

GitHub 上でもセットアップできます。

1. リポジトリページで `Code` を押す
2. `Codespaces` タブを開く
3. `Create codespace on main` を押す
4. セットアップ完了後、ポート `3000` のプレビューを開く

`.devcontainer/devcontainer.json` により、Codespaces 作成時に以下が自動実行されます。

```bash
npm install
npm run setup
```

Codespaces に接続すると、以下も自動実行されます。

```bash
npm run dev
```

## GitHub Actions

`.github/workflows/ci.yml` で以下を検証します。

```bash
npm install
npm run setup
npx tsc --noEmit
npm run build
```

## Codex バンドル環境での起動

この作業環境では npm が PATH にないため、pnpm を使っています。

```powershell
$env:PATH='C:\Users\unknown\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
C:\Users\unknown\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd install
.\node_modules\.bin\prisma.CMD generate
.\node_modules\.bin\tsx.CMD prisma/init-db.ts
.\node_modules\.bin\tsx.CMD prisma/seed.ts
.\node_modules\.bin\next.CMD dev
```

## 実装済み画面

- 設定
- 見積一覧
- 新規見積
- 見積詳細
- 材料タブ
- 加工時間タブ
- 試作・ロットタブ
- 実績タブ
- 見積書プレビュー
- 材料マスター
- 条件DB

## 方針

- 見積専用ツールとして作る
- 右側サマリー固定
- 見積金額を常に表示
- 入力変更時にリアルタイム再計算
- 白・グレー基調
- 数字を大きく表示
- スマホ対応

## SQLite 初期化

Prisma schema は `prisma/schema.prisma` に定義しています。

このMVPではローカル起動を優先し、SQLiteテーブル作成は `prisma/init-db.ts` で実行します。

```bash
npm run setup
```
