<script lang="ts">
    import { onMount } from "svelte";
    import { params } from 'svelte-spa-router';
    import { getGameById } from "../../../lib/api/game_API";
    import { goto } from "../../../lib/utils";
    import type { Game } from "../../../lib/api/game_API";

    let gameID: number | null = $state(null)
    let game: Game | null = $state(null)

    onMount(async ()=>{

    })

    $effect(()=>{
        if($params && !game){
            gameID = Number($params.gid)
            setGame()
        }
    })

    function setGame(){
        game = getGameById(gameID)
        // console.log(game)
    }
</script>


<h1>HELLO. This is game: {game?.name}</h1>