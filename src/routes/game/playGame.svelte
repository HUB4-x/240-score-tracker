<script>
    import { onDestroy, onMount } from 'svelte';
    import { currentGameSettings } from '../../lib/stores/gameSettings';


    let gameId = -1



    onMount(()=>{
        const tmpArr = window.location.href.split(':')
        gameId = Number(tmpArr[tmpArr.length-1])
    })

    onDestroy(()=>{
        console.log('Here das Spiel ' + gameId +  ' Speichern')
    })


    

  </script>
  
  <!-- <h1>Game ID: {gameId}</h1> -->


  <button class="btn btn-info" on:click={()=>{}}>LOG</button>