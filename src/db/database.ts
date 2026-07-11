// src/db/database.ts

import Dexie, { type EntityTable } from 'dexie';

import type { Player } from './models/player_model';
import { createEmptyPlayerStatistics } from './models/player_model';

import type { Board } from './models/board_model';
import { STANDARD_180_BOARD, STANDARD_240_BOARD } from './models/board_model';

import type { Game } from './models/game_model';

export const db = new Dexie('240-dart-database') as Dexie & {
  players: EntityTable<Player, 'id'>;
  boards: EntityTable<Board, 'id'>;
  games: EntityTable<Game, 'id'>;
};

db.version(1).stores({
  players: 'id, username, modelVersion',
  boards: 'id, name, modelVersion',
  games: 'id, status, createdAt, startedAt, finishedAt, modelVersion'
});

export const DEFAULT_GUEST_PLAYERS: Player[] = [
  {
    id: 'default-guest-player-1',
    username: 'Guest 1',
    color: '#ef4444',
    isGuest: true,
    statistics: createEmptyPlayerStatistics(),
    modelVersion: 1
  },
  {
    id: 'default-guest-player-2',
    username: 'Guest 2',
    color: '#3b82f6',
    isGuest: true,
    statistics: createEmptyPlayerStatistics(),
    modelVersion: 1
  },
  {
    id: 'default-guest-player-3',
    username: 'Guest 3',
    color: '#22c55e',
    isGuest: true,
    statistics: createEmptyPlayerStatistics(),
    modelVersion: 1
  },
  {
    id: 'default-guest-player-4',
    username: 'Guest 4',
    color: '#eab308',
    isGuest: true,
    statistics: createEmptyPlayerStatistics(),
    modelVersion: 1
  }
];

const DEFAULT_BOARDS: Board[] = [
  STANDARD_180_BOARD,
  STANDARD_240_BOARD
];

/**
 * Inserts only default records that are currently missing.
 *
 * Existing default players and boards are left unchanged.
 */
async function seedMissingDefaultData(): Promise<void> {
  await db.transaction('rw', db.players, db.boards, async () => {
    const storedPlayers = await db.players.bulkGet(DEFAULT_GUEST_PLAYERS.map((player) => player.id));

    const missingPlayers = DEFAULT_GUEST_PLAYERS.filter((player, index) => storedPlayers[index] === undefined);

    if (missingPlayers.length > 0) {
      await db.players.bulkAdd(missingPlayers);
    }

    const storedBoards = await db.boards.bulkGet(DEFAULT_BOARDS.map((board) => board.id));

    const missingBoards = DEFAULT_BOARDS.filter((board, index) => storedBoards[index] === undefined);

    if (missingBoards.length > 0) {
      await db.boards.bulkAdd(missingBoards);
    }
  });
}

/**
 * Opens the database.
 *
 * Dexie creates the database automatically when it does not exist.
 * Afterwards, missing default players and boards are inserted.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    await seedMissingDefaultData();

    console.info(`Database "${db.name}" initialized.`);
  } catch (error) {
    console.error('Could not initialize the database:', error);

    throw new Error('The local database could not be initialized.', {
      cause: error
    });
  }
}

export function closeDatabase(): void {
  db.close();
}

export async function deleteDatabase(): Promise<void> {
  db.close();
  await Dexie.delete(db.name);
}