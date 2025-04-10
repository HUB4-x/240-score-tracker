<script>
    import { onMount } from "svelte";
    import { userDB } from "../../lib/stores/userAPI";


    /**
     * What profiles have for props:
     *      - Name
     *      - ID
     *      - Avg
     *      - Win
     *      - Lose
     *      - Last Game
     *      - Color
     *      - Overall Points 
    */
    let addnewparam = false
    let show_addPlayerModal = false
    let show_RemovePlayerModal = false

    onMount(()=>{
        const tmpArr = window.location.href.split(':')
        console.log(tmpArr)
        addnewparam = tmpArr[tmpArr.length-1] === 'new'
        if(addnewparam){
            show_addPlayerModal = true
        }
    })


    let toBeRemovedPlayer = {}

    let newPlayer_Name = ''
    let newPlayer_Abrv = ''


    function addPlayer(){
        // check inputs
        if(newPlayer_Name.replaceAll(' ', '').length >= 2){
            // add player to players
            // const id = Math.floor(Math.random() * 999999) + 5; 
            // $userDB = [...$userDB, 
            //     {
            //         id:id, 
            //         name: newPlayer_Name, 
            //         abrv: newPlayer_Abrv,
            //         isGuest: false,
            //         wins: 0,
            //         loss: 0,
            //         avg: 0,
            //         overall_points: 0,
            //         highest_round: 0,
            //         highest_finish: 0,
            //         last_game: -1,
            //     }
            // ]
            userDB.addUser(newPlayer_Name, newPlayer_Abrv)

            // Closemodal
            show_addPlayerModal = false

            // reset add player form 
            newPlayer_Abrv = ''
            newPlayer_Name = ''
        }
    }

    function removePlayer(){
        // userDB.update(players => players.filter(player => player.id !== toBeRemovedPlayer.id))
        userDB.deleteUser(toBeRemovedPlayer.id)
        toBeRemovedPlayer = {}
        show_RemovePlayerModal = false
    }

</script>


<div class="w-full h-screen flex min-w-96 min-h-96">
    <div class="flex flex-col w-3/5 h-4/6 min-w-96 mx-auto mt-20 bg-base-100 rounded">
        

        <ul class="list w-full h-full overflow-y-auto">
            

            {#each $userDB as player}
            <!-- <button class="btn btn-info" on:click={()=>{userDB.updateUser(player.id, {name: 'TESTTEST'})}}>LOG</button> -->
            {#if !player.isGuest}
            <li class="list-row max-h-20 flex">
                <div class="flex-none w-10 h-full flex select-none">
                    <!-- Either IMG or KBD with Initials in picked color -->
                    {#if player.abrv}
                    <!-- For Profile differentiation -->
                    <div class="rounded-full m-auto">
                        <kbd class="kbd kbd-xl flex-wrap rounded-full bg-white font-bold text-black">{player.abrv}</kbd>
                    </div>
                    {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-10">
                        <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clip-rule="evenodd" />
                    </svg>
                    {/if}
                </div>
                <div class="flex-none">
                    <div class="font-bold text-lg">{player.name}</div>
                    <div class="text-xs uppercase font-semibold opacity-60">ID: {player.id}</div>
                </div>

                <div class="list-col-grow gap-3 pl-10 flex w-full h-full min-w-56 overflow-hidden">
                    <!-- Quick stats -->
                    <!-- Win/Loss -->
                    <div class="my-auto flex-none">
                        <p>{player.wins} | {player.loss}</p>
                    </div>
                    
                    <!-- Avg -->
                    <div class="my-auto flex flex-none">
                        <p class="font-bold mr-1">&empty;</p>
                        <p>{player.avg}</p>
                    </div>

                    
                    <!-- Scoreboard location -->
                    <div class="my-auto flex-none">
                        <p>#Scoreboard Location#</p>
                    </div>

                </div>

                <button class="btn btn-square btn-ghost ml-5" aria-label="Stats">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 text-secondary">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                      </svg>
                                                             
                </button>
                <button class="btn btn-square btn-ghost ml-5" aria-label="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-8 text-cyan-400">
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                      </svg>                      
                </button>
                <button class="btn btn-square btn-ghost ml-5" aria-label="Delete User" on:click={()=>{toBeRemovedPlayer = player; show_RemovePlayerModal = true}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-8 text-red-800">
                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                      </svg>                      
                </button>
            </li>
            {/if}
            {/each}
        </ul>

        <div class="mb-auto p-3 py-3 w-full flex">
            <button class="btn btn-success ml-auto" on:click={()=>{show_addPlayerModal = true}}>
                Add Player
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                  </svg>
            </button>
        </div>

    </div>

    <!-- Add New Player Modal -->
    <input type="checkbox" id="addNewPlayerModal" bind:checked={show_addPlayerModal} class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="modal-box bg-gray-700">
            <h3 class="text-lg font-bold">Add New Player</h3>
            <form action="">
                <div class="py-4 flex w-full h-full flex-col gap-2">
                    <input type="text" class="input w-full" placeholder="Name" bind:value={newPlayer_Name} maxlength="32" minlength="2">
                    <input type="text" class="input w-full" placeholder="Abbrevation (Optional)" bind:value={newPlayer_Abrv} maxlength="2" minlength="0">
                </div>
                <div class="modal-action">
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <label for="addNewPlayerModal" class="btn btn-error" on:click={()=>{window.location.href = '#/profiles'}}>Cancel</label>
                <button type="submit" class="btn btn-success {newPlayer_Name.replaceAll(' ', '').length < 2? 'btn-disabled' : ''}" on:click={()=>{addPlayer()}}>Add</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Remove Player Confirmation Modal -->
    <input type="checkbox" id="removePlayerModal" bind:checked={show_RemovePlayerModal} class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="modal-box bg-warning">
            <h3 class="text-xl text-base-200 font-bold">Do you want to remove this player?</h3>
            <form action="">
                <div class="py-4 flex w-full h-full flex-col gap-x-2 pl-3">
                    <label for="" class="flex text-base-200 gap-2">
                        <p class="font-bold">ID:</p>
                        <p>{toBeRemovedPlayer.id}</p>
                    </label>
                    <label for="" class="flex text-base-200 gap-2">
                        <p class="font-bold">Name:</p>
                        <p>{toBeRemovedPlayer.name}</p>
                    </label>
                    <label for="" class="flex text-base-200 gap-2">
                        <p class="font-bold">Abbrevation:</p>
                        {#if toBeRemovedPlayer.abrv}
                        <p>{toBeRemovedPlayer.abrv}</p>
                        {:else}
                        <p class="opacity-70">-No Abbrevation-</p>
                        {/if}
                    </label>
                    <!-- <input type="text" class="input w-full" placeholder="Name" bind:value={newPlayer_Name} maxlength="32" minlength="2">
                    <input type="text" class="input w-full" placeholder="Abbrevation (Optional)" bind:value={newPlayer_Abrv} maxlength="2" minlength="0"> -->

                </div>
                <div class="modal-action">
                <label for="removePlayerModal" class="btn">Cancel</label>
                <button type="submit" class="btn btn-error" on:click={()=>{removePlayer()}}>Remove</button>
                </div>
            </form>
        </div>
    </div>

</div>