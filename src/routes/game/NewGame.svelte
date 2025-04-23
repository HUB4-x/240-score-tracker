<script>
    import { onMount } from "svelte";
    import { EnterRules, GameModes, FinishingRule } from "../../lib/stores/gameSettings";
    import { userDB } from "../../lib/stores/userAPI";
    import GameAPI from "../../lib/stores/gameAPI";
    
    const defaultGame = {
        dartBoard: '240',
        gameMode: '_301',
        enterRule: EnterRules.STRAIGHT_IN,
        finishRule: FinishingRule.STRAIGHT_OUT,
        maxRounds: 0, //0 equals infinit rounds
        players: [], //The players that are playing the game. This array should be ordered by the playing order
        casual: false, //Wether or not it should count into the statistics
        rounds: 0, 
        finished: false,
        winner: undefined, //Only set at the end of the game
        id: GameAPI.generateNewGameID(100),
        score: {},
        throws: {},
    }

    let newGame = defaultGame

    // function generateNewGameID(length = 8) {
    //     const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    //     let result = '';
    //     for (let i = 0; i < length; i++) {
    //         result += chars.charAt(Math.floor(Math.random() * chars.length));
    //     }
    //     const burnedGameIDs = GameAPI.getAllCurrentGameIDs()
    //     if(burnedGameIDs.includes(result)){
    //         return generateNewGameID()
    //     } else {
    //         return result;
    //     }
    // }

    onMount(()=>{
        // currentGameSettings.update(state => {
        //     return {
        //         ...state, 
        //         selected_players: [],
        //     }
        // })

    })


    function removePlayerFromSelection(p){
        newGame.players = newGame.players.filter(player => {
            if(player.id === p.id) {
                return false
            } else {
                return true
            }
        })
        // currentGameSettings.update(state => {
        //     return {
        //         ...state,
        //         selected_players: state.selected_players.filter(player => player.id !== p.id)
        //     }
        // })
    }

    function addPlayerToSelection(p){
        if(!checkIfPlayerAlreadySelected(p)){
            newGame.players = [...newGame.players, p]
        }
    }

    function checkIfPlayerAlreadySelected(p){
        let tmp = []
        tmp = newGame.players
        return tmp.some(player => player.id === p.id)
    }

    function randomizeOrder(){
        let tmp = []
        tmp = newGame.players
        // console.log(`${tmp[0].name}, ${tmp[1].name}, ${tmp[2].name}, ${tmp[3].name}, ${tmp[4].name}`)
        tmp.sort(()=>{
            return Math.random()-0.5;
        })
        // console.log(`${tmp[0].name}, ${tmp[1].name}, ${tmp[2].name}, ${tmp[3].name}, ${tmp[4].name}`)
        newGame.players = tmp
    }

    let noRoundLimit = false
    $:if(newGame.maxRounds === 0){
        noRoundLimit = true
    }

    function startgame(){
        if(newGame.players.length > 0){
            GameAPI.createNewGame(newGame)
            window.location.href = `#/game/play/:${newGame.id}`;
        }
    }


    // TODO:: Make a List of GameIDs where the new games are pushed to at the end and for future performance issues (?) we delete the first few games from time to time
    //          Maybe make a function to clear game history 


</script>

