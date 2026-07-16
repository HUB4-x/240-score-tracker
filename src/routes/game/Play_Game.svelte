<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '../../db/database';
    import {
        createDartThrowFromSegment,
        getCurrentParticipant,
        getCurrentThrowingPlayer,
        isValidEntryDart,
        isValidExitDart,
        type DartThrow,
        type Game,
        type GameParticipant,
        type GameTurn
    } from '../../db/models/game_model';

    import type {
        BoardSegment,
        BoardSegmentClassification
    } from '../../db/models/board_model';

    // type SegmentFilter = 'all' | 'single' | 'double' | 'triple' | 'quadruple' | 'bull' | 'miss';

    interface TurnPreview {
        scoreBefore: number;
        scoreAfter: number;
        attemptedScore: number;
        scoredPoints: number;
        isBust: boolean;
        isCheckout: boolean;
        hasEntered: boolean;
        message: string;
    }

    let { params }: { params?: Record<string, string> } = $props();

    let game: Game | undefined = $state<Game | undefined>(undefined);

    let currentDarts: DartThrow[] = $state([]);
    // let selectedFilter: SegmentFilter = $state('all');

    let isLoading = $state(true);
    let isSaving = $state(false);

    let errorMessage = $state('');
    let successMessage = $state('');

    type SelectedMultiplier = 1 | 2 | 3 | 4;
    let selectedMultiplier: SelectedMultiplier = $state(1);

    onMount(() => {
        void loadGame();
    });

    async function loadGame(): Promise<void> {
        isLoading = true;
        errorMessage = '';

        const gameId = params?.gameId;

        if (!gameId) {
            errorMessage = 'No game ID was supplied.';
            isLoading = false;
            return;
        }

        try {
            const storedGame = await db.games.get(gameId);
            if (!storedGame) {
                errorMessage = 'The requested game could not be found.';
                return;
            }
            game = storedGame;
        } catch (error) {
            console.error('Failed to load game:', error);
            errorMessage = error instanceof Error? error.message: 'The game could not be loaded.';
        } finally {
            isLoading = false;
        }
    }

    function getActiveParticipant(): GameParticipant | undefined {
        if (!game || game.participants.length === 0) {
            return undefined;
        }

        return game.participants[game.currentParticipantIndex];
    }

    function getActivePlayer() {
        if (!game) {
            return undefined;
        }

        try {
            return getCurrentThrowingPlayer(game);
        } catch {
            return undefined;
        }
    }

    function getParticipantDisplayName(participant: GameParticipant): string {
        if (participant.name) {
            return participant.name;
        }

        if (participant.players.length === 1) {
            return participant.players[0]?.username ?? 'Unknown player';
        }

        return participant.players.map((player) => player.username).join(' / ');
    }

    function getParticipantColor(participant: GameParticipant): string {
        return participant.players[participant.currentPlayerIndex]?.color?? participant.players[0]?.color?? '#64748b';
    }

    function getParticipantSubtitle(participant: GameParticipant): string {
        if (participant.players.length === 1) {
            return participant.hasEntered? 'Entered' : 'Waiting to enter';
        }

        const activePlayer = participant.players[participant.currentPlayerIndex];

        return activePlayer? `${activePlayer.username} throws next` : 'Team';
    }

    // function getVisibleSegments(): BoardSegment[] {
    //     if (!game) {
    //         return [];
    //     }

    //     if (selectedFilter === 'all') {
    //         return game.board.segments;
    //     }

    //     return game.board.segments.filter((segment) =>
    //         segment.countsAs.includes(selectedFilter as BoardSegmentClassification)
    //     );
    // }

    // function getSegmentType(segment: BoardSegment): string {
    //     if (segment.countsAs.includes('miss')) {
    //         return 'Miss';
    //     }

    //     if (segment.countsAs.includes('bull')) {
    //         return 'Bull';
    //     }

    //     if (segment.countsAs.includes('quadruple')) {
    //         return 'Quadruple';
    //     }

    //     if (segment.countsAs.includes('triple')) {
    //         return 'Triple';
    //     }

    //     if (segment.countsAs.includes('double')) {
    //         return 'Double';
    //     }

    //         return 'Single';
    // }

    function canAddDart(): boolean {
        return Boolean(game && game.status === 'running' && currentDarts.length < game.rules.dartsPerTurn && !getTurnPreview().isBust &&!getTurnPreview().isCheckout);
    }

    function addDart(segment: BoardSegment): void {
        if (!game || !canAddDart()) {
            return;
        }

        const dart = createDartThrowFromSegment(segment);

        currentDarts = [...currentDarts, dart];
        errorMessage = '';
        successMessage = '';
        selectedMultiplier = 1

        if(!canAddDart()){
            completeTurn()
        }
    }

    function undoCurrentDart(): void {
        if (currentDarts.length === 0 || isSaving) {
            return;
        }

        currentDarts = currentDarts.slice(0, -1);
        errorMessage = '';
        successMessage = '';
    }

    function clearCurrentTurn(): void {
        if (currentDarts.length === 0 || isSaving) {
            return;
        }

        currentDarts = [];
        errorMessage = '';
        successMessage = '';
    }

    function getTurnPreview(): TurnPreview {
        const participant = getActiveParticipant();

        if (!game || !participant) {
            return {
                scoreBefore: 0,
                scoreAfter: 0,
                attemptedScore: 0,
                scoredPoints: 0,
                isBust: false,
                isCheckout: false,
                hasEntered: false,
                message: ''
            };
        }

        const scoreBefore = participant.currentScore;

        let attemptedScore = 0;
        let entered = participant.hasEntered;
        let isBust = false;
        let isCheckout = false;
        let message = '';

        for (const dart of currentDarts) {
            if (!entered) {
                const validEntry = isValidEntryDart(
                dart,
                game.rules.entryMode,
                game.rules.bullCountsAsDouble
                );

                if (!validEntry) {
                continue;
                }

                entered = true;
            }

            attemptedScore += dart.score;

            const remainingScore = scoreBefore - attemptedScore;

            if (remainingScore < 0) {
                isBust = true;
                message = 'Bust: score would fall below zero.';
                break;
            }

            if (remainingScore === 1 && game.rules.exitMode !== 'single-out') {
                isBust = true;
                message = 'Bust: one point cannot be checked out with this exit mode.';
                break;
            }

            if (remainingScore === 0) {
                const validExit = isValidExitDart(
                    dart,
                    game.rules.exitMode,
                    game.rules.bullCountsAsDouble
                );

                if (validExit) {
                    isCheckout = true;
                    message = 'Checkout completed.';
                } else {
                    isBust = true;
                    message = 'Bust: the final dart does not satisfy the exit rule.';
                }
                break;
            }
        }

        if (!message && currentDarts.length > 0 && !participant.hasEntered && !entered) {
            message = 'The participant has not entered yet.';
        }

        if (!message && currentDarts.length > 0) {
            message = `${scoreBefore - attemptedScore} points remaining.`;
        }

        return {
            scoreBefore,
            scoreAfter: isBust
                ? scoreBefore
                : scoreBefore - attemptedScore,
            attemptedScore,
            scoredPoints: isBust ? 0 : attemptedScore,
            isBust,
            isCheckout,
            hasEntered: entered,
            message
        };
    }

    function shouldCompleteTurn(): boolean {
        if (!game || currentDarts.length === 0) {
            return false;
        }

        const preview = getTurnPreview();

        return (preview.isBust || preview.isCheckout || currentDarts.length >= game.rules.dartsPerTurn);
    }

    function advanceParticipantPlayer(participant: GameParticipant): void {
        if (participant.players.length === 0) {
            return;
        }

        participant.currentPlayerIndex =
        (participant.currentPlayerIndex + 1)
        % participant.players.length;
    }

    function advanceGameParticipant(): void {
        if (!game || game.participants.length === 0) {
            return;
        }
        game.currentParticipantIndex = (game.currentParticipantIndex + 1) % game.participants.length;
    }

    async function goToPreviousTurn(): Promise<void> {
        if (!game || game.turns.length === 0 || isSaving) {
            return;
        }

        isSaving = true;
        errorMessage = '';
        successMessage = '';

        try {
            const lastTurn = game.turns[game.turns.length - 1];
            const participantIndex = game.participants.findIndex((participant) => {return participant.id === lastTurn.scoringParticipantId});
            if (participantIndex === -1) {
                throw new Error('The participant of the previous turn could not be found.');
            }
            const participant = game.participants[participantIndex];
            participant.currentScore = lastTurn.scoreBefore;
            const playerIndex = participant.players.findIndex((player) => {return player.playerId === lastTurn.playerId});

            participant.currentPlayerIndex = playerIndex >= 0 ? playerIndex : 0;

            game.turns = game.turns.slice(0, -1);
            game.currentParticipantIndex = participantIndex;
            game.currentTurnNumber = lastTurn.turnNumber;

            game.status = 'running';
            game.finishedAt = undefined;
            game.winner = undefined;
            game.updatedAt = new Date().toISOString();

            rebuildEntryStates();

            await db.games.put($state.snapshot(game));

            currentDarts = [];
            successMessage = `Returned to ${participant.players[participant.currentPlayerIndex]?.username ?? 'the previous player'}.`;
        } catch (error) {
            console.error('Failed to restore previous turn:', error);

            errorMessage =
            error instanceof Error? error.message: 'The previous turn could not be restored.'} finally {
            isSaving = false;
        }
    }


    async function completeTurn(): Promise<void> {
        if (!game || currentDarts.length === 0 || isSaving || game.status === 'finished') {
            return;
        }

        const participant = getActiveParticipant();
        const player = getActivePlayer();

        if (!participant || !player) {
            errorMessage = 'The active player could not be determined.';
            return;
        }

        isSaving = true;
        errorMessage = '';
        successMessage = '';

        try {
            const preview = getTurnPreview();
            const now = new Date().toISOString();

            const turn: GameTurn = {
                id: crypto.randomUUID(),
                scoringParticipantId: participant.id,
                playerId: player.playerId,
                turnNumber: game.currentTurnNumber,
                scoreBefore: preview.scoreBefore,
                scoreAfter: preview.scoreAfter,
                darts: currentDarts.map((dart) => ({
                ...dart,
                countsAs: [...dart.countsAs]
                })),
                scoredPoints: preview.scoredPoints,
                isBust: preview.isBust,
                isCheckout: preview.isCheckout,
                startedAt: currentDarts[0]?.thrownAt ?? now,
                completedAt: now
            };

            participant.hasEntered = preview.hasEntered;
            participant.currentScore = preview.scoreAfter;

            game.turns = [...game.turns, turn];
            game.currentTurnNumber += 1;
            game.updatedAt = now;
            game.startedAt ??= now;

            if (preview.isCheckout) {
                game.status = 'finished';
                game.finishedAt = now;
                game.winner = {
                    participantId: participant.id,
                    playerIds: participant.players.map((participantPlayer) => participantPlayer.playerId)
                };

                successMessage = `${getParticipantDisplayName(participant)} wins the game.`;
            } else {
                advanceParticipantPlayer(participant);
                advanceGameParticipant();

                const nextParticipant = getActiveParticipant();

                successMessage = nextParticipant? `${getParticipantDisplayName(nextParticipant)} is next.` : 'Turn saved.';
            }

            const gameSnapshot = $state.snapshot(game);
            await db.games.put(gameSnapshot);

            game = {
                ...game,
                board: {
                ...game.board,
                segments: [...game.board.segments]
                },
                participants: [...game.participants],
                turns: [...game.turns]
            };

            currentDarts = [];
        } catch (error) {
            console.error('Failed to save turn:', error);
            errorMessage = error instanceof Error? error.message: 'The turn could not be saved.';
        } finally {
            isSaving = false;
        }
    }

    async function undoLastTurn(): Promise<void> {
        if (!game || game.turns.length === 0 || isSaving) {
            return;
        }

        isSaving = true;
        errorMessage = '';
        successMessage = '';

        try {
            const removedTurn = game.turns[game.turns.length - 1];

            const participantIndex = game.participants.findIndex(
                (participant) =>
                participant.id === removedTurn.scoringParticipantId
            );

            if (participantIndex === -1) {
                throw new Error(
                'The participant belonging to the last turn could not be found.'
                );
            }

            const participant = game.participants[participantIndex];

            participant.currentScore = removedTurn.scoreBefore;

            const playerIndex = participant.players.findIndex(
                (player) => player.playerId === removedTurn.playerId
            );

            participant.currentPlayerIndex = playerIndex >= 0? playerIndex : 0;

            game.turns = game.turns.slice(0, -1);
            game.currentParticipantIndex = participantIndex;
            game.currentTurnNumber = Math.max(
                1,
                removedTurn.turnNumber
            );

            game.status = 'running';
            game.finishedAt = undefined;
            game.winner = undefined;
            game.updatedAt = new Date().toISOString();

            rebuildEntryStates();

            const gameSnapshot = $state.snapshot(game);
            await db.games.put(gameSnapshot);

            game = {
                ...game,
                participants: [...game.participants],
                turns: [...game.turns]
            };

            currentDarts = [];
            successMessage = 'The previous turn was restored.';
        } catch (error) {
            console.error('Failed to undo last turn:', error);
            errorMessage = error instanceof Error? error.message: 'The last turn could not be undone.';
        } finally {
            isSaving = false;
        }
    }

    function rebuildEntryStates(): void {
        if (!game) {
            return;
        }

        for (const participant of game.participants) {
            participant.hasEntered =
            game.rules.entryMode === 'single-in';
        }

        for (const turn of game.turns) {
            const participant = game.participants.find(
                (candidate) =>
                candidate.id === turn.scoringParticipantId
            );

            if (!participant || participant.hasEntered) {
                continue;
            }

            participant.hasEntered = turn.darts.some((dart) =>
                isValidEntryDart(
                dart,
                game!.rules.entryMode,
                game!.rules.bullCountsAsDouble
                )
            );
        }
    }

    function formatMode(value: string): string {
        return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    }

    function formatDate(value?: string): string {
        if (!value) {
            return '—';
        }

        return new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium',timeStyle: 'short'}).format(new Date(value));
    }

    function getRecentTurns(): GameTurn[] {
        if (!game) {
            return [];
        }

        return [...game.turns].reverse().slice(0, 4);
    }

    function getTurnPlayerName(turn: GameTurn): string {
        if (!game) {
            return 'Unknown player';
        }

        for (const participant of game.participants) {
            const player = participant.players.find(
                (candidate) => candidate.playerId === turn.playerId
            );

            if (player) {
                return player.username;
            }
        }

        return 'Unknown player';
    }

    function getWinnerName(): string {
        if (!game?.winner) {
            return '';
        }
        const participant = game.participants.find((candidate) => candidate.id === game?.winner?.participantId);
        return participant? getParticipantDisplayName(participant): 'Winner';
    }


    function getAvailableMultipliers(): SelectedMultiplier[] {
        if (!game) {
            return [1];
        }

        const multipliers = new Set<SelectedMultiplier>([1]);

        for (const segment of game.board.segments) {
            if (segment.countsAs.includes('double')) {
                multipliers.add(2);
            }

            if (segment.countsAs.includes('triple')) {
                multipliers.add(3);
            }

            if (segment.countsAs.includes('quadruple')) {
                multipliers.add(4);
            }
        }

        return [...multipliers].sort((first, second) => first - second);
    }

    function getSingleSegments(): BoardSegment[] {
        if (!game) {
            return [];
        }

        const uniqueValues = new Map<number, BoardSegment>();

        for (const segment of game.board.segments) {
            if (segment.countsAs.includes('miss') || segment.countsAs.includes('bull')) {
                continue;
            }

            if (segment.multiplier !== 1) {
                continue;
            }

            if (!uniqueValues.has(segment.value)) {
                uniqueValues.set(segment.value, segment);
            }
        }

        return [...uniqueValues.values()].sort((first, second) => first.value - second.value);
    }

    function getBullSegments(): BoardSegment[] {
        if (!game) {
            return [];
        }

        return game.board.segments.filter((segment) => segment.countsAs.includes('bull')).sort((first, second) => first.score - second.score);
    }

    function getMissSegment(): BoardSegment | undefined {
        return game?.board.segments.find((segment) => segment.countsAs.includes('miss'));
    }

    function getSegmentForMultiplier(baseSegment: BoardSegment,multiplier: SelectedMultiplier): BoardSegment | undefined {
        if (!game) {
            return undefined;
        }

        return game.board.segments.find((segment) => {
            if (segment.countsAs.includes('bull') || segment.countsAs.includes('miss')) {
                return false;
            }

            return (segment.value === baseSegment.value && segment.multiplier === multiplier);
        });
    }

    function selectNumberSegment(baseSegment: BoardSegment): void {
        const segment = getSegmentForMultiplier(baseSegment,selectedMultiplier);

        if (!segment) {
            errorMessage = `${selectedMultiplier}x ${baseSegment.value} is not available on this board.`;
            return;
        }

        addDart(segment);
    }


    function save_the_game(): void {
        //Save the games status
    }
