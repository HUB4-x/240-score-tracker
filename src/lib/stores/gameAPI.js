/**
 * This will be a normal api without store functionality. 
 * we will have GET, PULL, PUSH, DELETE
 * In the localstorage we will have single items that represents the current games via a name like e.g. game_[gameID], one array that contains ALL old games.
 * 
 *There are tqwo different kind of Games. Saved and current (ongoing) games.
 */


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
        const tmp_game = gameList.find(game => game.ID === gameID)
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
        localStorage.setItem(`game_${game.ID}`, JSON.stringify(game))
    }

    static updateCurrentGame(gameID, game){
        //Really needed???
    }

    static deleteCurrentGame(gameID){
        try{
            localStorage.removeItem(`game_${gameID}`)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }
    
    static deleteSavedGame(gameID){
        const gameList = this.getAllSavedGames()
        gameList.filter(game => {
            if(game.ID === gameID){
                return false
            } else {
                return true
            }
        })
        console.log('new Saved game list: ', gameList)
        localStorage.setItem('FinishedGames', JSON.stringify(gameList))
    }

    static saveCurrentGame(gameID, game){
        if(game.finsihed){
            const currentSavedGames = this.getAllSavedGames()
            let newSavedGamesList = [...currentSavedGames, game]
            localStorage.setItem('FinishedGames', JSON.stringify(newSavedGamesList))
        } else {
            localStorage.setItem(`game_${gameID}`, JSON.stringify(game))
        }
    }


}