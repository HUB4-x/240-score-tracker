<script>
    import { userDB } from "../../lib/stores/userAPI";
    
    
    let playerName = ''

    function addPlayer(){
        if(playerName.replaceAll(' ', '').length > 0){
            const id = Math.floor(Math.random() * 999999) + 5; 
            const age = Math.floor(Math.random() * 100) + 18; 
            $userDB = [...$userDB, {id:id, name: playerName, age: age}]
            playerName = ''
        }
    }

    function removePlayer(id){
        userDB.update(players => players.filter(player => player.id !== id))
    }
</script>


<div class="p-10">
    <a href="#/" class="link text-xl">HOME</a>
    <button class="btn btn-info" on:click={()=>{console.log($userDB)}}>LOG</button>

    <form action="" class="">
        <input type="text" name="" id="" bind:value={playerName} class="bg-white text-black" >
        <button class="btn btn-success" on:click={addPlayer}>+Add Player</button>
    </form>
    {#if $userDB}
        {#each $userDB as p}
            <div class="flex p-2">
                <p class="mr-2">ID: {p.id}; </p>
                <p>{p.name} - {p.age}</p>
                <button class="btn btn-error btn-xs ml-20" on:click={()=>{removePlayer(p.id)}}>Remove</button>
            </div>
        {/each}
    {/if}
</div>