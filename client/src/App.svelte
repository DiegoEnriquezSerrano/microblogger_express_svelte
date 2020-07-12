<script>

import Sections from "./components/Sections.svelte";
import Index from "./components/Index.svelte";
import Login from "./components/Login.svelte";

let paths;
let page;

const homeDirectory = window.location.origin;

paths = window.location.href.split(homeDirectory + "/").slice(1);
page = paths[0];

let navigate = (e) => {
	page = e.detail;
	console.log(page, 'navigate');
}

let loadPage = (e) => {
  page = e.detail;
}

</script>


<Sections page={page} on:bubbleApp={navigate} />

{#if page == "timeline" || page == "drafts" || page == "published" || page == "liked"}
  <Index page={page} on:bubbleApp={navigate} />
{:else if page == "login"}
  <Login page={page} on:loadPage={loadPage} />
{/if}

<style>

</style>