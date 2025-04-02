import { createLocalStorageStore } from "./storeMGMT"

export const GameModes = {
    _301: '301',
    _501: '501',
    // More to come
}

export const FinishingRule = {
    STRAIGHT_OUT: 'Straight Out', //You can end however you want
    DOUBLE_OUT: 'Double Out', //Dle OUT
    TRIPPLE_OUT: 'Tripple Out', //tripple OUT
    QUADRUPLE_OUT: 'Quadruple Out', //...
    MASTER_OUT: 'Master Out', //You have to end on a tripple, Dle, or quadruple
    BULL_OUT: 'Bull Out' //You only finish with a BULLS EYE
}

export const EnterRules = {
    STRAIGHT_IN: 'Straight In', //you can enter however you want
    DOUBLE_IN: 'Double In', //you only can enter by a 
    TRIPPLE_IN: 'Tripple In',
    QUADRUPLE_IN: 'Quadruple In', //...
    MASTER_IN: 'Master In', //you only enter when hittINg a double, tripple, or quadruple
    BULL_IN: 'Bull In' //You only enter when hitting a bulls EYE
}

export const currentGameSettings = createLocalStorageStore('gameSettings', {
    gameMode: '_301',
    enterRule: 'STRAIGHT_IN',
    finishRule: 'STRAIGHT_OUT',
    maxRounds: 0,
    selected_players: [{id:69, name:'Dummy', age: 0}], //The players that are playing the game. This array should be ordered by the playing order
    casual: false, //Wether or not it should count into the statistics
})