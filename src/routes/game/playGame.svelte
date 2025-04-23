<script>
    import { onDestroy, onMount } from 'svelte';
    import GameAPI from '../../lib/stores/gameAPI';
    import { validateEnter, validateFinishLimit, validateFinishRule } from './throwValidation';
    import { userDB } from '../../lib/stores/userAPI';

    const tmpArr = window.location.href.split(':')
    const gameId = tmpArr[tmpArr.length-1]

    //Fetch Current Game Stats
    let currentGame = GameAPI.getCurrentGame(''+gameId)
    if(!currentGame){
        window.location.href = '#/noSuchGame'
        window.location.reload()
    }
    const numberOfPlayers = currentGame.players.length
    const startingScore = currentGame.gameMode === '_501'? 501 : currentGame.gameMode === '_301'? 301 : 701


    const timervalue = 0 //TODO Make this a setting the user can set and store in the localstorage
    let timerPerc = 100


    // Global Blocking of interaction
    let blockInteractions = currentGame.finished

    // Current Games TMP Stats
    let currentPlayer = currentGame.players[0]
    let multiplier = 1
    let currentRound = 1
    let currentPlayerIndex = 0 //Max the number of selected players
    let currentThrowIndex = 0
    let currentThrows = []
    let throws = {}
    
    let winningPlayer = null
    let show_WinnerScreenModal = currentGame.finished
    let finishingScore = 0

    let show_ConfirmSaveModal = false
    
    let playersStats = {}
    currentGame.players.forEach(player=>{
        playersStats[player.id] = {
            score: startingScore,
            highestThrowScore: 0,
            avg: 0,
            won: false,

        }
    })


    onMount(()=>{
        // console.log('GameID: ', gameId)
        // console.log(currentGame.finishRule)
    })

    onDestroy(()=>{
        // console.log('Here das Spiel ' + gameId +  ' Speichern')
        //Call GameAPI and save the game
        console.log('onDestroy()')
    })




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


    // Ueberarbeite Play functionality
    async function clickedButton(value){
        // Calc throw point
        if(multiplier !== 4 || value !== 25){

            //Check if entering rule is violated
            if(playersStats[currentPlayer.id].score === startingScore){
                const allowedToEnter = validateEnter(value, multiplier, currentGame.enterRule)
                if(allowedToEnter){
                    dartThrown(value, multiplier, currentPlayer, currentThrowIndex)
                } else {
                    dartThrown(value, multiplier, currentPlayer, currentThrowIndex, -1)
                }
            } else {
                const newScore = playersStats[currentPlayer.id].score-(value*multiplier)
                const playerWithinLimit = validateFinishLimit(value, multiplier, playersStats[currentPlayer.id].score, currentGame.finishRule)
                const allowedToFinish = validateFinishRule(value, multiplier, currentGame.finishRule)
                if(newScore === 0){
                    if(allowedToFinish){
                        dartThrown(value, multiplier, currentPlayer, currentThrowIndex, 0)
                        //Show Finishing Screen
                        // winnerPlayerIndex = currentPlayerIndex
                        winningPlayer = currentPlayer
                        finishingScore = calcThrowsScore(currentThrows)
                        show_WinnerScreenModal = true
                        currentGame.finished = true
                        blockInteractions = true
                    } else {
                        dartThrown(value, multiplier, currentPlayer, currentThrowIndex, -1)
                    }
                } else {
                    if(playerWithinLimit){
                        dartThrown(value, multiplier, currentPlayer, currentThrowIndex, 0)
                    } else {
                        dartThrown(value, multiplier, currentPlayer, currentThrowIndex, -2)
                    }
                }
            }
            if(currentThrowIndex == 2){
                //Last throw
                commitThrows() // Commit throws
                updateAvg(currentPlayer, calcThrowsScore(currentThrows))
                nextPlayer()
            } else {
                currentThrowIndex += 1
            }
            // New Throw & reset multiplier
            multiplier = 1
        }
    }


    async function commitThrows(){
        const oldThrows = throws[currentRound]?? []
        throws[currentRound] = [...oldThrows, currentThrows]
        if(timervalue > 0){
            await startCountdown()
        }
    }

    function nextPlayer(){
        //Increase everything accordingly 
        currentThrows = []
        currentThrowIndex = 0
        currentPlayerIndex = (currentPlayerIndex+1)%numberOfPlayers
        currentPlayer = currentGame.players[currentPlayerIndex]
        if(currentPlayerIndex === 0){
            currentRound += 1
        }
    }


    function dartThrown(value, multiplier, player, throwIndex, errorCode = 0){
        const cur_throw_points = value * multiplier
        // const curr_score = scores[playerIndex] //DEL
        const curr_score = playersStats[player.id].score
        const newScore = curr_score - cur_throw_points
        const throwString = createThrowString(value, multiplier)

        if(errorCode === 0){
            currentThrows[throwIndex] = [cur_throw_points, throwString, errorCode]
            // scores[playerIndex] = newScore //DEL
            playersStats[currentPlayer.id].score = newScore
            if(playersStats[player.id].highestThrowScore < cur_throw_points){
                playersStats[player.id].highestThrowScore = cur_throw_points
            }

        } else if(errorCode === -1) {
            //Entering Error just changes the color of the displayed number and 0 is added to the score
            currentThrows[throwIndex] = [cur_throw_points, throwString, errorCode]

        } else if(errorCode === -2){
            //Finishing Error. No more attempts. The rest of the array will be undefined
            console.log('ERR: ', throwIndex)
            currentThrows[throwIndex] = [cur_throw_points, throwString, -3]
            if(throwIndex === 1){
                currentThrows[2] = [0, 'Err', -2]
            } 
            if(throwIndex === 0){
                currentThrows[1] = [0, 'Err', -2]
                currentThrows[2] = [0, 'Err', -2]
            }
            commitThrows()
            nextPlayer()
            currentThrowIndex = -1 //Needs to be -1 otherwise it increases to 1 automatically 
        }
    }


    function createThrowString(value, multiplier){
        let c = 'X'
        if(multiplier === 1) c = 'S'
        if(multiplier === 2) c = 'D'
        if(multiplier === 3) c = 'T'
        if(multiplier === 4) c = 'Q'
        return c + '' + value
    }


    function startCountdown(durationInSeconds = timervalue) {
        return new Promise((resolve) => {
            blockInteractions = true
            const total = durationInSeconds * 1000;
            const start = Date.now();
            const interval = setInterval(() => {
                const elapsed = Date.now() - start;
                const percent = Math.max(0, 100 - (elapsed / total) * 100);
                timerPerc = percent
                if (percent === 0) {
                    clearInterval(interval);
                    blockInteractions = false
                    resolve()
                }
            }, 1);
        });
    }

    function calcThrowsScore(arr){
        let score = 0
        if(arr[0]) {
            score += arr[0][0]?? 0
        }
        if(arr[1]) {
            score += arr[1][0]?? 0
        }
        if(arr[2]) {
            score += arr[2][0]?? 0
        }
        return score
    }

    function updateAvg(player, newScore){
        const summe = (playersStats[player.id].avg * (currentRound-1)) + newScore
        const newAvg = summe / currentRound
        playersStats[player.id].avg = Math.floor(newAvg * 100) / 100;
        return newAvg
    }

    function backButton(){
        if(currentThrowIndex-1 < 0){
            //Change player index
            currentThrowIndex = 2
            if(currentPlayerIndex-1 < 0){
                //Change round
                currentPlayerIndex = numberOfPlayers-1
                currentPlayer = currentGame.players[currentPlayerIndex]
                if(currentRound-1 < 0){
                    //Invalid return
                    console.log('INVALID BACK')
                    return
                } else {
                    currentRound -= 1
                }
            } else {
                currentPlayerIndex -= 1
                currentPlayer = currentGame.players[currentPlayerIndex]
            }
            currentThrows = throws[currentRound][currentPlayerIndex]
            throws[currentRound].splice(currentPlayerIndex)
        } else {
            currentThrowIndex -= 1
        }
        const oldThrow = currentThrows[currentThrowIndex][2] <= -1? 0 : currentThrows[currentThrowIndex][0]
        playersStats[currentPlayer.id].score += oldThrow
        if(currentThrows[0] && currentThrows[0][2] === -3) {
            console.log('here 1')
            currentThrowIndex = 0
            currentThrows = []
        }else if(currentThrows[1] && currentThrows[1][2] === -3) {
            console.log('here 2')
            currentThrowIndex = 1
            currentThrows[1] = undefined
            currentThrows[2] = undefined
        }else if(currentThrows[2] && currentThrows[2][2] === -3) {
            console.log('here 3')
            currentThrowIndex = 2
        }
        currentThrows[currentThrowIndex] = undefined
    }

    function playAgain(){
        show_WinnerScreenModal = false;
        show_ConfirmSaveModal = false;
        const newID = GameAPI.generateNewGameID(100) 
        GameAPI.createNewGame({...currentGame, id: newID, finished: false, winner: winningPlayer})
        window.location.href = `#/game/redirect/:${newID}`
    }
    
    function saveGameStats(){
        show_WinnerScreenModal=false;
        show_ConfirmSaveModal = false;
        GameAPI.saveCurrentGame(currentGame.id, currentGame)
    }

