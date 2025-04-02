<script>
    import { settings } from '../../lib/stores/settings';
</script>

<a href="#/" class="link text-xl">HOME</a>

<p>TEsting setting setting/getting</p>
<br>
<div>
    <label>
        <input type="checkbox" bind:checked={$settings.darkMode}>
        Dark Mode
    </label>


    <button class="btn btn-info" on:click={()=>{console.log($settings)}}>LOG</button>
    <button class="btn btn-success" on:click={()=>{settings.set({...$settings, darkMode:!$settings.darkMode})}}>Change Darkmode</button>
</div>