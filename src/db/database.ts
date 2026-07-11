import Dexie, { type EntityTable } from 'dexie';

import type { Player } from './models/player_model';
import { createEmptyPlayerStatistics } from './models/player_model';

import type { Board } from './models/board_model';
import { STANDARD_180_BOARD, STANDARD_240_BOARD } from './models/board_model';

import type { Game } from './models/game_model';


/**
 * Typed Dexie database used by the application.
 */
export const db = new Dexie('240-dart-database') as Dexie & {
  players: EntityTable<Player, 'id'>;
  boards: EntityTable<Board, 'id'>;
  games: EntityTable<Game, 'id'>;
};


/**
 * Version 1 of the IndexedDB schema.
 *
 * Only the properties listed here are indexed. Every other property
 * is still stored as part of the corresponding object.
 */
db.version(1).stores({
  players: 'id, username, modelVersion',
  boards: 'id, name, modelVersion',
  games: 'id, status, createdAt, startedAt, finishedAt, modelVersion'
});


/**
 * Default guest players included with the application.
 *
 * Fixed IDs ensure that the players are not duplicated whenever the
 * application starts.
 *
 * These players are permanently stored in IndexedDB, while `isGuest`
 * marks them as reusable guest profiles.
 */
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


/**
 * Adds default players and boards that are not currently stored.
 *
 * Existing records are not overwritten. This means that changes made
 * to an existing default player remain intact.
 *
 * Deleted default records are restored the next time the application
 * initializes the database.
 */
async function seedDefaultData(): Promise<void> {
  await db.transaction('rw', db.players, db.boards, async () => {
    const defaultPlayerIds = DEFAULT_GUEST_PLAYERS.map((player) => player.id);
    const storedDefaultPlayers = await db.players.bulkGet(defaultPlayerIds);

    const missingPlayers = DEFAULT_GUEST_PLAYERS.filter((player, index) => storedDefaultPlayers[index] === undefined);

    if (missingPlayers.length > 0) {
      await db.players.bulkAdd(missingPlayers);
    }

    const defaultBoards = [
      STANDARD_180_BOARD,
      STANDARD_240_BOARD
    ];

    const defaultBoardIds = defaultBoards.map((board) => board.id);
    const storedDefaultBoards = await db.boards.bulkGet(defaultBoardIds);

    const missingBoards = defaultBoards.filter((board, index) => storedDefaultBoards[index] === undefined);

    if (missingBoards.length > 0) {
      await db.boards.bulkAdd(missingBoards);
    }
  });
}


/**
 * Opens the IndexedDB database and inserts the default application data.
 *
 * Call this once before mounting the Svelte application.
 *
 * @throws When the database cannot be opened or initialized.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    await seedDefaultData();

    console.info(`Database "${db.name}" initialized successfully.`);
  } catch (error) {
    console.error('Could not initialize the database:', error);

    throw new Error('The local database could not be initialized.', {
      cause: error
    });
  }
}


/**
 * Closes the current database connection.
 */
export function closeDatabase(): void {
  db.close();
}


/**
 * Deletes the complete IndexedDB database.
 *
 * The default players and boards are recreated the next time
 * initializeDatabase() is called.
 */
export async function deleteDatabase(): Promise<void> {
  db.close();
  await Dexie.delete(db.name);
}
