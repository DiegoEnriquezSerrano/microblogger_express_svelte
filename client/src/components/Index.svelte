<script>
  import Navbar from './Navbar.svelte';
	import Login from "./Login.svelte";

  export let page;

  console.log(page);

  const loadPage = (e) => {
    page = e.detail;
  }
</script>

<svelte:head>
  <title>Microblogger | {page}</title>
</svelte:head>

{#if page == 'login'}
  <Login {page} on:loadPage={loadPage} />
{:else}
  <Navbar {page} />

  <div id="homeModule">
  
  </div><!--homeModule-->
{/if}


