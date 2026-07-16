<script lang="ts">
  import { onMount } from "svelte";
  import { db } from '../db/database';
  import { calculatePlayerAverages, type Player } from '../db/models/player_model';
  import type { Board } from '../db/models/board_model';
  import type { Game } from '../db/models/game_model';

  let players: Player[] = $state([]);
  let boards: Board[] = $state([]);
  let games: Game[] = $state([]);


  type LandingPageStats = {
    game_stats: {
      games_finished: number,
      games_running: number,
    },

    player_stats: {
      number_of_players: number,
      highest_finish_stat: Player | undefined
      total_number_of_180: number,
      total_number_of_240: number,

      player_with_best_winrate: Player | undefined,
      player_with_best_3Avg: Player | undefined,
      player_with_highest_total_pts: Player | undefined,
      player_with_highest_score: Player | undefined,
    },
  }


  let landingPageStats: LandingPageStats = $state({
    game_stats: {
      games_finished: 0,
      games_running: 0
    },
    player_stats:{
      highest_finish_stat: undefined,
      number_of_players: 0,
      total_number_of_180: 0,
      total_number_of_240: 0,

      player_with_best_winrate: undefined,
      player_with_best_3Avg: undefined,
      player_with_highest_total_pts: undefined,
      player_with_highest_score: undefined
    }
  })


  let current_running_game: Game | undefined = $state(undefined)
  let last_updated_game: Game | undefined = $state(undefined)
  type TopPlayerCategory = 'winrate' | 'three-dart-average' | 'total-points' | 'highest-score';

  let selectedTopPlayerCategory: TopPlayerCategory = $state('winrate');
  let selectedTopPlayer: Player | undefined = $derived.by(()=>{
    switch (selectedTopPlayerCategory){
      case 'winrate':
        return landingPageStats.player_stats.player_with_best_winrate 
      case 'highest-score':
        return landingPageStats.player_stats.player_with_highest_score
      case 'three-dart-average':
        return landingPageStats.player_stats.player_with_best_3Avg
      case 'total-points':
        return landingPageStats.player_stats.player_with_highest_total_pts
      default: 
        return undefined
    }
  });


  let isLoading = true;
  let errorMessage = '';



  onMount(async () => {
    loadDatabaseEntries();

    landingPageStats = await calc_landing_page_stats()

    current_running_game = games.find((game) => game.status === 'running')

    last_updated_game = await db.games.orderBy('updatedAt').last();
  });






  /**
   * Loads all players, boards and games from IndexedDB.
   */
  async function loadDatabaseEntries(): Promise<void> {
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
    } catch (error) {
      console.error('Could not load database entries:', error);
      errorMessage = 'The database entries could not be loaded.';
    } finally {
      isLoading = false;
    }
  }



  async function calc_landing_page_stats(): Promise<LandingPageStats> {
    const finishedGames: number = (games.filter((g)=>{return g.status === 'finished'})).length

    let total180: number = 0
    let total240: number = 0
    let non_guest_player: number = 0
    
    let highest_finish_player: Player | undefined
    let highest_win_rate_player: Player | undefined
    let best_3avg_player: Player | undefined
    let highest_score_player: Player | undefined
    let highest_total_score_player: Player | undefined


    players.forEach((player)=>{
      if(highest_finish_player && player.statistics.highestCheckout > highest_finish_player.statistics.highestCheckout) {
        highest_finish_player.statistics.highestCheckout = player.statistics.highestCheckout
        highest_finish_player = player
      }

      if(highest_win_rate_player){
        const current_player_winrate = player.statistics.gamesWon / player.statistics.gamesPlayed
        const bestPlayerWinRate = highest_win_rate_player.statistics.gamesWon / highest_win_rate_player.statistics.gamesPlayed
        if(current_player_winrate > bestPlayerWinRate) highest_win_rate_player = player
      }


      if(best_3avg_player && player.statistics.threeDartAverage > best_3avg_player.statistics.threeDartAverage){
        best_3avg_player = player
      }


      if(highest_score_player && player.statistics.highestScore > highest_score_player.statistics.highestScore){
        highest_score_player = player
      }


      if(highest_total_score_player && player.statistics.totalPointsScored > highest_total_score_player.statistics.totalPointsScored){
        highest_total_score_player = player
      }


      if(!player.isGuest){
        non_guest_player += 1
        console.log(player)
      }


      total180 += player.statistics.count180
      total240 += player.statistics.count240
    })




    const resulting_stats: LandingPageStats = {
      game_stats: {
        games_finished: finishedGames,
        games_running: games.length - finishedGames
      },
      player_stats: {
        highest_finish_stat: highest_finish_player,
        number_of_players: non_guest_player,
        total_number_of_180: total180,
        total_number_of_240: total240,
        player_with_best_3Avg: best_3avg_player,
        player_with_best_winrate: highest_win_rate_player,
        player_with_highest_score: highest_score_player,
        player_with_highest_total_pts: highest_total_score_player,
      }
    }
    return resulting_stats
  }



