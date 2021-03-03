<script>
  import Loading from './Loading.svelte';
  import Map from './Map.svelte';
  import Select from './Select.svelte';

  export let finalCountries = [];
</script>

<Map countries={finalCountries} />
<Select />
<button id="btn-open">開啟圖表</button>
<div id="modal">
  <button id="btn-close">關閉圖表</button>
  <div id="chart--line" />
  <div id="chart--bar" />
</div>
<div id="chart--dounut" />
<Loading />
