<script>

import { createEventDispatcher } from 'svelte';

export let user = {};

let dispatch = createEventDispatcher();

let homeModule;
let loginActive;
let username;
let email;
let password;
let active = false;
let url;
let params = {};
let body = {};

let loginToggle = (e) => {
  if (loginActive.value == 1) {
    loginActive.value = 0;
    active = true;
  } else {
    loginActive.value = 1;
    active = false;
  }
};

let authenticate = async (e) => {
  e.target.blur();
  body = {
    username: username.value,
    password: password.value,
    email: email.value,
  }
  if (body.username != "" && body.email != "" && body.password != "" && active == true) {
    let url = "http://localhost:4000/register";
    let params = {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body), 
      headers: { "Content-Type": "application/json" }
    };

    await fetch(url, params)
    .then(response => {return response.text()})
    .then(data =>  {
      let res = JSON.parse(data);
      console.log(res);
    });
  };
};

let login = async (e) => {
  e.target.blur();
  body.password = password.value;
  body.email = email.value;
  if (body.email != "" && body.password != "" && active == false) {
    let url = "http://localhost:4000/login";
    let params = {
      method: 'POST',
      body: JSON.stringify(body), 
      headers: { "Content-Type": "application/json" }
    };
    fetch(url, params);
  };
};

</script>

<svelte:head>
  <title>Microblogger | Login</title>
</svelte:head>

  <div id="homeModule">
    <div id="theLinkContainer">
      <a id="theLink" href="/">
        <span class="first">o</span>
        <span class="second">yea<span class="the_H">h?</span></span>
      </a>
    </div><!--theLink-->
    <div id="auth_box">
      <form method="POST" action="/login">
        <div id="auth_box_bod">
          <input type="hidden" name="loginActive" value="1" bind:this={loginActive}>
          <input type="email" name="email" placeholder="Email address" bind:this={email}>
          <input type="password" name="password" placeholder="Password" bind:this={password}>
          {#if active == true}
          <input type="text" name="username" placeholder="Username" bind:this={username}>
          {/if}
        </div><!--'auth_box_bod'-->
      </form>
      {#if active == true}
        <button class="button" on:focus={authenticate}>Register</button>
      {:else}
        <button class="button" on:click={login}>Login</button>
      {/if}
      <div id="auth_box_foot">
        <p>New user? <a id="toggle_auth_box_login" on:click={loginToggle}>Create an account.</a></p>
        <p>Forgot password? <a id="auth_box_close">Reset.</a></p>
      </div><!--'auth_box_foot'-->
    </div><!--'auth_box'-->
  </div><!--'#homeModule'-->


<style>

#homeModule {
  padding: 20px;
  width: calc(100% - 2.5rem);
}

#auth_box {
  position: relative;
  display: block;
  width: 100%;
  background-color: transparent;
  border-radius: 5px;
  text-align: center;
}

#auth_box_foot p {
  color: var(--detail);
  padding-top: 15px;
}

#auth_box_foot a {
  color: var(--cta2);
}

form {
  display: grid;
  grid-auto-flow: row;
  justify-items: center;
  padding: 0;
}

form input {
  display: inline-block;
  width: 100%;
  padding: 10px;
  border: 1px solid rgb(49,50,56);
  border-radius: 5px;
  background: rgb(19,20,26);
  color: var(--copy);
  text-shadow: 0 1px 2px rgb(30,30,30);
  line-height: 1.3rem;
  font-size: 0.9rem;
  font-weight: normal;
  text-align: center;
  opacity: 1.0;
  transition: opacity 0.5s;
  overflow: visible;
  box-shadow: inset -3px 3px 5px -1px rgb(0,0,0);
  margin-bottom: 10px;
}

form input::placeholder {
  color: var(--fill);
  opacity: 0.8;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 0.05rem;
}

form input:hover {
  cursor: pointer;
}

form input:focus {
  cursor: text;
  outline: 0;
}

form input:focus::placeholder {
  opacity: 0;
}

#theLink {
  font-size: 3rem! important;
  display: inline-block;
  word-spacing: -3rem;
  color: var(--cta);
  text-shadow: -1px 1px 3px rgb(0,0,0);
  font-weight: bold;
}

.the_H {
  text-transform: lowercase;
  font-size: 5rem;
  letter-spacing: -0.5rem;
}

.first {
  display: block;
  position: absolute;
  margin-top: -1.3rem;
  margin-left: 3.5rem;
}

.second {
  display: inline-block;
}

#theLinkContainer {
  padding: 25px;
  text-align: center;
}
    
</style>