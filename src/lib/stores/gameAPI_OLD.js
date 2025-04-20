import { get, writable } from "svelte/store";
import {sha256} from 'js-sha256';
// import { createLocalStorageStore } from "./storeMGMT"

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

function generateRandomString(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const defaultGame = {
    gameMode: '_301',
    enterRule: 'STRAIGHT_IN',
    finishRule: 'STRAIGHT_OUT',
    maxRounds: 0, //0 equals infinit rounds
    players: [], //The players that are playing the game. This array should be ordered by the playing order
    casual: false, //Wether or not it should count into the statistics
    rounds: 0, 
    finished: false,
    winner: undefined, //Only set at the end of the game
    id: sha256(generateRandomString(100)).slice(0,32),
    score: [],
}



function createLocalStorageStore(key, initialValue) {
    let value = initialValue;
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            value = JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Error loading ${key} from localStorage`, e);
    }

    const store = writable(value);

    store.subscribe(val => {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage`, e);
        }
    });

    return {
        ...store,

        //########################################################
        getGame: (id) => {
            if(id){
                const tmp = get(store).find(game => {
                    if(game.id === id) {
                        return true
                    } else {
                        return false
                    }
                })
                return tmp
            }
        },

        createGame: (gameMode,enterRule,finishRule,maxRounds,players,casual,rounds,finished,winner) => {
            const id = sha256(generateRandomString(100)).slice(0,32)
            store.update(currentGame => {
                return {
                    id: id,
                    gameMode: gameMode,
                    enterRule: enterRule,
                    finishRule: finishRule,
                    maxRounds: maxRounds,
                    players: players, 
                    casual: casual,
                    rounds: rounds,
                    finished: finished,
                    winner: winner,

                    // TODO: Weiter params eintragen
                }
            })

        },

        updateGame: (id, changes) => {
            if(id){
                store.update(currentUserDB => {
                        return currentUserDB.map(user => {
                            if(user.id === id){
                                return {...user, ...changes}
                            } else {
                                return user
                            }
                        })
                    }
                )
            }
        },

        deleteGame: (id) => {
            if(id){
                store.update(currentUserDB => {
                        return currentUserDB.filter(user => {
                            if(user.id === id){
                                return false
                            } else {
                                return true
                            }
                        })
                    }
                )
            }
        },

        deleteAllGames: () => {
            store.update(userDB => userDB = defaultGame)
        },
        //########################################################
    };
}





export const currentGameSettings = createLocalStorageStore('gameSettings', defaultGame)