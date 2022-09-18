<script lang="ts">
  import { route } from '../stores/route'
  
  function click() {
    $route = '/'
  }
  
  </script>
  
  <div on:click={click} class="back">
    <p class="txt">Back</p>
  </div>
  
  <style>
    .back {
      background-color: black;
      color: white;
      width: 10vh;
      height: 5vh;
      
      border-radius: 30px/100%;
      border-top-right-radius: 0px;
      border-bottom-right-radius: 0px;
  
      display: flex;
      justify-content: flex-end;
      align-items: center;
      transform: translateY(50%) translateX(40%);

      cursor: pointer;
    }
  
    .txt {
      font-size: 24px;
      margin-right: 1vh;
    }
  </style>