<div class="flex h-full w-full">
    <div class="w-3/5 h-screen flex m-auto gap-x-2">
        <div class="flex flex-col h-4/5 max-h-[800px] w-full mx-auto mt-20 bg-gray-500/75 rounded-lg pt-2 pl-5 overflow-y-auto">
            <!-- <h1 class="text-3xl underline font-bold">Settings</h1> -->
            <!-- <button class="btn btn-success" on:click={()=>{console.log($currentGameSettings)}}>LOG</button> -->

            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Players:</button> 
                <div class="ml-5">
                    <div class="flex gap-2 flex-wrap">
                        <!-- Players -->
                        {#each newGame.players as player, index}
                        <!-- {#each $currentGameSettings.selected_players as player, index} -->
                            <button class="rounded-lg bg-base-100 btn btn-md flex" on:click={()=>{removePlayerFromSelection(player)}}>
                                <p class="my-auto text-left ml-2 text-sm truncate">{player.name}</p>
                                <!-- svelte-ignore a11y_consider_explicit_label -->
                                <div class="ml-auto mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-800 my-auto" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </button>
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
                        <label for="{''+gamemode}" class="btn btn-sm {newGame.gameMode === GameMode? 'btn-success text-black': ''}">
                        <!-- <label for="{gamemode}" class="btn btn-sm {$currentGameSettings.gameMode === GameMode? 'btn-success text-black': ''}">
                            <input type="radio" name="{gamemode}" id="{gamemode}" class="hidden" value="{GameMode}" bind:group={$currentGameSettings.gameMode}> -->
                            <input type="radio" name="{''+gamemode}" id="{''+gamemode}" class="hidden" value="{GameMode}" bind:group={newGame.gameMode}>
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
                        <label for="{enterrule}" class="btn btn-sm {newGame.enterRule === enterrule? 'btn-success text-black': ''}">
                            <input type="radio" name="{enterrule}" id="{enterrule}" class="hidden" value="{enterrule}" bind:group={newGame.enterRule}>
                        <!-- <label for="{enterrule}" class="btn btn-sm {$currentGameSettings.enterRule === EnterRule? 'btn-success text-black': ''}">
                            <input type="radio" name="{enterrule}" id="{enterrule}" class="hidden" value="{EnterRule}" bind:group={$currentGameSettings.enterRule}> -->
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
                        <label for="{finishrule}" class="btn btn-sm {newGame.finishRule === finishrule? 'btn-success text-black': ''}">
                            <input type="radio" name="{finishrule}" id="{finishrule}" class="hidden" value="{finishrule}" bind:group={newGame.finishRule}>
                        <!-- <label for="{finishrule}" class="btn btn-sm {$currentGameSettings.finishRule === FinishRule? 'btn-success text-black': ''}">
                            <input type="radio" name="{finishrule}" id="{finishrule}" class="hidden" value="{FinishRule}" bind:group={$currentGameSettings.finishRule}> -->
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
                    <input type="checkbox" aria-label="No Round Limit" class="btn btn-sm checked:btn-success" bind:checked={noRoundLimit}>
                    {:else}
                    <input class="bg-base-300 px-2 w-32" type="number" name="" id="" bind:value={newGame.maxRounds} min="0">
                    <!-- <input class="bg-base-300 px-2 w-32" type="number" name="" id="" bind:value={$currentGameSettings.maxRounds} min="0"> -->
                    {/if}
                </div>
            </div>


            <div class="flex flex-col p-2">
                <button class="text-xl mr-auto font-bold mb-1">Casual:</button>
                <div class="ml-5">
                    <p class="text-sm text-gray-200/70">Info: If you choose to play casual, this game will not affect your statistics!</p>
                    <input type="checkbox" aria-label="Casual" bind:checked={newGame.casual} class="btn btn-sm w-fit checked:btn-success">
                    <!-- <input type="checkbox" aria-label="Casual" bind:checked={$currentGameSettings.casual} class="btn btn-sm w-fit checked:btn-success"> -->
                </div>
            </div>


            <div class="flex mt-auto ml-auto p-5 gap-2">
                <a href="#/" class="btn btn-lg btn-error">Cancel</a>
                <button class="btn btn-lg btn-success {newGame.players.length === 0? 'btn-disabled' : ''}" on:click={startgame}>Play</button>
                <!-- <button class="btn btn-lg btn-success {$currentGameSettings.selected_players.length === 0? 'btn-disabled' : ''}" on:click={startgame}>Play</button> -->
            </div>
        </div>

        

        <div class="w-40 h-4/5 flex-none my-auto mt-20 overflow-hidden">
            <div class="flex flex-col w-full h-full overflow-hidden">
                <a href="#/profiles/:new" class="w-full btn btn-success">
                    Add
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                    </svg>                      
                </a>
                <div class=" w-full overflow-y-auto">
                {#each $userDB as p}
                {#if !checkIfPlayerAlreadySelected(p)}
                    <button class="btn btn-block flex gap-x-2" on:click={()=>{addPlayerToSelection(p)}}>
                        <p class="truncate">{p.name}</p>
                        {#if p.abrv}
                        <p class="">({p.abrv})</p>
                        {/if}
                    </button>
                {/if}
                {/each}
                </div>
            </div>
        </div>
    </div>
</div>