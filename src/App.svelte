<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';

  import { initTheme, toggleTheme } from './lib/utils/utils';
  import Home from './routes/Home.svelte';
  import Admin from './routes/Admin.svelte';
  import { current_theme } from './lib/stores/UI_Values';
  import CreateNewGame from './routes/game/Create_new_Game.svelte';
  import PlayGame from './routes/game/Play_Game.svelte';

  const routes = {
    '/': Home,
    '/admin': Admin,
    '/create_new_game': CreateNewGame,
    '/game/:gameId': PlayGame,
    // '/game/:gameId/details': GameDetails,
    // '/game/:gameId/statistic': GameDetails,
    
  };

  onMount(() => {
    initTheme();
  });
</script>

<div class="flex h-screen min-h-screen flex-col overflow-hidden bg-base-100 text-base-content select-none">
  <nav class="navbar shrink-0 min-w-fit border-b border-base-300 bg-base-200/80 backdrop-blur px-3 z-90">
    <div class="navbar-start flex gap-x-3">
      <a href="#/" class="inline-block text-xl font-bold text-primary transition-transform duration-200 ease-out hover:scale-110">240 Darts</a>
      <div class="dropdown dropdown-center min-w-30">
      <button class="btn btn-ghost gap-2 px-2" type="button" tabindex="0" aria-label="Open developer links">
        <div class="avatar">
          <div class="size-9 rounded-full border border-primary/40 bg-base-100">
            {#if $current_theme === 'dart_240_dark'}
            <img src="/src/assets/favicons/h-dev-clean_lightlogo_wo_bg.png" alt="Developer logo" />
            {:else}
            <img src="/src/assets/favicons/h-dev-clean_darklogo_wo_bg.png" alt="Developer logo" />
            {/if}
          </div>
        </div>

        <span class="hidden font-semibold md:inline">About Me</span>

        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="dropdown-content mt-5 w-72 rounded-2xl border border-neutral bg-base-200 p-3 shadow-2xl" tabindex="0">
        <div class="flex items-center gap-3 rounded-xl bg-base-100 p-3">
          <div class="avatar">
            <div class="size-12 rounded-full border border-primary/40">
            {#if $current_theme === 'dart_240_dark'}
            <img src="/src/assets/favicons/h-dev-clean_lightlogo_wo_bg.png" alt="Developer logo" />
            {:else}
            <img src="/src/assets/favicons/h-dev-clean_darklogo_wo_bg.png" alt="Developer logo" />
            {/if}
            </div>
          </div>

          <div class="min-w-0">
            <p class="font-bold">HUB4-X</p>
            <p class="truncate text-sm text-base-content/60">Just a human</p>
          </div>
        </div>

        <p class="mt-3 px-2 text-sm text-base-content/60">currently under construction</p>

        <div class="mt-3 flex flex-col gap-2">
          <a href="https://github.com/HUB4-x" class="btn btn-primary btn-sm justify-start" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.16 1.19a10.92 10.92 0 0 1 5.76 0c2.19-1.5 3.16-1.19 3.16-1.19.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.11 0 4.45-2.71 5.43-5.29 5.72.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
            </svg>
            View GitHub repository
          </a>

          <!-- <a href="https://YOUR-PORTFOLIO-WEBSITE.com" class="btn btn-outline btn-sm justify-start" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.25 0 4.5-4.03 4.5-9S14.25 3 12 3s-4.5 4.03-4.5 9 2.25 9 4.5 9ZM3.6 9h16.8M3.6 15h16.8" />
            </svg>
            Visit portfolio
          </a> -->
        </div>
      </div>
    </div>
    </div>

    <div class="navbar-end gap-10">
      <a href="#/overall_statistics" class="link link-info font-bold" type="button">Stats</a>
      <a href="#/players" class="link link-info font-bold" type="button">Players</a>
      <a href="#/admin" class="link link-info font-bold">Admin</a>
      <button class="btn btn-primary" type="button" onclick={toggleTheme}>Theme</button>
    </div>
  </nav>

  <!-- <div class="navbar gap-6">
    <a href="#/overall_statistics" class="link link-info">Stats</a>
    <a href="#/players" class="link link-info">Players</a>
    <a href="#/admin" class="link link-info">Admin</a>

    <div class="dropdown dropdown-end">
      <button class="btn btn-ghost gap-2 px-2" type="button" tabindex="0" aria-label="Open developer links">
        <div class="avatar">
          <div class="size-9 rounded-full border border-primary/40 bg-base-100">
            <img src="/developer-logo.png" alt="Developer logo" />
          </div>
        </div>

        <span class="hidden font-semibold md:inline">About Me</span>

        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>

      <div class="dropdown-content z-50 mt-3 w-72 rounded-2xl border border-base-300 bg-base-200 p-3 shadow-2xl" tabindex="0">
        <div class="flex items-center gap-3 rounded-xl bg-base-100 p-3">
          <div class="avatar">
            <div class="size-12 rounded-full border border-primary/40">
              <img src="/developer-logo.png" alt="Developer logo" />
            </div>
          </div>

          <div class="min-w-0">
            <p class="font-bold">Your Name</p>
            <p class="truncate text-sm text-base-content/60">Web Developer</p>
          </div>
        </div>

        <p class="mt-3 px-2 text-sm text-base-content/60">Creator of 240 Darts and other web development projects.</p>

        <div class="mt-3 flex flex-col gap-2">
          <a href="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY" class="btn btn-primary btn-sm justify-start" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.16 1.19a10.92 10.92 0 0 1 5.76 0c2.19-1.5 3.16-1.19 3.16-1.19.63 1.6.23 2.78.11 3.07.74.81 1.19 1.84 1.19 3.11 0 4.45-2.71 5.43-5.29 5.72.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
            </svg>
            View GitHub repository
          </a>

          <a href="https://YOUR-PORTFOLIO-WEBSITE.com" class="btn btn-outline btn-sm justify-start" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.25 0 4.5-4.03 4.5-9S14.25 3 12 3s-4.5 4.03-4.5 9 2.25 9 4.5 9ZM3.6 9h16.8M3.6 15h16.8" />
            </svg>
            Visit portfolio
          </a>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" type="button" onclick={toggleTheme}>Theme</button>
  </div> -->




  <main class="min-h-0 flex-1 overflow-y-auto">
    <Router {routes} />
  </main>
</div>
