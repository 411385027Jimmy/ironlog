# IronLog PWA 🏋️‍♂️ 槓鐵現場訓練與槓片計算機

> 一款專為健身房高強度現場訓練設計的現代化、極簡、流暢的純前端 PWA（Progressive Web App）。
> 具備離線運行、全螢幕原生體驗、槓片視覺化拼裝、科學漸進熱身、RTS 官方 RPE 換算以及漸進超負荷現場日誌。

![IronLog Preview](./icons/icon-192.png)

---

## 🌟 核心設計與特色亮點

### 1. 槓片與科學熱身計算機（Plate & Warmup Calculator）
- **國際健力/舉重標準配色**：
  - 🔴 25 kg（紅） | 🔵 20 kg（藍） | 🟡 15 kg（黃） | 🟢 10 kg（綠） | ⚪ 5 kg（白） | ⚫ 2.5 kg（黑） | 🔘 1.25 kg（鉻銀）
- **精準槓鈴配片計算**：自動扣除槓重並分配單邊所需槓片，即時視覺化展示槓鈴桿、內側擋圈、槓片與夾簧。
- **支援槓鈴空槓切換**：20kg 標準奧林匹克男槓、15kg 女性/技術槓、10kg 史密斯機槓。
- **一鍵漸進熱身排程（Warmup Protocol）**：
  - Set 1: 空槓關節活化 (10次)
  - Set 2: ~50% 神經啟動 (5次)
  - Set 3: ~70% 爆發衝動 (3次)
  - Set 4: ~85% 重量適應 (1~2次，保留體力不力竭)
  - Set 5: 正式工作組 (100%)
  - **每一組熱身組皆附帶槓片明細**，點擊即可一鍵套用！

### 2. RPE / 估算 1RM (e1RM) 換算器
- **整合 RTS (Reactive Training Systems) 官方 RPE 係數矩陣**與 Epley 公式，計算肌力訓練界公認最精確的 e1RM。
- **反推目標重量**：輸入想要訓練的目標次數（如 3RM、5RM、8RM）與目標 RPE，即時反推今日應上的建議公斤數。
- **全強度對照矩陣**：即時輸出 1RM ~ 12RM 及各強度百分比訓練目的。

### 3. 現場訓練日誌與漸進超負荷（Quick Logger）
- **汗手防誤觸設計**：超大字體、高對比 OLED 深色主題、單手可及的大尺寸微調按鈕（+1.25, +2.5, +5, -2.5 kg）。
- **醒目「上次表現」對比**：選擇動作即刻顯示上次日期、組數、重量、RPE 與估算 1RM。
- **教練級漸進超負荷提示**：自動提供「重量超負荷 (+2.5kg)」或「次數超負荷 (+1次)」策略。
- **PR 突破動態回饋**：破紀錄時自動觸發專屬慶祝音效與震動反饋！

### 4. 常駐組間休息計時器
- 頂部常駐計時膠囊，隨時切換 60s、90s、120s、180s。
- 記錄完成自動起跑，倒數結束以合成聲（Web Audio API）與手機震動（Haptic Feedback）提示，無需聯網或下載音檔。

### 5. 100% 離線可用 & 資料自主
- 完全免後端、無伺服器依賴，純前端 SPA 架構。
- 支援完整 JSON 匯出備份與匯入還原，換手機或清除瀏覽器紀錄也不怕遺失資料。

---

## 🚀 如何在電腦本地預覽

因為專案是標準純前端架構，您可以透過任何靜態檔案伺服器預覽（若要測試完整 Service Worker 快取，建議透過 http/https 協議）：

### 方法 1：使用 Python 內建伺服器（推薦）
```bash
python -m http.server 8000
```
瀏覽器開啟：`http://localhost:8000`

### 方法 2：使用 Node.js npx serve
```bash
npx serve .
```

---

## 🌐 如何推上 GitHub Pages 免費部署

本專案使用相對路徑設計，可直接無縫部署於 GitHub Pages：

1. **建立 GitHub 儲存庫**：
   在 GitHub 上建立一個新的公開（Public）或私有儲存庫，例如 `ironlog` 或 `fitness-pwa`。

2. **推送本專案至 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of IronLog PWA"
   git branch -M main
   git remote add origin https://github.com/<您的用戶名>/<專案名稱>.git
   git push -u origin main
   ```

3. **啟用 GitHub Pages**：
   - 進入 GitHub 儲存庫的 **Settings**（設定）分頁。
   - 點擊左側選單的 **Pages**。
   - 在 **Build and deployment** 下方的 **Branch** 選擇 `main` 分支，資料夾選擇 `/ (root)`，點擊 **Save**。
   - 稍等約 1 分鐘，GitHub 會生成專屬網址：
     `https://<您的用戶名>.github.io/<專案名稱>/`

---

## 📱 手機「加入主畫面」全螢幕運行教學

將網址在手機瀏覽器打開後，只需兩步即可像原生 App 一樣使用（隱藏網址列、支援離線、桌面圖標）：

### iOS (iPhone / iPad - Safari 瀏覽器)
1. 使用 **Safari** 開啟您的 GitHub Pages 網址。
2. 點擊螢幕底部的 **「分享」按鈕**（向上箭頭的正方形圖標）。
3. 向下滑動找到並點擊 **「加入主畫面」 (Add to Home Screen)**。
4. 點擊右上角「新增」，桌面即會出現 **IronLog** 圖標！

### Android (Google Chrome 瀏覽器)
1. 使用 **Chrome** 開啟您的 GitHub Pages 網址。
2. 點擊右上角的 **選單圖標（三個直點 ⋮）**。
3. 點選 **「安裝應用程式」** 或 **「新增至主螢幕」**。
4. 系統會自動將其安裝為獨立運行的 PWA 應用程式。

---

## 🛠️ 技術堆疊
- **UI 框架**：Tailwind CSS (CDN, 暗黑高對比主題)
- **圖標庫**：Lucide Icons
- **資料儲存**：Browser LocalStorage + JSON Export/Import
- **離線支援**：Service Worker (Cache API) + Web App Manifest
- **音效與體感**：Web Audio API (純合成波形) + Navigator Vibration API

