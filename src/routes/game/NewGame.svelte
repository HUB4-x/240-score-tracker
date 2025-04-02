<script>
    import { currentGameSettings, EnterRules, GameModes, FinishingRule } from "../../lib/stores/gameSettings";
    import { players } from "../../lib/stores/profiles";
    
    let arr = new Array(50)
    arr.fill(99999)

    let showPlayerSelection = true

    function removePlayerFromSelection(p){
        currentGameSettings.update(state => {
            return {
                ...state,
                selected_players: state.selected_players.filter(player => player.id !== p.id)
            }
        })
    }

    function addPlayerToSelection(p){
        if(!checkIfPlayerAlreadySelected(p)){
            currentGameSettings.update(state => {
                return {
                    ...state,
                    selected_players: [...$currentGameSettings.selected_players, p]
                }
            })
        }
    }

    function checkIfPlayerAlreadySelected(p){
        let tmp = []
        tmp = $currentGameSettings.selected_players
        return tmp.some(player => player.id === p.id)
    }

    function randomizeOrder(){
        let tmp = []
        tmp = $currentGameSettings.selected_players
        // console.log(`${tmp[0].name}, ${tmp[1].name}, ${tmp[2].name}, ${tmp[3].name}, ${tmp[4].name}`)
        tmp.sort(()=>{
            return Math.random()-0.5;
        })
        // console.log(`${tmp[0].name}, ${tmp[1].name}, ${tmp[2].name}, ${tmp[3].name}, ${tmp[4].name}`)
        currentGameSettings.update(state=>{
            return {
                ...state,
                selected_players: tmp
            }
        })
    }

    let noRoundLimit = false
    $:if($currentGameSettings.maxRounds === 0){
        noRoundLimit = true
    }
</script>

<div class="flex h-full w-full">
    <div class="w-3/5 h-screen flex m-auto gap-x-2">
        <div class="flex flex-col h-4/5 w-full m-auto bg-gray-500/50 rounded-lg pt-2 pl-5 overflow-y-auto">
            <!-- <h1 class="text-3xl underline font-bold">Settings</h1> -->
            <!-- <button class="btn btn-success" on:click={()=>{console.log($currentGameSettings)}}>LOG</button> -->

            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Players:</button> 
                <div class="ml-5">
                    <div class="flex gap-2 flex-wrap">
                        <!-- Players -->
                        {#each $currentGameSettings.selected_players as player, index}
                            <div class="rounded-lg bg-base-100 btn btn-md flex">
                                <p class="my-auto text-left ml-2 text-sm truncate">{player.name}</p>
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <button class="ml-auto mr-2" on:click={()=>{removePlayerFromSelection(player)}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-800 my-auto" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        {/each}      
                    </div>
                    <button class="btn btn-info text-black font-bold w-fit my-2" on:click={()=>{randomizeOrder()}}>Random Order</button>
                </div>
            </div>


            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Gamemode:</button> 
                <div class="ml-5">
                    <div class="flex gap-2 flex-wrap">
                        {#each Object.entries(GameModes) as [GameMode, gamemode]}
                        <label for="{gamemode}" class="btn {$currentGameSettings.gameMode === GameMode? 'btn-success text-black': ''}">
                            <input type="radio" name="{gamemode}" id="{gamemode}" class="hidden" value="{GameMode}" bind:group={$currentGameSettings.gameMode}>
                            {gamemode}
                        </label>
                        {/each}
                    </div>
                </div>
            </div>


            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Enter Rule:</button> 
                <div class="ml-5">
                    <div class="flex gap-2 flex-wrap">
                        {#each Object.entries(EnterRules) as [EnterRule, enterrule]}
                        <label for="{enterrule}" class="btn {$currentGameSettings.enterRule === EnterRule? 'btn-success text-black': ''}">
                            <input type="radio" name="{enterrule}" id="{enterrule}" class="hidden" value="{EnterRule}" bind:group={$currentGameSettings.enterRule}>
                            {enterrule}
                        </label>
                        {/each}
                    </div>
                </div>
            </div>


            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Finish Rule:</button> 
                <div class="ml-5">
                    <div class="flex gap-2 flex-wrap">
                        {#each Object.entries(FinishingRule) as [FinishRule, finishrule]}
                        <label for="{finishrule}" class="btn {$currentGameSettings.finishRule === FinishRule? 'btn-success text-black': ''}">
                            <input type="radio" name="{finishrule}" id="{finishrule}" class="hidden" value="{FinishRule}" bind:group={$currentGameSettings.finishRule}>
                            {finishrule}
                        </label>
                        {/each}
                    </div>
                </div>
            </div>


            <div class="flex flex-col p-2">
                <button  class="text-xl mr-auto font-bold mb-1">Round Limit</button>
                <div class="ml-5">
                    {#if noRoundLimit}
                    <!-- <div class="flex">
                        <input type="checkbox" name="" id="" bind:checked={noRoundLimit}>
                        <label for="">No Round Limit</label>
                    </div> -->
                    <input type="checkbox" aria-label="No Round Limit" class="btn checked:btn-success" bind:checked={noRoundLimit}>
                    {:else}
                    <input class="bg-base-300 px-2 w-32" type="number" name="" id="" bind:value={$currentGameSettings.maxRounds} min="0">
                    {/if}
                </div>
            </div>


            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Casual:</button>
                <div class="ml-5">
                    <p class="text-sm text-gray-200/70">Info: If you choose to play casual this game will not affect your statistics!</p>
                    <input type="checkbox" aria-label="Casual" bind:checked={$currentGameSettings.casual} class="btn w-fit checked:btn-success">
                </div>
            </div>


            <div class="flex mt-auto ml-auto p-5 gap-2">
                <a href="#/" class="btn btn-error">Cancel</a>
                <button class="btn btn-success">Play</button>
            </div>
        </div>

        

        <div class="w-40 h-4/5 flex-none my-auto overflow-hidden">
            <div class="flex flex-col w-full h-full overflow-hidden">
                <div class=" w-full overflow-y-auto">
                {#each $players as p}
                {#if !checkIfPlayerAlreadySelected(p)}
                    <button class="btn btn-block" on:click={()=>{addPlayerToSelection(p)}}>
                        <p class="truncate">{p.name}</p>
                    </button>
                {/if}
                {/each}
                </div>
            </div>
        </div>
    </div>
</div>