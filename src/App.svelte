<script>
  import { drawerOpen } from './lib/stores/globals';


  /**
   * ##################################################################################
   * ##############################  Routing  #########################################
   * ##################################################################################
  */
  import Router from 'svelte-spa-router'; //Improt SPA Router
  import Home from './routes/Home.svelte'; //Route to Landing Page
  import NotFound from './routes/404.svelte'; //Route to Error Page

  import SettingTesting from './routes/testing/settingTesting.svelte'
  import PlayerTesting from './routes/testing/testingProfiles.svelte'
  import NewGame from './routes/game/NewGame.svelte';
  
  const routes = {
    '/': Home,
    '/testing/settingtesting': SettingTesting,
    '/testing/profiles': PlayerTesting,
    '/game/new': NewGame,

    '*': NotFound, //Fallback/Error/404 Route
  };

</script>


<div class="w-screen h-screen bg-sky-950 flex flex-col overflow-hidden">
  <!-- Navbar -->
  <nav class="bg-base-200 flex h-16">
    <div class="h-full w-full max-w-20">
      <label for="my-drawer" class="btn btn-block h-full btn-ghost drawer-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </label>
    </div>
    <a href="#/game/new" class="btn btn-ghost ml-auto h-full w-fit flex items-center pr-10">
      <p class="text-nowrap text-green-600">Start New Game</p>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-13 w-13 text-green-600" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
      </svg>
    </a>
  </nav>

    <div class="drawer w-full h-full">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked={$drawerOpen}/>
      <div class="drawer-content flex h-full w-full">
        <!-- Page content here -->
        <Router {routes} />
        <!-- <label for="my-drawer" class="btn btn-base-200 drawer-button">Open</label> -->
      </div>
      <div class="drawer-side">
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <!-- Sidebar content here -->
          <li><a href="#/" class="link text-blue-500 text-3xl">Home</a></li>
          <li></li>
          <li><a href="#/" class="link text-blue-400 text-2xl">Players</a></li>
          <li><a href="#/game/new" class="link text-blue-400 text-2xl">Start a New Game</a></li>
          <li><a href="#/" class="link text-blue-400 text-2xl">Statistics</a></li>
          <li><a href="#/" class="link text-blue-400 text-2xl">Scoreboard</a></li>
          <li><a href="#/" class="link text-blue-400 text-2xl">History</a></li>
          <li><a href="#/" class="link text-blue-400 text-2xl">About this Game</a></li>
          <li></li>
          <li>Testing</li>
          <li></li>
          <li><a href="#/testing/settingtesting" class="link text-blue-400 text-2xl">Settings</a></li>
          <li><a href="#/testing/profiles" class="link text-blue-400 text-2xl">Profiles</a></li>
        </ul>
      </div>
    </div>
  

  <!-- When using a route use # for GitHub Pages -->
  <!-- <a href="/">Home</a> -->
  
  <!-- This is like a slot. Thats where the routes are rendered. The first in the routes constant is the default -->
</div>




