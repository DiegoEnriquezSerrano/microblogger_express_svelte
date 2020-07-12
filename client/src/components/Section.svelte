<script>
import { createEventDispatcher } from 'svelte';

export let key;
export let section;
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

async function sectionClick(path) {
  let text;
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
    dispatch('bubbleSection', path);
    }
  });
};

</script>

  <a class="sectionLink" href={key} on:click|preventDefault={sectionClick(key)}>
    {@html section.icon}
    <span class="sectionLinkText">{section.name}</span>
  </a>