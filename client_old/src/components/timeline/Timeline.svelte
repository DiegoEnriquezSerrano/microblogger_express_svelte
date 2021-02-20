<script>

import Posts from './Posts.svelte';

export let posts = [];
export let currentUser;

$: currentUser = currentUser;

</script>

<div id="postContainer">
  <Posts {posts} {currentUser} />
</div><!--postContainer-->

<style>

#postContainer {
  padding: 10px;
  width: 100%;
  display: grid;
  grid-auto-flow: row;
  grid-gap: 15px;
  align-content: start;
}
      
</style>