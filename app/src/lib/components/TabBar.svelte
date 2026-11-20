<script lang="ts">
	import { page } from '$app/state';
	import { CircleCheck, Wallet, Plus, User } from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';

	const tabs = [
		{ href: '/', label: m.tab_today, icon: CircleCheck },
		{ href: '/stakes', label: m.tab_stakes, icon: Wallet },
		{ href: '/new', label: m.tab_new, icon: Plus },
		{ href: '/me', label: m.tab_me, icon: User }
	];

	const isActive = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<nav>
	{#each tabs as tab (tab.href)}
		<a href={tab.href} class:active={isActive(tab.href)} aria-current={isActive(tab.href) ? 'page' : undefined}>
			<tab.icon size={22} strokeWidth={isActive(tab.href) ? 2.4 : 1.8} />
			<span>{tab.label()}</span>
		</a>
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		inset: auto 0 0 0;
		z-index: 10;
		height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
		padding-bottom: env(safe-area-inset-bottom);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		background: var(--bg);
		border-top: 1px solid var(--border);
	}

	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		font-size: 0.6875rem;
		color: var(--muted);
	}

	a.active {
		color: var(--accent);
		font-weight: 600;
	}
</style>
