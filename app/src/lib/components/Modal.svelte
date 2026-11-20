<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { X } from '@lucide/svelte';

	interface Props {
		open: boolean;
		title?: string;
		icon?: Snippet;
		children: Snippet;
	}

	let { open = $bindable(), title, icon, children }: Props = $props();

	const close = () => (open = false);
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && close()} />

{#if open}
	<div class="backdrop" transition:fade={{ duration: 150 }} onclick={close} aria-hidden="true"></div>
	<div
		class="sheet"
		role="dialog"
		aria-modal="true"
		aria-label={title}
		transition:fly={{ y: 40, duration: 240, easing: cubicOut }}
	>
		<div class="head">
			{#if icon}<span class="icon">{@render icon()}</span>{/if}
			{#if title}<h2>{title}</h2>{/if}
			<button class="close" onclick={close} aria-label="Close"><X size={20} /></button>
		</div>
		{@render children()}
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: rgba(0, 0, 0, 0.45);
	}

	.sheet {
		position: fixed;
		z-index: 51;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: min(100%, 520px);
		max-height: 88dvh;
		overflow-y: auto;
		padding: 16px 20px calc(24px + env(safe-area-inset-bottom));
		background: var(--bg);
		border: 1px solid var(--border);
		border-bottom: none;
		border-radius: 20px 20px 0 0;
	}

	.head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 12px;
	}

	.icon {
		display: flex;
		color: var(--accent);
	}

	h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.close {
		margin-left: auto;
		padding: 6px;
		color: var(--muted);
	}
</style>
