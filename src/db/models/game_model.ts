import type { BoardSegment, BoardSegmentClassification } from "./board_model";

export type GameStatus = 'setup' | 'running' | 'paused' | 'finished' | 'cancelled';

export type EntryMode = 'single-in' | 'double-in' | 'master-in';

export type ExitMode = 'single-out' | 'double-out' | 'master-out';



/**
 * Snapshot of a player at the time the game was created.
 *
 * This keeps old games readable when a player profile is later changed
 * or deleted from the player database.
 */
export interface GamePlayerSnapshot {
    /**
     * ID of the player in the player database.
     */
    playerId: string;

    username: string;
    name?: string;
    avatar?: string;
    color: string;
}


/**
 * Snapshot of the board used by the game.
 *
 * The board segments are copied into the game so that a running or finished
 * game remains valid when the original board is later changed or deleted.
 */
export interface GameBoardSnapshot {
    /**
     * ID of the board in the board database.
     */
    boardId: string;

    /**
     * Board name at the time the game was created.
     */
    name: string;

    /**
     * Version of the board model.
     */
    modelVersion: number;

    /**
     * Snapshot of all board segments available during the game.
     */
    segments: BoardSegment[];
}


/**
 * Snapshot of the selected game mode.
 *
 * Examples include 301, 501, 701 or a custom starting score.
 */
export interface GameModeSnapshot {
    /**
     * ID of the game mode.
     *
     * Built-in game modes can use stable IDs such as "301" or "501".
     */
    gameModeId: string;

    /**
     * Display name of the game mode.
     */
    name: string;

    /**
     * Score each participant starts with.
     */
    startingScore: number;
}


/**
 * Rules used by the game.
 */
export interface GameRules {
    /**
     * Rule that must be satisfied before a participant can start scoring.
     */
    entryMode: EntryMode;

    /**
     * Rule that must be satisfied to finish the game.
     */
    exitMode: ExitMode;

    /**
     * Number of darts allowed during one turn.
     *
     * This is normally 3.
     */
    dartsPerTurn: number;

    /**
     * Whether a bull segment counts as a double for double-in and double-out.
     */
    bullCountsAsDouble: boolean;
}


/**
 * One competing side in the game.
 *
 * A participant can represent:
 * - one solo player
 * - a team containing multiple players
 */
export interface GameParticipant {
    /**
     * Unique ID of this participant inside the game.
     */
    id: string;

    /**
     * Optional participant or team name.
     */
    name?: string;

    /**
     * Players belonging to this participant.
     *
     * One player means this is a solo participant.
     * Multiple players mean this is a team.
     */
    players: GamePlayerSnapshot[];

    /**
     * Position in the participant throwing order.
     */
    order: number;

    /**
     * Shared remaining score of this participant.
     */
    currentScore: number;

    /**
     * Whether this participant has fulfilled the entry rule.
     */
    hasEntered: boolean;

    /**
     * Index of the player who should throw next inside this participant.
     *
     * For solo participants this remains 0.
     */
    currentPlayerIndex: number;
}


/**
 * Snapshot of one board segment hit by a dart.
 *
 * The relevant board segment properties are copied so that the game history
 * remains correct when the original board is later changed.
 */
export interface DartThrow {
    /**
     * Unique ID of this dart throw.
     */
    id: string;

    /**
     * ID of the board segment that was hit.
     */
    segmentId: string;

    /**
     * Segment name at the time the dart was recorded.
     */
    segmentName: string;

    /**
     * Score awarded by the segment.
     */
    score: number;

    /**
     * Semantic classifications used for entry and exit validation.
     *
     * Examples:
     * - single
     * - double
     * - triple
     * - bull
     * - master-valid
     * - miss
     */
    countsAs: BoardSegmentClassification[];

    /**
     * Whether this dart was a miss.
     */
    isMiss: boolean;

    /**
     * Date and time when the dart was entered.
     */
    thrownAt: string;
}


/**
 * One player's turn.
 *
 * A normal turn contains up to the number of darts configured by
 * GameRules.dartsPerTurn.
 */