</script>
  

<div class="w-full h-full flex select-none">
    <div class="w-5/7 h-5/7 m-auto mt-28 bg-gray-600 overflow-y-auto rounded-lg grid grid-cols-10 min-w-2xl flex-none gap-1">
        <div class="w-full h-full col-span-5 flex flex-col min-w-fit flex-none overflow-x-hidden">
            <div class="flex w-fit mr-auto border-b-2 border-r-2 flex flex-none overflow-x-hidden p-1 gap-x-2 min-w-fit">
                <p class="pr-1">{startingScore};</p>
                <p class="pr-1">{currentGame.enterRule};</p>
                <p class="pr-1">{currentGame.finishRule};</p>
                <!-- <button class="btn btn-info" on:click={()=>{console.log(currentThrows)}}>LOG</button> -->
                <!-- <button class="btn btn-info" on:click={()=>{show_WinnerScreenModal = true}}>Open Win</button> -->
            </div>

            
            <div class="w-full h-full flex flex-col gap-y-2 p-2">
                {#if timervalue > 0}
                <div class="w-full">
                    <progress class="progress progress-warning w-full" value="{timerPerc}" max="100"></progress>
                </div>
                {/if}
                <!-- This will have the info about the score of the players -->
                {#each currentGame.players as p, index}
                    {#if index === currentPlayerIndex}
                        <div class="bg-info w-full h-full flex rounded-lg">
                            <!-- Current Player -->
                            <div class="w-full h-full p-2 flex flex-col">
                                <div class="h-fit w-full flex">
                                    <div class="w-min h-full flex flex-col">
                                        <p class="text-base-100 text-3xl font-bold">{p.name}</p>
                                        <div class="">
                                            <!-- Last throws scores. the index is the current round -1, -2, and -3 -->
                                            {#if currentRound > 3}
                                                <p class="text-base-200 text-xs">R{currentRound-3}: {calcThrowsScore(throws[currentRound-3][currentPlayerIndex])}</p>
                                            {/if}
                                            {#if currentRound > 2}
                                                <p class="text-base-200 text-xs">R{currentRound-2}: {calcThrowsScore(throws[currentRound-2][currentPlayerIndex])}</p>
                                            {/if}
                                            {#if currentRound > 1}
                                                <p class="text-base-200 text-xs">R{currentRound-1}: {calcThrowsScore(throws[currentRound-1][currentPlayerIndex])}</p>
                                            {/if}
                                        </div>
                                    </div>
                                    <div class="flex flex-col ml-auto">
                                        <p class="text-base-200">Avg: {playersStats[p.id].avg}</p>
                                        <p class="ml-auto font-bold text-base-200 text-3xl">{playersStats[p.id].score}</p>
                                    </div>
                                </div>
                                <div class="h-full w-full flex flex-col mx-auto my-auto">
                                    <div class="flex px-2 h-full w-full mb-auto">
                                        <div class="flex w-full h-full m-auto gap-x-3 mx-5">
                                            <div class="w-full h-full max-w-20 max-h-20 bg-gray-800 {currentThrowIndex===0? 'border-2 border-cyan-200':'border-none'} flex m-auto p-5">
                                                {#if currentThrows[0] && currentThrows[0][1]}
                                                <p class="font-bold text-2xl {currentThrows[0][2] < 0?'text-error' : 'text-white'} text-center m-auto">{currentThrows[0][1]}</p>
                                                {/if}
                                            </div>
                                            <div class="w-full h-full max-w-20 max-h-20 bg-gray-800 {currentThrowIndex===1? 'border-2 border-cyan-200':'border-none'} flex m-auto p-5">
                                                {#if currentThrows[1] && currentThrows[1][1]}
                                                <p class="font-bold text-2xl {currentThrows[1][2] < 0?'text-error' : 'text-white'} text-center m-auto">{currentThrows[1][1]}</p>
                                                {/if}
                                            </div>
                                            <div class="w-full h-full max-w-20 max-h-20 bg-gray-800 {currentThrowIndex===2? 'border-2 border-cyan-200':'border-none'} flex m-auto p-5">
                                                {#if currentThrows[2] && currentThrows[2][1]}
                                                <p class="font-bold text-2xl {currentThrows[2][2] < 0?'text-error' : 'text-white'} text-center m-auto">{currentThrows[2][1]}</p>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="w-full h-full flex flex-col rounded-lg bg-base-100/70">
                            <!-- Other Player Stats -->
                            <div class="w-full h-full p-2 flex">
                                <div class="flex flex-col w-full h-full m-auto">
                                    <p class="font-bold text-xl">{p.name}</p>
                                    <p>Avg: {playersStats[p.id].avg}</p>
                                </div>
                                <div class="flex h-full w-full ml-auto my-auto">
                                    <p class="ml-auto my-auto font-bold text-xl">{playersStats[p.id].score}</p>
                                </div>                            
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>




        <div class="w-full h-full col-span-5 flex flex-col">
            <div class="w-full h-fit flex">
                <div class="flex ml-auto border-l-2 border-b-2">
                    {#if currentGame.maxRounds === 0}
                    <p class="ml-auto px-5">Round: {currentRound}/&#8734;</p>
                    {:else}
                    <p class="ml-auto px-5">Round: {currentRound}/{currentGame.maxRounds}</p>
                    {/if}
                </div>
            </div>

            <div class="w-full h-full grid grid-rows-7 gap-y-1 p-2 {blockInteractions? 'pointer-events-none':''}">
                <!-- Here comes the calc buttons GRID -->
                <div class="w-full h-full grid grid-cols-3 gap-1">
                    <button class="{blockInteractions? 'btn-disabled':''} btn {multiplier === 2? 'btn-success' : 'hover:bg-info'} hidden lg:block font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(2)}}>Double</button>
                    <button class="{blockInteractions? 'btn-disabled':''} btn {multiplier === 3? 'btn-success' : 'hover:bg-info'} hidden lg:block font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(3)}}>Triple</button>
                    <button class="{blockInteractions? 'btn-disabled':''} btn {multiplier === 4? 'btn-success' : 'hover:bg-info'} hidden lg:block font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(4)}}>Quadruple</button>
                    <button class="{blockInteractions? 'btn-disabled':''} btn {multiplier === 2? 'btn-success' : 'hover:bg-info'} block lg:hidden font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(2)}}>2x</button>
                    <button class="{blockInteractions? 'btn-disabled':''} btn {multiplier === 3? 'btn-success' : 'hover:bg-info'} block lg:hidden font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(3)}}>3x</button>
                    <button class="{blockInteractions? 'btn-disabled':''} btn {multiplier === 4? 'btn-success' : 'hover:bg-info'} block lg:hidden font-bold text-lg h-full w-full" on:click={()=>{changeMultiplier(4)}}>4x</button>
                </div>

                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(1)}}>1</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(2)}}>2</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(3)}}>3</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(4)}}>4</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(5)}}>5</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(6)}}>6</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(7)}}>7</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(8)}}>8</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(9)}}>9</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(10)}}>10</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(11)}}>11</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(12)}}>12</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(13)}}>13</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(14)}}>14</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(15)}}>15</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(16)}}>16</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-4">
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(17)}}>17</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(18)}}>18</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(19)}}>19</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60" on:click={()=>{clickedButton(20)}}>20</buttons>
                </div>
                <div class="w-full h-full gap-1 grid grid-cols-2">
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn {multiplier >= 3? 'btn-disabled' : ''} font-bold text-lg w-full h-full bg-base-300/60"  on:click={()=>{clickedButton(25)}}>25</buttons>
                    <buttons class="{blockInteractions? 'btn-disabled':''} hover:bg-info btn font-bold text-lg w-full h-full bg-base-300/60"  on:click={()=>{clickedButton(0)}}>0</buttons>
                </div>
            </div>

            <div class="w-full h-fit flex p-5 pt-1">
                <div class="ml-auto">
                    <button class="btn btn-error {currentRound==1 && currentPlayerIndex==0 && currentThrowIndex==0? 'btn-disabled':''}" on:click={backButton}>Back</button>
                </div>
            </div>

        </div>

    </div>
