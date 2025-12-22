<script lang="ts">
    import { onMount } from "svelte";
    import type { Game } from "../../lib/api/game_API";
    import { getPlayerById, getPlayers } from "../../lib/api/player_API";
    import { getContrastingTextColor } from "../../lib/utils";


    let { game = $bindable() as Game, } = $props<{
        game: Game,
    }>()

    let currentGame: Game | null = $state(null)

    onMount(()=>{
        currentGame = game

        let players = getPlayers()
        let p1 = players[0].id
        let p2 = players[2].id
        let p3 = players[3].id
        currentGame.playerIDs_in_game = [...currentGame.playerIDs_in_game, p1, p2, p3]
        console.log(currentGame.playerIDs_in_game)
    })

</script>

{#if currentGame}
<div class="flex w-full h-full p-1">
    <div class="w-full h-full bg-base-300 {currentGame.finished? 'bg-success/40' : ''} flex flex-col rounded rounded-lg border border-1 p-3 overflow-hidden gap-y-1">
        <p class="w-full h-fit text-sm mr-auto text-ellipsis whitespace-nowrap overflow-hidden">{currentGame.name}</p>
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