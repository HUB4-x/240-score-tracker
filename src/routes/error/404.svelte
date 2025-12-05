<!-- <h1>Error Page. You have clicked a link that is not provided/found</h1>
<a href="#/" class="link text-xl">HOME</a> -->


<!-- src/routes/NotFound.svelte -->
<script>
  const homeHref = '#/';
</script>

<section class="mx-auto p-3 text-center flex flex-col">
  <h1 class="text-7xl font-semibold p-2">404</h1>
  <h2 class="mb-10">Page not found</h2>
  <p class="mb-5"> The page you’re looking for doesn’t exist.</p>
  <a href={homeHref} class="inline-block p-3 rounded rounded-lg border border-2 font-semibold">Go back to Home</a>
</section>