export interface GameTurn {
    /**
     * Unique ID of the turn.
     */
    id: string;

    /**
     * ID of the solo participant or team whose shared score was affected.
     */
    scoringParticipantId: string;

    /**
     * ID of the individual player who threw the darts.
     */
    playerId: string;

    /**
     * Sequential turn number inside the game.
     */
    turnNumber: number;

    /**
     * Remaining participant score before the turn started.
     */
    scoreBefore: number;

    /**
     * Remaining participant score after the turn was completed.
     *
     * On a bust this should normally equal scoreBefore.
     */
    scoreAfter: number;

    /**
     * Darts recorded during this turn.
     */
    darts: DartThrow[];

    /**
     * Score officially deducted from the participant's remaining score.
     *
     * This is normally 0 when the turn busts.
     */
    scoredPoints: number;

    /**
     * Whether the turn was invalid and the score was reset.
     */
    isBust: boolean;

    /**
     * Whether this turn successfully finished the game.
     */
    isCheckout: boolean;

    /**
     * Date and time when the turn started.
     */
    startedAt: string;

    /**
     * Date and time when the turn was completed.
     */
    completedAt?: string;
}


/**
 * Winner of a finished game.
 *
 * The winner references a participant because the winner can be either
 * a solo player or a team.
 */
export interface GameWinner {
    /**
     * ID of the winning participant.
     */
    participantId: string;

    /**
     * IDs of all players belonging to the winning participant.
     */
    playerIds: string[];
}


/**
 * Complete game stored in IndexedDB.
 *
 * One Game currently represents one complete leg.
 */
export interface Game {
    /**
     * IndexedDB primary key.
     */
    id: string;

    /**
     * Date and time when the game was created.
     */
    createdAt: string;

    /**
     * Date and time when the game started.
     */
    startedAt?: string;

    /**
     * Date and time when the game finished.
     */
    finishedAt?: string;

    /**
     * Current lifecycle status of the game.
     */
    status: GameStatus;

    /**
     * Snapshot of the selected board.
     */
    board: GameBoardSnapshot;

    /**
     * Snapshot of the selected game mode.
     */
    gameMode: GameModeSnapshot;

    /**
     * Entry, exit and turn rules.
     */
    rules: GameRules;

    /**
     * Solo players or teams competing in the game.
     */
    participants: GameParticipant[];

    /**
     * Complete turn history.
     */
    turns: GameTurn[];

    /**
     * Index of the participant whose turn is next.
     */
    currentParticipantIndex: number;

    /**
     * Number assigned to the next turn.
     */
    currentTurnNumber: number;

    /**
     * Winner of the game.
     *
     * Only present when status is "finished".
     */
    winner?: GameWinner;

    /**
     * Increment when the stored game structure changes.
     */
    modelVersion: number;
}


/**
 * One participant supplied when creating a new game.
 */
export interface CreateGameParticipantInput {
    /**
     * Optional participant or team name.
     */
    name?: string;

    /**
     * One player for a solo participant or multiple players for a team.
     */
    players: GamePlayerSnapshot[];
}


/**
 * Values required to create a new game.
 */
export interface CreateGameInput {
    board: GameBoardSnapshot;
    gameMode: GameModeSnapshot;
    rules: GameRules;
    participants: CreateGameParticipantInput[];
}


/**
 * Values required to create a dart throw.
 */
export interface CreateDartThrowInput {
    segmentId: string;
    segmentName: string;
    score: number;
    countsAs: BoardSegmentClassification[];
}


/**
 * Creates a new game object ready to be stored in IndexedDB.
 *
 * @param input - Board, game mode, rules and participants.
 * @returns A fully initialized game.
 * @throws When the supplied game configuration is invalid.
 */
