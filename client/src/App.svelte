<script>

	import Sections from "./components/Sections.svelte";
	import Index from "./components/Index.svelte";

	let name;
	let paths;
	let page;

	let homeDirectory = window.location.origin;

	paths = window.location.href.split(homeDirectory + "/").slice(1);
	page = paths[0];
</script>

<Sections />
<Index {page} />

<style>

</style>