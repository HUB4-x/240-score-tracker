<script>
    import { onDestroy, onMount } from 'svelte';
    import GameAPI from '../../lib/stores/gameAPI';
    // import { currentGameSettings } from '../../lib/stores/gameSettings';


    let gameId = null
    const tmpArr = window.location.href.split(':')
    gameId = tmpArr[tmpArr.length-1]
    let currentGame = GameAPI.getCurrentGame(''+gameId)


    // Current Games TMP Stats
    let currentRound = 1
    let currenPlayerIndex = 0 //Max the number of selected players
    let currentThrowIndex = 0
    let currentThrows = []
    
    let multiplier = 1
    let throws = {}
    // let throws = new Array($currentGameSettings.maxRounds === 0? 999 : $currentGameSettings.maxRounds).fill([]) // Here save throws in a row


    // let playerList = []
    // let playerList = $currentGameSettings.selected_players


    onMount(()=>{
        console.log('GameID: ', gameId)
        console.log(currentGame)
    })

    onDestroy(()=>{
        // console.log('Here das Spiel ' + gameId +  ' Speichern')
        //Call GameAPI and save the game
    })


    // function play(){
    //     let roundFinished = false
    //     while (!roundFinished && ($currentGameSettings.maxRounds === 0 || currentRound <= $currentGameSettings.maxRounds)){
    //         console.log('Round: ', currentRound)
    //     }
    // }


    function playerFinishedRound(playerID, points){
        
    }

    



    function changeMultiplier(m){
        if(m !== 1 && m !== 2 && m !== 3 && m !== 4){
            return
        } else {
            if(multiplier === m){
                multiplier = 1
            } else {
                multiplier = m
            }
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    // Ueberarbeite Play functionality
    function clickedButton(value){
        // Calc throw point
        if(multiplier !== 4 || value !== 25){
            const cur_throw_points = value * multiplier
            console.log(cur_throw_points)

            // add throw to array/sum/etc.
            currentThrows[currentThrowIndex] = cur_throw_points
            if(currentThrowIndex == 2){
                // Commit throws
                throws[(currentRound-1)*currenPlayerIndex] = currentThrows
                // Reset throw index
                currenPlayerIndex = (currenPlayerIndex + 1) % currentGame.players.length
                currentThrowIndex = 0
                currentThrows = []
                currentRound += 1
            } else {
                currentThrowIndex += 1
            }
    
            // 
            // reset multiplier
            multiplier = 1
        }

    }


</script>
  
<!-- <button class="btn btn-info" on:click={()=>{}}>LOG</button> -->
<!-- <h1>Game ID: {gameId}</h1> -->

<div class="w-full h-full flex">
    <div class="w-5/7 h-5/7 m-auto mt-28 bg-gray-600 overflow-y-auto rounded-lg grid grid-cols-10 min-w-2xl flex-none gap-1">
        <div class="w-full h-full col-span-5 flex flex-col min-w-fit flex-none overflow-x-hidden">
            <div class="flex w-fit mr-auto border-b-2 border-r-2 flex flex-none overflow-x-hidden p-1 gap-x-2 min-w-fit">
                <p class="pr-1">{currentGame.gameMode};</p>
                <p class="pr-1">{currentGame.enterRule};</p>
                <p class="pr-1">{currentGame.finishRule};</p>
                <!-- <p class="pr-1">{$currentGameSettings.gameMode};</p>
                <p class="pr-1">{$currentGameSettings.enterRule};</p>
                <p class="pr-1">{$currentGameSettings.finishRule};</p> -->
            </div>

            <div class="w-full h-5 bg-blue-600 flex-none overflow-x-hidden">
                <!-- LADE BALKEN -->
            </div>

            <div class="w-full h-full grid grid-rows-7">
                <!-- This will have the info about the score of the players -->
                <div class="bg-red-500 w-full h-full row-span-2">
                    <!-- Current Player -->
                    <div class="w-full h-full p-2 flex flex">
                        <div class="w-fit min-w-28 h-full flex flex-col">
                            <p class="text-3xl font-bold">{currentGame.players[currenPlayerIndex].name}</p>
                            <div>
                                <p>avg: 44.6</p>
                                <!-- Last throws scores. the index is the current round -1, -2, and -3 -->
                                <p>r5: 66</p>
                                <p>r6: 66</p>
                                <p>r7: 66</p>
                            </div>
                        </div>
                        <div class="h-fit w-full flex gap-x-3 mx-auto my-auto">
                            <div class="w-full h-full py-3 border-2 border-black"><p class="font-bold text-xl text-black text-center">20</p></div>
                            <div class="w-full h-full py-3 border-2 border-black"><p class="font-bold text-xl text-black text-center">44</p></div>
                            <div class="w-full h-full py-3 border-2 border-black"><p class="font-bold text-xl text-black text-center">45</p></div>
                        </div>

                        <!-- <p>{currenPlayerIndex}----{currentGame.players.length}</p> -->
                        <!-- <button class="btn" on:click={()=>{console.log(currentGame.players)}}>LOG</button>
                        <button class="btn btn-info" on:click={()=>{console.log(throws)}}>LOG</button> -->
                        <!-- <button class="btn btn-success" on:click={()=>{}}>LOG</button> -->
                        <!-- [{throws[(currentRound-1)*currenPlayerIndex][0]}]
                        [{throws[(currentRound-1)*currenPlayerIndex][1]}]
                        [{throws[(currentRound-1)*currenPlayerIndex][2]}] -->


                        <!-- {#key currentThrows}
                        {#each currentThrows as t}
                        <p>[{t}]</p>
                        {/each}
                        {/key} -->

                    </div>
                </div>
                
                <div class="bg-red-900 w-full h-full row-span-5 flex flex-col">
                    <!-- Other Player Stats -->
                    {#each currentGame.players as p, index}
                        {#if index !== currenPlayerIndex}
                            <div class="w-full h-full p-2">
                                <p>{currentGame.players[index].name}</p>
                            </div>
                        {/if}
                    {/each}
                </div>

            </div>
        </div>




        <div class="w-full h-full col-span-5 flex flex-col">
            <div class="w-full h-fit flex">
                <div class="flex ml-auto border-l-2 border-b-2">
                    <p class="ml-auto px-5">{currentRound}</p>
                </div>
            </div>

            <div class="w-full h-full grid grid-rows-7 gap-y-1 p-2">
                <!-- Here comes the calc buttons GRID -->
                <div class="w-full h-full grid grid-cols-3 gap-1">
                    <button class="border-2 btn {multiplier === 2? 'btn-success' : ''} hidden lg:block font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(2)}}>Double</button>
                    <button class="border-2 btn {multiplier === 3? 'btn-success' : ''} hidden lg:block font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(3)}}>Triple</button>
                    <button class="border-2 btn {multiplier === 4? 'btn-success' : ''} hidden lg:block font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(4)}}>Quadruple</button>
                    <button class="border-2 btn {multiplier === 2? 'btn-success' : ''} block lg:hidden font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(2)}}>2x</button>
                    <button class="border-2 btn {multiplier === 3? 'btn-success' : ''} block lg:hidden font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(3)}}>3x</button>
                    <button class="border-2 btn {multiplier === 4? 'btn-success' : ''} block lg:hidden font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(4)}}>4x</button>
                </div>

                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(1)}}>1</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(2)}}>2</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(3)}}>3</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(4)}}>4</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(5)}}>5</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(6)}}>6</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(7)}}>7</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(8)}}>8</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(9)}}>9</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(10)}}>10</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(11)}}>11</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(12)}}>12</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(13)}}>13</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(14)}}>14</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(15)}}>15</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(16)}}>16</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(17)}}>17</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(18)}}>18</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(19)}}>19</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(20)}}>20</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-2">
                    <buttons class="btn {multiplier === 4? 'btn-disabled' : ''} font-bold text-lg w-full h-full bg-base-300/60"  on:click={()=>{clickedButton(25)}}>25</buttons>
                    <buttons class="btn font-bold text-lg w-full h-full bg-base-300/60"  on:click={()=>{clickedButton(0)}}>0</buttons>
                </div>
            </div>

            <div class="w-full h-fit flex p-5 pt-1">
                <div class="ml-auto">
                    <button class="btn btn-error">Back</button>
                </div>
            </div>

        </div>



        <!-- <div class="bg-blue-400 w-full h-fit flex p-3">
            <p>{$currentGameSettings.gameMode}; {$currentGameSettings.enterRule}; {$currentGameSettings.finishRule}; Casual:{$currentGameSettings.casual}</p>
        </div>
        <div class="bg-red-400 w-full h-full flex p-3 flex-col"> -->
            <!-- This is the place for the whole  -->
        <!-- </div> -->
        


    </div>
</div>

