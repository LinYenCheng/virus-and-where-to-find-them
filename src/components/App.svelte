<script>
  import { onMount } from "svelte";
  import Loading from "./Loading.svelte";
  import Map from "./Map.svelte";
  import Select from "./Select.svelte";

  export let finalCountries = [];
  export let mapMode = "virus";
  export let showLoading = true;

  let chartOpen = false;

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
    return () => clearTimeout(timer);
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
</script>

<Map countries={finalCountries} {mapMode} />

<section class="map-station" aria-label="地圖控制台">
  <div class="station-heading">
    <span class="station-kicker">{activeMode.eyebrow}</span>
    <h2>{activeMode.title}</h2>
    <p>{activeMode.description}</p>
  </div>

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

<Select />
{#if mapMode === "virus"}
  <button
    id="btn-open"
    type="button"
    aria-expanded={chartOpen}
    aria-controls="modal"
    onclick={openChartModal}
  >
    趨勢圖表
  </button>
  <div id="modal" class:modal-open={chartOpen} aria-hidden={!chartOpen}>
    <button id="btn-close" type="button" onclick={() => (chartOpen = false)}>
      關閉
    </button>
    <div class="chart-modal-header">
      <span class="chart-kicker">Epidemic timeline</span>
      <h2>病例曲線</h2>
      <p>用日增與移動平均看趨勢，不讓單日尖峰搶走判斷。</p>
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
    width: min(330px, calc(100vw - 140px));
    color: #17323a;
    background: rgba(247, 248, 244, 0.92);
    border: 1px solid rgba(23, 50, 58, 0.18);
    border-left: 5px solid #d75c4a;
    border-radius: 8px;
    box-shadow: 0 18px 45px rgba(16, 34, 39, 0.22);
    backdrop-filter: blur(12px);
  }

  .station-heading {
    padding: 14px 16px 10px;
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
    margin: 4px 0 5px;
    font-family: "Noto Serif TC", "Iowan Old Style", "Songti TC", serif;
    font-size: clamp(1.25rem, 1.05rem + 0.6vw, 1.7rem);
    line-height: 1.18;
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
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .mode-switch {
    display: flex;
    gap: 1px;
    padding: 5px;
    background: rgba(220, 234, 228, 0.78);
    border-top: 1px solid rgba(23, 50, 58, 0.13);
    border-radius: 0 0 7px 7px;
  }

  .mode-switch button {
    flex: 1 1 0;
    min-height: 38px;
    padding: 8px 10px;
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
      top: auto;
      bottom: 16px;
      left: 12px;
      right: 12px;
      width: auto;
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

    .chart-grid {
      grid-template-columns: 1fr;
    }

    .chart-panel-heading {
      display: block;
    }

    .chart-panel-heading p {
      margin-top: 3px;
      text-align: left;
    }
  }
</style>