</script>

<svelte:head>
  <title>240 Dart - Home</title>
</svelte:head>

<main class="mx-auto w-full max-w-7xl px-4 py-8">
    <!-- Hero -->
    <section class="hero h-70 rounded-3xl bg-base-200 shadow-xl">
      <div class="hero-content grid w-full gap-10 grid-cols-2">
        <div>
          <!-- <div class="rounded-full badge badge-info mb-4">Offline First</div> -->

          <h1 class="text-5xl font-black leading-tight">
            240 Dart Scorer
            <!-- <span class="text-primary">Play smarter.</span> -->
          </h1>

          <p class="mt-4 max-w-xl text-base-content/70">
            Local dart scoring with 240-Board support
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#/create_new_game" class="btn btn-primary btn-lg">Start New Game</a>
            <a href="#/game/{last_updated_game?.id}" class="btn btn-outline btn-lg {last_updated_game? '' : 'btn-disabled'}">Continue Last Game</a>
          </div>
        </div>

        <div class="rounded-3xl border border-base-300 bg-base-100 p-6">
          <div class="stats w-full stats-horizontal">
            <div class="stat">
              <div class="stat-title">Finished Games</div>
              <div class="stat-value text-primary">{landingPageStats.game_stats.games_finished}</div>
              <div class="stat-desc">Total played</div>
            </div>

            <div class="stat">
              <div class="stat-title">Highest Checkout</div>
              {#if landingPageStats.player_stats.highest_finish_stat?.statistics.highestCheckout}
              <div class="stat-value text-secondary">{landingPageStats.player_stats.highest_finish_stat?.statistics.highestCheckout}</div>
              {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-6 text-secondary">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 20.247 6-16.5" />
              </svg>
              {/if}
              <div class="stat-desc">{landingPageStats.player_stats.highest_finish_stat?.name}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="mt-8 grid gap-4 md:grid-cols-2 grid-cols-4">
      <a href="#/create_new_game" class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <h2 class="card-title">🎯 New Game</h2>
          <!-- <p class="text-base-content/60">Start 501, 301 or custom mode.</p> -->
          <p class="text-base-content/60">Start 501 or 301</p>
        </div>
      </a>

      <a href="#/saved_games" class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <div class="flex items-center justify-between gap-3">
            <h2 class="card-title">🎯 Saved Games</h2>
            <span class="badge badge-outline badge-info rounded-full">{games.length}</span>
          </div>

          <p class="text-base-content/60">View running, paused, and finished matches.</p>
        </div>
      </a>

      <a href="#/players" class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <div class="flex items-center justify-between gap-3">
            <h2 class="card-title">👥 Players</h2>
            <span class="badge badge-outline badge-info rounded-full">{players.length}</span>
          </div>

          <p class="text-base-content/60">Manage local player profiles.</p>
        </div>
      </a>

      <a href="#/overall_statistics" class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <h2 class="card-title">📊 Statistics</h2>
          <p class="text-base-content/60">View averages and history.</p>
        </div>
      </a>
    </section>

    <!-- Main Grid -->

    <section class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Resume Game -->
      <div class="card border border-primary/30 bg-base-200 shadow-xl lg:col-span-2">
        <div class="card-body">
          {#if current_running_game}
            <div class="flex items-center justify-between gap-4">
              <h2 class="card-title">Current Game</h2>
              <div class="badge badge-info rounded-full">{current_running_game.gameMode.name} {current_running_game.rules.exitMode}</div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              {#each current_running_game.participants as participant, index (participant.id)}
                <div class="rounded-2xl bg-base-100 p-5">
                  <p class="text-sm text-base-content/60">{participant.name ?? participant.players.map((player) => player.username).join(' & ')}</p>
                  <p class:text-primary={index === 0} class:text-secondary={index === 1} class="text-4xl font-black">{participant.currentScore}</p>
                </div>
              {/each}
            </div>

            <div class="card-actions mt-4 justify-end">
              <a href={`#/game/${current_running_game.id}`} class="btn btn-primary">Resume Match</a>
            </div>
          {:else}
            <div class="flex min-h-64 flex-col items-center justify-center text-center">
              <div class="mb-4 text-6xl">🎯</div>
              <h2 class="text-2xl font-bold">No current game</h2>
              <p class="mt-2 max-w-md text-base-content/60">There is currently no running or paused match. Start a new game to begin scoring.</p>

              <div class="card-actions mt-6 justify-center">
                <a href="#/create_new_game" class="btn btn-primary">Start New Game</a>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Player Box -->
      <!-- <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Top Player</h2>

          <div class="mt-4 rounded-2xl bg-base-100 p-5">
            <p class="text-lg font-bold">Alex</p>
            <p class="text-base-content/60">Win rate 62%</p>
          </div>

          <progress class="progress progress-success mt-4" value="62" max="100" />
        </div>
      </div> -->

      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="card-title">Top Player</h2>

            <select class="select select-bordered select-sm" bind:value={selectedTopPlayerCategory}>
              <option value="winrate">Best win rate</option>
              <option value="three-dart-average">Best 3-dart average</option>
              <option value="total-points">Highest total points</option>
              <option value="highest-score">Highest score</option>
            </select>
          </div>

          {#if selectedTopPlayer}
            <div class="mt-4 rounded-2xl bg-base-100 p-5">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 shrink-0 rounded-full" style:background-color={selectedTopPlayer.color}></div>

                <div class="min-w-0">
                  <p class="truncate text-lg font-bold">{selectedTopPlayer.username}</p>

                  {#if selectedTopPlayer.name}
                    <p class="truncate text-sm text-base-content/50">{selectedTopPlayer.name}</p>
                  {/if}
                </div>
              </div>

              <!-- <p class="mt-4 text-base-content/60">{selectedTopPlayerLabel}</p> -->
            </div>

            <!-- <progress class="progress progress-success mt-4" value={selectedTopPlayerProgress} max="100"></progress> -->
          {:else}
            <div class="mt-4 flex min-h-36 items-center justify-center rounded-2xl bg-base-100 p-5 text-center">
              <p class="text-base-content/60">No player statistics are available yet.</p>
            </div>
          {/if}
        </div>
      </div>


    </section>

    <!-- Bottom Grid -->
    <!-- <section class="mt-8 grid gap-6 lg:grid-cols-2"> -->
      <!-- Favorite Modes -->
      <!-- <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Favorite Modes</h2>

          <div class="mt-4 flex flex-wrap gap-3">
            <button class="btn btn-outline btn-primary">501 Double Out</button>
            <button class="btn btn-outline btn-primary">301 Single Out</button>
            <button class="btn btn-outline btn-primary">180 Board</button>
            <button class="btn btn-outline btn-primary">Custom</button>
          </div>
        </div>
      </div> -->

      <!-- Recent Games -->
      <!-- <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Recent Games</h2>

          <div class="space-y-3">
            <div class="rounded-2xl bg-base-100 p-4">
              <p class="font-bold">501 Double Out</p>
              <p class="text-sm text-base-content/60">Winner: Alex</p>
            </div>

            <div class="rounded-2xl bg-base-100 p-4">
              <p class="font-bold">301 Single Out</p>
              <p class="text-sm text-base-content/60">Winner: John</p>
            </div>
          </div>
        </div>
      </div>
    </section> -->
  </main>