export function createGame(input: CreateGameInput): Game {
    validateGameInput(input);

    const now = new Date().toISOString();

    const participants: GameParticipant[] = input.participants.map((participant, index) => ({
        id: crypto.randomUUID(),
        name: participant.name?.trim() || undefined,
        players: participant.players.map((player) => ({ ...player })),
        order: index,
        currentScore: input.gameMode.startingScore,
        hasEntered: input.rules.entryMode === 'single-in',
        currentPlayerIndex: 0
    }));

    return {
        id: crypto.randomUUID(),
        createdAt: now,
        status: 'setup',
        board: {
            ...input.board,
            segments: input.board.segments.map((segment) => ({
            ...segment,
            countsAs: [...segment.countsAs]
            }))
        },
        gameMode: { ...input.gameMode },
        rules: { ...input.rules },
        participants,
        turns: [],
        currentParticipantIndex: 0,
        currentTurnNumber: 1,
        modelVersion: 1
    };
}


/**
 * Validates the configuration of a new game.
 *
 * @param input - Game configuration to validate.
 * @throws When the game configuration is invalid.
 */
export function validateGameInput(input: CreateGameInput): void {
    if (input.gameMode.startingScore <= 0) {
        throw new Error('The starting score must be greater than zero.');
    }

    if (!Number.isInteger(input.rules.dartsPerTurn) || input.rules.dartsPerTurn <= 0) {
        throw new Error('The number of darts per turn must be a positive integer.');
    }

    if (input.participants.length < 2) {
        throw new Error('A game requires at least two participants.');
    }

    if (input.board.segments.length === 0) {
        throw new Error('The selected board does not contain any segments.');
    }

    const participantSizes = input.participants.map((participant) => participant.players.length);
    const usedPlayerIds = new Set<string>();

    for (const participant of input.participants) {
        if (participant.players.length === 0) {
            throw new Error('Every participant requires at least one player.');
        }

        for (const player of participant.players) {
            if (player.playerId.trim().length === 0) {
                throw new Error('Every player requires a valid player ID.');
            }

            if (usedPlayerIds.has(player.playerId)) {
                throw new Error(`Player "${player.username}" appears more than once in the game.`);
            }

            usedPlayerIds.add(player.playerId);
        }
    }

    const firstParticipantSize = participantSizes[0];
    const participantsHaveDifferentSizes = participantSizes.some((size) => size !== firstParticipantSize);

    if (participantsHaveDifferentSizes) {
        throw new Error('All participants must contain the same number of players.');
    }
}


/**
 * Creates a dart throw from a board segment.
 *
 * @param segment - Board segment hit by the dart.
 * @returns A dart throw containing a snapshot of the segment.
 */
export function createDartThrowFromSegment(segment: BoardSegment): DartThrow {
    return createDartThrow({
        segmentId: segment.id,
        segmentName: segment.name,
        score: segment.score,
        countsAs: segment.countsAs
    });
}


/**
 * Creates a dart throw from explicit segment snapshot values.
 *
 * @param input - Segment information to store with the dart.
 * @returns A new dart throw.
 */
export function createDartThrow(input: CreateDartThrowInput): DartThrow {
    if (input.segmentId.trim().length === 0) {
        throw new Error('A dart throw requires a segment ID.');
    }

    if (input.segmentName.trim().length === 0) {
        throw new Error('A dart throw requires a segment name.');
    }

    if (input.score < 0) {
        throw new Error('A dart score cannot be negative.');
    }

  return {
        id: crypto.randomUUID(),
        segmentId: input.segmentId,
        segmentName: input.segmentName,
        score: input.score,
        countsAs: [...input.countsAs],
        isMiss: input.countsAs.includes('miss'),
        thrownAt: new Date().toISOString()
    };
}


/**
 * Returns the raw score represented by all darts in a turn.
 *
 * For a bust, this value can be greater than scoredPoints because
 * scoredPoints is normally 0.
 *
 * @param turn - Turn whose raw score should be calculated.
 * @returns Sum of all dart scores in the turn.
 */
export function getAttemptedScore(turn: GameTurn): number {
    return turn.darts.reduce((total, dart) => total + dart.score, 0);
}


/**
 * Returns the currently active participant.
 *
 * @param game - Game from which to retrieve the participant.
 * @returns The participant whose turn is next.
 */
