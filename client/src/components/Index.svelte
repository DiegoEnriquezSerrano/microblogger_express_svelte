<script>
  import Navbar from './Navbar.svelte';
  import { createEventDispatcher } from 'svelte';

  export let page;

  $: pageName = page;
  $: pageNameCapitalized = page[0].toUpperCase() + page.slice(1);

  let dispatch = createEventDispatcher();

  let loadPage = (e) => {
    dispatch('bubbleApp', e.detail);
  }

</script>

<svelte:head>
  <title>Microblogger | {pageNameCapitalized}</title>
</svelte:head>

  <Navbar page={pageName} on:loadPage={loadPage} />

  <div id="homeModule">
  {#if pageName == 'timeline'}
    timeline
  {:else if pageName == 'drafts'}
    draft
  {:else if pageName == 'published'}
    published
  {:else if pageName == 'liked'}
    liked
  {/if}
  </div><!--homeModule-->