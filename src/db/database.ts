import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Player } from './models/player_model';



export const db = new Dexie('240-dart-database') as Dexie & {
    players: EntityTable<Player, 'id'>;
};


/**
 * IndexedDB schema version 1.
 *
 * Only fields listed here are indexed. The entire object is still stored,
 * including nested fields such as statistics, turns, and segments.
 */
db.version(1).stores({
    players: 'id, username, modelVersion'
});



/**
 * Opens the IndexedDB database and performs any initial setup.
 *
 * Call this once before mounting the application. Importing `db` elsewhere
 * does not create another database; all imports use the same instance.
 */
export async function initializeDatabase(): Promise<void> {
    try {
        await db.open();

        console.info(`Database "${db.name}" initialized successfully.`);
    } catch (error) {
        console.error('Could not initialize the database:', error);

    throw new Error('The local database could not be initialized.', {
        cause: error
    });
    }
}