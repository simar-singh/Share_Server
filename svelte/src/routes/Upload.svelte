<script lang="ts">
  import Back from '../components/Back.svelte'
  let files: FileList;
  let hover = false;

  let blue = false;
  let uc: string = ""

  async function drop(e: DragEvent) {
    e.preventDefault();
    files = e.dataTransfer.files;
    blue = false;
    
    let data = new FormData();
    data.append('files', files[0]);

    let res = await fetch('/upload', {
      method: 'POST',
      body: data
    });

    uc = await res.json();
  }

  function dragOver(e) {
    e.preventDefault();
    blue = true;
  }

  function click() {
    document.getElementById('file').click();
  }
</script>

<div>
  <Back />
  <div class="outer" on:dragend={() => blue = false} on:dragover={(e) => dragOver(e)} on:drop={(e) => drop(e)}>
    <div class="body" id="upload" style={ blue === true ? "border-color: blue" : "border-color: black;"}>
      <h1>Upload File</h1>
      <div class="border">
        <div class="ico">
          <svg xmlns="http://www.w3.org/2000/svg" class="" viewBox="0 0 20 20" fill="black">
            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
          </svg>
        </div>
      </div>
      {#if uc == ''}
        <div class="btn" on:pointerout={() => hover = false} on:click={click} on:pointerover={() => hover = true}>
          <div class="txt" style={ hover == false ? "color:black" : "color:white"}>Select File</div>
        </div>
      {:else if uc == 'ok'}
        <div class="fin">Successfully uploaded file</div>
      {:else}
        <div class="fin">Failed to upload file</div>
      {/if}
    </div>
  </div>
  <input type="file" id="file" class="hidden" />
</div>

<style>
  .hidden {
    display: none;
  }

  .fin {
    font-size: 24px;
    margin-top: 2%;
  }

  .outer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .body {
    border: dashed;
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

  h1 {
    font-size: 84px;
    transform: translateY(-25%);
  }

  .btn {
    border: solid;
    border-radius: 0.85rem;
    border-color: black;
    background-color: white;
    height: 10vh;
    width: 30vh;

    cursor: pointer;
  }

  .btn:hover {
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
</style>