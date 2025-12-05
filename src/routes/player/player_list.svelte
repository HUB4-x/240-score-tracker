<script lang="ts">
    import { onMount } from 'svelte';
    import { type Player, getPlayers, savePlayer, deletePlayer, generateUniquePlayerId, setPlayers, updatePlayer } from '../../lib/api/player_API';
    import { openModal, closeModal, isValidHexColor, getRandomHexColor } from '../../lib/utils' 
    import PlayerTileComponent from './player_tile_component.svelte';

    let players: Player[] = $state([]);
    let isCurrenltyEditing: boolean = $state(false)

    function loadPlayers() {
        players = getPlayers();
    }

    onMount(()=>{
        loadPlayers();
    });


    let tmp_id: number | null = $state(null)
    let name: string = $state('');
    let nickname: string = $state('');
    let isFavorite: boolean = $state(false);
    let playersColor_hex: string = $state(getRandomHexColor())

    function handleSubmit() {
        if (!name.trim()) return;
        if(!isValidHexColor(playersColor_hex)) return;

        if(isCurrenltyEditing && tmp_id){
            const updatedPlayer: Player = {
                id: tmp_id, // simple numeric id; replace if you use something else
                name: name.trim(),
                nickname: nickname.trim() || undefined,
                isFavorite,
                playersColor_hex,
            };
            updatePlayer(updatedPlayer.id, updatedPlayer)
        } else {
            const newPlayer: Player = {
            id: generateUniquePlayerId(), // simple numeric id; replace if you use something else
            name: name.trim(),
            nickname: nickname.trim() || undefined,
            isFavorite,
            playersColor_hex,
            };
    
            savePlayer(newPlayer);
        }
        resetform()
    }


    function resetform(){
        isCurrenltyEditing = false
        name = '';
        tmp_id = null
        nickname = '';
        isFavorite = false;
        playersColor_hex = getRandomHexColor()
        loadPlayers()
        closeModal('create_new_player_modal')
    }


    function editFunction(player: Player){
        isCurrenltyEditing = true
        name = player.name?? ''
        tmp_id = player.id
        nickname = player.nickname?? ''
        isFavorite = player.isFavorite?? false
        playersColor_hex = player.playersColor_hex
        openModal('create_new_player_modal')
    }


    $effect(()=>{
        setPlayers(players)
    })

</script>

<div class="w-full h-full flex flex-col mx-auto p-5 px-20 space-y-4">
    <div class="flex h-fit mr-auto items-center gap-x-5 mb-10">
        <h1 class="text-2xl font-bold">Players</h1>
        <!-- svelte-ignore event_directive_deprecated -->
        <button class="btn btn-success text-black text-lg font-bold btn-md" on:click={()=>{openModal('create_new_player_modal')}}>
            + New player
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
            </svg>
        </button>
    </div>

    {#if players.length === 0}
        <div class="alert alert-info">
            <span>No players yet. Create your first player.</span>
        </div>
    {:else}
        <div class="flex flex-col size-full overflow-y-auto">
            <div class="flex flex-wrap gap-4">
                {#each players as player, index}
                    {#if player.isFavorite}
                        <div class="w-70 h-40 flex rounded rounded-lg">
                            <PlayerTileComponent bind:player={players[index]} index={index} editFunction_parent={editFunction} updateFunction={loadPlayers}></PlayerTileComponent>
                        </div>
                    {/if}
                {/each}
            </div>
            <div class="divider"></div>
            <div class="flex flex-wrap gap-4">
                {#each players as player, index}
                    {#if !player.isFavorite}
                        <div class="w-70 h-40 flex rounded rounded-lg">
                            <PlayerTileComponent bind:player={players[index]} index={index} editFunction_parent={editFunction} updateFunction={loadPlayers}></PlayerTileComponent>        
                        </div>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</div>


<dialog id="create_new_player_modal" class="modal">
  <div class="modal-box w-2/6 max-w-5xl h-fit p-0">
        <div class="w-full h-full card bg-base-100 shadow-md">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={()=>{closeModal('create_new_player_modal')}}>✕</button>
            <div class="card-body">
                <h2 class="card-title font-bold text-2xl">{isCurrenltyEditing? 'Edit Player' : 'Create Player'}</h2>
                <form class="space-y-4 flex flex-col" on:submit|preventDefault={handleSubmit}>
                    <!-- Name -->
                    <div class="form-control">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Name</legend>
                            <input type="text" placeholder="Name" maxlength={20} class="input input-bordered" bind:value={name} required/>
                        </fieldset>
                    </div>

                    <!-- Nickname -->
                    <div class="form-control mb-20">
                        <fieldset class="fieldset">
                            <legend class="fieldset-legend">Nickname (optional)</legend>
                            <input type="text" placeholder="Nickname" maxlength={20} class="input input-bordered" bind:value={nickname}/>
                        </fieldset>
                    </div>

                    <div class="divider"></div>

                    <!-- Favorite -->
                    <div class="form-control mt-auto">
                        <label class="label cursor-pointer justify-start gap-3">
                            <input type="checkbox" class="checkbox" bind:checked={isFavorite}/>
                            <span class="label-text">Mark as favorite</span>
                        </label>
                    </div>

                    <!-- Color -->
                    <div class="form-control">
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label class="label">
                            <span class="label-text">Player color</span>
                        </label>
                        <div class="flex items-center gap-3">
                            <input type="color" class="w-10 h-10 rounded-md border border-base-300" bind:value={playersColor_hex}/>
                            <input type="text" class="input input-bordered flex-1" bind:value={playersColor_hex} placeholder="#2196f3"/>
                        </div>
                    </div>

                    <div class="card-actions justify-end">
                    <!-- svelte-ignore event_directive_deprecated -->
                    <button type="button" class="btn btn-error" on:click={()=>{closeModal('create_new_player_modal'); resetform()}}>Cancel</button>
                    <button type="submit" class="btn btn-success">{isCurrenltyEditing? 'Save' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>

  </div>
  <form method="dialog" class="modal-backdrop">
    <!-- Uncomment to be able to close the modal by clicking outside -->
    <!-- <button>close</button> -->
  </form>
</dialog>