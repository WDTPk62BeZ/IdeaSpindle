# IdeaSpindle

**絵の練習をもっと楽しく、もっとスマートに。**
**Make drawing practice more fun and smarter.**

---

## 概要 / Overview

IdeaSpindle は、絵を描く人のためのトレーニングアプリです。
写真スライドショー・記憶模写・ランダムお題の 3 つのモードで、日々のドローイング練習をサポートします。

IdeaSpindle is a training app designed for artists and drawing enthusiasts.
Three modes — photo slideshow, memory drawing, and random prompts — support your daily drawing practice.

---

## 機能 / Features

### 📷 スライドショー / Slideshow

写真ライブラリのアルバムから画像を選び、設定した時間ごとに自動で切り替えます。
資料を次々と見ながら模写する「クロッキー練習」に最適です。

Select an album from your photo library and automatically cycle through images at a set interval.
Ideal for gesture drawing and quick-sketch sessions.

- アルバム選択 / Album selection
- 表示時間の設定（30秒〜1時間）/ Configurable display duration (30s – 1h)
- 手動スキップ（⏭）/ Manual skip (⏭)

---

### 🧠 記憶 / Memory

画像を一定時間表示したあとに非表示にし、記憶を頼りに絵を描くトレーニングです。
観察力・記憶力・描写力を同時に鍛えます。

View an image for a set time, then draw it from memory once it's hidden.
Trains observation, memory, and drawing accuracy simultaneously.

- 表示時間・描画時間をそれぞれ設定 / Separate view and draw timers
- 「答えを見る」で正解画像を確認 / Peek at the answer anytime
- スキップボタン（⏭）で次の画像へ / Skip to the next image (⏭)

---

### 🎲 ランダムお題 / Random Prompts

動詞/形容詞 と 名詞 をランダムに組み合わせてお題を生成します。
自由な発想でスケッチするクリエイティブ練習に最適です。

Generates prompts by randomly combining a verb/adjective with a noun.
Perfect for creative sketching and imagination training.

- タイマー付きの自動切替 / Auto-switching with timer
- 各単語をタップしてブラウザで意味を確認 / Tap words to look up meanings in a browser
- 単語リストはアプリ内で追加・削除・リセット可能 / Word lists are editable in-app

---

### ⚙️ 設定 / Settings

- 言語切替（日本語 / English）/ Language toggle (Japanese / English)
- 単語リストの編集（動詞/形容詞・名詞）/ Word list editor (verbs/adjectives & nouns)
- フィードバック送信 / Send feedback
- プライバシーポリシー / Privacy policy

---

## 動作環境 / Requirements

| | |
|---|---|
| プラットフォーム / Platform | iOS / Android |
| フレームワーク / Framework | React Native (Expo) |
| 対応方向 / Orientation | 縦横両対応 / Portrait & Landscape |

---

## セットアップ / Setup

```bash
# 依存パッケージのインストール / Install dependencies
npm install

# 開発サーバーの起動 / Start development server
npm start

# iOS シミュレーターで起動 / Run on iOS simulator
npm run ios

# Android エミュレーターで起動 / Run on Android emulator
npm run android
```

> Expo CLI および EAS CLI が必要です。
> Expo CLI and EAS CLI are required.

---

## 権限 / Permissions

| 権限 / Permission | 用途 / Purpose |
|---|---|
| 写真ライブラリ / Photo Library | スライドショー・記憶モードで写真を表示するため / To display photos in Slideshow and Memory modes |

---

## 開発者 / Developer

**tenmetsu-soft**
📧 tenmetsusoft@gmail.com
🔗 [プライバシーポリシー / Privacy Policy](https://tenmetsusoft.github.io/#privacy)

---

## バージョン / Version

`1.0.0`