</script>

<svelte:head>
  <title>240 Dart - Game</title>
</svelte:head>

<main class="min-h-0 min-w-90 flex-1 overflow-y-auto bg-base-100">
  {#if isLoading}
    <div class="flex min-h-[70vh] items-center justify-center">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else if errorMessage && !game}
    <div class="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center p-6">
      <div class="card w-full border border-error/30 bg-base-200 shadow-lg">
        <div class="card-body items-center text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-2xl text-error">!</div>
          <h1 class="card-title mt-2 text-2xl">Game unavailable</h1>
          <p class="text-base-content/65">{errorMessage}</p>
          <div class="card-actions mt-4">
            <a href="#/" class="btn btn-primary">Return home</a>
          </div>
        </div>
      </div>
    </div>
  {:else if game}
    {@const activeParticipant = getActiveParticipant()}
    {@const activePlayer = getActivePlayer()}
    {@const preview = getTurnPreview()}
    <!-- {@const visibleSegments = getVisibleSegments()} -->
    {@const singleSegments = getSingleSegments()}
    {@const availableMultipliers = getAvailableMultipliers()}
    {@const bullSegments = getBullSegments()}
    {@const missSegment = getMissSegment()}

    <div class="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-3 sm:p-5 lg:p-6">
      <header class="flex gap-4 rounded-md items-center justify-between">
        <div class="min-w-0 flex items-center gap-x-5">
          <div class="flex items-center gap-2">
            <span class="badge badge-primary">{game.gameMode.name}</span>
            <span class="hidden md:badge md:badge-outline">{game.board.name}</span>

            {#if game.status === 'finished'}
              <span class="badge badge-success">Finished</span>
            {:else}
              <span class="badge badge-warning">Running</span>
            {/if}
          </div>

          <p class="hidden md:block mt-1 text-sm text-base-content/55">
            Turn {game.currentTurnNumber} · Updated {formatDate(game.updatedAt ?? game.createdAt)}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <!-- <a href={`#/game/${game.id}/details`} class="btn btn-outline btn-sm">Game details</a> -->
          <a href="#/" class="btn btn-error btn-sm" onclick={save_the_game}>Save & Leave game</a>
        </div>
      </header>

      <!-- {#if errorMessage}
        <div class="alert alert-error" role="alert">
          <span>{errorMessage}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="alert alert-success" role="status">
          <span>{successMessage}</span>
        </div>
      {/if} -->

      {#if game.status === 'finished'}
        <section class="card border border-success/30 bg-success/10 shadow-sm">
          <div class="card-body items-center text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-success text-4xl text-success-content">🏆</div>
            <p class="mt-2 text-sm font-semibold uppercase tracking-wider text-success">Game finished</p>
            <h2 class="text-3xl font-bold">{getWinnerName()} wins</h2>
            <p class="text-base-content/65">Completed in {game.turns.length} turns.</p>

            <div class="card-actions mt-4">
              <a href={`#/game/${game.id}/details`} class="btn btn-success">View full details</a>
              <a href="#/create-game" class="btn btn-outline">Create new game</a>
              <button type="button" class="btn btn-ghost" disabled={isSaving || game.turns.length === 0} onclick={undoLastTurn}>Undo final turn</button>
            </div>
          </div>
        </section>
      {/if}

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {#each game.participants as participant, index}
          {@const isActive = game.status === 'running' && index === game.currentParticipantIndex}
          {@const participantColor = getParticipantColor(participant)}

          <article class={['relative overflow-hidden rounded-md border bg-base-200 p-4 shadow-sm transition', isActive ? 'border-primary ring-2 ring-primary/80' : 'border-base-300']}>
            <div class="absolute inset-y-0 left-0 w-1.5" style={`background-color: ${participantColor};`}></div>

            <div class="flex items-start justify-between gap-3 pl-2">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm" style={`background-color: ${participantColor};`}>
                    <!-- {index + 1} -->
                     Avt
                  </div>

                  <div class="min-w-0">
                    <h2 class="truncate font-semibold">{getParticipantDisplayName(participant)}</h2>
                    <p class="truncate text-xs text-base-content/50">{getParticipantSubtitle(participant)}</p>
                  </div>
                </div>
              </div>

              {#if isActive}
                <span class="badge badge-primary badge-sm">Throwing</span>
              {/if}
            </div>

            <div class="mt-4 flex items-end justify-between pl-2">
              <span class="text-sm text-base-content/50">Remaining</span>
              <span class="text-4xl font-black tabular-nums">{participant.currentScore - (isActive? preview.scoredPoints : 0)}</span>
            </div>
          </article>
        {/each}
      </section>

      {#if game.status === 'running' && activeParticipant && activePlayer}
        <div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section class="card min-w-0 border border-base-300 bg-base-200 shadow-sm">
            <div class="card-body gap-4 p-4 sm:p-5">
              <!-- <div class="flex flex-col gap-3">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-wider text-primary">Score input</p>
                  <h2 class="mt-1 text-2xl font-bold">{activePlayer.username}'s turn</h2>
                  <p class="mt-1 text-sm text-base-content/55">
                    {formatMode(game.rules.entryMode)} · {formatMode(game.rules.exitMode)} · {game.rules.dartsPerTurn} darts
                  </p>
                </div>

                <div class="flex w-fit ml-auto items-center gap-3 rounded-md border border-base-300 bg-base-100 px-4 py-3">
                  <span class="text-sm text-base-content/55">Remaining</span>
                  <span class={['text-3xl font-black tabular-nums', preview.isBust ? 'text-error' : preview.isCheckout ? 'text-success' : 'text-base-content']}>
                    {preview.scoreAfter}
                  </span>
                </div>
              </div> -->

              <div class="grid grid-cols-3 gap-3">
                {#each Array(game.rules.dartsPerTurn) as _, index}
                  {@const dart = currentDarts[index]}

                  <div class={['flex flex-col items-center justify-center rounded-md border p-3 text-center', dart ? 'border-primary bg-primary/10' : 'border-dashed border-base-300 bg-base-100']}>
                    <!-- <span class="text-xs font-semibold uppercase tracking-wide text-base-content/45">Dart {index + 1}</span> -->
                    {#if dart}
                      <span class="mt-1 text-2xl font-black">{dart.score}</span>
                      <!-- <span class="mt-1 max-w-full truncate text-xs text-base-content/55">{dart.segmentName}</span> -->
                    {:else}
                      <span class="mt-2 text-2xl my-auto text-base-content/25">—</span>
                    {/if}
                  </div>
                {/each}
              </div>

              <!-- {#if currentDarts.length > 0}
                <div class={['rounded-md border p-4', preview.isBust ? 'border-error/40 bg-error/10' : preview.isCheckout ? 'border-success/40 bg-success/10' : 'border-base-300 bg-base-100']}>
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p class={['font-semibold', preview.isBust ? 'text-error' : preview.isCheckout ? 'text-success' : 'text-base-content']}>
                        {preview.message}
                      </p>

                      <p class="mt-1 text-sm text-base-content/55">
                        Attempted {preview.attemptedScore} · Counts {preview.scoredPoints}
                      </p>
                    </div>

                    {#if !activeParticipant.hasEntered}
                      <span class={['badge', preview.hasEntered ? 'badge-success' : 'badge-warning']}>
                        {preview.hasEntered ? 'Entry achieved' : 'Not entered'}
                      </span>
                    {/if}
                  </div>
                </div>
              {/if} -->

              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold">Multiplier</p>
                    <!-- <p class="text-xs text-base-content/50">Select the ring before choosing a number.</p> -->
                </div>

                <!-- <div class="join">
                    {#each availableMultipliers as multiplier}
                    <button type="button" class={['btn join-item btn-sm', selectedMultiplier === multiplier ? 'btn-primary' : 'btn-ghost']} onclick={() => selectedMultiplier = multiplier}>
                        {multiplier}x
                    </button>
                    {/each}
                </div> -->

                {#if currentDarts.length === 0}
                <button class="btn btn-outline btn-xs hover:btn-info" onclick={goToPreviousTurn}>Go to last player</button>
                {:else}
                <button class="btn btn-outline btn-xs hover:btn-info" onclick={undoCurrentDart}>Undo Last Dart</button>
                {/if}
                
                </div>

                <div class="flex gap-x-5">
                    <div class="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 w-full">
                    {#each singleSegments as segment}
                        {@const multipliedSegment = getSegmentForMultiplier(segment, selectedMultiplier)}
    
                        <button type="button" class="btn h-auto min-h-20 flex-col gap-1 border-base-300 bg-base-100 px-2 py-3 hover:border-primary hover:bg-primary/10" disabled={!canAddDart() || !multipliedSegment} onclick={() => selectNumberSegment(segment)}>
                        <span class="text-xl font-black">{segment.value}</span>
                        <!-- <span class="text-xs font-normal text-base-content/55">{selectedMultiplier}x</span> -->
                        <span class="badge badge-ghost badge-xs">{multipliedSegment?.score ?? '—'}</span>
                        </button>
                    {/each}
                    </div>
                    <div class="grid h-full max-h-50 w-70 grid-cols-2 grid-rows-2 gap-2">
                    {#each availableMultipliers as multiplier}
                        <button type="button" class="btn btn-primary h-full w-full {selectedMultiplier === multiplier ? '' : 'btn-outline hover:btn-info hover:text-white'}" onclick={() => selectedMultiplier = multiplier}>
                        {multiplier}x
                        </button>
                    {/each}
                    </div>
                </div>

                <div class="divider my-1">Special fields</div>

                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {#each bullSegments as bull}
                    <button type="button" class="btn h-auto min-h-20 flex-col gap-1 border-base-300 bg-base-100 px-3 py-3 hover:border-primary hover:bg-primary/10" disabled={!canAddDart()} onclick={() => addDart(bull)}>
                    <span class="text-xl font-black">{bull.score}</span>
                    <span class="text-xs font-normal">{bull.name}</span>
                    <span class="badge badge-ghost badge-xs">Bull</span>
                    </button>
                {/each}

                {#if missSegment}
                    <button type="button" class="btn h-auto min-h-20 flex-col gap-1 border-base-300 bg-base-100 px-3 py-3 hover:border-error hover:bg-error/10" disabled={!canAddDart()} onclick={() => addDart(missSegment)}>
                    <span class="text-xl font-black">0</span>
                    <!-- <span class="text-xs font-normal">{missSegment.name}</span> -->
                    <span class="badge badge-ghost badge-xs">Miss</span>
                    </button>
                {/if}
                </div>
            </div>
          </section>

          <aside class="flex min-w-0 flex-col gap-5">
            <section class="card border border-primary/30 bg-base-200 shadow-sm">
              <div class="card-body">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full font-bold text-white" style={`background-color: ${activePlayer.color || '#64748b'};`}>
                    {activePlayer.username.slice(0, 2).toUpperCase()}
                  </div>

                  <div class="min-w-0">
                    <p class="text-xs font-semibold uppercase tracking-wider text-primary">Current player</p>
                    <h2 class="truncate text-xl font-bold">AVT</h2>
                    <!-- <h2 class="truncate text-xl font-bold">{activePlayer.username}</h2> -->
                  </div>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-3">
                  <div class="rounded-md bg-base-100 p-3">
                    <p class="text-xs text-base-content/50">To Finish</p>
                    <!-- <p class="mt-1 text-2xl font-bold tabular-nums">{preview.scoreAfter}</p> -->
                    <p class="mt-1 font-bold tabular-nums">Show here fin strat</p>
                  </div>

                  <div class="rounded-md bg-base-100 p-3">
                    <p class="text-xs text-base-content/50">Turn score</p>
                    <p class="mt-1 text-2xl font-bold tabular-nums">{preview.scoredPoints}</p>
                  </div>
                </div>

                <!-- <button type="button" class="btn btn-primary btn-lg mt-2 w-full" disabled={isSaving || currentDarts.length === 0} onclick={completeTurn}>
                  {#if isSaving}
                    <span class="loading loading-spinner loading-sm"></span>
                    Saving
                  {:else if preview.isCheckout}
                    Complete checkout
                  {:else if preview.isBust}
                    Confirm bust
                  {:else if shouldCompleteTurn()}
                    Complete turn
                  {:else}
                    End turn early
                  {/if}
                </button> -->

                <!-- <div class="grid grid-cols-2 gap-2">
                  <button type="button" class="btn btn-outline" disabled={isSaving || currentDarts.length === 0} onclick={undoCurrentDart}>Undo dart</button>
                  <button type="button" class="btn btn-ghost" disabled={isSaving || currentDarts.length === 0} onclick={clearCurrentTurn}>Clear turn</button>
                </div> -->
              </div>
            </section>

            <section class="card border border-base-300 bg-base-200 shadow-sm">
              <div class="card-body">
                <div class="flex items-center justify-between gap-3">
                  <h2 class="card-title text-lg">Recent turns</h2>
                  <!-- <button type="button" class="btn btn-ghost btn-xs" disabled={isSaving || game.turns.length === 0 || currentDarts.length > 0} onclick={undoLastTurn}>Undo last</button> -->
                </div>

                {#if game.turns.length === 0}
                  <div class="rounded-md border border-dashed border-base-300 bg-base-100 p-5 text-center">
                    <p class="text-sm text-base-content/55">No completed turns yet.</p>
                  </div>
                {:else}
                  <div class="flex flex-col gap-2">
                    {#each getRecentTurns() as turn}
                      <div class="flex items-center gap-3 rounded-md border border-base-300 bg-base-100 p-3">
                        <div class={['flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold', turn.isBust ? 'bg-error/15 text-error' : turn.isCheckout ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary']}>
                          {turn.turnNumber}
                        </div>

                        <div class="min-w-0 flex-1">
                          <p class="truncate text-sm font-semibold">{getTurnPlayerName(turn)}</p>
                          <p class="text-xs text-base-content/50">
                            {turn.isBust ? 'Bust' : `${turn.scoredPoints} points`}
                          </p>
                        </div>

                        <div class="text-right">
                          <p class="font-bold tabular-nums">{turn.scoreAfter}</p>
                          <p class="text-xs text-base-content/45">remaining</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </section>
          </aside>
        </div>
      {/if}
    </div>
  {/if}
</main>