</div>


<input type="checkbox" id="addNewPlayerModal" bind:checked={show_WinnerScreenModal} class="modal-toggle" />
<div class="modal select-none" role="dialog">
    <div class="modal-box bg-gray-400 flex flex-col">
        <div class="w-full flex">
            <h3 class="font-bold flex text-black text-3xl m-auto">&#127882; &#127881; WINNER &#127881; &#127882;</h3>
        </div>
        {#if winningPlayer}
        <form action="" class="m-auto flex flex-col mt-10">
            <div class="card card-side bg-base-100 shadow-sm">
                {#if winningPlayer.profilePicturePath}
                    <figure>
                    <img src="{winningPlayer.profilePicturePath}" alt="ProfilePicture" />
                    </figure>
                {:else}  
                    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>                      
                {/if}
                <div class="card-body">
                    <h2 class="card-title">{winningPlayer.name}</h2>
                    <p>With an average of: {playersStats[winningPlayer.id].avg}</p>
                    <div class="flex">
                        <p class="">Finished with a </p>
                        <p class="{finishingScore > 100? 'text-3xl text-success':'text-lg text-white'}">{finishingScore}</p> 
                        <p>throw</p>
                    </div>
                    <div class="card-actions justify-end flex">
                    <div class="modal-action flex ml-10">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <label for="addNewPlayerModal" class="btn btn-error ml-auto" on:click={()=>{window.location.href = '#/'}}>Home</label>
                        <button type="submit" class="btn btn-success ml-auto" on:click={()=>{console.log('Safe Game'); show_WinnerScreenModal=false;}}>Save</button>
                        <button type="submit" class="btn btn-primary ml-auto" on:click={()=>{show_ConfirmSaveModal = true}}>Play Again</button>
                    </div>
                    </div>
                </div>
            </div>
        </form>
        {/if}
    </div>
</div>


<input type="checkbox" id="removePlayerModal" bind:checked={show_ConfirmSaveModal} class="modal-toggle" />
    <div class="modal" role="dialog">
        <div class="modal-box bg-warning">
            <h3 class="text-xl text-base-200 font-bold">Do you want to save this game?</h3>
            <form action="">
                <div class="modal-action">
                <label for="removePlayerModal" class="btn btn-error" on:click={()=>{playAgain();}}>No</label>
                <button type="submit" class="btn btn-success" on:click={()=>{saveGameStats(); playAgain();}}>Yes</button>
                </div>
            </form>
        </div>
    </div>

