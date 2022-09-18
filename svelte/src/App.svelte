<script lang="ts">
	import { onMount } from 'svelte'

	import Root from './routes/Root.svelte'
	import Server from './routes/Server.svelte'
	import Upload from './routes/Upload.svelte'

	import { route } from './stores/route'
	let curr = Root;

	onMount(async () => {
		$route = '/';
		curr = Root;
	});

	route.subscribe(() => {
		switch($route) {
			case '/':
				curr = Root;
				break;
			case '/upload':
				curr = Upload;
				break;
			case '/server':
				curr = Server;
				break;
			default:
				break;
		}
	});


</script>

<main>
	<svelte:component this={curr} />
</main>

<style>
</style>