
export interface PlayerStatistics {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;

    legsPlayed: number;
    legsWon: number;

    setsPlayed: number;
    setsWon: number;

    totalDartsThrown: number;
    totalPointsScored: number;

    highestScore: number;
    highestCheckout: number;
    
    /**
     * Number of checkouts >= 100;
     */
    count100PlusCheckout: number;


    count140Plus: number;
    count180: number;
    count240: number;

    /**
     * Average points scored per three darts.
     */
    threeDartAverage: number;

    /**
     * Average score of one dart.
     */
    oneDartAverage: number;

    /**
     * Checkout attempts and successful checkouts can be used
     * to calculate the checkout percentage.
     */
    checkoutAttempts: number;
    successfulCheckouts: number;
    checkoutPercentage: number;
}







/**
 * A player stored in IndexedDB.
 */
export interface Player {
    /**
     * IndexedDB primary key
     */
    id: string,

    /**
     * Optional Player name shown the application.
     */
    name?: string;

    /**
     * shorter name used in compact layouts.
     */
    username: string;

    /**
     * Optional avatar. This is one of the predefined avatars that I will create later
     */
    avatar?: string;

    /**
     * color used to identify the player in the UI.
     *
     * is a hex-color code
     */
    color: string;

    /**
     * True for temporary guest players.
     *
     * Guest players can participate in games without being
     * treated as permanent profiles.
     */
    isGuest: boolean;

    /**
     * Aggregated lifetime statistics.
     */
    statistics: PlayerStatistics;

    /**
     * Increment when the stored player structure changes.
     */
    modelVersion: number;

}













export function createEmptyPlayerStatistics(): PlayerStatistics {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,

    legsPlayed: 0,
    legsWon: 0,

    setsPlayed: 0,
    setsWon: 0,

    totalDartsThrown: 0,
    totalPointsScored: 0,

    highestScore: 0,
    highestCheckout: 0,

    count100PlusCheckout: 0,
    count140Plus: 0,
    count180: 0,
    count240: 0,

    threeDartAverage: 0,
    oneDartAverage: 0,

    checkoutAttempts: 0,
    successfulCheckouts: 0,
    checkoutPercentage: 0
  };
}



export interface CreatePlayerInput {
    username: string;
    color: string;
    name?: string;
    avatar?: string;
    isGuest?: boolean;
}


/**
 * Creates a validated player object that can be stored in IndexedDB.
 *
 * @param input - The values used to create the player.
 * @returns A new player with a generated ID and empty statistics.
 * @throws When the username is empty or the color is invalid.
 */
export function createPlayer(input: CreatePlayerInput): Player {
  const username = input.username.trim();
  const name = input.name?.trim();
  const color = input.color.trim();

  if (username.length === 0) {
    throw new Error('Player username cannot be empty.');
  }

  if (!isHexColor(color)) {
    throw new Error('The player color is not a valid hex color.');
  }

  return {
    id: crypto.randomUUID(),
    name: name || undefined,
    username,
    avatar: input.avatar,
    color: normalizeHexColor(color),
    isGuest: input.isGuest ?? false,
    statistics: createEmptyPlayerStatistics(),
    modelVersion: 1
  };
}

/**
 * Recalculates all derived player statistics.
 *
 * The original statistics object is not modified.
 *
 * @param statistics - The statistics from which averages are calculated.
 * @returns A new statistics object containing updated averages.
 */
export function calculatePlayerAverages(
  statistics: PlayerStatistics
): PlayerStatistics {
  const oneDartAverage =
    statistics.totalDartsThrown > 0
      ? statistics.totalPointsScored / statistics.totalDartsThrown
      : 0;

  const checkoutPercentage =
    statistics.checkoutAttempts > 0
      ? (statistics.successfulCheckouts /
          statistics.checkoutAttempts) *
        100
      : 0;

  return {
    ...statistics,
    oneDartAverage,
    threeDartAverage: oneDartAverage * 3,
    checkoutPercentage
  };
}




/**
 * Checks whether a string is a valid hexadecimal color value.
 *
 * Supported formats:
 * - #RGB, for example "#fff"
 * - #RRGGBB, for example "#ffffff"
 *
 * The check is case-insensitive, so both uppercase and lowercase
 * hexadecimal characters are accepted.
 *
 * @param value - The string to validate.
 * @returns `true` when the string is a valid hex color; otherwise `false`.
 */
export function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}


/**
 * Converts a valid hex color into the normalized `#RRGGBB` format.
 *
 * Examples:
 * - `#fff` becomes `#ffffff`
 * - `#12ABef` becomes `#12abef`
 *
 * @param value - A valid hexadecimal color.
 * @returns The normalized lowercase six-digit color.
 * @throws When the supplied value is not a valid hex color.
 */
export function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) {
    throw new Error('Cannot normalize an invalid hex color.');
  }

  const normalized = value.toLowerCase();

  if (normalized.length === 7) {
    return normalized;
  }

  const [red, green, blue] = normalized.slice(1);

  return `#${red}${red}${green}${green}${blue}${blue}`;
}