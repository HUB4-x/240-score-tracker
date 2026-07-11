<script lang="ts">
  import { onMount } from 'svelte';

  import { db } from '../db/database';
  import { createPlayer, type Player } from '../db/models/player_model';
  import { createBoard, createStandard180Segments, createStandard240Segments, type Board } from '../db/models/board_model';
  import { createGame, type EntryMode, type ExitMode, type Game, type GameParticipant, type GamePlayerSnapshot } from '../db/models/game_model';

  type DatabaseTab = 'players' | 'boards' | 'games';
  type BoardPreset = '180' | '240';

  let activeTab: DatabaseTab = 'players';

  let players: Player[] = [];
  let boards: Board[] = [];
  let games: Game[] = [];

  let isLoading = true;
  let isSavingPlayer = false;
  let isSavingBoard = false;
  let isSavingGame = false;

  let errorMessage = '';
  let successMessage = '';

  let playerUsername = '';
  let playerName = '';
  let playerColor = '#3b82f6';
  let playerAvatar = '';
  let playerIsGuest = false;

  let boardName = '';
  let boardDescription = '';
  let boardPreset: BoardPreset = '180';

  let gameBoardId = '';
  let gameModeName = '501';
  let gameStartingScore = 501;
  let gameEntryMode: EntryMode = 'single-in';
  let gameExitMode: ExitMode = 'double-out';
  let gameDartsPerTurn = 3;
  let gameTeamSize = 1;
  let selectedPlayerIds: string[] = [];

  /**
   * Loads all database tables.
   */
  async function loadDatabaseContent(): Promise<void> {
    isLoading = true;
    errorMessage = '';

    try {
      const [storedPlayers, storedBoards, storedGames] = await Promise.all([
        db.players.orderBy('username').toArray(),
        db.boards.orderBy('name').toArray(),
        db.games.orderBy('createdAt').reverse().toArray()
      ]);

      players = storedPlayers;
      boards = storedBoards;
      games = storedGames;

      if (!gameBoardId && boards.length > 0) {
        gameBoardId = boards[0].id;
      }

      selectedPlayerIds = selectedPlayerIds.filter((playerId) => players.some((player) => player.id === playerId));
    } catch (error) {
      console.error('Could not load database content:', error);
      errorMessage = 'The database content could not be loaded.';
    } finally {
      isLoading = false;
    }
  }

  /**
   * Clears the current status messages.
   */
  function clearMessages(): void {
    errorMessage = '';
    successMessage = '';
  }

  /**
   * Creates and stores a player.
   */
  async function handleCreatePlayer(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    isSavingPlayer = true;
    clearMessages();

    try {
      const player = createPlayer({
        username: playerUsername,
        name: playerName || undefined,
        avatar: playerAvatar || undefined,
        color: playerColor,
        isGuest: playerIsGuest
      });

      await db.players.add(player);

      playerUsername = '';
      playerName = '';
      playerAvatar = '';
      playerIsGuest = false;

      successMessage = `Player "${player.username}" was created.`;

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not create player:', error);
      errorMessage = error instanceof Error ? error.message : 'The player could not be created.';
    } finally {
      isSavingPlayer = false;
    }
  }

  /**
   * Deletes one player.
   */
  async function deletePlayer(player: Player): Promise<void> {
    clearMessages();

    try {
      await db.players.delete(player.id);

      successMessage = `Player "${player.username}" was deleted.`;

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not delete player:', error);
      errorMessage = 'The player could not be deleted.';
    }
  }

  /**
   * Deletes every player.
   */
  async function deleteAllPlayers(): Promise<void> {
    clearMessages();

    try {
      await db.players.clear();

      successMessage = 'All players were deleted.';

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not delete all players:', error);
      errorMessage = 'The players could not be deleted.';
    }
  }

  /**
   * Creates and stores a board using the selected preset.
   */
  async function handleCreateBoard(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    isSavingBoard = true;
    clearMessages();

    try {
      const segments = boardPreset === '240'
        ? createStandard240Segments()
        : createStandard180Segments();

      const board = createBoard({
        name: boardName,
        description: boardDescription || undefined,
        segments,
        isBuiltIn: false
      });

      await db.boards.add(board);

      boardName = '';
      boardDescription = '';
      boardPreset = '180';

      successMessage = `Board "${board.name}" was created.`;

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not create board:', error);
      errorMessage = error instanceof Error ? error.message : 'The board could not be created.';
    } finally {
      isSavingBoard = false;
    }
  }

  /**
   * Deletes one board.
   */
  async function deleteBoard(board: Board): Promise<void> {
    clearMessages();

    try {
      await db.boards.delete(board.id);

      successMessage = `Board "${board.name}" was deleted.`;

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not delete board:', error);
      errorMessage = 'The board could not be deleted.';
    }
  }

  /**
   * Deletes every board.
   */
  async function deleteAllBoards(): Promise<void> {
    clearMessages();

    try {
      await db.boards.clear();

      successMessage = 'All boards were deleted.';

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not delete all boards:', error);
      errorMessage = 'The boards could not be deleted.';
    }
  }

  /**
   * Updates the starting score when a built-in game mode is selected.
   */
  function handleGameModeChange(): void {
    const parsedScore = Number(gameModeName);

    if (Number.isFinite(parsedScore) && parsedScore > 0) {
      gameStartingScore = parsedScore;
    }
  }

  /**
   * Creates a snapshot of a player for storage inside a game.
   */
  function createGamePlayerSnapshot(player: Player): GamePlayerSnapshot {
    return {
      playerId: player.id,
      username: player.username,
      name: player.name,
      avatar: player.avatar,
      color: player.color
    };
  }

  /**
   * Divides selected players into equally sized participants.
   */
  function createGameParticipants(selectedPlayers: Player[]): Array<{ name?: string; players: GamePlayerSnapshot[] }> {
    if (!Number.isInteger(gameTeamSize) || gameTeamSize < 1) {
      throw new Error('The team size must be a positive integer.');
    }

    if (selectedPlayers.length < 2) {
      throw new Error('Select at least two players.');
    }

    if (selectedPlayers.length % gameTeamSize !== 0) {
      throw new Error(`The number of selected players must be divisible by the team size of ${gameTeamSize}.`);
    }

    const participants: Array<{ name?: string; players: GamePlayerSnapshot[] }> = [];

    for (let index = 0; index < selectedPlayers.length; index += gameTeamSize) {
      const participantPlayers = selectedPlayers.slice(index, index + gameTeamSize).map(createGamePlayerSnapshot);

      participants.push({
        name: gameTeamSize > 1 ? `Team ${participants.length + 1}` : undefined,
        players: participantPlayers
      });
    }

    if (participants.length < 2) {
      throw new Error('A game requires at least two participants or teams.');
    }

    return participants;
  }

  /**
   * Creates and stores a new game.
   */
  async function handleCreateGame(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    isSavingGame = true;
    clearMessages();

    try {
      const board = boards.find((storedBoard) => storedBoard.id === gameBoardId);

      if (!board) {
        throw new Error('Select a valid board.');
      }

      const selectedPlayers = selectedPlayerIds.map((playerId) => players.find((player) => player.id === playerId)).filter((player): player is Player => player !== undefined);
      const participants = createGameParticipants(selectedPlayers);

      const game = createGame({
        board: {
          boardId: board.id,
          name: board.name,
          segments: board.segments,
          modelVersion: board.modelVersion
        },
        gameMode: {
          gameModeId: `mode-${gameStartingScore}`,
          name: gameModeName.trim() || `${gameStartingScore}`,
          startingScore: gameStartingScore
        },
        rules: {
          entryMode: gameEntryMode,
          exitMode: gameExitMode,
          dartsPerTurn: gameDartsPerTurn,
          bullCountsAsDouble: true
        },
        participants
      });

      await db.games.add(game);

      selectedPlayerIds = [];

      successMessage = `Game "${game.gameMode.name}" was created.`;

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not create game:', error);
      errorMessage = error instanceof Error ? error.message : 'The game could not be created.';
    } finally {
      isSavingGame = false;
    }
  }

  /**
   * Deletes one game.
   */
  async function deleteGame(game: Game): Promise<void> {
    clearMessages();

    try {
      await db.games.delete(game.id);

      successMessage = `Game "${game.gameMode.name}" was deleted.`;

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not delete game:', error);
      errorMessage = 'The game could not be deleted.';
    }
  }

  /**
   * Deletes every game.
   */
  async function deleteAllGames(): Promise<void> {
    clearMessages();

    try {
      await db.games.clear();

      successMessage = 'All games were deleted.';

      await loadDatabaseContent();
    } catch (error) {
      console.error('Could not delete all games:', error);
      errorMessage = 'The games could not be deleted.';
    }
  }

  /**
   * Returns the display name of a participant.
   */
  function getParticipantName(participant: GameParticipant): string {
    if (participant.name) {
      return participant.name;
    }

    return participant.players.map((player) => player.username).join(' & ');
  }

  /**
   * Returns the display name of a game's winner.
   */
  function getWinnerName(game: Game): string {
    if (!game.winner) {
      return '—';
    }

    const participant = game.participants.find((entry) => entry.id === game.winner?.participantId);

    return participant ? getParticipantName(participant) : 'Unknown participant';
  }

  /**
   * Formats an ISO date.
   */
  function formatDate(value?: string): string {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString();
  }

  onMount(() => {
    void loadDatabaseContent();
  });
