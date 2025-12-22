<script lang="ts">
    import { onMount } from "svelte";
    import { Enter_Rule, Finish_Rule, getGameById, type Game } from "../../lib/api/game_API";
    import { getPlayerById, getPlayers } from "../../lib/api/player_API";
    import { getContrastingTextColor } from "../../lib/utils";


    let { gameID, }: {gameID: number,} = $props<{}>()

    let currentGame: Game | null = $state(null)

    onMount(()=>{
        currentGame = getGameById(gameID)
    })

</script>

{#if currentGame}
<div class="flex w-full h-full p-1">
    <div class="w-full h-full bg-base-300 {currentGame.finished? 'bg-success/40' : ''} flex flex-col rounded rounded-lg border border-1 p-3 overflow-hidden gap-y-1">
        <div class="w-full flex">
            <p class="w-full h-fit text-sm mr-auto text-ellipsis whitespace-nowrap overflow-hidden">{currentGame.name}</p>
            <div class="badge badge-sm {currentGame.game_settings.dartboard === 240? 'badge-warning' : 'badge-secondary'} font-bold">{currentGame.game_settings.dartboard}</div>
        </div>
        <div class="w-full h-fit flex gap-x-1 overflow-hidden text-ellipsis select-none">
            {#each currentGame.playerIDs_in_game as pid, index}
            {@const tmp_player = getPlayerById(pid)}
            <div class="tooltip" data-tip="{tmp_player.name} {tmp_player.nickname? `(Alias: ${tmp_player.nickname})` : ''}">
                <div class="avatar avatar-placeholder">
                    <div class="w-6 rounded-full" style="color: {getContrastingTextColor(tmp_player.playersColor_hex)}; background-color: {tmp_player.playersColor_hex};">
                        <span class="text-xs">{tmp_player.name.slice(0, 2)}</span>
                    </div>
                </div>
            </div>
            {/each}
        </div>
        <!-- <p>{currentGame.game_settings.dartboard}</p> -->
        {#if currentGame.finished}
            <p>{currentGame.winner}</p>
        {:else}
            <p>Current Round: {currentGame.currentRound}</p>
            <p>{Enter_Rule[currentGame.game_settings.enter_rule].replace('ENTER_', '')}; {Finish_Rule[currentGame.game_settings.enter_rule].replace('FIN_', '')}</p>
        {/if}
        <p class="text-xs font-thin mt-auto ml-auto opacity-70">ID: {currentGame.id}</p>
    </div>
</div>
{:else}
<div class="flex w-full h-full p-1">
    <div class="w-full h-full bg-base-300 flex flex-col rounded rounded-lg border border-1 p-3 overflow-hidden">
        <p class="text-lg font-bold m-auto">Error no such Game exists</p>
    </div>
</div>
{/if}