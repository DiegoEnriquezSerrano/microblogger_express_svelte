<script>

import { onMount } from "svelte";
import { isAuthenticated } from './javascript/functions.js';
import Sections from "./components/Sections.svelte";
import Index from "./components/Index.svelte";
import Directory from "./components/Directory.svelte";
import Settings from "./components/Settings.svelte";
import Login from "./components/Login.svelte";
import Navbar from "./components/Navbar.svelte";

let paths;
let page;
$: currentUser = user;

export let user = {};

const homeDirectory = window.location.origin;

paths = window.location.href.split(homeDirectory + "/").slice(1);
page = paths[0];

let loadPage = (e) => {
  page = e.detail;
  console.log(page)
}

let authenticated = (e) => {
  user = e.detail;
}

onMount(async () => {
  user = await isAuthenticated();
  if (user.status == 200) {
  user = await user.text();
  user = JSON.parse(user);
  };
});

</script>

<Sections page={page} on:loadPage={loadPage} />

{#if
  page == "timeline" || page == "drafts" || page == "published" || page == "liked" }

  <Navbar {page} on:loadPage={loadPage} />
  <Index {page} />

{:else if page == "directory"}

  <Navbar {page} on:loadPage={loadPage} />
	<Directory {page} />

{:else if page == "login"}

  <Login {page} on:loadPage={loadPage} on:userLogin={authenticated} />

{:else if page == "settings" || page == "account"}

  <Navbar {page} on:loadPage={loadPage} />
  <Settings {page} {currentUser} />

{/if}

<style>

</style>