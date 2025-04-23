/**
 * This will be a normal api without store functionality. 
 * we will have GET, PULL, PUSH, DELETE
 * In the localstorage we will have single items that represents the current games via a name like e.g. game_[gameID], one array that contains ALL old games.
 * 
 *There are tqwo different kind of Games. Saved and current (ongoing) games.
 */

 import {sha256} from 'js-sha256';


class GameAPI {

    static getCurrentGame(gameID){
        const value = localStorage.getItem(`game_${gameID}`)
        if(value) {
            return JSON.parse(value)
        } else {
            return null
        }
    }

    static getSavedGame(gameID){
        const gameList = this.getAllSavedGames()
        const tmp_game = gameList.find(game => game.id === gameID)
        return tmp_game
    }

    /**
     * Returns a list of GameObjects that are all finished
     * @returns List of GameObjects
     */
    static getAllSavedGames(){
        const value = localStorage.getItem('FinishedGames')
        if(value){
            return JSON.parse(value)
        } else {
            localStorage.setItem('FinishedGames', JSON.stringify([]))
            return []
        }
    }

    /**
     * Returns a list of GameIDs of all ongoing current games
     */
    static getAllCurrentGameIDs(){
        const value = localStorage.getItem('RunningGamesList')
        if(value){
            return JSON.parse(value)
        } else {
            localStorage.setItem('RunningGamesList', JSON.stringify([]))
            return []
        }
    }

    static createNewGame(game){
        localStorage.setItem(`game_${game.id}`, JSON.stringify({...game, timestamp: this.getFormattedDateTime()}))
        const currentRunningGameIDList = this.getAllCurrentGameIDs()
        localStorage.setItem('RunningGamesList', JSON.stringify([...currentRunningGameIDList, game.id]))
    }

    static updateCurrentGame(gameID, game){
        //Really needed???
    }

    static deleteCurrentGame(gameID){
        const newRunningGameList = this.getAllCurrentGameIDs().filter(id => id !== gameID);
        localStorage.setItem('RunningGamesList', JSON.stringify(newRunningGameList))
        try{
            localStorage.removeItem(`game_${gameID}`)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }
    
    static deleteSavedGame(gameID){
        const gameList = this.getAllSavedGames().filter(game => game.id !== gameID)
        localStorage.setItem('FinishedGames', JSON.stringify(gameList))
    }

    static saveCurrentGame(gameID, game){
        if(game.finished){
            const currentSavedGames = this.getAllSavedGames()
            let newSavedGamesList = [...currentSavedGames, game]
            localStorage.setItem('FinishedGames', JSON.stringify(newSavedGamesList))
            this.deleteCurrentGame(gameID)
        } else {
            localStorage.setItem(`game_${gameID}`, JSON.stringify(game))
        }
    }

    static generateNewGameID(length = 8){
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result = sha256(result).slice(0, 32)
        const burnedGameIDs = this.getAllCurrentGameIDs()
        if(burnedGameIDs.includes(result)){
            return this.generateNewGameID()
        } else {
            return result;
        }
    }

    static getFormattedDateTime(){
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const day = pad(now.getDate());
        const month = pad(now.getMonth() + 1); // Months are 0-indexed
        const year = now.getFullYear();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
      }


}

export default GameAPI;