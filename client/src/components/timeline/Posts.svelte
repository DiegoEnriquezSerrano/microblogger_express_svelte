<script>

export let posts;

</script>

  {#each posts as post}
    <div class="post" data-postID="{post._id}">
      <div class="post_header">
        <a class="user_avatar" href="http://localhost:4000/{post.user.username}">
          <div class="user_img" style="">
            <img src="http://localhost:5000/assets/{post.user.photo ? `uploads/${post.user.photo}` : 'images/profiledefault.jpg'}" alt="pfp">
          </div>
        </a>
        <p class="post_details_box">
          <a class="userlink" href="http://localhost:4000/{post.user.username}">{post.user.displayname || post.user.username}</a>
          @{post.user.username}<br>
          <span class="time">{post.created}</span>
          <a class="postArrow" href="http://localhost:4000/post/{post._id}">➤</a>
        </p><!--post_details_box-->
      </div><!--post_header-->
      <div class="postContent">
        <p class="postBody">{post.body}</p>
        
      </div><!--postContent-->
      <div class="post_interaction_buttons">
        <button class="reply_post_buttom">
          <svg width="21px" height="16px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Reply</title>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g transform="translate(-60.000000, -919.000000)" fill="#59617d">
                <g transform="translate(56.000000, 160.000000)">
                  <path d="M13.9577278,759 C7.99972784,759 3.26472784,764.127 4.09472784,770.125 C4.62372784,773.947 7.52272784,777.156 11.3197278,778.168 C12.7337278,778.545 14.1937278,778.625 15.6597278,778.372 C16.8837278,778.16 18.1397278,778.255 19.3387278,778.555 L20.7957278,778.919 L20.7957278,778.919 C22.6847278,779.392 24.4007278,777.711 23.9177278,775.859 C23.9177278,775.859 23.6477278,774.823 23.6397278,774.79 C23.3377278,773.63 23.2727278,772.405 23.5847278,771.248 C23.9707278,769.822 24.0357278,768.269 23.6887278,766.66 C22.7707278,762.415 18.8727278,759 13.9577278,759 M13.9577278,761 C17.9097278,761 21.0047278,763.71 21.7337278,767.083 C22.0007278,768.319 21.9737278,769.544 21.6547278,770.726 C20.3047278,775.718 24.2517278,777.722 19.8237278,776.614 C18.3507278,776.246 16.8157278,776.142 15.3187278,776.401 C14.1637278,776.601 12.9937278,776.544 11.8347278,776.236 C8.80772784,775.429 6.49272784,772.863 6.07572784,769.851 C5.40472784,764.997 9.26872784,761 13.9577278,761 L13.9577278,761" id="message-[#1579]"></path>
                </g>
              </g>
            </g>
          </svg>
        </button>
        <button class="relay_post_button">
          <svg width="21px" height="16px" viewBox="0 0 20 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Relay</title>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g transform="translate(-100.000000, -7074.000000)" fill="#59617d">
                <g transform="translate(56.000000, 160.000000)">
                  <path d="M64,6919.75588 L58.343,6914 L56.929,6915.51204 L60.172,6918.7711 L44,6918.7711 L44,6928.32285 L46,6928.32285 L46,6920.68145 L60.172,6920.68145 L56.929,6923.61479 L58.343,6924.88326 L64,6919.75588 Z M62,6935.96425 L47.828,6935.96425 L51.071,6932.70328 L49.657,6931.27052 C44.671,6935.98431 45.809,6934.91069 44,6936.61186 C46.227,6938.72566 44.99,6937.54888 49.657,6942 L51.071,6940.81081 L47.828,6937.8746 L64,6937.8746 L64,6928.32285 L62,6928.32285 L62,6935.96425 Z" id="arrow_repeat-[#241]"></path>
                </g>
              </g>
            </g>
          </svg>
        </button> 
        <button class="delete_post_button">
          <svg width="21px" height="16px" viewBox="0 0 21 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Delete</title>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g transform="translate(-179.000000, -360.000000)" fill="#59617d">
                <g transform="translate(56.000000, 160.000000)">
                  <path d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z" id="delete-[#1487]"></path>
                </g>
              </g>
            </g>
          </svg>
        </button>
      </div><!--post_interaction_buttons-->
    </div><!--post-->
  {/each}


<style>

.post {
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0px 0px 10px -2px rgb(5,5,5);
  color: var(--copy);
  background-color: var(--segment);;
  min-width: 80vw;
  max-width: 100%;
}

.post .post {
  min-width: 70px;
  border: 2px solid var(--bg);
  box-shadow: 0 0 0 0 transparent;
  margin: 10px 0 0 0;
  padding: 10px
}

.post .post .postContent {
  padding: 10px 5px 5px 5px;
}

.relay-text {
  font-size: 0.85rem;
  padding-bottom: 10px;
  display: block;
  color: var(--detail);
}

.post_header {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 55px 1fr;
  grid-template-rows: 55px;
  align-content: start;
  justify-content: start;
  line-height: 1.50em;
  vertical-align: text-bottom;
}

.post_header p {
  padding-left: 10px;
  font-size: 0.9rem;
  line-height: 1.15rem;
  width: 100%;
  overflow: hidden;
}

.post a {
  color: var(--copy);
  text-shadow: -1px 1px 0 rgb(0,0,0);
  font-weight: normal;
  font-family: 'Libre Franklin Bold', 'Monaco', monospace
}

a.user_avatar img {
  max-width: 100%;
  height: auto;
  border-radius: 100%;
}

.user_img {
  display: inline-block;
  max-width: 100%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

a.userlink {
  font-weight: bold;
  font-size: 1.0rem;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  font-size: 0.8rem;
}

.post .postContent {
  padding: 20px 10px;
  text-shadow: -1px 1px 1px rgb(0,0,0);
  font-size: 0.9rem;
}

.post_interaction_buttons button svg g {
  fill: var(--fill);
}

.delete_post_button,
.toggleFollow {
  letter-spacing: 0.10rem;
  font-size: 0.8rem;
  color: var(--detail);
}

.toggleFollow img {
  height: 25px !important;
  width: 25px !important;
}

.post_details_box {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-all;
  color: var(--detail);
  text-shadow: 1px -1px 2px rgb(0,0,0);
}

.postArrow {
  font-size: 1.6em !important;
  vertical-align: bottom;
  display: inline-block;
  height: 0.9em !important;
  overflow: hidden;
  color: var(--detail)! important;
}

.post_details_box {
  font-size: 0.9rem;
  line-height: 1.0rem;
}

.post_interaction_buttons {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-evenly;
}

.post_interaction_buttons button {
  border-radius: 10px;
  background-color: transparent;
}

.post_interaction_buttons button:hover svg g {
  fill: var(--cta);
}

</style>