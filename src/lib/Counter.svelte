<script>
  let count = $state(0)
  const increment = () => {
    count += 1
  }
</script>

<button onclick={increment} class="">
  count is {count}
</button>
