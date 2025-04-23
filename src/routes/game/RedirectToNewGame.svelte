<script>
    import { onMount } from "svelte";
    import GameAPI from "../../lib/stores/gameAPI";

    const tmpArr = window.location.href.split(':')
    const gameId = tmpArr[tmpArr.length-1]

    //Fetch Current Game Stats
    onMount(()=>{
        let currentGame = GameAPI.getCurrentGame(''+gameId)
        console.log(gameId)
        if(!currentGame){
            window.location.href = '#/noSuchGame'
        } else {
            console.log('Redirecting to', gameId)
            window.location.href = `#/game/play/:${gameId}`
        }
        window.location.reload()
        console.log('HERE')
    })
</script>