<script>
  import { onMount } from "svelte";
  import Loading from "./Loading.svelte";
  import Map from "./Map.svelte";
  import Select from "./Select.svelte";

  export let finalCountries = [];
  export let mapMode = "virus";
  export let showLoading = true;
  export let chartCountryOptions = [];
  export let trendCountryId = "taiwan";

  let chartOpen = false;
  let selectedFood = null;
  let selectedFoodId = null;

  const modes = [
    {
      id: "virus",
      label: "疫情",
      eyebrow: "COVID-19",
      title: "疫情熱區觀察",
      description: "以近期待過地點與病例資料疊出熱區，快速查找國家或台灣縣市。",
    },
    {
      id: "rat",
      label: "鼠跡",
      eyebrow: "Hantavirus",
      title: "鼠跡通報追蹤",
      description: "聚焦台北市鼠類出沒通報，方便掃描熱點並定位通報紀錄。",
    },
    {
      id: "food",
      label: "肥肥",
      eyebrow: "Hsinchu",
      title: "新竹補給站",
      description: "把收藏美食攤點放回街廓裡，從地圖直接挑下一站。",
    },
  ];

  $: activeMode = modes.find((mode) => mode.id === mapMode) || modes[0];
  $: if (mapMode !== "virus") {
    chartOpen = false;
  }

  onMount(() => {
    // Safety check: ensure loading disappears even if external script misses it
    const timer = setTimeout(() => {
      showLoading = false;
    }, 2000);
    const handleFoodSelect = (event) => {
      selectedFood = event.detail?.food;
      selectedFoodId = event.detail?.id || null;
      requestAnimationFrame(() => {
        if (!selectedFood?.lat || !selectedFood?.lng || !window.map) return;
        const location = [Number(selectedFood.lat), Number(selectedFood.lng)];
        window.map.invalidateSize({ pan: false });
        window.map.setView(location, 17, { animate: false });
        if (selectedFoodId) window.foodMarkerMap?.get(selectedFoodId)?.openPopup();
      });
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") closeFoodModal();
    };
    window.addEventListener("food-card-select", handleFoodSelect);
    window.addEventListener("keydown", handleKeydown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("food-card-select", handleFoodSelect);
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  function toggleMap(mode) {
    mapMode = mode;
    const url = new URL(window.location);
    url.searchParams.set("map", mode);
    window.history.pushState({}, "", url);

    if (typeof window.updateMapModeUI === "function") {
      window.updateMapModeUI(mode);
    }
  }

  function openChartModal() {
    chartOpen = true;
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  }

  function closeFoodModal() {
    selectedFood = null;
    if (selectedFoodId) window.foodMarkerMap?.get(selectedFoodId)?.closePopup();
  }

  function selectTrendCountry(id) {
    if (typeof window.updateTrendCountry === "function") {
      window.updateTrendCountry(id);
    }
  }
</script>

<Map countries={finalCountries} {mapMode} />

<aside class="left-rail" class:food-modal-active={!!selectedFood} aria-label="地圖資訊面板">
<section class="map-station" aria-label="地圖控制台">
  <div class="mode-switch" role="group" aria-label="切換地圖圖層">
    {#each modes as mode}
      <button
        type="button"
        class:active={mapMode === mode.id}
        aria-pressed={mapMode === mode.id}
        onclick={() => toggleMap(mode.id)}
      >
        <span class={`mode-dot mode-dot--${mode.id}`}></span>
        {mode.label}
      </button>
    {/each}
  </div>
</section>
<section class="list-panel" aria-label="模式資訊與資料清單">
  <header class="list-panel-heading" class:has-trend={mapMode === "virus"}>
    {#if mapMode === "virus"}
      <button
        id="btn-open"
        type="button"
        aria-expanded={chartOpen}
        aria-controls="modal"
        onclick={openChartModal}
      >趨勢圖表</button>
    {/if}
    <div class="list-panel-copy">
      <span class="station-kicker">{activeMode.eyebrow}</span>
      <h2>{activeMode.title}</h2>
      <p>{activeMode.description}</p>
    </div>
  </header>
  <div class="station-search">
    <Select />
  </div>
<div id="dataTable"></div>
</section>
</aside>
{#if selectedFood}
  <div class="food-map-modal" role="dialog" aria-modal="true" aria-label={`${selectedFood.name} 地圖資訊`}>
    <header class="food-map-modal__header">
      <h2>{selectedFood.name}</h2>
      <button type="button" aria-label="關閉地圖資訊" onclick={closeFoodModal}>×</button>
    </header>
    <article class="food-map-modal__card">
      <div class="food-map-modal__card-heading">
        <h3>{selectedFood.name}</h3>
        <span>{selectedFood.rating || "尚無評價"}</span>
      </div>
      <span class="card-tag">{selectedFood.location || "新竹"}</span>
      <p class="card-address">⌖ {selectedFood.fullAddress}</p>
      <p class="card-description">{selectedFood.description}</p>
    </article>
    <footer class="food-map-modal__footer">
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selectedFood.fullAddress} ${selectedFood.name}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >↗ 前往 Google 地圖</a>
    </footer>
  </div>
{/if}
{#if mapMode === "virus"}
  <div id="modal" class:modal-open={chartOpen} aria-hidden={!chartOpen}>
    <button id="btn-close" type="button" onclick={() => (chartOpen = false)}>
      關閉
    </button>
    <div class="chart-modal-header">
      <span class="chart-kicker">Epidemic timeline</span>
      <h2>病例曲線</h2>
      <p>用日增與移動平均看趨勢，不讓單日尖峰搶走判斷。</p>
      <label class="chart-country-picker">
        <span>切換國家</span>
        <select bind:value={trendCountryId} aria-label="切換趨勢圖國家" onchange={(event) => selectTrendCountry(event.currentTarget.value)}>
          {#each chartCountryOptions as option (option.id)}
            <option value={option.id}>{option.text}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="chart-grid">
      <section class="chart-panel" aria-label="國家/地區病例趨勢">
        <div class="chart-panel-heading">
          <span id="chart-country-title">台灣</span>
          <p id="chart-country-stat">載入中...</p>
        </div>
        <div id="chart--line"></div>
      </section>

      <section class="chart-panel" aria-label="全球病例趨勢">
        <div class="chart-panel-heading">
          <span>全球</span>
          <p id="chart-global-stat">載入中...</p>
        </div>
        <div id="chart--bar"></div>
      </section>
    </div>

    <p class="chart-source">
      <span>資料來源:</span>
      <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank"
        >JHU CSSE COVID-19 Data</a
      >
    </p>
  </div>
  <div id="chart--dounut"></div>
{/if}
<Loading show={showLoading} />

<style>
  .map-station {
    position: absolute;
    top: 18px;
    left: 58px;
    z-index: 1000;
    width: 100%;
    color: #17323a;
    background: rgba(247, 248, 244, 0.92);
    border: 1px solid rgba(23, 50, 58, 0.18);
    border-left: 5px solid #d75c4a;
    border-radius: 0;
    box-shadow: 0 18px 45px rgba(16, 34, 39, 0.22);
    backdrop-filter: blur(12px);
  }
  .station-search { padding: 8px 12px 9px; border-top: 1px solid rgba(23,50,58,.12); }
  .station-search label { display:block; margin-bottom:4px; color:#4e6b5d; font-size:.68rem; font-weight:800; letter-spacing:.08em; }
  .station-search :global(#select-country), .station-search :global(.select2-container) { position:relative; inset:auto; display:block; width:100% !important; min-width:0; }
  .station-search :global(.select2-container--default .select2-selection--single) { background:#fff; box-shadow:none; }
  .station-search :global(.select2-container--default .select2-selection--single),
  .station-search :global(.select2-container--default .select2-selection--single .select2-selection__rendered) { height:38px; line-height:38px; }
  .station-search :global(.select2-container--default .select2-selection--single .select2-selection__arrow) { height:38px; }
  .list-panel :global(.select2-container--open) { z-index:2100; }

  .station-heading {
    padding: 10px 14px 7px;
  }

  .station-kicker {
    display: block;
    color: #4e6b5d;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h2 {
    margin: 2px 0 3px;
    font-family: "Noto Serif TC", "Iowan Old Style", "Songti TC", serif;
    font-size: clamp(1.25rem, 1.05rem + 0.6vw, 1.7rem);
    line-height: 1.14;
  }

  .chart-modal-header {
    max-width: 780px;
  }

  .chart-kicker {
    display: block;
    color: #d75c4a;
    font-size: 0.72rem;
    font-weight: 850;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.35fr);
    align-items:start;
    gap: 16px;
  }

  .chart-panel {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 14px;
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(23, 50, 58, 0.12);
    border-radius: 8px;
    box-shadow: 0 18px 45px rgba(16, 34, 39, 0.13);
  }

  .chart-panel:first-child { max-height:calc(100vh - 170px); overflow:auto; }

  .chart-panel :global(#chart--line),
  .chart-panel :global(#chart--bar) {
    flex: 1 1 0;
    min-height: 260px;
    height: 300px;
  }

  .chart-panel-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 8px;
  }

  .chart-panel-heading span {
    color: #17323a;
    font-weight: 900;
  }

  .chart-panel-heading p {
    color: #4e6b5d;
    font-size: 0.82rem;
    font-weight: 750;
    text-align: right;
  }

  p {
    margin: 0;
    color: #39535a;
    font-size: 0.84rem;
    line-height: 1.38;
  }

  .mode-switch {
    display: flex;
    gap: 1px;
    padding: 3px 5px;
    background: rgba(220, 234, 228, 0.78);
    border-top: 1px solid rgba(23, 50, 58, 0.13);
    border-radius: 0 0 7px 7px;
  }

  .mode-switch button {
    flex: 1 1 0;
    min-height: 34px;
    padding: 6px 8px;
    color: #17323a;
    background: transparent;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.92rem;
    font-weight: 800;
    transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
  }

  .mode-switch button:hover,
  .mode-switch button:focus-visible {
    background: rgba(255, 255, 255, 0.78);
    outline: none;
  }

  .mode-switch button:focus-visible {
    box-shadow: 0 0 0 3px rgba(221, 174, 70, 0.45);
  }

  .mode-switch button.active {
    color: #f7f8f4;
    background: #17323a;
  }

  .mode-dot {
    display: inline-block;
    width: 0.58rem;
    height: 0.58rem;
    margin-right: 0.38rem;
    border-radius: 50%;
    vertical-align: 0.03em;
    background: #d75c4a;
  }

  .mode-dot--rat {
    background: #ddae46;
  }

  .mode-dot--food {
    background: #4e6b5d;
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-switch button {
      transition: none;
    }
  }

  @media (max-width: 720px) {
    .map-station {
      top: 10px;
      left: 10px;
      right: auto;
      width: min(350px, calc(100vw - 20px));
      z-index: 1002;
    }
    .station-heading {
      padding: 11px 13px 8px;
    }

    p {
      font-size: 0.82rem;
    }

    .mode-switch button {
      min-height: 42px;
      padding-inline: 6px;
    }

    .chart-grid { grid-template-columns: 1fr; }
    .chart-panel:first-child { max-height:none; overflow:visible; }

    .chart-panel-heading {
      display: block;
    }

    .chart-panel-heading p {
      margin-top: 3px;
      text-align: left;
    }
  }
</style>
