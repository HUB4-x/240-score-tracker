/**
 * 
 */
import { readJSON, writeJSON } from "./local_storage_API";
import { STORAGE_KEYS } from "../configs/storage_configs";
import type {Player} from './player_API'

/**
 * ######################################################################
 * ########################## MODEL #####################################
 * ######################################################################
 */

export enum Dartboard {
    GAME_180 = 180,
    GAME_240 = 240,
}

export enum Finish_Rule {
    FIN_STRAIGHT_OUT,
    FIN_DOUBLE_OUT,
    FIN_TRIPPLE_OUT,
    FIN_MASTER_OUT,
    //TODO: MAYBE MORE 
}

export enum Enter_Rule {
    ENTER_STRAIGHT_IN,
    ENTER_DOUBLE_IN,
    ENTER_TRIPPLE_IN,
    ENTER_MASTER_IN,
    //TODO: MAYBE MORE 
}


export type Game_Settings = {
    maxRounds: number,
    dartboard: Dartboard,
    casual: boolean,
    enter_rule: Enter_Rule,
    finish_rule: Finish_Rule,

}

export type Round = {
    round_index: number,
    playerID: number,
    throwing_attempts: [number, number, number],
    finished?: boolean
}

export type PlayerScores = {
    playerID: number,
    score: number
}

export interface Game {
    id: number,
    name?: string,
    timestamp?: string,
    playerIDs_in_game: number[],
    players_in_game?: Player[],
    finished: boolean, //false ==> ongoing game
    winner?: Player,
    currentRound?: number,
    rounds?: Round[], // []
    player_scores?: PlayerScores,


    game_settings: Game_Settings,
}






/**
 * ######################################################################
 * ########################## FUNCTIONs #################################
 * ######################################################################
 */

export function check_validity_of_game_settings(game: Game): boolean {
    const gs = game.game_settings
    if(gs.dartboard == 180){
        if(gs.enter_rule === Enter_Rule.ENTER_TRIPPLE_IN) return false
        if(gs.finish_rule === Finish_Rule.FIN_TRIPPLE_OUT) return false
    } else if (gs.dartboard == 240) {

    } else {
        return false
    }

    return true
}




/**
 * Get all games from localStorage.
 */
export function getGames(): Game[] {
  return readJSON<Game[]>(STORAGE_KEYS.games, []);
}

/**
 * Bulk setter: replace the stored games list with the given array.
 * (analog to setPlayers / savePlayers)
 */
export function setGames(games: Game[]): void {
  writeJSON<Game[]>(STORAGE_KEYS.games, games);
}

/**
 * Upsert a single game.
 * - adds if id not found
 * - replaces if id already exists
 */
export function saveGame(game: Game): void {
  const games = getGames();
  const idx = games.findIndex((g) => g.id === game.id);

  if (idx === -1) {
    games.push(game);
  } else {
    games[idx] = game;
  }

  writeJSON<Game[]>(STORAGE_KEYS.games, games);
}

/**
 * Update a game by id with a partial patch.
 * Returns updated game or null if not found.
 */
export function updateGame(
  id: Game['id'],
  patch: Partial<Game>
): Game | null {
  const games = getGames();
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) return null;

  const updated: Game = { ...games[idx], ...patch };
  games[idx] = updated;

  writeJSON<Game[]>(STORAGE_KEYS.games, games);
  return updated;
}

/**
 * Delete a game by id.
 * Returns true if a game was removed, false if none matched.
 */
export function deleteGame(id: Game['id']): boolean {
  const games = getGames();
  const next = games.filter((g) => g.id !== id);

  if (next.length === games.length) {
    // nothing deleted
    return false;
  }

  writeJSON<Game[]>(STORAGE_KEYS.games, next);
  return true;
}

/**
 * Get a single game by id, or null if it doesn't exist.
 */
export function getGameById(id: Game['id']): Game | null {
  const games = getGames();
  const game = games.find((g) => g.id === id);
  return game ?? null;
}

/**
 * Generate a unique numeric id for a new Game.
 * Uses random numbers and checks collisions via getGameById.
 */
export function generateUniqueGameId(maxAttempts = 1000): Game['id'] {
  for (let i = 0; i < maxAttempts; i++) {
    // random int between 1 and 999999999
    const id = Math.floor(Math.random() * 1_000_000_000) + 1;

    const existing = getGameById(id);
    if (!existing) {
      return id;
    }
  }

  // fallback: timestamp (still very likely unique)
  return Date.now();
}