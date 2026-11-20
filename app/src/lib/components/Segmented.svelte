<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';

	interface Props {
		options: readonly T[];
		value: T;
		onchange: (value: T) => void;
		item: Snippet<[T]>;
	}

	let { options, value, onchange, item }: Props = $props();
</script>

<div class="seg card">
	{#each options as opt (opt)}
		<button class:active={opt === value} aria-pressed={opt === value} onclick={() => onchange(opt)}>
			{@render item(opt)}
		</button>
	{/each}
</div>

<style>
	.seg {
		display: flex;
		gap: 4px;
		padding: 4px;
	}

	button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 6px;
		border-radius: 8px;
		color: var(--muted);
	}

	button.active {
		background: var(--bg);
		color: var(--text);
		font-weight: 600;
		box-shadow: 0 0 0 1px var(--border);
	}
</style>
