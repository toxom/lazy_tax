<script lang="ts">
	import { untrack } from 'svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { addDays, dayKind, sameDay, startOfDay } from '#lib/day.svelte.js';
	import { daySummary } from '#lib/commitments.svelte.js';

	interface Props {
		selected: Date;
		onselect: (d: Date) => void;
	}

	let { selected, onselect }: Props = $props();

	// Start on the selected month (component remounts each time the modal opens)
	let month = $state(untrack(() => new Date(selected.getFullYear(), selected.getMonth(), 1)));

	const monthLabel = $derived(
		month.toLocaleDateString(getLocale(), { month: 'long', year: 'numeric' })
	);

	// Monday-first weekday labels
	const weekdays = Array.from({ length: 7 }, (_, i) =>
		new Date(2024, 0, 1 + i).toLocaleDateString(getLocale(), { weekday: 'narrow' })
	);

	const cells = $derived.by(() => {
		const offset = (month.getDay() + 6) % 7; // Monday = 0
		const first = addDays(month, -offset);
		return Array.from({ length: 42 }, (_, i) => addDays(first, i));
	});

	function status(d: Date) {
		if (dayKind(d) >= 0) return null;
		const s = daySummary(d);
		return s.done === s.total ? 'ok' : 'miss';
	}

	const shiftMonth = (n: number) =>
		(month = new Date(month.getFullYear(), month.getMonth() + n, 1));
</script>

<div class="nav">
	<button onclick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeft size={20} /></button>
	<span class="display">{monthLabel}</span>
	<button onclick={() => shiftMonth(1)} aria-label="Next month"><ChevronRight size={20} /></button>
</div>

<div class="grid">
	{#each weekdays as w, i (i)}
		<span class="wd">{w}</span>
	{/each}
	{#each cells as d (d.getTime())}
		{@const st = status(d)}
		<button
			class="day"
			class:other={d.getMonth() !== month.getMonth()}
			class:today={dayKind(d) === 0}
			class:selected={sameDay(d, selected)}
			onclick={() => onselect(startOfDay(d))}
		>
			{d.getDate()}
			{#if st}<span class="dot {st}"></span>{/if}
		</button>
	{/each}
</div>

<button class="card jump" onclick={() => onselect(startOfDay(new Date()))}>{m.tab_today()}</button>

<style>
	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.nav span {
		font-size: 1.125rem;
		text-transform: capitalize;
	}

	.nav button {
		padding: 8px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 2px;
		text-align: center;
	}

	.wd {
		font-size: 0.75rem;
		color: var(--muted);
		padding: 6px 0;
	}

	.day {
		position: relative;
		aspect-ratio: 1;
		border-radius: 50%;
		font-variant-numeric: tabular-nums;
	}

	.day.other {
		color: var(--muted);
		opacity: 0.5;
	}

	.day.today {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.day.selected {
		background: var(--accent);
		color: var(--bg);
		font-weight: 600;
	}

	.dot {
		position: absolute;
		left: 50%;
		bottom: 5px;
		width: 4px;
		height: 4px;
		margin-left: -2px;
		border-radius: 50%;
	}

	.dot.ok {
		background: var(--accent);
	}

	.dot.miss {
		background: var(--danger);
	}

	.selected .dot {
		background: var(--bg);
	}

	.jump {
		width: 100%;
		margin-top: 12px;
		padding: 12px;
		font-weight: 600;
	}
</style>
