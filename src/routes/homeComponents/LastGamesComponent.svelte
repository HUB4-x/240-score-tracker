<script>
    import { onMount } from "svelte";
    import GameAPI from "../../lib/stores/gameAPI";
    
    
    let allRunningGames = []
    let allSavedGames = []

    onMount(()=>{
        fetchCurrentGames()
        fetchSavedGames()
    })

    function fetchCurrentGames(){
        allRunningGames = []
        const runningGameIDList = GameAPI.getAllCurrentGameIDs()
        runningGameIDList.forEach(id => {
            const tmp_game = GameAPI.getCurrentGame(id)
            if(tmp_game){
                allRunningGames = [...allRunningGames,tmp_game]
            } else {
                GameAPI.deleteCurrentGame(id)
            }
        })
    }

    function fetchSavedGames(){
        allSavedGames = GameAPI.getAllSavedGames()
    }

    function deleteGameButton(id, savedGame){
        if(savedGame){
            GameAPI.deleteSavedGame(id)
            fetchSavedGames()
        } else {
            GameAPI.deleteCurrentGame(id)
            fetchCurrentGames()
        }
    }
</script>




<div class="h-full w-full flex flex-col gap-x-1">
    {#if allRunningGames.length !== 0 || allSavedGames.length !== 0}
    <div class="divider">Open Games</div>
    <div class="h-full w-full flex flex-col gap-y-1 overflow-y-auto">
        {#each allRunningGames as game, index}
        <div class="w-full h-fit {index%2===0? 'bg-cyan-900/70' : 'bg-cyan-600/80'} rounded flex">
            <div class="flex w-full h-fit gap-x-3">
                <!-- <p>ID: {game.id.slice(0, 5)}...</p> -->
                <p>{game.gameMode};</p>
                <p>{game.enterRule};</p>
                <p>{game.finishRule};</p>
            </div>
            <div class="w-full h-fit flex">
                <div class="ml-auto flex">
                    <button class="btn btn-xs btn-info" on:click={()=>{console.log('See game Stats')}}>View Stats</button>
                    <button class="btn btn-xs btn-success" on:click={()=>{console.log('Implement continue this game')}}>Continue</button>
                    <button class="btn btn-xs btn-error" on:click={()=>{deleteGameButton(game.id, false)}}>Delete</button>
                </div>
            </div>
        </div>
        {/each}
    </div>
    <div class="divider">Finished Games</div>
    <div class="h-full w-full flex flex-col gap-y-1">
        {#each allSavedGames as game, index}
            <div class="w-full h-fit {index%2===0? 'bg-success/50' : 'bg-success/80'} rounded flex">
                <div class="flex w-full h-fit gap-x-3">
                    <!-- <p>ID: {game.id.slice(0, 10)}...</p> -->
                    <p>{game.gameMode};</p>
                    <p>{game.enterRule};</p>
                    <p>{game.finishRule};</p>
                </div>
                <p class="mx-auto whitespace-nowrap">Winner: {game.winner.name}</p>
                <div class="w-full h-fit flex">
                    <button class="btn btn-xs ml-auto btn-info" on:click={()=>{console.log('See game Stats')}}>View Stats</button>
                    <button class="btn btn-xs ml-auto btn-error" on:click={()=>{deleteGameButton(game.id, true)}}>Delete</button>
                </div>
            </div>
        {/each}
    </div>
    {:else}
        <p>No Game Data Available</p>
    {/if}
</div>