</script>

<svelte:head>
  <title>Database Test</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-6 p-6 overflow-y-auto">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold">Database Test</h1>
      <p class="mt-2 text-base-content/70">Create and inspect players, boards and games stored in IndexedDB.</p>
    </div>

    <button class="btn btn-ghost" type="button" onclick={() => void loadDatabaseContent()} disabled={isLoading}>Refresh database</button>
  </header>

  <div class="tabs tabs-boxed w-fit">
    <button class:tab-active={activeTab === 'players'} class="tab" type="button" onclick={() => activeTab = 'players'}>Players ({players.length})</button>
    <button class:tab-active={activeTab === 'boards'} class="tab" type="button" onclick={() => activeTab = 'boards'}>Boards ({boards.length})</button>
    <button class:tab-active={activeTab === 'games'} class="tab" type="button" onclick={() => activeTab = 'games'}>Games ({games.length})</button>
  </div>

  {#if errorMessage}
    <div class="alert alert-error">
      <span>{errorMessage}</span>
    </div>
  {/if}

  {#if successMessage}
    <div class="alert alert-success">
      <span>{successMessage}</span>
    </div>
  {/if}

  {#if isLoading}
    <div class="flex justify-center py-20">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if activeTab === 'players'}
    <section class="flex flex-col gap-6">
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title">Create player</h2>

          <form class="grid gap-4 md:grid-cols-2" onsubmit={handleCreatePlayer}>
            <label class="form-control">
              <span class="label-text mb-2">Username</span>
              <input class="input input-bordered" type="text" bind:value={playerUsername} maxlength="30" placeholder="DartMaster" required />
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Full name</span>
              <input class="input input-bordered" type="text" bind:value={playerName} maxlength="100" placeholder="Optional" />
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Player color</span>

              <div class="flex items-center gap-3">
                <input class="h-12 w-16 cursor-pointer" type="color" bind:value={playerColor} />
                <input class="input input-bordered flex-1 font-mono" type="text" bind:value={playerColor} placeholder="#3b82f6" required />
              </div>
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Avatar ID</span>
              <input class="input input-bordered" type="text" bind:value={playerAvatar} placeholder="Optional" />
            </label>

            <label class="label cursor-pointer justify-start gap-3">
              <input class="checkbox" type="checkbox" bind:checked={playerIsGuest} />
              <span class="label-text">Guest player</span>
            </label>

            <div class="flex items-end md:justify-end">
              <button class="btn btn-primary w-full md:w-auto" type="submit" disabled={isSavingPlayer}>{isSavingPlayer ? 'Creating…' : 'Create player'}</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="card-title">Stored players</h2>
              <p class="text-sm text-base-content/70">{players.length} {players.length === 1 ? 'player' : 'players'} stored</p>
            </div>

            <button class="btn btn-error btn-sm" type="button" onclick={() => void deleteAllPlayers()} disabled={players.length === 0}>Delete all players</button>
          </div>

          {#if players.length === 0}
            <div class="rounded-md bg-base-100 p-8 text-center">
              <p class="text-base-content/70">No players are stored yet.</p>
            </div>
          {:else}
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Color</th>
                    <th>Type</th>
                    <th>Games</th>
                    <th>Average</th>
                    <th>Model</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {#each players as player (player.id)}
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 rounded-full" style:background-color={player.color}></div>

                          <div>
                            <div class="font-bold">{player.username}</div>

                            {#if player.name}
                              <div class="text-sm text-base-content/60">{player.name}</div>
                            {/if}

                            <div class="max-w-48 truncate font-mono text-xs text-base-content/40">{player.id}</div>
                          </div>
                        </div>
                      </td>

                      <td><code>{player.color}</code></td>
                      <td><span class="badge badge-outline">{player.isGuest ? 'Guest' : 'Permanent'}</span></td>
                      <td>{player.statistics.gamesPlayed}</td>
                      <td>{player.statistics.threeDartAverage.toFixed(2)}</td>
                      <td>v{player.modelVersion}</td>

                      <td class="text-right">
                        <button class="btn btn-ghost btn-sm" type="button" onclick={() => void deletePlayer(player)}>Delete</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    </section>
  {:else if activeTab === 'boards'}
    <section class="flex flex-col gap-6">
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title">Create board</h2>

          <form class="grid gap-4 md:grid-cols-2" onsubmit={handleCreateBoard}>
            <label class="form-control">
              <span class="label-text mb-2">Board name</span>
              <input class="input input-bordered" type="text" bind:value={boardName} placeholder="My 240 Board" required />
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Board preset</span>

              <select class="select select-bordered" bind:value={boardPreset}>
                <option value="180">180 board</option>
                <option value="240">240 board</option>
              </select>
            </label>

            <label class="form-control md:col-span-2">
              <span class="label-text mb-2">Description</span>
              <textarea class="textarea textarea-bordered" bind:value={boardDescription} placeholder="Optional board description"></textarea>
            </label>

            <div class="md:col-span-2 md:text-right">
              <button class="btn btn-primary w-full md:w-auto" type="submit" disabled={isSavingBoard}>{isSavingBoard ? 'Creating…' : 'Create board'}</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="card-title">Stored boards</h2>
              <p class="text-sm text-base-content/70">{boards.length} {boards.length === 1 ? 'board' : 'boards'} stored</p>
            </div>

            <button class="btn btn-error btn-sm" type="button" onclick={() => void deleteAllBoards()} disabled={boards.length === 0}>Delete all boards</button>
          </div>

          {#if boards.length === 0}
            <div class="rounded-md bg-base-100 p-8 text-center">
              <p class="text-base-content/70">No boards are stored yet.</p>
            </div>
          {:else}
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {#each boards as board (board.id)}
                <article class="card bg-base-100">
                  <div class="card-body">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h3 class="card-title">{board.name}</h3>
                        <p class="font-mono text-xs text-base-content/40">{board.id}</p>
                      </div>

                      <span class="badge badge-outline">{board.isBuiltIn ? 'Built-in' : 'Custom'}</span>
                    </div>

                    {#if board.description}
                      <p class="text-sm text-base-content/70">{board.description}</p>
                    {/if}

                    <div class="grid grid-cols-2 gap-3">
                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Segments</div>
                        <div class="text-xl font-bold">{board.segments.length}</div>
                      </div>

                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Model</div>
                        <div class="text-xl font-bold">v{board.modelVersion}</div>
                      </div>
                    </div>

                    <details class="collapse collapse-arrow bg-base-200">
                      <summary class="collapse-title font-medium">Show segments</summary>

                      <div class="collapse-content">
                        <div class="max-h-72 overflow-y-auto">
                          <table class="table table-xs">
                            <thead>
                              <tr>
                                <th>Segment</th>
                                <th>Score</th>
                                <th>Type</th>
                              </tr>
                            </thead>

                            <tbody>
                              {#each board.segments as segment (segment.id)}
                                <tr>
                                  <td>{segment.name}</td>
                                  <td>{segment.score}</td>
                                  <td>{segment.countsAs.join(', ')}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </details>

                    <div class="card-actions justify-end">
                      <button class="btn btn-ghost btn-sm" type="button" onclick={() => void deleteBoard(board)}>Delete</button>
                    </div>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </section>
  {:else}
    <section class="flex flex-col gap-6">
      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <h2 class="card-title">Create game</h2>

          {#if boards.length === 0 || players.length < 2}
            <div class="alert alert-warning">
              <span>Create at least one board and two players before creating a game.</span>
            </div>
          {/if}

          <form class="grid gap-4 md:grid-cols-2" onsubmit={handleCreateGame}>
            <label class="form-control">
              <span class="label-text mb-2">Board</span>

              <select class="select select-bordered" bind:value={gameBoardId} required>
                <option value="" disabled>Select a board</option>

                {#each boards as board (board.id)}
                  <option value={board.id}>{board.name}</option>
                {/each}
              </select>
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Game mode</span>

              <select class="select select-bordered" bind:value={gameModeName} onchange={handleGameModeChange}>
                <option value="301">301</option>
                <option value="501">501</option>
                <option value="701">701</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Starting score</span>
              <input class="input input-bordered" type="number" bind:value={gameStartingScore} min="1" required />
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Darts per turn</span>
              <input class="input input-bordered" type="number" bind:value={gameDartsPerTurn} min="1" required />
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Entry mode</span>

              <select class="select select-bordered" bind:value={gameEntryMode}>
                <option value="single-in">Single in</option>
                <option value="double-in">Double in</option>
                <option value="master-in">Master in</option>
              </select>
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Exit mode</span>

              <select class="select select-bordered" bind:value={gameExitMode}>
                <option value="single-out">Single out</option>
                <option value="double-out">Double out</option>
                <option value="master-out">Master out</option>
              </select>
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Players per participant/team</span>

              <select class="select select-bordered" bind:value={gameTeamSize}>
                <option value={1}>Solo players</option>
                <option value={2}>Teams of 2</option>
                <option value={3}>Teams of 3</option>
                <option value={4}>Teams of 4</option>
              </select>
            </label>

            <div class="md:col-span-2">
              <span class="mb-2 block text-sm font-medium">Players</span>

              <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {#each players as player (player.id)}
                  <label class="flex cursor-pointer items-center gap-3 rounded-md bg-base-100 p-3">
                    <input class="checkbox checkbox-primary" type="checkbox" value={player.id} bind:group={selectedPlayerIds} />

                    <span class="h-6 w-6 rounded-full" style:background-color={player.color}></span>

                    <span>
                      <span class="block font-semibold">{player.username}</span>

                      {#if player.name}
                        <span class="block text-xs text-base-content/60">{player.name}</span>
                      {/if}
                    </span>
                  </label>
                {/each}
              </div>

              <p class="mt-2 text-sm text-base-content/60">{selectedPlayerIds.length} players selected</p>
            </div>

            <div class="md:col-span-2 md:text-right">
              <button class="btn btn-primary w-full md:w-auto" type="submit" disabled={isSavingGame || boards.length === 0 || players.length < 2}>{isSavingGame ? 'Creating…' : 'Create game'}</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card bg-base-200 shadow-md">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="card-title">Stored games</h2>
              <p class="text-sm text-base-content/70">{games.length} {games.length === 1 ? 'game' : 'games'} stored</p>
            </div>

            <button class="btn btn-error btn-sm" type="button" onclick={() => void deleteAllGames()} disabled={games.length === 0}>Delete all games</button>
          </div>

          {#if games.length === 0}
            <div class="rounded-md bg-base-100 p-8 text-center">
              <p class="text-base-content/70">No games are stored yet.</p>
            </div>
          {:else}
            <div class="grid gap-4 xl:grid-cols-2">
              {#each games as game (game.id)}
                <article class="card bg-base-100">
                  <div class="card-body">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 class="card-title">{game.gameMode.name}</h3>
                        <p class="font-mono text-xs text-base-content/40">{game.id}</p>
                      </div>

                      <span class="badge badge-outline">{game.status}</span>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Board</div>
                        <div class="font-semibold">{game.board.name}</div>
                      </div>

                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Starting score</div>
                        <div class="font-semibold">{game.gameMode.startingScore}</div>
                      </div>

                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Status</div>
                        <div class="font-semibold">{game.status}</div>
                      </div>

                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Entry</div>
                        <div class="font-semibold">{game.rules.entryMode}</div>
                      </div>

                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Exit</div>
                        <div class="font-semibold">{game.rules.exitMode}</div>
                      </div>

                      <div class="rounded-md bg-base-200 p-3">
                        <div class="text-xs text-base-content/60">Turns</div>
                        <div class="font-semibold">{game.turns.length}</div>
                      </div>
                    </div>

                    <div>
                      <h4 class="mb-2 font-semibold">Participants</h4>

                      <div class="flex flex-col gap-2">
                        {#each game.participants as participant (participant.id)}
                          <div class="flex flex-wrap items-center justify-between gap-3 rounded-md bg-base-200 p-3">
                            <div>
                              <div class="font-semibold">{getParticipantName(participant)}</div>
                              <div class="text-xs text-base-content/60">{participant.players.length === 1 ? 'Solo player' : `${participant.players.length}-player team`}</div>
                            </div>

                            <div class="text-right">
                              <div class="text-xl font-bold">{participant.currentScore}</div>
                              <div class="text-xs text-base-content/60">remaining</div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>

                    <div class="grid gap-2 text-sm sm:grid-cols-2">
                      <div><span class="font-semibold">Created:</span> {formatDate(game.createdAt)}</div>
                      <div><span class="font-semibold">Winner:</span> {getWinnerName(game)}</div>
                    </div>

                    <details class="collapse collapse-arrow bg-base-200">
                      <summary class="collapse-title font-medium">Show raw game data</summary>

                      <div class="collapse-content">
                        <pre class="max-h-96 overflow-auto rounded-md bg-base-300 p-4 text-xs">{JSON.stringify(game, null, 2)}</pre>
                      </div>
                    </details>

                    <div class="card-actions justify-end">
                      <button class="btn btn-ghost btn-sm" type="button" onclick={() => void deleteGame(game)}>Delete</button>
                    </div>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}
</div>
