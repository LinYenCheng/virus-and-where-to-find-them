<script>
  export let show = true;
</script>

{#if show}
  <div class="loading__overlay">
    <div class="loading__content">
      <div class="loader">Loading...</div>
    </div>
  </div>
{/if}
