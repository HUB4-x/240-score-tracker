/**
 * ##################################################################################
 * ##############################  Routing  #########################################
 * ##################################################################################
 */
import Home from '../../routes/Home.svelte'; //Route to Landing Page
import NotFound from '../../routes/error/404.svelte'; //Route to Error Page
import GameList from '../../routes/game/game_list.svelte';
import PlayerList from '../../routes/player/player_list.svelte';
import PlayerStatistics from '../../routes/stats/player_statistics.svelte';


export const routes = {
    '/': Home,
    '/profiles': PlayerList,
    '/profiles/:pid/statistics': PlayerStatistics,

    '/games': GameList,

    '*': NotFound, //Fallback/Error/404 Route
};


export const route_links = {
    home: '#/',
    playerlist: '#/profiles',
    statistics: '#/profiles/:pid/statistics',

    gamelist: '#/games',
}






/**
 * ##################################################################################
 * ##############################  Routing  #########################################
 * ##################################################################################
*/














/**
 * BELOW IS THE OLD ROUTING LIST
 */
// const routes = {
//   '/': Home,
//   '/testing/settingtesting': SettingTesting,
//   '/testing/profiles': PlayerTesting,
//   '/game/new': NewGame,
//   '/game/play/:gameid': PlayGame,
//   '/profiles': AllProfiles, //All Profiles Showing here
//   '/profiles/:new': AllProfiles, //All Profiles Showing here
//   '/game/redirect/:new': RedirectToNewGame, //Needed for playing a new game from within a game
//   // '/profiles/profile/:userid': ProfileInfo, //Showing the specific params of one user

//   // '*': NotFound, //Fallback/Error/404 Route
// };