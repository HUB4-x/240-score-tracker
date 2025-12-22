// random_game.ts
import type { Game } from '../../lib/api/game_API';
import { getPlayers } from '../../lib/api/player_API';
import { Dartboard, generateUniqueGameId, Enter_Rule, Finish_Rule } from '../../lib/api/game_API';

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomGame(): Game {
  const allPlayers = getPlayers();
  if (allPlayers.length < 2) {
    throw new Error('Need at least 2 players to generate a random game');
  }

  // pick 2–4 distinct players
  const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);
  const numPlayers = Math.min(shuffled.length, randomInt(2, 4));
  const selected = shuffled.slice(0, numPlayers);
  const playerIds = selected.map((p) => p.id);
  const createdAt = new Date();


  const id = generateUniqueGameId();

  const game: Game = {
    id,
    name: `Random Game #${id}`,
    finished: [false, true][Math.floor(Math.random() * 2)],
    timestamp: createdAt.toISOString(),
    playerIDs_in_game: playerIds,
    game_settings: {
        casual: [false, true][Math.floor(Math.random() * 2)],
        dartboard: [Dartboard.GAME_180,Dartboard.GAME_240][Math.floor(Math.random() * 2)],
        enter_rule: Enter_Rule.ENTER_STRAIGHT_IN,
        finish_rule: Finish_Rule.FIN_MASTER_OUT,
    },
  };

  return game;
}