export function getCurrentParticipant(game: Game): GameParticipant {
    const participant = game.participants[game.currentParticipantIndex];

    if (!participant) {
        throw new Error('The current participant could not be found.');
    }

    return participant;
}


/**
 * Returns the player who should currently throw.
 *
 * @param game - Game from which to retrieve the player.
 * @returns The currently active player.
 */
export function getCurrentThrowingPlayer(game: Game): GamePlayerSnapshot {
    const participant = getCurrentParticipant(game);
    const player = participant.players[participant.currentPlayerIndex];

    if (!player) {
        throw new Error('The current throwing player could not be found.');
    }

    return player;
}


/**
 * Returns whether a participant represents a team.
 *
 * @param participant - Participant to inspect.
 * @returns `true` when the participant contains multiple players.
 */
export function isTeamParticipant(participant: GameParticipant): boolean {
  return participant.players.length > 1;
}


/**
 * Returns whether the game is a team game.
 *
 * @param game - Game to inspect.
 * @returns `true` when every participant contains multiple players.
 */
export function isTeamGame(game: Game): boolean {
  return game.participants.every((participant) => isTeamParticipant(participant));
}


/**
 * Returns the IDs of all players belonging to a participant.
 *
 * @param participant - Participant whose player IDs should be returned.
 * @returns Array containing the participant's player IDs.
 */
export function getParticipantPlayerIds(participant: GameParticipant): string[] {
    return participant.players.map((player) => player.playerId);
}


/**
 * Advances to the next player inside a participant.
 *
 * This supports teams of any size.
 *
 * @param participant - Participant whose internal player order should advance.
 */
export function advanceParticipantPlayer(participant: GameParticipant): void {
    if (participant.players.length === 0) {
        throw new Error('Cannot advance a participant without players.');
    }

    participant.currentPlayerIndex = (participant.currentPlayerIndex + 1) % participant.players.length;
}


/**
 * Advances the game to the next participant.
 *
 * @param game - Game whose participant order should advance.
 */
export function advanceGameParticipant(game: Game): void {
    if (game.participants.length === 0) {
        throw new Error('Cannot advance a game without participants.');
    }

    game.currentParticipantIndex = (game.currentParticipantIndex + 1) % game.participants.length;
}


/**
 * Checks whether a dart satisfies the configured entry mode.
 *
 * @param dart - Dart to validate.
 * @param entryMode - Entry mode used by the game.
 * @param bullCountsAsDouble - Whether bull is accepted as a double.
 * @returns `true` when the dart satisfies the entry rule.
 */
export function isValidEntryDart(dart: DartThrow, entryMode: EntryMode, bullCountsAsDouble: boolean): boolean {
    if (entryMode === 'single-in') {
        return !dart.isMiss;
    }

    if (entryMode === 'double-in') {
        return dart.countsAs.includes('double') || bullCountsAsDouble && dart.countsAs.includes('bull');
    }

    return dart.countsAs.includes('double') || dart.countsAs.includes('triple') || dart.countsAs.includes('master-valid');
}


/**
 * Checks whether a dart satisfies the configured exit mode.
 *
 * @param dart - Final dart of a possible checkout.
 * @param exitMode - Exit mode used by the game.
 * @param bullCountsAsDouble - Whether bull is accepted as a double.
 * @returns `true` when the dart satisfies the exit rule.
 */
export function isValidExitDart(dart: DartThrow, exitMode: ExitMode, bullCountsAsDouble: boolean): boolean {
    if (exitMode === 'single-out') {
        return !dart.isMiss;
    }

    if (exitMode === 'double-out') {
        return dart.countsAs.includes('double') || bullCountsAsDouble && dart.countsAs.includes('bull');
    }

    return dart.countsAs.includes('double') || dart.countsAs.includes('triple') || dart.countsAs.includes('master-valid');
}


/**
 * Returns whether a game is finished.
 *
 * @param game - Game to inspect.
 * @returns `true` when the game status is finished.
 */
export function isGameFinished(game: Game): boolean {
    return game.status === 'finished';
}