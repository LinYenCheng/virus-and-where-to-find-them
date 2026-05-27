我想要讓這個舊的疫情地圖可以延伸新的顯示:

1. 想要可以有按鈕切換顯示老鼠地圖
2. 老鼠地圖一樣用熱區顯示，marker 點下去的 pupup 顯示詳細資料及圖片
3. 希望可以透過 URL 參數指定要顯示疫情地圖或是老鼠地圖
4. <https://ratdar.taipei/reports/export> 這個 API 會匯出 csv 想請你幫我透過 github action 定時 fetch
5. 匯出的格式可以參考 D:\github\virus-and-where-to-find-them\data\mouse.csv

---

### 修改計畫

#### 1. 資料獲取與自動化 (Data Fetching & Automation)

* **目標**: 定期從台北老鼠地圖 API 獲取最新資料。
* **動作**:
  * 修改 `generateJSON.js` 加入獲取 `https://ratdar.taipei/reports/export` 的邏輯，並儲存為 `data/mouse.csv`。
  * 建立 `.github/workflows/fetch-rat-data.yml`，設定定時執行 (例如每天凌晨) `npm run generate` 並將更新後的 `data/mouse.csv` (或轉換後的 JSON) commit 回 repo。
  * 考慮將 `mouse.csv` 轉為 `mouse.json` 以利前端直接 import 使用。

#### 2. 路由與狀態管理 (Routing & State)

* **目標**: 支援 URL 參數 `?map=rat` 或 `?map=virus`，並提供 UI 切換按鈕。
* **動作**:
  * 在 `src/index.js` 中使用 `URLSearchParams` 解析 `map` 參數。
  * 在 `src/components/App.svelte` 加入一個 Switch 或 Button Group 元件用於切換地圖模式。
  * 將地圖模式 (`mapMode`) 作為 prop 傳遞給 `Map.svelte`。

#### 3. 地圖元件增強 (`Map.svelte`)

* **目標**: 實作老鼠地圖的熱區與 Marker 顯示。
* **動作**:
  * **老鼠模式 (`rat` mode)**:
    * 載入老鼠資料 (CSV 或 JSON)。
    * 使用 `L.heatLayer` 根據經緯度產生熱區圖。
    * 使用 `L.markerClusterGroup` 產生標記，點擊後彈出 Popup。
    * Popup 內容需包含：報案時間、行政區、說明，以及最重要的「報案圖片」(`<img>` 標籤)。
  * **切換邏輯**: 當 `mapMode` 改變時，清除現有 Layer 並重新繪製對應模式的 Layer。

#### 4. UI/UX 調整

* **目標**: 整合切換按鈕並確保在不同模式下顯示正確的圖表/資訊。
* **動作**:
  * 在標題或側邊欄加入顯眼的切換按鈕。
  * 老鼠地圖模式下，可能需要暫時隱藏或調整 COVID-19 相關的數據圖表。

#### 5. 檔案結構調整

* 將 `data/mouse.csv` 移出 `.gitignore` (或至少確保 GitHub Action 可以 commit 它)，或者將其放在 `public/data/` 透過 AJAX 獲取。
