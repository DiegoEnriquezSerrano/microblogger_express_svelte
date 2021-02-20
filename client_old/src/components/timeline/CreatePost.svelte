<script>

let post;
let modalOpen = false;

let modalToggle = (e) => {
  e.target.blur();
  if (modalOpen == false) modalOpen = true;
  else modalOpen = false ;
};

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

<button class="create-post" on:focus={modalToggle}>
  <svg class="icon" width="21px" height="20px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>Edit</title>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-99.000000, -400.000000)" fill="#59617d">
        <g transform="translate(56.000000, 160.000000)">
          <path d="M61.9,258.010643 L45.1,258.010643 L45.1,242.095788 L53.5,242.095788 L53.5,240.106431 L43,240.106431 L43,260 L64,260 L64,250.053215 L61.9,250.053215 L61.9,258.010643 Z M49.3,249.949769 L59.63095,240 L64,244.114985 L53.3341,254.031929 L49.3,254.031929 L49.3,249.949769 Z"></path>
        </g>
      </g>
    </g>
  </svg>
</button>

<div class="create-post-modal {modalOpen == true ? 'open' : ''}">
  <div class="create-post-modal-form">
    <button class="close" id="create-post-modal-close" on:click={modalToggle}>
      <svg class="icon" width="21px" height="20px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>Close</title>
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-419.000000, -240.000000)" fill="#59617d">
            <g transform="translate(56.000000, 160.000000)">
              <polygon points="375.0183 90 384 98.554 382.48065 100 373.5 91.446 364.5183 100 363 98.554 371.98065 90 363 81.446 364.5183 80 373.5 88.554 382.48065 80 384 81.446"></polygon>
            </g>
          </g>
        </g>
      </svg>
    </button><!--close-->
    <div class="post-form">
      <h3>New Post</h3>
      <div class="draft-slider">
        <span id="">Draft?</span>
        <label class="switch">
          <input class="draft-active" value="1" type="checkbox">
          <span class="slider round"></span>
        </label>
      </div><!--draft-slider-->
      <div id="post-feedback">
        <span class="success" id="post-success">Great success.</span>
        <span class="danger" id="post-fail">Couldn't publish. Try again.</span>
      </div><!--post-feedback-->
      <textarea bind:this={post} id="post-body" placeholder="Tell the world how you feel!"></textarea>
      <div id="post-actions">
        <button id="post-submit" on:click={sendPost}>Post</button>
        <button id="post-preview">Preview</button>
      </div><!--post-actions-->
    </div><!--post-form-->
  </div><!--create-post-modal-form-->
</div><!--create-post-modal-->

<style>

.draft-slider {
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

.draft-slider input:checked + .slider {
  background-color: #ffffff;
  box-shadow: inset -1px 1px 4px -1px rgb(25,25,25);
}

.draft-slider input:focus + .slider {
  box-shadow: 0 0 1px #ffffff;
}

.draft-slider input:checked + .slider:before {
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

.create-post-modal {
   display: none;
   position: fixed;
   height: 100vh;
   width: 100vw;
   top: 0;
   left: 0;
   background-color: rgba(5,5,5,0.5);
   place-items: center;
   padding-right: 2.5rem;
   padding-top: 2.5rem;
 }

 .create-post-modal.open {
   display: grid;
 }

 .create-post-modal-form {
  display: grid;
  max-width: calc(100% - 20px);
  min-width: calc(100% - 40px);
  min-height: 150px;
  padding: 20px;
  background-color: var(--segment);
  border-radius: 10px;
  place-items: center;
  transition: all 0.2s;
}

#create-post-modal-close {
  justify-self: start;
}

 button.create-post {
   background-color: var(--cta);
   position: fixed;
   bottom: 4rem;
   right: 4rem;
   border-radius: 50%;
   height: 3.5rem;
   width: 3.5rem;
   display: grid;
   place-content: center;
   border: 2px solid var(--cta);
   box-shadow: 0 2px 5px 0 rgb(5,5,5);
   transition: all 0.2s;
 }

 button.create-post:hover {
   border-color: var(--orange);
 }

 .create-post svg.icon {
   height: 1.5rem;
   width: 1.5rem;
 }

 .create-post .icon g {
   fill: var(--copy);
 }

 .post-form {
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

.post-form > h3 {
  grid-area: heading;
  width: 100%;
  color: var(--copy);
  font-weight: bold;
}

#post-feedback {
  grid-area: body;
  opacity: 0;
}

#post-body {
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

#post-body::placeholder {
  color: var(--detail);
}

#post-body:focus {
  height: 200px;
}

#post-actions {
  grid-area: cta;
  display: grid;
  grid-auto-flow: column;
  justify-content: space-around;
  grid-gap: 20px;
  padding: 20px;
}

#post-actions button {
  cursor: pointer;
  border-radius: 15px;
  padding: 5px 20px;
}

#post-preview {
  cursor: pointer;
  background-color: var(--cta-sec);
  color: var(--detail);
  border: 1px solid var(--bg);
}

.modalOverlay {
  display: none;
  position: fixed;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 2;
}

.modalOverlay.open {
  display: block;
}

</style>