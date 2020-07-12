<script>

import { createEventDispatcher } from 'svelte';

export let page;

let dispatch = createEventDispatcher();

function processAjaxData(response, urlPath){
  window.history.pushState({
      "html":response,
      "pageTitle":response.pageTitle
    },
    "",
    urlPath
  );
};

async function navbarClick(e) {
  let path = e.target.pathname.split('/').slice(1).join('/');
  let params = {
    method: 'GET',
    headers: { "Content-Type": "application/json" }
  };

  fetch(path, params)
  .then(response => {
    response = {
      status: response.status,
      response: response
    }
    return response;
    })
  .then(async data => {
    console.log(data);
    let res = await data.response.text();
    if (data.status === 200) {
    processAjaxData(res, path);
    dispatch('loadPage', path);
    }
  });
};

</script>

<nav class="navbar">
  <span class="nav-item"><a class="nav-link" on:click|preventDefault={navbarClick} href="timeline">Feed</a></span>
  <span class="nav-item"><a class="nav-link" on:click|preventDefault={navbarClick} href="published">Published</a></span>
  <span class="nav-item"><a class="nav-link" on:click|preventDefault={navbarClick} href="drafts">Drafts</a></span>
  <span class="nav-item"><a class="nav-link" on:click|preventDefault={navbarClick} href="liked">Liked</a></span>
</nav>

<style>
.navbar {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-evenly;
  align-items: center;
  margin: 0;
  background-color: var(--segment);
  box-shadow: 2px 2px 6px -4px rgb(0,0,0);
  border: 0;
  position: fixed;
  top: 0px;
  left: 0px;
  width: calc(100% - 2.5rem);
  height: 50px;
  z-index: 4;
}

.navbar a {
  color: var(--copy);
  display: block;
  padding: 7px 7px;
  border-radius: 1em;
  text-align: center;
  border: 1px solid transparent;
  text-shadow: -1px 1px 1px rgb(0,0,0);
  font-size: 0.9rem;
}

.navbar a.active {
  background-color: var(--fill);
  color: #fff;
  box-shadow: inset -1px 1px 5px -1px rgba(0,0,0,0.4);
}

.navbar a:hover {
  color: var(--cta);
}
</style>