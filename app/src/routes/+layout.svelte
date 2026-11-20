<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { settings, initSettings, applySettings } from '#lib/settings.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Page switch: native View Transitions (fade + slight rise), no-op where unsupported
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// Theme: load saved settings, then re-apply whenever they (or the OS theme) change
	onMount(() => {
		initSettings();
		const mq = matchMedia('(prefers-color-scheme: dark)');
		const onOs = () => settings.mode === 'system' && applySettings();
		mq.addEventListener('change', onOs);
		return () => mq.removeEventListener('change', onOs);
	});

	$effect(() => {
		void [settings.mode, settings.accent, settings.font];
		applySettings();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
