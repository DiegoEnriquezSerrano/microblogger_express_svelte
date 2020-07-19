<script>

import Posts from './Posts.svelte';

export let posts = [];

let post;

let sendPost = async () => {
  let body = {
    body: post.value,
  };
  let params = {
    method: 'POST',
    body: JSON.stringify(body), 
    headers: { "Content-Type": "application/json" }
  };
  await fetch('/timeline', params);
}

</script>

<div id="postContainer">
  <div class="postForm">
    <h3>New Post</h3>
    <div class="draftSlider">
      <span id="">Draft?</span>
      <label class="switch">
        <input class="draftActive" value="1" type="checkbox">
        <span class="slider round"></span>
      </label>
    </div><!--draftSlider-->
    <div id="postFeedback">
      <span class="success" id="postSuccess">Great success.</span>
      <span class="danger" id="postFail">Couldn't publish. Try again.</span>
    </div><!--postFeedback-->
    <textarea bind:this={post} id="postBody" placeholder="Tell the world how you feel!"></textarea>
    <div id="postActions">
      <button id="postSubmit" on:click={sendPost}>Post</button>
      <button id="postPreview">Preview</button>
    </div><!--postActions-->
  </div><!--postForm-->

<Posts {posts} />
  
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

.draftSlider {
  grid-area: slider;
  width: 100%;
  height: 100%;
  display: grid;
  grid-auto-flow: row;
  align-content: center;
  justify-items: center;
  padding: 5px 0.2rem;
  color: var(--detail);
}

.switch {
  position: relative;
  display: inline-block;
  width: 3.0rem;
  height: 0.9rem;
  margin-top: 2px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--fill);
  -webkit-transition: .4s;
  transition: .4s;
  box-shadow: inset -1px 1px 3px -1px rgb(25,25,25);
}

.slider:before {
  position: absolute;
  content: "";
  height: 0.95rem;
  width: 0.95rem;
  left: 0;
  background-color: var(--cta);
  top: 0px;
  -webkit-transition: .4s;
  transition: .4s;
}

.draftSlider input:checked + .slider {
  background-color: #ffffff;
  box-shadow: inset -1px 1px 4px -1px rgb(25,25,25);
}

.draftSlider input:focus + .slider {
  box-shadow: 0 0 1px #ffffff;
}

.draftSlider input:checked + .slider:before {
  -webkit-transform: translateX(34px);
  -ms-transform: translateX(34px);
  transform: translateX(34px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.postForm {
  display: grid;
  justify-items: center;
  align-items: center;
  background-color: var(--segment);
  border-radius: 10px;
  width: 100%;
  overflow: visible;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    "heading   heading   slider"
    "body      body      body"
    "cta       cta       cta";
  left: 0;
  z-index: 3;
  transition: margin-top 0.5s;
}

.postForm > h3 {
  grid-area: heading;
  width: 100%;
  color: var(--copy);
  font-weight: bold;
}

#postFeedback {
  grid-area: body;
  opacity: 0;
}

#postBody {
  display: block;
  height: 2.8rem;
  width: inherit;
  border-radius: 10px;
  background-color: transparent;
  padding: 10px;
  transition: all 0.5s ease-in-out;
  box-sizing: border-box;
  grid-area: body;
  color: var(--copy);
  border: 2px solid var(--bg);
}

#postBody::placeholder {
  color: var(--detail);
}

#postBody:focus {
  height: 200px;
}

#postActions {
  grid-area: cta;
  display: grid;
  grid-auto-flow: column;
  justify-content: space-around;
  grid-gap: 20px;
  padding: 20px;
}

#postActions button {
  cursor: pointer;
  border-radius: 15px;
  padding: 5px 20px;
}

#postPreview {
  cursor: pointer;
  background-color: var(--cta-sec);
  color: var(--detail);
  border: 1px solid var(--bg);
}

#loginAlert,
#postSuccess,
#postFail {
  display: none;
}

.post_deleted {
  display: block! important;
  width: 80%;
  background-color: var(--navy);
  padding: 15px;
  border-radius: 15px;
  border: 1px solid var(--lightblue);
}
      
</style>