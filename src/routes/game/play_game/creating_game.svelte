<script lang="ts">
    import { onMount } from 'svelte';
    import { Dartboard, Finish_Rule, type Game, type Game_Settings } from '../../../lib/api/game_API';              // adjust path
    import { saveGame, generateUniqueGameId, Enter_Rule } from '../../../lib/api/game_API'; // adjust path
    import { getPlayerById, getPlayers, type Player } from '../../../lib/api/player_API';
    import { closeModal, openModal } from '../../../lib/utils';
    import PlayerTileComponent from '../../player/player_tile_component.svelte';

    let enableMaxRounds: boolean = $state(false)

    const default_name = ''
    const default_max_rounds: number = 9999
    const default_dartboard: Dartboard = Dartboard.GAME_240
    const default_isCasual = false
    const default_enterRule: Enter_Rule = Enter_Rule.ENTER_STRAIGHT_IN
    const default_finishRule: Finish_Rule = Finish_Rule.FIN_STRAIGHT_OUT

    let name = $state(default_name);
    let max_rounds: number = $state(default_max_rounds);
    let dartboard: Dartboard = $state(default_dartboard);
    let isCasual = $state(default_isCasual);
    let enterRule: Enter_Rule = $state(default_enterRule);
    let finishRule: Finish_Rule = $state(default_finishRule);

    // placeholder for selected players - button only (no logic wired)
    let selectedPlayerIds: number[] = $state([]);

    let players: Player[] = $state([])

    function loadPlayers() {
        players = getPlayers();
    }

    onMount(()=>{
        loadPlayers()
        console.log(new Date().toISOString())
    })

    function handle_player_click(p: Player){
        if(selectedPlayerIds.includes(p.id)){
            const idx: number = selectedPlayerIds.indexOf(p.id)
            selectedPlayerIds.splice(idx)
        } else {
            selectedPlayerIds.push(p.id)
        }
    }

    function handleSubmit() {
        if (!name.trim()) return;

        const now: string = new Date().toISOString();

        const gameSetting: Game_Settings = {
            maxRounds: max_rounds,
            dartboard,
            casual: isCasual,
            enter_rule: enterRule,
            finish_rule: finishRule
        }

        const newGame: Game = {
            id: generateUniqueGameId(),
            name: name.trim(),
            timestamp: now,
            playerIDs_in_game: selectedPlayerIds,
            rounds: [],
            currentRound: 0,
            finished: false,
            player_scores: [],
            winner: undefined,
            game_settings: gameSetting,
        } as Game;

        saveGame(newGame);
        reset_form_values()
    }

    function reset_form_values(){
        selectedPlayerIds = []
        name = default_name
        max_rounds = default_max_rounds
        dartboard = default_dartboard
        isCasual = default_isCasual
        enterRule = default_enterRule
        finishRule = default_finishRule
    }
</script>

