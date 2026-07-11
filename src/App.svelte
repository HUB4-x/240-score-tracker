<script lang="ts">
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';

  import { initTheme, toggleTheme } from './lib/utils/utils';
  import Home from './routes/Home.svelte';
  import Admin from './routes/Admin.svelte';

  const routes = {
    '/': Home,
    '/admin': Admin
  };

  onMount(() => {
    initTheme();
  });
</script>

<div class="flex h-screen min-h-screen flex-col overflow-hidden bg-base-100 text-base-content">
  <nav class="navbar shrink-0 border-b border-base-300 bg-base-200/80 backdrop-blur">
    <div class="navbar-start flex gap-x-3">
      <a href="#/" class="text-xl font-bold text-primary">240 Darts</a>
    </div>

    <div class="navbar-end gap-2">
      <button class="btn btn-ghost" type="button">Stats</button>
      <button class="btn btn-ghost" type="button">Players</button>
      <a href="#/admin" class="link link-info font-bold">Admin</a>
      <button class="btn btn-primary" type="button" onclick={toggleTheme}>Theme</button>
    </div>
  </nav>

  <main class="min-h-0 flex-1 overflow-y-auto">
    <Router {routes} />
  </main>
</div>
