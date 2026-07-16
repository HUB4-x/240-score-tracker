<script lang="ts">
    import { onMount } from 'svelte';

    import { db } from '../../db/database';

    import type { Player } from '../../db/models/player_model';
    import type { Board } from '../../db/models/board_model';

    import {
        createGame,
        type EntryMode,
        type ExitMode,
        type GameBoardSnapshot,
        type GameModeSnapshot,
        type GamePlayerSnapshot
    } from '../../db/models/game_model';

    type SelectableGameMode = '301' | '501';

    let players: Player[] = [];
    let boards: Board[] = [];

    let selectedPlayerIds: string[] = [];
    let selectedBoardId = '';

    let selectedGameMode: SelectableGameMode = '501';
    let entryMode: EntryMode = 'single-in';
    let exitMode: ExitMode = 'single-out';

    let isLoading = true;
    let isStartingGame = false;
    let errorMessage = '';

    onMount(() => {
        void loadGameData();
    });

    async function loadGameData(): Promise<void> {
        isLoading = true;
        errorMessage = '';

        try {
        const [storedPlayers, storedBoards] = await Promise.all([db.players.toArray(),db.boards.toArray()]);

        players = [...storedPlayers].sort((firstPlayer, secondPlayer) => {
            const firstIsDefaultGuest = firstPlayer.id.startsWith('default-guest-player-');
            const secondIsDefaultGuest = secondPlayer.id.startsWith('default-guest-player-');

            if (firstIsDefaultGuest && !secondIsDefaultGuest) {
                return -1;
            }

            if (!firstIsDefaultGuest && secondIsDefaultGuest) {
                return 1;
            }

            if (firstIsDefaultGuest && secondIsDefaultGuest) {
                return firstPlayer.id.localeCompare(secondPlayer.id, undefined, { numeric: true });
            }

            return firstPlayer.username.localeCompare(secondPlayer.username);
        });

        boards = [...storedBoards].sort((firstBoard, secondBoard) =>
            firstBoard.name.localeCompare(secondBoard.name)
        );

        if (boards.length === 1) {
            selectedBoardId = boards[0].id;
        }
        } catch (error) {
            console.error('Failed to load players and boards:', error);
            errorMessage = error instanceof Error ? error.message: 'Players and boards could not be loaded.';
        } finally {
            isLoading = false;
        }
    }



    function isPlayerSelected(playerId: string): boolean {
        return selectedPlayerIds.includes(playerId);
    }



    function togglePlayer(playerId: string): void {
        errorMessage = '';

        if (isPlayerSelected(playerId)) {
            selectedPlayerIds = selectedPlayerIds.filter((selectedPlayerId) => selectedPlayerId !== playerId);
            return;
        }

        selectedPlayerIds = [...selectedPlayerIds, playerId];
    }



    function selectBoard(boardId: string): void {
        selectedBoardId = boardId;
        errorMessage = '';
    }



    function getPlayer(playerId: string): Player | undefined {
        return players.find((player) => player.id === playerId);
    }



    function getSelectedPlayers(): Player[] {
        return selectedPlayerIds.map((playerId) => getPlayer(playerId)).filter((player): player is Player => player !== undefined);
    }



    function getSelectedBoard(): Board | undefined {
        return boards.find((board) => board.id === selectedBoardId);
    }



    function movePlayer(playerId: string, direction: -1 | 1): void {
        const currentIndex = selectedPlayerIds.indexOf(playerId);
        const targetIndex = currentIndex + direction;

        if (currentIndex === -1 || targetIndex < 0 || targetIndex >= selectedPlayerIds.length) {
            return;
        }

        const reorderedPlayerIds = [...selectedPlayerIds];

        [reorderedPlayerIds[currentIndex],reorderedPlayerIds[targetIndex]] = [reorderedPlayerIds[targetIndex],reorderedPlayerIds[currentIndex]];

        selectedPlayerIds = reorderedPlayerIds;
    }


    
    function removePlayer(playerId: string): void {
        selectedPlayerIds = selectedPlayerIds.filter((selectedPlayerId) => selectedPlayerId !== playerId);
    }


    
    function createBoardSnapshot(board: Board): GameBoardSnapshot {
        return {
            boardId: board.id,
            name: board.name,
            modelVersion: 1,
            segments: board.segments.map((segment) => ({
                ...segment,
                countsAs: [...segment.countsAs]
            }))
        };
    }


    
    function createGameModeSnapshot(): GameModeSnapshot {
        return {
            gameModeId: selectedGameMode,
            name: selectedGameMode,
            startingScore: Number(selectedGameMode)
        };
    }


    
    function createPlayerSnapshot(player: Player): GamePlayerSnapshot {
        return {playerId: player.id, username: player.username, color: player.color};
    }


    
    async function startGame(): Promise<void> {
        errorMessage = '';

        const selectedBoard = getSelectedBoard();
        const selectedPlayers = getSelectedPlayers();

        if (!selectedBoard) {
            errorMessage = 'Select a board.';
            return;
        }

        if (selectedPlayers.length < 2) {
            errorMessage = 'Select at least two players.';
            return;
        }

        isStartingGame = true;

        try {
            const boardSnapshot = createBoardSnapshot(selectedBoard);
            const gameMode = createGameModeSnapshot();

            const participants = selectedPlayers.map((player) => ({
                players: [createPlayerSnapshot(player)]
            }));

            const game = createGame({
                board: boardSnapshot,
                gameMode,
                rules: {
                entryMode,
                exitMode,
                dartsPerTurn: 3,
                bullCountsAsDouble: true
                },
                participants
            });

            await db.games.add(game);

            window.location.hash = `#/game/${game.id}`;
        } catch (error) {
            console.error('Failed to create game:', error);

            errorMessage = error instanceof Error? error.message: 'The game could not be created.';
        } finally {
            isStartingGame = false;
        }
    }
