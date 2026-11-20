<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import TopBar from '#lib/components/TopBar.svelte';
	import TabBar from '#lib/components/TabBar.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import About from '#lib/components/About.svelte';
	import Calendar from '#lib/components/Calendar.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { day, dayKind, setDay } from '#lib/day.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	let aboutOpen = $state(false);
	let calendarOpen = $state(false);

	const infos: Record<string, () => string> = {
		'/': m.info_today,
		'/stakes': m.info_stakes,
		'/new': m.info_new,
		'/me': m.info_me
	};

	const titles: Record<string, () => string> = {
		'/': m.tab_today,
		'/stakes': m.tab_stakes,
		'/new': m.title_new,
		'/me': m.tab_me
	};

	const isHome = $derived(page.url.pathname === '/');
	const title = $derived(
		isHome && dayKind(day.date) !== 0
			? day.date.toLocaleDateString(getLocale(), { weekday: 'long' })
			: (titles[page.url.pathname]?.() ?? m.app_name())
	);
	const info = $derived(infos[page.url.pathname]?.());
	const subtitle = $derived(
		isHome
			? day.date.toLocaleDateString(getLocale(), { weekday: 'short', day: 'numeric', month: 'short' })
			: undefined
	);
</script>

<svelte:head>
	<title>{title} · {m.app_name()}</title>
</svelte:head>

<TopBar
	{title}
	{subtitle}
	{info}
	onlogo={() => (aboutOpen = true)}
	ondate={isHome ? () => (calendarOpen = true) : undefined}
/>

<main>
	{@render children()}
</main>

<TabBar />

<Modal bind:open={aboutOpen} title={m.app_name()}>
	{#snippet icon()}<Logo size={32} />{/snippet}
	<About />
</Modal>

<Modal bind:open={calendarOpen} title={m.calendar_title()}>
	<Calendar
		selected={day.date}
		onselect={(d) => {
			setDay(d);
			calendarOpen = false;
		}}
	/>
</Modal>

<style>
	main {
		max-width: 560px;
		margin: 0 auto;
		padding: calc(var(--topbar-h) + env(safe-area-inset-top) + 16px) 16px
			calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 16px);
		min-height: 100dvh;
	}
</style>
