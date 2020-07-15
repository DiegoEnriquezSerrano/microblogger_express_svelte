<script>

  import { createEventDispatcher, onMount } from 'svelte';

  export let page;

  $: users = [];

  $: pageName = page;
  $: pageNameCapitalized = page[0].toUpperCase() + page.slice(1);

  async function showUsers() {
    let path = 'http://localhost:4000/getUsers';
    let params = { method: 'GET', headers: { "Content-Type": "application/json" } };
    fetch(path, params)
    .then(async response => {
      users = await response.text();
      users = JSON.parse(users);
    })
  };

  onMount(() => {
    showUsers();
  })

</script>

<svelte:head>
  <title>Microblogger | {pageNameCapitalized}</title>
</svelte:head>

<div id="usersModule">
  <div id="usersContainer">
    {#each users as user}
      <div class="userNode">
        <div class="userNodeInfo">
          <a class="user_avatar" href="/">
            <div class="user_img">
              <img src="http://localhost:5000/assets/{user.photo ?  `uploads/${user.photo}` : 'images/profiledefault.jpg'}" alt="avatar" />
            </div>
          </a>
          <br>
          <a class="userName" href="/">{user.displayname || user.username}</a><br>
          <span>@{user.username}</span><br>
          <p class="userNodeBio">{user.bio || ""}</p>
        </div><!--userNodeInfo-->
        <div class="userNodeActions">
          <a class="toggleFollow" href="/">
            <svg class="icon" width="20px" height="22px" viewBox="0 0 20 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>follow</title>
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(-100.000000, -2159.000000)" fill="#59617d">
                  <g transform="translate(56.000000, 160.000000)">
                    <path d="M58.0831232,2004.99998 C58.0831232,2002.79398 56.2518424,2000.99998 54,2000.99998 C51.7481576,2000.99998 49.9168768,2002.79398 49.9168768,2004.99998 C49.9168768,2007.20598 51.7481576,2008.99998 54,2008.99998 C56.2518424,2008.99998 58.0831232,2007.20598 58.0831232,2004.99998 M61.9457577,2018.99998 L60.1246847,2018.99998 C59.5612137,2018.99998 59.1039039,2018.55198 59.1039039,2017.99998 C59.1039039,2017.44798 59.5612137,2016.99998 60.1246847,2016.99998 L60.5625997,2016.99998 C61.26898,2016.99998 61.790599,2016.30298 61.5231544,2015.66198 C60.2869889,2012.69798 57.3838883,2010.99998 54,2010.99998 C50.6161117,2010.99998 47.7130111,2012.69798 46.4768456,2015.66198 C46.209401,2016.30298 46.73102,2016.99998 47.4374003,2016.99998 L47.8753153,2016.99998 C48.4387863,2016.99998 48.8960961,2017.44798 48.8960961,2017.99998 C48.8960961,2018.55198 48.4387863,2018.99998 47.8753153,2018.99998 L46.0542423,2018.99998 C44.7782664,2018.99998 43.7738181,2017.85698 44.044325,2016.63598 C44.7874534,2013.27698 47.1076881,2010.79798 50.1639058,2009.67298 C48.7695192,2008.57398 47.8753153,2006.88998 47.8753153,2004.99998 C47.8753153,2001.44898 51.0234032,1998.61898 54.7339414,1999.04198 C57.422678,1999.34798 59.6500217,2001.44698 60.0532301,2004.06998 C60.4002955,2006.33098 59.4560733,2008.39598 57.8360942,2009.67298 C60.8923119,2010.79798 63.2125466,2013.27698 63.955675,2016.63598 C64.2261819,2017.85698 63.2217336,2018.99998 61.9457577,2018.99998 M57.0623424,2017.99998 C57.0623424,2018.55198 56.6050326,2018.99998 56.0415616,2018.99998 L55.2290201,2018.99998 C55.2290201,2019.99998 55.3351813,2020.99998 54.2082393,2020.99998 C53.6437475,2020.99998 53.1874585,2020.55198 53.1874585,2019.99998 L53.1874585,2018.99998 L51.9584384,2018.99998 C51.3949674,2018.99998 50.9376576,2018.55198 50.9376576,2017.99998 C50.9376576,2017.44798 51.3949674,2016.99998 51.9584384,2016.99998 L53.1874585,2016.99998 L53.1874585,2015.99998 C53.1874585,2015.44798 53.6437475,2014.99998 54.2082393,2014.99998 C54.7717103,2014.99998 55.2290201,2015.44798 55.2290201,2015.99998 L55.2290201,2016.99998 L56.0415616,2016.99998 C56.6050326,2016.99998 57.0623424,2017.44798 57.0623424,2017.99998"></path>
                  </g>
                </g>
              </g>
            </svg>
          </a>
          <a href="/">
            <svg class="icon" width="30px" height="30px" viewBox="0 0 20 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>Message</title>
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(-300.000000, -922.000000)" fill="#59617d">
                  <g transform="translate(56.000000, 160.000000)">
                    <path d="M262,764.291 L254,771.318 L246,764.281 L246,764 L262,764 L262,764.291 Z M246,775 L246,766.945 L254,773.98 L262,766.953 L262,775 L246,775 Z M244,777 L264,777 L264,762 L244,762 L244,777 Z"></path>
                  </g>
                </g>
              </g>
            </svg>
          </a>
          <a href="/">
            <svg class="icon" width="30px" height="30px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>Block</title>
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g transform="translate(-219.000000, -600.000000)" fill="#59617d">
                  <g transform="translate(56.000000, 160.000000)">
                    <path d="M177.7,450 C177.7,450.552 177.2296,451 176.65,451 L170.35,451 C169.7704,451 169.3,450.552 169.3,450 C169.3,449.448 169.7704,449 170.35,449 L176.65,449 C177.2296,449 177.7,449.448 177.7,450 M173.5,458 C168.86845,458 165.1,454.411 165.1,450 C165.1,445.589 168.86845,442 173.5,442 C178.13155,442 181.9,445.589 181.9,450 C181.9,454.411 178.13155,458 173.5,458 M173.5,440 C167.70085,440 163,444.477 163,450 C163,455.523 167.70085,460 173.5,460 C179.29915,460 184,455.523 184,450 C184,444.477 179.29915,440 173.5,440"></path>
                  </g>
                </g>
              </g>
            </svg>
          </a>
        </div><!--userNodeActions-->
      </div><!--userNode-->
    {/each}
  </div><!--usersContainer-->
</div><!--usersModule-->

<style>

#usersModule {
  display: block;
  width: calc(100% - 2.5rem);
  padding-top: 50px;
}

