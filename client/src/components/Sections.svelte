<script>

import Section from './Section.svelte';
import { sections } from '../javascript/sections.js';
import { createEventDispatcher } from 'svelte';

export let page;

let dispatch = createEventDispatcher();

let expandSections = (e) => {
  e.target.parentElement.classList.toggle('expanded');
  e.target.blur();
}

let bubbleUp = (e) => {
  dispatch('loadPage', e.detail);
}
</script>


<nav id="sectionsModule">
  <div id="sectionsContainer">

    <button class="sectionLink" id="sections_expander" on:focus={expandSections}>
      <svg class="icon" width="21px" height="15px" viewBox="0 0 21 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>Menu</title>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-179.000000, -322.000000)" fill="#59617d">
            <g transform="translate(56.000000, 160.000000)">
              <path d="M124.575,174 C123.7056,174 123,174.672 123,175.5 C123,176.328 123.7056,177 124.575,177 C125.4444,177 126.15,176.328 126.15,175.5 C126.15,174.672 125.4444,174 124.575,174 L124.575,174 Z M128.25,177 L144,177 L144,175 L128.25,175 L128.25,177 Z M124.575,168 C123.7056,168 123,168.672 123,169.5 C123,170.328 123.7056,171 124.575,171 C125.4444,171 126.15,170.328 126.15,169.5 C126.15,168.672 125.4444,168 124.575,168 L124.575,168 Z M128.25,171 L144,171 L144,169 L128.25,169 L128.25,171 Z M124.575,162 C123.7056,162 123,162.672 123,163.5 C123,164.328 123.7056,165 124.575,165 C125.4444,165 126.15,164.328 126.15,163.5 C126.15,162.672 125.4444,162 124.575,162 L124.575,162 Z M128.25,165 L144,165 L144,163 L128.25,163 L128.25,165 Z"></path>
            </g>
          </g>
        </g>
      </svg>
      <span class="filler"></span>
    </button>

    {#each Object.keys($sections) as key}
      <Section {page} key={key} section={$sections[key]} on:bubbleUp={bubbleUp} />
    {/each}

    <a class="sectionLink" href='logout'>
      <svg class="icon" width="21px" height="20px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>logout</title>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-419.000000, -560.000000)" fill="#59617d">
            <g transform="translate(56.000000, 160.000000)">
              <path d="M378.381271,401.145 C377.596921,400.752 376.64982,401.278 376.64982,402.123 C376.64982,402.552 376.91862,402.925 377.316571,403.126 C380.236622,404.602 382.110873,407.716 381.575372,411.174 C381.046172,414.602 378.050521,417.343 374.434319,417.728 C369.515067,418.251 365.333966,414.581 365.333966,410 C365.333966,407.004 367.121066,404.4 369.733467,403.101 C370.102018,402.918 370.349818,402.572 370.349818,402.176 L370.349818,402.084 C370.349818,401.256 369.423717,400.745 368.651967,401.129 C364.951765,402.966 362.545164,406.841 363.072265,411.191 C363.624565,415.742 367.515866,419.43 372.296519,419.936 C378.634321,420.607 383.999823,415.9 383.999823,410 C383.999823,406.155 381.722372,402.818 378.381271,401.145 M372.449819,409 L372.449819,401 C372.449819,400.447 372.920219,400 373.499819,400 C374.080469,400 374.549819,400.447 374.549819,401 L374.549819,409 C374.549819,409.552 374.080469,410 373.499819,410 C372.920219,410 372.449819,409.552 372.449819,409"></path>
            </g>
          </g>
        </g>
      </svg>
      <span class="sectionLinkText">Logout</span>
    </a>

  </div><!--sectionContainer-->
</nav><!--sectionsModule-->