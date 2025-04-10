<script>
    import { settings } from '../lib/stores/settings';
    import { userDB } from '../lib/stores/userAPI';
    // Import History
    // Import Scoreboard
</script>

<div class="h-full w-full grid grid-cols-4 grid-rows-10">
    <div class="row-span-10 col-span-3 grid grid-cols-1 grid-rows-2">
        <div class="flex flex-col p-8">
            <h1 class="text-2xl front-bold underline mb-2">Last Game</h1>
            <p>No Game Data Available</p>
        </div>

        <div class="flex flex-col p-8 border-t-2 border-white">
            <h1 class="text-2xl front-bold underline mb-2">Scoreboard</h1>
        </div>
    </div>
    <div class="border-l-2 border-white row-span-10 col-span-1 p-8">
        <h1 class="text-2xl front-bold underline mb-2">Statistics</h1>
        
    </div>

</div>