#usersContainer {
  background: transparent;
  display: grid;
  grid-auto-flow: row;
  padding: 10px 15px;
  z-index: 0;
}

.userNode {
  min-width: 100%;
  min-height: 12rem;
  max-height: 12rem;
  border-radius: 5px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 0 8px -2px rgb(5,5,5);
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  margin: 5px 0px 15px 0px;
  word-wrap: break-all;
  hyphens: auto;
  color: var(--detail);
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 50px;
  background-color: var(--segment);
}

.userName {
  color: var(--copy);
  font-family: 'Libre Franklin Bold', 'Arial', 'sans-serif';
  font-weight: bold;
  font-size: 1.0rem;
  line-height: 1.0rem;
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: inline;
  vertical-align: top;
}

.userNodeActions {
  text-align: center;
  padding: 5px;
  display: grid;
  grid-auto-flow: row;
  justify-content: space-evenly;
  align-items: center;
  max-height: 12rem;
  background-color: var(--fg);
  border-left: 2px solid var(--bg);
}

.userNodeActions a svg {
  width: 30px;
  height: 30px;
}

.userNodeActions a svg g {
  fill: var(--fill);
}

.userNode img {
  max-width: 70px;
  max-height: 70px;
  width: 100%;
  height: auto;
  border-radius: 50px;
}

.user_img {
  display: inline-block;
  max-width: 6rem;
  max-height: 6rem;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.userNodeBio {
  display: block;
  padding: 15px;
  font-size: 0.9rem;
}

.userNodeInfo {
  background-color: var(--segment);
  text-align: center;
  padding: 20px 5px;
  font-size: 0.8rem;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  max-height: 12rem;
}
</style>