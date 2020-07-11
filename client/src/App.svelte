<script>
	export let name;
	
	let homeDirectory = window.location.origin;
	let paths = window.location.href.split(homeDirectory + "/").slice(1);

	console.log(paths);

	name = homeDirectory;

	import Sections from "./components/Sections.svelte";
	import Login from "./components/Login.svelte";
	import Index from "./components/Index.svelte";

</script>

<Sections />

{#if paths[0] == "login"}
<Login />
{:else if paths[0] == "timeline"}
<Index />
{/if}

<style>

</style>