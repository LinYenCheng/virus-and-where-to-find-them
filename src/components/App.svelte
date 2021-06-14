<script>
  import Loading from "./Loading.svelte";
  import Map from "./Map.svelte";
  import Select from "./Select.svelte";

  export let finalCountries = [];
</script>

<Map countries={finalCountries} />
<Select />
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
<Loading />
