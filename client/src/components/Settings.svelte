<script>

  import { createEventDispatcher } from 'svelte';
  import axios from 'axios';

  export let page;
  export let currentUser = {};

  let userForm = {}
  let body;
  let photo;
  $: form = userForm;

  $: pageName = page;
  $: pageNameCapitalized = page[0].toUpperCase() + page.slice(1);


  let formClick = async (e) => {
    let file = photo;
    let formData = new FormData();

    formData.append('file', file.files[0]);
    formData.append('username', form[1].value);
    formData.append('displayname', form[2].value);
    formData.append('bio', form[3].value);

    await axios.post('/settings', formData)
    .then(response => {
      console.log(response.data);
    });
  };
  
</script>

<svelte:head>
  <title>Microblogger | {pageNameCapitalized}</title>
</svelte:head>

<div id="settingsModule">
  <div id="settingsContainer">
    {#if page == "settings"}
      <form enctype="multipart/form-data" id="edit_form" method="POST" action="/profile" bind:this={userForm}>
        <div class="user_img" style="">
          <div class="row">
            <input type="file" bind:this={photo} name="photo" id="photo" accept="image/gif, image/png, image/jpeg" />
            <label for="photo">
              <svg width="15px" height="15px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>Edit</title>
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-99.000000, -400.000000)" fill="#fff">
                    <g transform="translate(56.000000, 160.000000)">
                      <path d="M61.9,258.010643 L45.1,258.010643 L45.1,242.095788 L53.5,242.095788 L53.5,240.106431 L43,240.106431 L43,260 L64,260 L64,250.053215 L61.9,250.053215 L61.9,258.010643 Z M49.3,249.949769 L59.63095,240 L64,244.114985 L53.3341,254.031929 L49.3,254.031929 L49.3,249.949769 Z"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </label>
          </div><!--row-->
        </div><!--user_img-->
        <label for="username" class="label">Username</label>
        <input class="input" name="username" value="{currentUser.username || null}" required>
        <label for="displayname" class="label">Display name</label>
        <input class="input" name="displayname" value="{currentUser.displayname || null}">
        <label for="bio" class="label">Bio</label>
        <textarea name="bio" class="input">{currentUser.bio || null}</textarea>
        <hr>
        <button class="button" type="submit" value="Submit" on:click|preventDefault={formClick}>Save</button>
      </form>
    {:else if page == "account"}
      <form id="edit_form" method="POST" action="/account">
        <label for="email" class="label">Email</label>
        <input class="input" name="email" value="{currentUser.email}" type="email" required>
        <label for="oldPassword" class="label">Password</label>
        <input class="input" name="oldPassword" type="password" value="">
        <label for="newPassword" class="label">New Password</label>
        <input class="input" name="newPassword" type="password" value="">
        <label for="newPasswordConfirm" class="label">Re-type New Password</label>
        <input class="input" name="newPasswordConfirm" type="password" value="">
        <hr>
        <button class="button" type="submit" value="Submit" id="editFormSubmit">Save</button>
      </form>
    {/if}
  </div><!--settingsContainer-->
</div><!--settingsModule-->


<style>

#settingsModule {
  display: grid;
  padding: 65px 15px 10px 15px;
  width: calc(100vw - 2.5rem)
}

#settingsContainer {
  min-width: 250px;
  max-width: 700px;
  width: 100%;
  background-color: var(--segment);
  border-radius: 10px;
  box-shadow: 0 0 8px 0 rgb(5,5,5);
  text-align: center;
  align-items: center;
}

#edit_form {
  text-align: left;
  display: grid;
  align-content: stretch
}

#edit_form hr {
  border: 0;
  height: 2px;
  background-color: var(--bg);
  margin: 15px 0;
}

.label {
  padding: 15px 0 0 0;
  color: var(--detail);
  margin: 0 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.input {
  padding: 10px;
  background-color: transparent;
  border: 2px solid var(--bg);
  border-radius: 5px;
  color: var(--copy);
  font-size: 0.9rem;
  margin: 5px 20px;
  max-width: calc(100% - 40px);
  width: 100%;
  transition: all 0.3s;
}

.input:focus {
  border: 1px solid var(--orange);
}

.user_img {
  display: inline-block;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: cover;
  background-position: center; 
  margin: 20px 5px 0px;
}

[type="file"] {
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  overflow: hidden;
  padding: 0;
  position: absolute !important;
  white-space: nowrap;
  width: 1px; 
}

[type="file"] + label {
  background-color: var(--cta);
  border-radius: 50%;
  cursor: pointer;
  display: inline-block;
  height: 30px;
  width: 30px;
  padding: 8px;
  transition: background-color 0.3s;
  position: absolute;
  margin-left: 25px;
}
 
[type="file"]:focus + label,
[type="file"] + label:hover {
  background-color: var(--orange);
}
 
[type="file"]:focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}

button {
  justify-self: center;
  margin: 5px 0 20px 0;
}

button:hover {
  border: 2px solid var(--orange);
  cursor: pointer;
}

</style>