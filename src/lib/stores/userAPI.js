// import { createLocalStorageStore } from "./storeMGMT";
import { writable } from "svelte/store";
import {sha256} from 'js-sha256';




const dbName = 'UserDB'

const colorArr = [
    "red-200",
    "orange-200",
    "amber-200",
    "yellow-200",
    "lime-200",
    "green-200",
    "emerald-200",
    "teal-200",
    "cyan-200",
    "sky-200",
    "blue-200",
    "indigo-200",
    "violet-200",
    "purple-200",
    "fuchsia-200",
    "pink-200",
    "rose-200"
  ];



export const userDB = createLocalStorageStore(dbName, [
    {
        id: 1,
        // id: sha256('1').slice(0, 8),
        name: 'Gast 1',
        isGuest: true,
        color: 'red',
        abrv: 'G1',
    },
    {
        id: 2,
        // id: sha256('2').slice(0, 8),
        name: 'Gast 2',
        isGuest: true,
        color: 'green', 
        abrv: 'G2',
    },
    {
        id: 3,
        // id: sha256('3').slice(0, 8),
        name: 'Gast 3',
        isGuest: true,
        color: 'purple',
        abrv: 'G3',
    },
    {
        id: 4,
        // id: sha256('4').slice(0, 8),
        name: 'Gast 4',
        isGuest: true,
        color: 'yellow',
        abrv: 'G4',
    },
]);

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
        getUser: (id) => {/**Add function here to get a user by an ID */},

        getAllUser: () => {console.log('here are all the users')},

        addUser: (name, abrv, color) => {
            if(name){
                const newPlayerAbrv = abrv ?? ''
                const newPlayerColor = color ?? colorArr[Math.floor(Math.random() * colorArr.length)]
                const id = sha256(name).slice(0, 8);
                store.update(currentUserDB => {
                    return [
                        ...currentUserDB,
                        {
                            id:id, 
                            name: name, 
                            abrv: newPlayerAbrv,
                            color: newPlayerColor,
                            isGuest: false,
                            wins: 0,
                            losses: 0,
                            games_played: 0,
                            avg: 0,
                            overall_points: 0,
                            highest_round: 0,
                            highest_finish: 0,
                            last_game: null,
                        }
                    ]
                })
            }
        },

        updateUser: (id, changes) => {
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

        deleteUser: (id) => {
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

        deleteAllUser: () => {},
        //########################################################
    };
}

