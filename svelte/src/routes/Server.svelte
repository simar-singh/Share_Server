<script lang="ts">
  import Back from '../components/Back.svelte';
  import { route } from '../stores/route'

  const port = 8000;
  let ip = "";

  async function click() {
    let res = await fetch('/getIP');
    let json = await res.json();
    ip = json;
    hover = false;

    await fetch('/start')
  }

  function stop() {
    fetch('/stop').then(() => {
      ip = '';
      hover = false;
    });
  }

  let hover = false;

</script>

<div>
  <Back />
  <div class="outer">
    <div class="body">
      <h1>Start Server</h1>
      <div class="border">
        <div class="ico">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      {#if ip !== '' }
        <div class="serv" on:load={() => hover = false}>Server hosted on - <b>{ ip }:{ port }</b></div>
        <div class="btn2" on:pointerout={() => hover = false} on:click={stop} on:pointerover={() => hover = true}>
          <div class="txt" style={ hover == false ? "color:black" : "color:white"}>Stop</div>
        </div>
      {:else}
        <div class="btn" on:pointerout={() => hover = false} on:click={click} on:pointerover={() => hover = true}>
          <div class="txt" style={ hover == false ? "color:black" : "color:white"}>Start</div>
        </div>
      {/if}  
    
    </div>
  </div>
</div>

<style>
  .outer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .body {
    border: solid;
    border-color: black;
    width: 95%;
    height: 85vh;
    transform: translateY(5%);

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .border {
    border: solid;
    border-radius: 100%;

    width: 35vh;
    height: 35vh;

    display: flex;
    justify-content: center;
    align-items: center;

    transform: translateY(-25%);
    margin-top: 5vh;
  }

  .ico {
    width: 30vh;
    height: 30vh;
  }

  .btn {
    border: solid;
    border-radius: 0.75rem;
    border-color: black;
    background-color: white;
    height: 10vh;
    width: 30vh;

    cursor: pointer;
  }

  .btn2 {
    border: solid;
    border-radius: 0.75rem;
    border-color: black;
    background-color: white;
    height: 7vh;
    width: 20vh;
    margin-top: 2%;

    cursor: pointer;
  }

  .btn:hover,
  .btn2:hover {
    border-color: black;
    background-color: black;
  }

  .txt {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    font-size: 35px;

    color: black
  }

  h1 {
    font-size: 84px;
    transform: translateY(-25%);
  }

  .serv {
    font-size: 20px;
  }
</style>