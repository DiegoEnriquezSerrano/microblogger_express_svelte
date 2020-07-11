<script>

	import Sections from "./components/Sections.svelte";
	import Login from "./components/Login.svelte";
	import Index from "./components/Index.svelte";

	let name;
	let paths;

	let homeDirectory = window.location.origin;

	paths = window.location.href.split(homeDirectory + "/").slice(1);

	console.log(paths);

	name = homeDirectory;
	
 
</script>

<Sections />

{#if paths[0] == "login"}
  <Login />
{:else}
  <Index {paths} />
{/if}

<style>

</style>