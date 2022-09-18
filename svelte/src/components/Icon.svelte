<script lang="ts">
  import Button from './Button.svelte'
  import { route } from '../stores/route'
  export let ico;

  function click() {
    if(ico == 'Upload') {
      $route = '/upload';
    }

    else if(ico == 'Server') {
      $route = '/server';
    }

    else {}
  }
</script>

<div class="bg">
  <div class="border">
    <div class="btn">
      { #if ico == 'Upload' }
        <svg xmlns="http://www.w3.org/2000/svg" class="" viewBox="0 0 20 20" fill="black">
          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
          <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
        </svg>
      { :else if ico == 'Server' }
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" />
        </svg>
      {/if}
      <div class="gap"></div>
        <Button click={click} text={ico} desc={ico == 'Server' ? "Start server to access the hacking box's files " : "Send file to the hacking box" } />
      <div class="gap"></div>
    </div>
  </div>
</div>

<style>
  .bg {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
  }

  .border {
    width: 35vh;
    height: 35vh;
    border: solid;
    border-color: black;
    border-radius: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    margin-top: 17%;
  }

  .btn {
    width: 30vh;
    height: 30vh;
  }

  .gap {
    width: 100%;
    height: 10vh;
  }
</style>