<script>

import { onMount } from "svelte";
import { isAuthenticated } from './javascript/functions.js';
import Sections from "./components/Sections.svelte";
import Index from "./components/Index.svelte";
import Directory from "./components/Directory.svelte";
import Settings from "./components/Settings.svelte";
import Login from "./components/Login.svelte";
import Navbar from "./components/Navbar.svelte";

export let user = {};

const homeDirectory = window.location.origin;

let pathList = [
  'timeline',
  'drafts',
  'published',
  'liked',
  'directory',
  'login',
  'settings',
  'account'
]

let paths = window.location.href.split(homeDirectory + "/").slice(1);
let page = paths[0];
$: currentUser = user;
$: currentPage = page;

let loadPage = (e) => {
  page = e.detail;
}

let authenticated = (e) => {
  user = e.detail;
}

onMount(async () => {
  user = await isAuthenticated();
  if (user.status == 200) {
  user = await user.text();
  user = JSON.parse(user);
  console.log(user)
  };

  if (!pathList.find(url => url === currentPage)) {
  let params = { method: 'GET', headers: { "Content-Type": "application/json" }};
  await fetch(`/findUser?${currentPage}`, params)
    .then(response => {
      if (response.status !== 200) {
        page = 'login';
        return;
      }
      return response.text()})
    .then(data => console.log(data))
  }
});

</script>

<Sections page={page} on:loadPage={loadPage} />

{#if
  page == "timeline" || page == "drafts" || page == "published" || page == "liked" }

  <Navbar {page} on:loadPage={loadPage} />
  <Index {page} {currentUser} />

{:else if page == "directory"}

  <Navbar {page} on:loadPage={loadPage} />
	<Directory {page} />

{:else if page == "login"}

  <Login {page} on:loadPage={loadPage} on:userLogin={authenticated} />

{:else if page == "settings" || page == "account"}

  <Navbar {page} on:loadPage={loadPage} />
  <Settings {page} on:userUpdate={authenticated} {currentUser} />

{/if}

<style>

</style>