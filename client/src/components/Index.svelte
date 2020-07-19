<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import Timeline from './timeline/Timeline.svelte';
  import Drafts from './timeline/Drafts.svelte';
  import Published from './timeline/Published.svelte';
  import Liked from './timeline/Liked.svelte';

  export let user;
  export let page;
  let posts;
  let drafts;
  let myPosts;
  let liked;

  $: timelinePosts = posts

  $: pageName = page;
  $: pageNameCapitalized = page[0].toUpperCase() + page.slice(1);

  let getPosts = async () =>{
    await fetch('http://localhost:4000/timelinePosts')
    .then(response => {return response.text()})
    .then(data => {
      posts = Array.from(JSON.parse(data));
      console.log(posts)
      return posts;
    });
  };

  let getPublished = async () => {
    await fetch('http://localhost:4000/publishedPosts')
    .then(response => {return response.text()})
    .then(data => {
      myPosts = Array.from(JSON.parse(data));
      console.log(myPosts)
      return myPosts;
    });
  }

  onMount(() => {
    getPosts();
    getPublished();
  });

</script>

<svelte:head>
  <title>Microblogger | {pageNameCapitalized}</title>
</svelte:head>

  <div id="homeModule">
  {#if pageName == 'timeline'}
    <Timeline posts={timelinePosts} />
  {:else if pageName == 'drafts'}
    <Drafts {drafts} />
  {:else if pageName == 'published'}
    <Published posts={myPosts} {user} />
  {:else if pageName == 'liked'}
    <Liked {liked} />
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