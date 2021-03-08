<script context="module">

export async function preload(page) {
  let user = false;
  const res = await this.fetch(`http://localhost:4000/timeline`, { method: 'GET', credentials: 'include' });
  if (res.status == 201) user = await res.json();
  return { user }
}

</script>

<script>
  
  export let user;

  console.log(user)

</script>