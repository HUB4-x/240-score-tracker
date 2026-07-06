<script lang="ts">
    import { onMount } from "svelte";
    import { params } from 'svelte-spa-router';
    import { getGameById } from "../../../lib/api/game_API";
    import { goto } from "../../../lib/utils";
    import type { Game } from "../../../lib/api/game_API";
    import { getPlayerById } from "../../../lib/api/player_API";

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


<!-- <h1>HELLO. This is game: {game?.name}</h1> -->
{#if game}
    <div class="size-full rounded rounded-lg bg-base-300 flex gap-x-2 p-2">
        <!-- Scoring Table -->
        <div class="h-full w-1/4 rounded-l-lg">
            {#each game.playerIDs_in_game as pid, index}
                {@const player = getPlayerById(pid)}
                <div class="w-full h-50 bg-red-800">
                    <p>{player.name}</p>
                </div>
            {/each}
        </div>
        
        <!-- Scoring Input Tiles-->
        <div class="h-full w-3/4 rounded-r-lg"></div>
    </div>
{/if}