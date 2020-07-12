<script>
  import { createEventDispatcher } from 'svelte';
  import Timeline from './timeline/Timeline.svelte';
  import Drafts from './timeline/Drafts.svelte';
  import Published from './timeline/Published.svelte';
  import Liked from './timeline/Liked.svelte';

  export let page;

  $: pageName = page;
  $: pageNameCapitalized = page[0].toUpperCase() + page.slice(1);

</script>

<svelte:head>
  <title>Microblogger | {pageNameCapitalized}</title>
</svelte:head>

  <div id="homeModule">
  {#if pageName == 'timeline'}
    <Timeline />
  {:else if pageName == 'drafts'}
    <Drafts />
  {:else if pageName == 'published'}
    <Published />
  {:else if pageName == 'liked'}
    <Liked />
  {/if}
  </div><!--homeModule-->

  <style>

  #homeModule {
    display: grid;
    padding-top: 50px;
    width: calc(100% - 2.5rem);
    min-height: 100vh;
  }
  
  </style>