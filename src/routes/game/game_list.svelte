<script lang="ts">
    import { onMount } from 'svelte';
    import type { Game } from '../../lib/api/game_API'
    import { getGames, getGameById, setGames, saveGame, updateGame, deleteGame, generateUniqueGameId } from '../../lib/api/game_API'
    import { generateRandomGame } from './random_game'
    import GameListElementComponent from './game_list_element_component_OLD.svelte';

    let games: Game[] = $state([])

    let finishedGame_Checkbox: boolean = $state(true)
    let unfinishedGame_Checkbox: boolean = $state(true)
    let game_searchstring: string = $state('')

    function loadGames() {
        games = getGames();
    }

    onMount(()=>{
        loadGames();
    });


    function genGame(n: number = 10){
        for(let i = 0; i < n; i++){
            saveGame(generateRandomGame())
        }
        loadGames()
    }

    function filter(game: Game): boolean {
        if(unfinishedGame_Checkbox && !game.finished) return true
        if(finishedGame_Checkbox && game.finished) return true

        return false
    }


</script>

<div class="w-full h-full max-h-full flex flex-col mx-auto p-5 px-20 space-y-4 overflow-hidden">
    <!-- <div class="flex h-fit mr-auto items-center gap-x-5 mb-10">
        <h1 class="text-2xl font-bold">Games</h1>
        <button class="btn btn-error" on:click={()=>{genGame()}}>Gen Games</button>
    </div> -->

    <div class="w-full h-20 rounded rounded-lg flex gap-x-5">
        <div class="flex">
            <label class="input">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input type="search" required placeholder="Search" bind:value={game_searchstring}/>
            </label>
        </div>

        <div class="flex flex-col">
            <label for="">Unfinished</label>
            <input type="checkbox" name="" id="" bind:checked={unfinishedGame_Checkbox}>
        </div>
        
        <div class="flex flex-col">
            <label for="">Finished</label>
            <input type="checkbox" name="" id="" bind:checked={finishedGame_Checkbox}>
        </div>
    </div>


    {#if games.length === 0}
        <div class="alert alert-info">
            <span>Currenlty no saved games.</span>
        </div>
    {:else}
        <div class="flex flex-col size-full max-h-full overflow-hidden">
            <!-- svelte-ignore event_directive_deprecated -->
            <div class="flex flex-col w-full h-fit max-h-full border border-1 p-5 rounded rounded-lg gap-y-3">
                <div class="flex flex-wrap w-full h-full gap-4 overflow-y-auto">
                    {#each games as game, index}
                        {@const is_game_valid = filter(game)}
                        {#if is_game_valid && ((game_searchstring !== '' && game.name.includes(game_searchstring)) || game_searchstring === '')}
                            <div class="flex w-75 h-40">
                                <GameListElementComponent gameID={game.id}></GameListElementComponent>                    
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>

        </div>
    {/if}
</div>