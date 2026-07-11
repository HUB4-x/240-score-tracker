export type BoardSegmentClassification = 'miss' | 'single' | 'double' | 'triple' | 'quadruple' | 'bull' | 'master-valid';

export interface BoardSegment {
  /**
   * Unique ID of the segment inside the board.
   *
   * Examples:
   * - "single-20"
   * - "triple-20"
   * - "quadruple-20"
   * - "bull"
   */
  id: string;

  /**
   * Display name shown in the UI.
   */
  name: string;

  /**
   * Base value of the segment.
   *
   * Example:
   * Triple 20 has value 20.
   */
  value: number;

  /**
   * Multiplier applied to the base value.
   *
   * Examples:
   * - Single = 1
   * - Double = 2
   * - Triple = 3
   * - Quadruple = 4
   */
  multiplier: number;

  /**
   * Final score awarded when this segment is hit.
   *
   * Usually value × multiplier.
   */
  score: number;

  /**
   * Classifications used by the game rules.
   */
  countsAs: BoardSegmentClassification[];
}


/**
 * A complete dartboard stored in IndexedDB.
 */
export interface Board {
  /**
   * IndexedDB primary key.
   */
  id: string;

  /**
   * Board name displayed in the application.
   *
   * Examples:
   * - "Standard 180 Board"
   * - "240 Board"
   */
  name: string;

  /**
   * Optional description of the board.
   */
  description?: string;

  /**
   * All scoring segments available on this board.
   */
  segments: BoardSegment[];

  /**
   * Determines whether the board is included with the application.
   *
   * Built-in boards can be protected from deletion or editing.
   */
  isBuiltIn: boolean;

  /**
   * Increment when the stored board structure changes.
   */
  modelVersion: number;
}


/**
 * Values required to create a new board.
 */
export interface CreateBoardInput {
  name: string;
  description?: string;
  segments: BoardSegment[];
  isBuiltIn?: boolean;
}


/**
 * Values that can be changed on an existing board.
 */
export type UpdateBoardInput = Partial<Pick<Board, 'name' | 'description' | 'segments'>>;


/**
 * Values required to create one board segment.
 */
export interface CreateBoardSegmentInput {
  id: string;
  name: string;
  value: number;
  multiplier: number;
  score?: number;
  countsAs: BoardSegmentClassification[];
}


/**
 * Creates and validates a board segment.
 *
 * When no explicit score is supplied, the score is calculated using
 * value multiplied by multiplier.
 *
 * @param input - Values used to create the segment.
 * @returns A validated board segment.
 */
export function createBoardSegment(input: CreateBoardSegmentInput): BoardSegment {
  const id = input.id.trim();
  const name = input.name.trim();

  if (id.length === 0) {
    throw new Error('A board segment requires an ID.');
  }

  if (name.length === 0) {
    throw new Error('A board segment requires a name.');
  }

  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error('A board segment value must be zero or greater.');
  }

  if (!Number.isFinite(input.multiplier) || input.multiplier < 0) {
    throw new Error('A board segment multiplier must be zero or greater.');
  }

  if (input.countsAs.length === 0) {
    throw new Error('A board segment requires at least one classification.');
  }

  const score = input.score ?? input.value * input.multiplier;

  if (!Number.isFinite(score) || score < 0) {
    throw new Error('A board segment score must be zero or greater.');
  }

  if (input.countsAs.includes('miss') && score !== 0) {
    throw new Error('A miss segment must have a score of zero.');
  }

  return {
    id,
    name,
    value: input.value,
    multiplier: input.multiplier,
    score,
    countsAs: [...new Set(input.countsAs)]
  };
}


/**
 * Creates a new board object ready to be stored in IndexedDB.
 *
 * @param input - Name, description and segments of the board.
 * @returns A fully initialized board.
 */
export function createBoard(input: CreateBoardInput): Board {
  const name = input.name.trim();
  const description = input.description?.trim();

  if (name.length === 0) {
    throw new Error('The board name cannot be empty.');
  }

  validateBoardSegments(input.segments);

  return {
    id: crypto.randomUUID(),
    name,
    description: description || undefined,
    segments: cloneBoardSegments(input.segments),
    isBuiltIn: input.isBuiltIn ?? false,
    modelVersion: 1
  };
}


/**
 * Validates all segments belonging to a board.
 *
 * @param segments - Board segments to validate.
 */
export function validateBoardSegments(segments: BoardSegment[]): void {
  if (segments.length === 0) {
    throw new Error('A board requires at least one segment.');
  }

  const usedSegmentIds = new Set<string>();

  for (const segment of segments) {
    if (segment.id.trim().length === 0) {
      throw new Error('Every board segment requires an ID.');
    }

    if (usedSegmentIds.has(segment.id)) {
      throw new Error(`The board segment ID "${segment.id}" is used more than once.`);
    }

    if (segment.name.trim().length === 0) {
      throw new Error(`Board segment "${segment.id}" requires a name.`);
    }

    if (!Number.isFinite(segment.value) || segment.value < 0) {
      throw new Error(`Board segment "${segment.name}" has an invalid value.`);
    }

    if (!Number.isFinite(segment.multiplier) || segment.multiplier < 0) {
      throw new Error(`Board segment "${segment.name}" has an invalid multiplier.`);
    }

    if (!Number.isFinite(segment.score) || segment.score < 0) {
      throw new Error(`Board segment "${segment.name}" has an invalid score.`);
    }

    if (segment.countsAs.length === 0) {
      throw new Error(`Board segment "${segment.name}" requires at least one classification.`);
    }

    if (segment.countsAs.includes('miss') && segment.score !== 0) {
      throw new Error(`Miss segment "${segment.name}" must have a score of zero.`);
    }

    usedSegmentIds.add(segment.id);
  }
}


