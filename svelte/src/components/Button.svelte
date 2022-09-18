<script lang="ts">
  export let text: string;
  export let click: any;
  export let desc: string;

  let hover = false;
  let up = false;
  if(desc == 'Select directory to make public for other machines') {
    up = true;
  }
</script>

<div class="btn" on:pointerout={() => hover = false} on:click={click} on:pointerover={() => hover = true}>
  <div class="txt" style={ hover == false ? "color:black" : "color:white"}>{ text }</div>
</div>
<p class={up == true ? "up" : ""}>{ desc }</p>

<style>
  .txt {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    font-size: 35px;
  }

  .btn {
    border: solid;
    border-radius: 0.35rem;
    border-color: black;
    background-color: white;
    height: 10vh;

    cursor: pointer;
  }

  .btn:hover {
    border-color: black;
    background-color: black;
  }

  p {
    margin-top: 20%;
    text-align: center;
    font-size: 20px;
    width: 100%;
  }

  .up {
    transform: translateY(-10px);
  }
</style>