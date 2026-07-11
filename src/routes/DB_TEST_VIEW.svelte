<script lang="ts">
  import { onMount } from 'svelte';

  import { db } from '../db/database';
  import { createPlayer, type Player } from '../db/models/player_model';

  let players: Player[] = [];

  let username = '';
  let name = '';
  let color = '#3b82f6';
  let avatar = '';
  let isGuest = false;

  let isLoading = true;
  let isSaving = false;
  let errorMessage = '';
  let successMessage = '';

  /**
   * Loads every player currently stored in IndexedDB.
   */
  async function loadPlayers(): Promise<void> {
    isLoading = true;
    errorMessage = '';

    try {
      players = await db.players.orderBy('username').toArray();
    } catch (error) {
      console.error('Could not load players:', error);
      errorMessage = 'The players could not be loaded.';
    } finally {
      isLoading = false;
    }
  }

  /**
   * Validates the form, creates a Player object, and saves it in IndexedDB.
   */
  async function handleCreatePlayer(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    isSaving = true;
    errorMessage = '';
    successMessage = '';

    try {
      const player = createPlayer({
        username,
        name: name || undefined,
        avatar: avatar || undefined,
        color,
        isGuest
      });

      await db.players.add(player);

      username = '';
      name = '';
      avatar = '';
      isGuest = false;

      successMessage = `Player "${player.username}" was created.`;

      await loadPlayers();
    } catch (error) {
      console.error('Could not create player:', error);

      errorMessage = error instanceof Error
        ? error.message
        : 'The player could not be created.';
    } finally {
      isSaving = false;
    }
  }

  /**
   * Deletes one player from IndexedDB.
   */
  async function deletePlayer(player: Player): Promise<void> {
    errorMessage = '';
    successMessage = '';

    try {
      await db.players.delete(player.id);

      successMessage = `Player "${player.username}" was deleted.`;

      await loadPlayers();
    } catch (error) {
      console.error('Could not delete player:', error);
      errorMessage = 'The player could not be deleted.';
    }
  }

  /**
   * Deletes every player from the player object store.
   */
  async function deleteAllPlayers(): Promise<void> {
    errorMessage = '';
    successMessage = '';

    try {
      await db.players.clear();

      successMessage = 'All players were deleted.';

      await loadPlayers();
    } catch (error) {
      console.error('Could not delete all players:', error);
      errorMessage = 'The players could not be deleted.';
    }
  }

  onMount(() => {
    void loadPlayers();
  });
</script>

<svelte:head>
  <title>Player Database Test</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 p-6">
  <header>
    <h1 class="text-3xl font-bold">Player Database Test</h1>
    <p class="mt-2 text-base-content/70">Create players and inspect the records stored in IndexedDB.</p>
  </header>

  <section class="card bg-base-200 shadow-md">
    <div class="card-body">
      <h2 class="card-title">Create player</h2>

      <form class="grid gap-4 md:grid-cols-2" onsubmit={handleCreatePlayer}>
        <label class="form-control">
          <span class="label">
            <span class="label-text">Username</span>
          </span>

          <input class="input input-bordered" type="text" bind:value={username} maxlength="30" placeholder="DartMaster" required />
        </label>

        <label class="form-control">
          <span class="label">
            <span class="label-text">Full name</span>
          </span>

          <input class="input input-bordered" type="text" bind:value={name} maxlength="100" placeholder="Optional" />
        </label>

        <label class="form-control">
          <span class="label">
            <span class="label-text">Player color</span>
          </span>

          <div class="flex items-center gap-3">
            <input class="h-12 w-16 cursor-pointer" type="color" bind:value={color} />
            <input class="input input-bordered flex-1 font-mono" type="text" bind:value={color} placeholder="#3b82f6" required />
          </div>
        </label>

        <label class="form-control">
          <span class="label">
            <span class="label-text">Avatar ID</span>
          </span>

          <input class="input input-bordered" type="text" bind:value={avatar} placeholder="Optional" />
        </label>

        <label class="label cursor-pointer justify-start gap-3">
          <input class="checkbox" type="checkbox" bind:checked={isGuest} />
          <span class="label-text">Guest player</span>
        </label>

        <div class="flex items-end md:justify-end">
          <button class="btn btn-primary w-full md:w-auto" type="submit" disabled={isSaving}>
            {isSaving ? 'Creating…' : 'Create player'}
          </button>
        </div>
      </form>

      {#if errorMessage}
        <div class="alert alert-error mt-4">
          <span>{errorMessage}</span>
        </div>
      {/if}

      {#if successMessage}
        <div class="alert alert-success mt-4">
          <span>{successMessage}</span>
        </div>
      {/if}
    </div>
  </section>

  <section class="card bg-base-200 shadow-md">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="card-title">Stored players</h2>
          <p class="text-sm text-base-content/70">
            {players.length} {players.length === 1 ? 'player' : 'players'} stored
          </p>
        </div>

        <div class="flex gap-2">
          <button class="btn btn-ghost" type="button" onclick={() => void loadPlayers()} disabled={isLoading}>
            Refresh
          </button>

          <button class="btn btn-error" type="button" onclick={() => void deleteAllPlayers()} disabled={players.length === 0}>
            Delete all
          </button>
        </div>
      </div>

      {#if isLoading}
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      {:else if players.length === 0}
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
                      </div>
                    </div>
                  </td>

                  <td>
                    <code>{player.color}</code>
                  </td>

                  <td>
                    {#if player.isGuest}
                      <span class="badge badge-ghost">Guest</span>
                    {:else}
                      <span class="badge badge-primary">Permanent</span>
                    {/if}
                  </td>

                  <td>{player.statistics.gamesPlayed}</td>

                  <td>{player.statistics.threeDartAverage.toFixed(2)}</td>

                  <td class="text-right">
                    <button class="btn btn-ghost btn-sm" type="button" onclick={() => void deletePlayer(player)}>
                      Delete
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </section>
</div>