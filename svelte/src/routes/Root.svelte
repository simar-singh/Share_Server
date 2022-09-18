<script lang="ts">
  import Icon from '../components/Icon.svelte'
</script>

<div class="outer">
  <div class="section">
    <Icon ico="Server" />
  </div>
  <div class="bg">
    <div class="line"></div>
  </div>
  <div class="section">
    <Icon ico="Upload" />
  </div>
</div>

<style>
  .outer {
    width: 100%;
    height: 95vh;
    display: flex;
    justify-content: space-between;
  }

  .section {
    width: 100vh;
    display: flex;
    flex-direction: column;
  }

  .bg {
    display: flex;
    align-items: center;
  }

  .line {
    height: 85vh;
    width: 3px;
    background-color: black;
    border: thin;
  }
</style>