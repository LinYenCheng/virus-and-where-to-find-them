<script>
  import { onMount } from "svelte";
  import Loading from "./Loading.svelte";
  import Map from "./Map.svelte";
  import Select from "./Select.svelte";

  export let finalCountries = [];
  export let mapMode = "virus";
  export let showLoading = true;

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
</script>

<Map countries={finalCountries} {mapMode} />

<div class="map-controls">
  <button
    class:active={mapMode === "virus"}
    on:click={() => toggleMap("virus")}
  >
    疫情地圖
  </button>
  <button class:active={mapMode === "rat"} on:click={() => toggleMap("rat")}>
    老鼠地圖
  </button>
</div>

<Select />
{#if mapMode === "virus"}
  <button id="btn-open">開啟圖表</button>
  <div id="modal">
    <button id="btn-close">關閉圖表</button>
    <div id="chart--line" />
    <div id="chart--bar" />
    <p>
      <span>資料來源:</span>
      <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank"
        >JHU CSSE COVID-19 Data</a
      >
    </p>
    <p />
  </div>
  <div id="chart--dounut" />
{/if}
<Loading show={showLoading} />

<style>
  .map-controls {
    position: absolute;
    top: 10px;
    left: 50px;
    z-index: 1000;
    display: flex;
    gap: 5px;
  }
  .map-controls button {
    padding: 6px 10px;
    background: white;
    border: 1px solid #ccc;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.4);
  }
  .map-controls button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  @media (max-width: 480px) {
    .map-controls {
      top: auto;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: max-content;
      z-index: 1002;
    }
    .map-controls button {
      padding: 10px 15px;
      font-size: 16px;
    }
  }
</style>
