# Wood Quote

木工加工業向け見積専用アプリ

---

## 概要

Wood Quote は木工加工業向けの見積専用アプリです。

材料費と加工時間から原価を計算し、適正な見積金額を短時間で作成することを目的としています。

本アプリは業務管理システムではありません。

見積作成に特化し、最短3分で見積を作成できることを目標とします。

---

## 目的

* 安く請けすぎない
* 見積作成時間を短縮する
* 材料費と加工時間から適正価格を算出する
* 実績を蓄積して見積精度を向上させる

---

## 対象ユーザー

* 木工加工業
* CNC加工業
* 家具製作
* 什器製作
* 個人事業主
* 小規模工場

---

## 実装しない機能

以下はMVPでは実装しない。

* 案件ステータス管理
* カンバン管理
* 工程管理
* CRM
* 請求書発行
* 在庫管理
* チャット機能
* 営業管理
* Fusion API連携
* DXF解析
* Gコード解析
* Gコード変換
* クラウド同期
* マルチユーザー

---

# 技術構成

## Framework

Next.js (App Router)

## Language

TypeScript

## Database

SQLite

## ORM

Prisma

## Styling

Tailwind CSS

## Import

CSV / JSON

## Export

PDF / CSV

---

# ナビゲーション

* 見積
* 材料
* 条件DB
* 設定

---

# 画面構成

## 1. 見積一覧

表示項目

* 見積名
* 顧客名
* 更新日
* 見積金額
* 粗利率

操作

* 新規見積
* 編集
* 複製
* 削除

---

## 2. 新規見積

入力項目

* 見積名
* 顧客名
* 図面ファイル
* メモ

---

## 3. 見積詳細

### タブ構成

* 材料
* 加工時間
* 試作・ロット
* 見積書

---

# 右固定サマリー

常時表示

* 材料費
* 加工費
* 段取り費
* 仕上げ費
* 検品費
* 梱包費
* 試作費
* 外注費
* 消耗品費
* リスク費
* 利益
* 見積金額
* 粗利率

入力中リアルタイム更新

---

# 材料タブ

## 目的

材料費を算出する

### 材料マスター項目

* 材料名
* カテゴリ
* 厚み
* 規格幅
* 規格長さ
* 仕入先
* 単価
* 送料
* ロス率

### 見積入力

* 必要幅
* 必要長さ
* 数量
* 歩留まり率
* 予備率

### 自動計算

* 必要面積
* 規格面積
* 必要板数
* 材料原価
* ロス費
* 送料
* 材料費合計

### 計算式

requiredArea = width × length × quantity

sheetArea = sheetWidth × sheetLength

requiredSheets = ceil(requiredArea / sheetArea / yieldRate × (1 + extraRate))

materialCost = requiredSheets × unitPrice

lossCost = materialCost × lossRate

totalMaterialCost = materialCost + lossCost + shippingCost

---

# 加工時間タブ

## 目的

加工費を算出する

### 入力

* 必要数量
* 同時加工個数
* 1回の加工時間（分）
* 段取り時間（分）
* 工具交換時間（分）
* 仕上げ時間（分）
* 検品時間（分）
* 梱包時間（分）

### 自動計算

* 加工回数
* 総加工時間
* 総作業時間

### 計算式

runCount = ceil(requiredQuantity / partsPerRun)

machineMinutes = minutesPerRun × runCount

totalWorkMinutes =
setupMinutes +
toolChangeMinutes +
machineMinutes +
finishingMinutes +
inspectionMinutes +
packingMinutes

---

# 試作・ロットタブ

## 見積タイプ

* 通常
* 試作
* ロット
* 試作＋量産

### 試作費

* データ確認費
* 設計費
* 条件出し費
* 治具検討費
* 修正対応費
* 試作リスク費

### ロットシミュレーション

初期数量

* 1
* 5
* 10
* 30
* 50
* 100

表示項目

* 数量
* 総額
* 単価
* 原価
* 利益
* 利益率

計算式

totalPrice = initialCost + unitCost × quantity

---

# 見積書タブ

表示内容

* 顧客名
* 見積名
* 発行日
* 有効期限
* 見積金額
* 備考

出力

* PDF
* CSV

---

# 設定

## 月固定費

* 家賃
* 電気代
* 通信費
* ソフト代
* 車両費
* 保険
* 消耗品
* 借入返済
* 税金積立
* 生活費
* 欲しい利益

## 稼働条件

* 営業日数
* 1日作業時間
* 加工稼働率
* 予備率

## 自動計算

requiredMonthlyRevenue = 全固定費合計

availableHours =
workingDays × hoursPerDay × utilizationRate × (1 - bufferRate)

baseHourlyRate =
requiredMonthlyRevenue ÷ availableHours

### 自動生成単価

* 設計単価
* 機械加工単価
* 段取り単価
* 手作業単価
* 仕上げ単価

初期値

設計 = 1.2 × base

機械 = 1.0 × base

段取り = 0.9 × base

手作業 = 0.8 × base

仕上げ = 0.8 × base

---

# 材料マスター

インポート対応

* CSV
* JSON

項目

* materialName
* category
* thickness
* width
* length
* supplier
* unitPrice
* shippingCost
* updatedAt

---

# 条件DB

加工条件を蓄積する

項目

* material
* toolDiameter
* toolType
* rpm
* feedRate
* depthPerPass
* stepover
* result
* memo

---

# データベース

テーブル

* estimates
* estimate_materials
* estimate_processing
* estimate_quotes
* estimate_actuals
* materials
* machining_conditions
* settings

---

# UI要件

* 業務用で見やすい
* 白ベース
* グレー基調
* 余白を広く
* 数字を大きく表示
* 右サマリー固定
* スマホ対応
* PC最適化
* レスポンシブ対応
* リアルタイム計算
* 見積金額を常時表示

---

# 最重要方針

Wood Quote は業務管理ソフトではない。

見積作成専用ツールとして設計する。

最短3分で見積作成できることを最優先とする。
