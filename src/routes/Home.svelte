<main class="mx-auto flex-col size-full max-w-7xl px-4 py-8">
    <!-- Hero -->
    <section class="hero min-h-[360px] rounded-3xl bg-base-200 shadow-xl">
      <div class="hero-content grid w-full gap-10 lg:grid-cols-2">
        <div>
          <div class="badge badge-success mb-4">Offline First</div>

          <h1 class="text-5xl font-black leading-tight">
            Score darts faster.
            <span class="text-primary">Play smarter.</span>
          </h1>

          <p class="mt-4 max-w-xl text-base-content/70">
            Local-first dart scoring with custom game modes, saved matches,
            player statistics and match history.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <button class="btn btn-primary btn-lg">Start New Game</button>
            <button class="btn btn-outline btn-lg">Continue Game</button>
          </div>
        </div>

        <div class="rounded-3xl border border-base-300 bg-base-100 p-6">
          <div class="stats stats-vertical w-full shadow lg:stats-horizontal">
            <div class="stat">
              <div class="stat-title">Games</div>
              <div class="stat-value text-primary">128</div>
              <div class="stat-desc">Total played</div>
            </div>

            <div class="stat">
              <div class="stat-title">Checkout</div>
              <div class="stat-value text-secondary">170</div>
              <div class="stat-desc">Highest</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <button class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <h2 class="card-title">🎯 New Game</h2>
          <p class="text-base-content/60">Start 501, 301 or custom mode.</p>
        </div>
      </button>

      <button class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <h2 class="card-title">▶ Continue</h2>
          <p class="text-base-content/60">Resume your saved match.</p>
        </div>
      </button>

      <button class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <h2 class="card-title">👥 Players</h2>
          <p class="text-base-content/60">Manage local player profiles.</p>
        </div>
      </button>

      <button class="card bg-base-200 shadow-xl transition hover:-translate-y-1">
        <div class="card-body">
          <h2 class="card-title">📊 Statistics</h2>
          <p class="text-base-content/60">View averages and history.</p>
        </div>
      </button>
    </section>

    <!-- Main Grid -->
    <section class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Resume Game -->
      <div class="card border border-primary/30 bg-base-200 shadow-xl lg:col-span-2">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h2 class="card-title">Current Game</h2>
            <div class="badge badge-primary">501 Double Out</div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl bg-base-100 p-5">
              <p class="text-sm text-base-content/60">Player 1</p>
              <p class="text-4xl font-black text-primary">240</p>
            </div>

            <div class="rounded-2xl bg-base-100 p-5">
              <p class="text-sm text-base-content/60">Player 2</p>
              <p class="text-4xl font-black text-secondary">180</p>
            </div>
          </div>

          <div class="card-actions mt-4 justify-end">
            <button class="btn btn-primary">Resume Match</button>
          </div>
        </div>
      </div>

      <!-- Player Box -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Top Player</h2>

          <div class="mt-4 rounded-2xl bg-base-100 p-5">
            <p class="text-lg font-bold">Alex</p>
            <p class="text-base-content/60">Win rate 62%</p>
          </div>

          <progress class="progress progress-success mt-4" value="62" max="100" />
        </div>
      </div>
    </section>

    <!-- Bottom Grid -->
    <section class="mt-8 grid gap-6 lg:grid-cols-2">
      <!-- Favorite Modes -->
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Favorite Modes</h2>

          <div class="mt-4 flex flex-wrap gap-3">
            <button class="btn btn-outline btn-primary">501 Double Out</button>
            <button class="btn btn-outline btn-primary">301 Single Out</button>
            <button class="btn btn-outline btn-primary">180 Board</button>
            <button class="btn btn-outline btn-primary">Custom</button>
          </div>
        </div>
      </div>

      <!-- Recent Games -->
      <div class="card bg-base-200 shadow-xl">
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
    </section>
  </main>