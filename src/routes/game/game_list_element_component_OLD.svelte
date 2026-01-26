<script lang="ts">
    import { onMount } from "svelte";
    import { Enter_Rule, Finish_Rule, getGameById, type Game } from "../../lib/api/game_API";
    import { getPlayerById, getPlayers } from "../../lib/api/player_API";
    import { getContrastingTextColor } from "../../lib/utils";
    import { route_links } from "../../lib/configs/routing_config";


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
                    <div class="w-5 rounded-full" style="color: {getContrastingTextColor(tmp_player.playersColor_hex)}; background-color: {tmp_player.playersColor_hex};">
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
            <p class="text-xs">{Enter_Rule[currentGame.game_settings.enter_rule].replace('ENTER_', '')}; {Finish_Rule[currentGame.game_settings.enter_rule].replace('FIN_', '')}</p>
        {/if}
        <div class="mt-auto flex w-full">
            {#if !currentGame.finished}
            <a class="mr-auto mt-auto border border-1 border-info rounded rounded-lg px-1" target="_blank" href="{route_links.playing_a_game.replaceAll(':gid', '' + currentGame.id)}">
                <div class="flex">
                    <p class="my-auto font-bold">Continue</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3 my-auto ml-2">
                        <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                    </svg>
                </div>
            </a>
        {/if}
            <p class="text-xs font-thin mt-auto ml-auto opacity-70">ID: {currentGame.id}</p>
        </div>
    </div>
</div>
{:else}
<div class="flex w-full h-full p-1">
    <div class="w-full h-full bg-base-300 flex flex-col rounded rounded-lg border border-1 p-3 overflow-hidden">
        <p class="text-lg font-bold m-auto">Error no such Game exists</p>
    </div>
</div>
{/if}