/**
 * Creates a deep copy of a board's segment array.
 *
 * @param segments - Segments to clone.
 * @returns A new segment array.
 */
export function cloneBoardSegments(segments: BoardSegment[]): BoardSegment[] {
  return segments.map((segment) => ({
    ...segment,
    countsAs: [...segment.countsAs]
  }));
}


/**
 * Creates the miss segment shared by standard boards.
 */
export function createMissSegment(): BoardSegment {
  return createBoardSegment({
    id: 'miss',
    name: 'Miss',
    value: 0,
    multiplier: 0,
    score: 0,
    countsAs: ['miss']
  });
}


/**
 * Creates the single bull segment worth 25 points.
 */
export function createSingleBullSegment(): BoardSegment {
  return createBoardSegment({
    id: 'single-bull',
    name: 'Single Bull',
    value: 25,
    multiplier: 1,
    score: 25,
    countsAs: ['bull', 'single']
  });
}


/**
 * Creates the double bull segment worth 50 points.
 *
 * Because it includes the "double" classification, it is valid for
 * double-in, double-out, master-in and master-out.
 */
export function createDoubleBullSegment(): BoardSegment {
  return createBoardSegment({
    id: 'double-bull',
    name: 'Double Bull',
    value: 25,
    multiplier: 2,
    score: 50,
    countsAs: ['bull', 'double']
  });
}


/**
 * Creates all numbered segments for one multiplier.
 *
 * @param classification - Segment classification.
 * @param multiplier - Score multiplier.
 * @returns Segments for numbers 1 through 20.
 */
export function createNumberSegments(classification: 'single' | 'double' | 'triple' | 'quadruple', multiplier: number): BoardSegment[] {
  const displayName = classification.charAt(0).toUpperCase() + classification.slice(1);

  return Array.from({ length: 20 }, (_, index) => {
    const value = index + 1;

    return createBoardSegment({
      id: `${classification}-${value}`,
      name: `${displayName} ${value}`,
      value,
      multiplier,
      countsAs: [classification]
    });
  });
}


/**
 * Creates all segments for a standard 180 board.
 *
 * The maximum possible score with three darts is 180.
 */
export function createStandard180Segments(): BoardSegment[] {
  return [
    createMissSegment(),
    ...createNumberSegments('single', 1),
    ...createNumberSegments('double', 2),
    ...createNumberSegments('triple', 3),
    createSingleBullSegment(),
    createDoubleBullSegment()
  ];
}


/**
 * Creates all segments for a 240 board.
 *
 * The board additionally contains quadruple segments, allowing a
 * maximum possible score of 240 with three darts.
 */
export function createStandard240Segments(): BoardSegment[] {
  return [
    createMissSegment(),
    ...createNumberSegments('single', 1),
    ...createNumberSegments('double', 2),
    ...createNumberSegments('triple', 3),
    ...createNumberSegments('quadruple', 4),
    createSingleBullSegment(),
    createDoubleBullSegment()
  ];
}


/**
 * Built-in standard 180 board.
 *
 * A fixed ID prevents duplicate built-in boards when seeding IndexedDB.
 */
export const STANDARD_180_BOARD: Board = {
  id: 'board-standard-180',
  name: 'Standard 180 Board',
  description: 'Standard dartboard with singles, doubles and triples.',
  segments: createStandard180Segments(),
  isBuiltIn: true,
  modelVersion: 1
};


/**
 * Built-in standard 240 board.
 *
 * A fixed ID prevents duplicate built-in boards when seeding IndexedDB.
 */
export const STANDARD_240_BOARD: Board = {
  id: 'board-standard-240',
  name: 'Standard 240 Board',
  description: 'Dartboard with singles, doubles, triples and quadruples.',
  segments: createStandard240Segments(),
  isBuiltIn: true,
  modelVersion: 1
};


/**
 * Returns a segment from a board by its ID.
 *
 * @param board - Board to search.
 * @param segmentId - Segment ID to locate.
 * @returns The matching segment or undefined.
 */
export function findBoardSegment(board: Board, segmentId: string): BoardSegment | undefined {
  return board.segments.find((segment) => segment.id === segmentId);
}


/**
 * Returns the highest-scoring segment on a board.
 *
 * @param board - Board to inspect.
 * @returns The highest-scoring segment.
 */
export function getHighestBoardSegment(board: Board): BoardSegment {
  const highestSegment = board.segments.reduce<BoardSegment | undefined>((highest, segment) => {
    if (!highest || segment.score > highest.score) {
      return segment;
    }

    return highest;
  }, undefined);

  if (!highestSegment) {
    throw new Error('The board does not contain any segments.');
  }

  return highestSegment;
}


/**
 * Returns the highest possible score for one complete turn.
 *
 * @param board - Board to inspect.
 * @param dartsPerTurn - Number of darts allowed in one turn.
 */
export function getMaximumTurnScore(board: Board, dartsPerTurn: number): number {
  if (!Number.isInteger(dartsPerTurn) || dartsPerTurn <= 0) {
    throw new Error('Darts per turn must be a positive integer.');
  }

  return getHighestBoardSegment(board).score * dartsPerTurn;
}