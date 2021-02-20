<script>

  import { createEventDispatcher, onMount } from 'svelte';

  let posts;
  let drafts;
  let myPosts;
  let liked;

  $: timelinePosts = posts;
  $: currentUser = currentUser;

  let getPosts = async () =>{
    await fetch('http://localhost:4000/timelinePosts')
    .then(response => {return response.text()})
    .then(data => {
      posts = Array.from(JSON.parse(data));
      return posts;
    });
  };

  let getPublished = async () => {
    await fetch('http://localhost:4000/publishedPosts')
    .then(response => {return response.text()})
    .then(data => {
      myPosts = Array.from(JSON.parse(data));
      return myPosts;
    });
  }

  onMount(() => {
		
  });

</script>

<svelte:head>
  <title>Microblogger</title>
</svelte:head>

  <div id="homeModule">

  </div><!--homeModule-->


  <style>

  #homeModule {
    display: grid;
    padding-top: 50px;
    width: calc(100% - 2.5rem);
    min-height: 100vh;
  }
  
  </style>