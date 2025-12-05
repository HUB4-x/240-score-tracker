<script lang="ts">
    import { onMount } from "svelte";
    import { params } from 'svelte-spa-router';
    import { getPlayerById, type Player } from "../../../lib/api/player_API";
    import { goto } from "../../../lib/utils";

    let playerID: number | null = $state(null)
    let player: Player | null = $state(null)

    onMount(async ()=>{

    })

    $effect(()=>{
        if($params && !player){
            playerID = Number($params.pid)
            setPlayer()
        }
    })

    function setPlayer(){
        player = getPlayerById(playerID)
        console.log(player)
    }

</script>


<h1>STATISTICS FOR: {player?.name}</h1>