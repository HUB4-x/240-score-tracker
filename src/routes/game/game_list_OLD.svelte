<script lang="ts">
    import { onMount } from 'svelte';
    import type { Game } from '../../lib/api/game_API'
    import { getGames, getGameById, setGames, saveGame, updateGame, deleteGame, generateUniqueGameId } from '../../lib/api/game_API'
    import { generateRandomGame } from './random_game'
    import GameListElementComponent from './game_list_element_component_OLD.svelte';

    let games: Game[] = $state([])

    let hideFinishedGames: boolean = $state(true)
    let hideUnfinishedGames: boolean = $state(false)

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

    function handleFinishedGamesVisibilityChange(){
        hideFinishedGames = !hideFinishedGames
        hideUnfinishedGames = true
    }
    function handleUnfinishedGamesVisibilityChange(){
        hideUnfinishedGames = !hideUnfinishedGames
        hideFinishedGames = true
    }


</script>

<div class="w-full h-full max-h-full flex flex-col mx-auto p-5 px-20 space-y-4 overflow-hidden">
    <!-- <div class="flex h-fit mr-auto items-center gap-x-5 mb-10">
        <h1 class="text-2xl font-bold">Games</h1>
        <button class="btn btn-error" on:click={()=>{genGame()}}>Gen Games</button>
    </div> -->

    {#if games.length === 0}
        <div class="alert alert-info">
            <span>No players yet. Create your first player.</span>
        </div>
    {:else}
        <div class="flex flex-col size-full max-h-full overflow-hidden">

            <!-- svelte-ignore event_directive_deprecated -->
            <div class="flex flex-col w-full h-fit max-h-full border border-1 p-5 rounded rounded-lg gap-y-3">
                <button class="bg-transparent w-full flex gap-y-3" aria-label="hide/unhide finished games" on:click={handleUnfinishedGamesVisibilityChange}>
                    <h1 class="text-3xl font-bold mr-auto">Unfinished Games:</h1>
                    <div class="ml-auto my-auto flex">
                        {#if hideUnfinishedGames}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10 m-auto">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10 m-auto">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                        {/if}
                    </div>
                </button>
                {#if !hideUnfinishedGames}
                    <div class="flex flex-wrap w-full h-full gap-4 overflow-y-auto">
                        {#each games as game, index}
                            {#if game.finished}
                                <div class="flex w-75 h-40">
                                    <!-- <GameListElementComponent bind:game={games[index]}></GameListElementComponent>                     -->
                                    <GameListElementComponent gameID={game.id}></GameListElementComponent>                    
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>

            <div class="divider"></div>
            
            <div class="flex flex-col w-full h-fit max-h-full border border-1 rounded rounded-lg p-5 gap-y-3">
                <button class="bg-transparent w-full flex gap-y-3" aria-label="hide/unhide finished games" on:click={handleFinishedGamesVisibilityChange}>
                    <h1 class="text-3xl font-bold mr-auto">Finished Games:</h1>
                    <div class="ml-auto my-auto flex">
                        {#if hideFinishedGames}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10 m-auto">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10 m-auto">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                        {/if}
                    </div>
                </button>
                {#if !hideFinishedGames}
                    <div class="flex flex-wrap w-full h-full gap-4 overflow-y-auto">
                        {#each games as game, index}
                            {#if !game.finished}
                            <!-- <div class="flex gap-x-5">
                                <p>{game.id}</p>
                                <p>{game.name}</p>
                            </div> -->
                            <div class="flex w-70 h-40">
                                <GameListElementComponent gameID={game.id}></GameListElementComponent>
                            </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>

        </div>
    {/if}
</div>