<div class="w-1/2 min-h-max h-5/6 m-auto p-4 flex gap-x-5">
    <div class="card bg-base-200 shadow-md min-w-1/2 w-1/2">
        <div class="card-body">
        <h2 class="card-title">Create Game</h2>

        <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
            <!-- Name -->
            <div class="form-control">
            <div class="w-full flex flex-col gap-y-2">
                <label class="bg-base-200 px-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">Name</label>
                <input type="text" class="input input-bordered w-full mt-2" bind:value={name} required />
            </div>
            </div>

            <!-- Select players (button only, no logic) -->
            <div class="form-control">
            <label class="label">
                <span class="label-text">Players</span>
            </label>
            <div class="flex items-center gap-3">
                <!-- svelte-ignore event_directive_deprecated -->
                <button type="button" class="btn btn-info btn-sm" title="Open player selection (not yet implemented)" on:click={()=>{openModal('playerListModal')}}>Select players</button>
                <span class="text-sm text-base-content/70">{selectedPlayerIds.length} players selected</span>
            </div>
            </div>

            <!-- Max rounds -->
            <div class="form-control">
            <div class="flex flex-col">
                <label class="bg-base-200 px-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">Max rounds</label>
                <div class="flex w-full gap-x-3">
                    <input class="checkbox m-auto" type="checkbox" name="" id="" bind:checked={enableMaxRounds}>
                    {#if enableMaxRounds}
                    <input type="number" min="1" class="input input-bordered w-full mt-2" bind:value={max_rounds}/>
                    {:else}
                    <input type="text" class="input input-ghost w-full mt-2 input-disabled" readonly value="Infinit Number of Rounds"/>
                    {/if}
                </div>
            </div>
            </div>

            <!-- Dartboard: 180 / 240 -->
            <div class="form-control">
            <label class="label">
                <span class="label-text">Dartboard</span>
            </label>
            <div class="join">
                {#each Object.values(Dartboard) as Dartboard[] as db, index}
                {#if index > (Object.values(Dartboard).length-1)/2}
                    <label class="btn join-item">
                        <input type="radio" class="radio radio-sm mr-2" checked={dartboard === db} on:change={() => (dartboard = db)}/>
                        {db}
                    </label>
                {/if}
                <!-- <label class="btn join-item">
                    <input type="radio" class="radio radio-sm mr-2" value="240" checked={dartboard === 240} on:change={() => (dartboard = 240)}/>
                    240
                </label> -->
                {/each}
            </div>
            </div>

            <!-- Casual flag -->
            <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
                <input type="checkbox" class="checkbox" bind:checked={isCasual}/>
                <span class="label-text">Casual game</span>
            </label>
            </div>

            <!-- Enter rule -->
            <div class="form-control">
            <div class="w-full flex flex-col gap-y-2">
                <label class="bg-base-200 px-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
                    Enter rule
                </label>
                <!-- <textarea class="textarea textarea-bordered w-full mt-2" rows="2" bind:value={enterRule} placeholder="How do players enter this game?"></textarea> -->
                <select class="select" bind:value={enterRule}>
                    {#each Object.values(Enter_Rule) as eRule, index}
                        {#if index <= (Object.values(Enter_Rule).length -1)/2}
                            {#if Enter_Rule[eRule] === enterRule}
                                <option class="bg-info" value="{Enter_Rule[eRule]}">{eRule}</option>
                            {:else}
                                <option value="{Enter_Rule[eRule]}">{eRule}</option>
                            {/if}
                        {/if}
                    {/each}
                </select>
            </div>
            </div>

            <!-- Finish rule -->
            <div class="form-control">
            <div class="w-full flex flex-col gap-y-2">
                <label class="bg-base-200 px-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
                Finish rule
                </label>
                <!-- <textarea class="textarea textarea-bordered w-full mt-2" rows="2" bind:value={finishRule} placeholder="How does the game end / who wins?"></textarea> -->
                <select class="select" bind:value={finishRule}>
                    {#each Object.values(Finish_Rule) as fRule, index}
                        {#if index <= (Object.values(Finish_Rule).length -1)/2}
                            {#if Finish_Rule[fRule] === finishRule}
                                <option class="bg-info" value="{Finish_Rule[fRule]}">{fRule}</option>
                            {:else}
                                <option value="{Finish_Rule[fRule]}">{fRule}</option>
                            {/if}
                        {/if}
                    {/each}
                </select>
            </div>
            </div>

            <div class="card-actions justify-end">
            <button type="submit" class="btn btn-error">Cancel</button>
            <button type="submit" class="btn btn-success">Create game</button>
            </div>
        </form>
        </div>
    </div>

    <div class="h-full w-full bg-base-300 flex flex-col card card-body">
        {#if selectedPlayerIds.length <= 0}
            <div class="w-full h-full">
                <h2 class="card-title">No Players Selected yet</h2>
            </div>
        {:else}
        {#each selectedPlayerIds as pID, index}
            {@const player = getPlayerById(pID)}
            <div class="w-full h-10 max-h-10 flex font-bold">
                <p class="mr-auto">{player.name}</p>
                <p>{player.nickname}</p>
            </div>
            {/each}
        {/if}
    </div>
</div>





<dialog id="playerListModal" class="modal">
  <div class="modal-box w-2/6 max-w-5xl max-h-7/9 p-0">
        <div class="w-full h-full card bg-base-100 shadow-md p-5">
            <button class="sticky top-0 ml-auto btn btn-sm btn-circle btn-ghost" on:click={()=>{closeModal('playerListModal')}}>✕</button>
            <div class="card-body w-full h-full">
                <button class="sticky top-0 btn btn-success w-full z-1">Create New Player</button>
                {#if players.length <= 0}
                    <p>No Players Available</p>
                {:else}
                    {#each players as player, index}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <!-- svelte-ignore event_directive_deprecated -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        {#if player.isFavorite}
                            <div class="{selectedPlayerIds.includes(player.id)? 'border border-2 border-success':''}">
                                <PlayerTileComponent player={player} onClick={()=>{handle_player_click(player)}}></PlayerTileComponent>
                            </div>
                        {/if}
                    {/each}

                    {#each players as player, index}
                        {#if !player.isFavorite}
                        <div class="{selectedPlayerIds.includes(player.id)? 'border border-2 border-success':''}">
                            <PlayerTileComponent player={player} onClick={()=>{handle_player_click(player)}}></PlayerTileComponent>
                        </div>
                        {/if}
                    {/each}
                {/if}
            </div>
        </div>
  </div>
</dialog>
