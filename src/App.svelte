<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { getInitialTheme, initTheme, toggleTheme } from "../src/lib/utils/utils";
  import Router from "svelte-spa-router";
  import Home from "./routes/Home.svelte";
  import DBTESTVIEW from "./routes/DB_TEST_VIEW.svelte";

  const routes = {
    '/': Home,
    '/dbtestview': DBTESTVIEW,
  }


  onMount(()=>{
    initTheme()
  })
</script>

<div class="min-h-screen h-screen flex flex-col bg-base-100 text-base-content overflow-hidden">
  <!-- Navbar -->
  <nav class="navbar border-b border-base-300 bg-base-200/80 backdrop-blur h-fit">
    <div class="navbar-start flex gap-x-3">
      <a href="#/" class="text-xl font-bold text-primary">240 Darts</a>
      <a href="#/dbtestview" class="text-xl font-bold text-primary">DB-Test</a>
    </div>

    <div class="navbar-end gap-2">
      <button class="btn btn-ghost">Stats</button>
      <button class="btn btn-ghost">Players</button>
      <button class="btn btn-primary" on:click={toggleTheme}>
        Theme
      </button>
    </div>
  </nav>

  <div class="flex size-full overflow-y-aut">
    <Router {routes}/>
  </div>
</div>