</script>

<svelte:head>
  <title>240 Dart - Create Game</title>
</svelte:head>

<main class="min-h-0 flex-1 overflow-y-auto">
  <div class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <p class="text-sm font-semibold uppercase tracking-wider text-primary">New game</p>

      <h1 class="mt-1 text-3xl font-bold sm:text-4xl">Create Game</h1>

      <p class="mt-2 max-w-2xl text-base-content/65">
        Choose a board, select the players and configure the rules for the game.
      </p>
    </header>

    {#if errorMessage}
      <div class="alert alert-error mb-6" role="alert">
        <svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.214 2.986-1.742 2.986H3.48c-1.528 0-2.492-1.652-1.742-2.986l6.519-11.59ZM11 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1-8a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V7a1 1 0 0 0-1-1Z" clip-rule="evenodd" />
        </svg>

        <span>{errorMessage}</span>
      </div>
    {/if}

    {#if isLoading}
      <div class="flex min-h-80 items-center justify-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    {:else}
      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="flex min-w-0 flex-col gap-6">
          <section class="card border border-base-300 bg-base-200 shadow-sm">
            <div class="card-body">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="card-title text-xl">Select board</h2>

                  <p class="mt-1 text-sm text-base-content/60">
                    Choose the dartboard configuration used for this game.
                  </p>
                </div>

                <span class="badge badge-outline">
                  {boards.length}
                  {boards.length === 1 ? ' board' : ' boards'}
                </span>
              </div>

              {#if boards.length === 0}
                <div class="rounded-md border border-dashed border-base-300 bg-base-100 p-6 text-center">
                  <p class="font-semibold">No boards available</p>

                  <p class="mt-1 text-sm text-base-content/60">
                    Create or restore a board before starting a game.
                  </p>

                  <a href="#/admin" class="btn btn-primary mt-4">Manage boards</a>
                </div>
              {:else}
                <div class="grid gap-3 sm:grid-cols-2">
                  {#each boards as board}
                    {@const isSelected = selectedBoardId === board.id}

                    <button type="button" class={['relative min-h-28 rounded-md border p-4 text-left transition', isSelected ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100 hover:border-primary/50']} aria-pressed={isSelected} onclick={() => selectBoard(board.id)}>
                      <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0">
                          <p class="truncate text-lg font-semibold">{board.name}</p>

                          <p class="mt-1 text-sm text-base-content/60">
                            {board.segments.length}
                            {board.segments.length === 1 ? ' segment' : ' segments'}
                          </p>
                        </div>

                        <span class={['flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm', isSelected ? 'border-primary bg-primary text-primary-content' : 'border-base-300']} aria-hidden="true">
                          {#if isSelected}
                            ✓
                          {/if}
                        </span>
                      </div>
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </section>

          <section class="card border border-base-300 bg-base-200 shadow-sm">
            <div class="card-body">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="card-title text-xl">Select players</h2>

                  <p class="mt-1 text-sm text-base-content/60">
                    Select every player participating in this game.
                  </p>
                </div>

                <span class="badge badge-primary badge-outline">
                  {selectedPlayerIds.length} selected
                </span>
              </div>

              {#if players.length === 0}
                <div class="rounded-md border border-dashed border-base-300 bg-base-100 p-6 text-center">
                  <p class="font-semibold">No players available</p>

                  <p class="mt-1 text-sm text-base-content/60">
                    Create a player before starting a game.
                  </p>

                  <a href="#/admin" class="btn btn-primary mt-4">Manage players</a>
                </div>
              {:else}
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {#each players as player}
                        {@const isSelected = isPlayerSelected(player.id)}
                        {@const displayName = player.name?.trim() || player.username}
                        {@const initials = displayName.slice(0, 2).toUpperCase()}

                        <button type="button" class={['flex min-h-24 items-center gap-4 rounded-md border p-4 text-left transition', isSelected ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100 hover:border-primary/50']} aria-pressed={isSelected} onclick={() => togglePlayer(player.id)}>
                            <div class="avatar shrink-0">
                            <div class="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm" style={`background-color: ${player.color};`}>
                                {#if player.avatar}
                                <img src={player.avatar} alt={`${player.username} avatar`} />
                                {:else}
                                {initials}
                                {/if}
                            </div>
                            </div>

                            <span class="min-w-0 flex-1">
                                <span class="flex items-center gap-2">
                                    <span class="truncate font-semibold">{player.username}</span>

                                    {#if player.isGuest}
                                    <span class="badge badge-warning badge-sm shrink-0">Guest</span>
                                    {/if}
                                </span>

                                {#if player.name}
                                    <span class="mt-1 block truncate text-xs text-base-content/60">{player.name}</span>
                                {/if}

                                {#if player.isGuest}
                                <span class="mt-1 flex items-center gap-2 text-xs text-base-content/50">
                                    <span class="h-2.5 w-2.5 rounded-full border border-base-300" style={`background-color: ${player.color};`}></span>
                                    <span>Temporary guest player</span>
                                </span>
                                {/if}
                            </span>

                            <span class={['flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm', isSelected ? 'border-primary bg-primary text-primary-content' : 'border-base-300']} aria-hidden="true">
                            {#if isSelected}
                                ✓
                            {/if}
                            </span>
                        </button>
                    {/each}
                </div>
              {/if}
            </div>
          </section>

          <section class="card border border-base-300 bg-base-200 shadow-sm">
            <div class="card-body">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 class="card-title text-xl">Playing order</h2>

                  <p class="mt-1 text-sm text-base-content/60">
                    The first player in this list starts the game.
                  </p>
                </div>

                <span class="badge badge-outline">
                  {selectedPlayerIds.length}
                  {selectedPlayerIds.length === 1 ? ' player' : ' players'}
                </span>
              </div>

              {#if selectedPlayerIds.length === 0}
                <div class="rounded-md border border-dashed border-base-300 bg-base-100 p-6 text-center">
                  <p class="text-sm text-base-content/60">
                    Selected players will appear here.
                  </p>
                </div>
              {:else}
                <div class="flex flex-col gap-2">
                  {#each selectedPlayerIds as playerId, index}
                    {@const player = getPlayer(playerId)}

                    {#if player}
                      <div class="flex items-center gap-3 rounded-md border border-base-300 bg-base-100 p-3">
                        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white" style={`background-color: ${player.color || '#64748b'};`}>
                            {index + 1}
                        </div>

                        <div class="min-w-0 flex-1">
                          <p class="truncate font-semibold">{player.username}</p>

                          {#if index === 0}
                            <p class="text-xs font-medium text-primary">Starts the game</p>
                          {/if}
                        </div>

                        <div class="flex shrink-0 gap-1">
                          <button type="button" class="btn btn-square btn-sm" aria-label={`Move ${player.username} up`} disabled={index === 0} onclick={() => movePlayer(playerId, -1)}>
                            ↑
                          </button>

                          <button type="button" class="btn btn-square btn-sm" aria-label={`Move ${player.username} down`} disabled={index === selectedPlayerIds.length - 1} onclick={() => movePlayer(playerId, 1)}>
                            ↓
                          </button>

                          <button type="button" class="btn btn-square btn-ghost btn-sm" aria-label={`Remove ${player.username}`} onclick={() => removePlayer(playerId)}>
                            ✕
                          </button>
                        </div>
                      </div>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>
          </section>
        </div>

        <aside class="card border border-base-300 bg-base-200 shadow-sm lg:sticky lg:top-6">
          <div class="card-body">
            <div>
              <h2 class="card-title text-xl">Game settings</h2>

              <p class="mt-1 text-sm text-base-content/60">
                Configure the rules for this game.
              </p>
            </div>

            <fieldset>
              <legend class="mb-2 text-sm font-medium">Starting score</legend>

              <div class="join grid grid-cols-2">
                <input class="btn join-item btn-outline" type="radio" name="game-mode" value="301" aria-label="301" bind:group={selectedGameMode} />

                <input class="btn join-item btn-outline" type="radio" name="game-mode" value="501" aria-label="501" bind:group={selectedGameMode} />
              </div>
            </fieldset>

            <label class="form-control">
              <span class="label-text mb-2">Entry mode</span>

              <select class="select select-bordered w-full" bind:value={entryMode}>
                <option value="single-in">Single in</option>
                <option value="double-in">Double in</option>
                <option value="master-in">Master in</option>
              </select>
            </label>

            <label class="form-control">
              <span class="label-text mb-2">Exit mode</span>

              <select class="select select-bordered w-full" bind:value={exitMode}>
                <option value="single-out">Single out</option>
                <option value="double-out">Double out</option>
                <option value="master-out">Master out</option>
              </select>
            </label>

            <div class="divider my-2"></div>

            <div class="rounded-md border border-base-300 bg-base-100 p-4">
              <h3 class="font-semibold">Game summary</h3>

              <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt class="text-base-content/60">Board</dt>

                <dd class="truncate text-right font-semibold">
                  {getSelectedBoard()?.name ?? 'Not selected'}
                </dd>

                <dt class="text-base-content/60">Game</dt>

                <dd class="text-right font-semibold">{selectedGameMode}</dd>

                <dt class="text-base-content/60">Entry</dt>

                <dd class="text-right font-semibold">
                  {entryMode.replace('-', ' ')}
                </dd>

                <dt class="text-base-content/60">Exit</dt>

                <dd class="text-right font-semibold">
                  {exitMode.replace('-', ' ')}
                </dd>

                <dt class="text-base-content/60">Players</dt>

                <dd class="text-right font-semibold">
                  {selectedPlayerIds.length}
                </dd>

                <dt class="text-base-content/60">Starting player</dt>

                <dd class="truncate text-right font-semibold">
                  {getPlayer(selectedPlayerIds[0])?.username ?? 'Not selected'}
                </dd>
              </dl>
            </div>

            <button type="button" class="btn btn-primary btn-lg mt-2 w-full" disabled={isStartingGame || selectedPlayerIds.length < 2 || !selectedBoardId} onclick={startGame}>
              {#if isStartingGame}
                <span class="loading loading-spinner loading-sm"></span>
                Starting game
              {:else}
                Start game
              {/if}
            </button>

            {#if selectedPlayerIds.length === 1}
              <p class="text-center text-xs text-warning">
                Select at least one more player.
              </p>
            {/if}
          </div>
        </aside>
      </div>
    {/if}
  </div>
</main>