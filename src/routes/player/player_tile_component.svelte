<script lang="ts">
    import { onMount } from "svelte";
    import { deletePlayer, type Player } from "../../lib/api/player_API";
    import { route_links } from "../../lib/configs/routing_config";

    let { player = $bindable() as Player, index = null, editFunction_parent = (p: Player)=>{}, updateFunction = ()=>{}} = $props<{
        player: Player,
        index: number | null,
        editFunction_parent: (p: Player)=>void,
        updateFunction: ()=>any,
    }>()

    onMount(()=>{
        // console.log(player)
    })

    function editFav(){
        player.isFavorite = !player.isFavorite
    }

    function deleteCurrentPlayer(){
        deletePlayer(player.id)
        updateFunction()
    }

</script>

<div class="w-full h-full flex rounded rounded-lg bg-base-300 p-2 gap-x-3 min-w-70 overflow-hidden group">
    <div class="h-full w-3 rounded rounded-full" style={`background-color: ${player.playersColor_hex ?? '#FFFFFF'}`}></div>
    <div class="w-full h-full flex overflow-hidden">
        <div class="flex flex-col max-w-full w-full overflow-hidden">
            <p class="text-2xl font-semibold w-full text-ellipsis overflow-hidden">{player.name}</p>
            <p class="text-xl font-thin opacity-60 w-full text-ellipsis overflow-hidden">{player.nickname}</p>
            <p class="text-md w-full mt-auto">Number of 240:  {player.stats && player.stats.number_of_240? player.stats.number_of_240 : 0}</p>
        </div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="w-fit max-w-10 h-full ml-auto flex flex-col justify-between">
             <!-- svelte-ignore a11y_click_events_have_key_events -->
             <!-- svelte-ignore a11y_no_static_element_interactions -->
             <!-- svelte-ignore event_directive_deprecated -->
             <div class="flex m-auto" on:click={editFav}>
                {#if player.isFavorite}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="m-auto size-6 text-warning">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
                </svg>
                {:else}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="m-auto size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
                {/if}
             </div>
             <!-- svelte-ignore a11y_click_events_have_key_events -->
             <!-- svelte-ignore a11y_no_static_element_interactions -->
             <!-- svelte-ignore event_directive_deprecated -->
             <div class="flex m-auto tooltip tooltip-left tooltip-info" data-tip="Edit" on:click={()=>{editFunction_parent(player)}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                </svg>
             </div>
             <div class="flex m-auto tooltip tooltip-left tooltip-info" data-tip="Statistics">
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <a href="{route_links.statistics.replaceAll(':pid', player.id)}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-primary size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <path fill-rule="evenodd" d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z" clip-rule="evenodd" />
                    </svg>
                </a>
             </div>
             <!-- svelte-ignore a11y_click_events_have_key_events -->
             <!-- svelte-ignore a11y_no_static_element_interactions -->
             <!-- svelte-ignore event_directive_deprecated -->
             <div class="flex m-auto tooltip tooltip-left tooltip-info" data-tip="Delete" on:click={deleteCurrentPlayer}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-error size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                </svg>
             </div>
        </div>
    </div>
</div>