/**
 * 
 */
import { readJSON, writeJSON } from "./local_storage_API";
import { STORAGE_KEYS } from "../configs/storage_configs";

/**
 * ######################################################################
 * ########################## MODEL #####################################
 * ######################################################################
 */
export type PlayerStats = {
    wins?: number,
    losses?: number,
    totalPoints?: number,
    games_played?: number,
    avg_avg?: number, //This is the average of the averages in games. (e.g. someone plays 2 rounds one with an avg of 10 and the other with 30 the avg_avg = (sum_of_avg)/number_of_games = (10+30)/2 = 20)
    highscore?: number,
    number_of_240?: number,
    number_of_180?: number,
    highest_finish?: number,
}

export interface Player {
    id: number
    name: string,
    nickname?: string
    stats?: PlayerStats,
    isFavorite?: boolean,
    playersColor_hex?: string,
} 





/**
 * ######################################################################
 * ########################## FUNCTIONs #################################
 * ######################################################################
 */

/**
 * Getter: returns all players from localStorage.
 */
export function getPlayers(): Player[] {
  return readJSON<Player[]>(STORAGE_KEYS.players, []);
}


/**
 * Setter: upserts a single player into the list in localStorage.
 * - adds if id not found
 * - replaces if id already exists
 */
export function savePlayer(player: Player): void {
  const players = getPlayers();
  const idx = players.findIndex((p) => p.id === player.id);

  if (idx === -1) {
    players.push(player);
  } else {
    players[idx] = player;
  }

  writeJSON<Player[]>(STORAGE_KEYS.players, players);
}

/**
 * Update: patch a given player's properties by id.
 * Returns the updated player or null if not found.
 */
export function updatePlayer(id: Player['id'], patch: Partial<Player>): Player | null {
  const players = getPlayers();
  const idx = players.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const updated: Player = { ...players[idx], ...patch };
  players[idx] = updated;

  writeJSON<Player[]>(STORAGE_KEYS.players, players);
  return updated;
}


export function setPlayers(players: Player[]): void {
  writeJSON<Player[]>(STORAGE_KEYS.players, players);
}


/**
 * Delete: removes a player with the given id.
 * Returns true if something was deleted, false if no player with that id existed.
 */
export function deletePlayer(id: Player['id']): boolean {
  const players = getPlayers();
  const next = players.filter((p) => p.id !== id);

  if (next.length === players.length) {
    // no player removed
    return false;
  }

  writeJSON<Player[]>(STORAGE_KEYS.players, next);
  return true;
}


// NEW: get a single player by id
export function getPlayerById(id: Player['id']): Player | null {
  const players = getPlayers();
  const player = players.find((p) => p.id === id);
  return player ?? null;
}



export function generateUniquePlayerId(maxAttempts = 1000): Player['id'] {
  for (let i = 0; i < maxAttempts; i++) {
    // e.g. random int between 1 and 999999999
    const id = Math.floor(Math.random() * 1_000_000_000) + 1;

    const existing = getPlayerById(id);
    if (!existing) {
      return id;
    }
  }

  // Fallback: in the (very) unlikely case we hit maxAttempts,
  // use timestamp (still number, and very likely unique)
  return Date.now();
}