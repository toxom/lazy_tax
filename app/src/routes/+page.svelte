<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { m } from '#lib/paraglide/messages.js';
	import { commitments, proofFor, daySummary } from '#lib/commitments.svelte.js';
	import { day, dayKind, dayKey, shiftDay } from '#lib/day.svelte.js';
	import CommitmentCard from '#lib/components/CommitmentCard.svelte';

	const kind = $derived(dayKind(day.date) as -1 | 0 | 1);
	const summary = $derived(daySummary(day.date));

	let expanded = $state<string | null>(null);
	let dir = $state(1); // slide direction for the day transition

	// ---- Swipe left/right to change day ----
	let sx = 0;
	let sy = 0;
	let swiped = false;

	function down(e: PointerEvent) {
		sx = e.clientX;
		sy = e.clientY;
		swiped = false;
	}

	function up(e: PointerEvent) {
		const dx = e.clientX - sx;
		const dy = e.clientY - sy;
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
			swiped = true;
			go(dx < 0 ? 1 : -1);
		}
	}

	function go(n: number) {
		dir = n;
		expanded = null;
		shiftDay(n);
	}

	// Swallow the click that follows a swipe so a card doesn't toggle
	function clickCapture(e: MouseEvent) {
		if (swiped) {
			e.stopPropagation();
			e.preventDefault();
			swiped = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.target instanceof HTMLInputElement) return;
		if (e.key === 'ArrowLeft') go(-1);
		if (e.key === 'ArrowRight') go(1);
	}}
/>

<div class="swipe" onpointerdown={down} onpointerup={up} onclickcapture={clickCapture} role="presentation">
	{#key dayKey(day.date)}
		<div in:fly={{ x: dir * 48, duration: 220, easing: cubicOut }}>
			<section class="progress">
				<div class="bars">
					{#each commitments as c (c.id)}
						<span class:filled={!!proofFor(day.date, c.id)} class:missed={kind === -1 && !proofFor(day.date, c.id)}
						></span>
					{/each}
				</div>
				<p class="muted">
					{#if kind === 0}
						{m.today_progress(summary)}
					{:else if kind === -1}
						{m.day_summary_past({ done: summary.done, total: summary.total, lost: summary.atRisk })}
					{:else}
						{m.day_summary_future()}
					{/if}
				</p>
			</section>

			<ul>
				{#each commitments as c (c.id)}
					<li>
						<CommitmentCard
							commitment={c}
							date={day.date}
							proof={proofFor(day.date, c.id)}
							{kind}
							expanded={expanded === c.id}
							onexpand={() => (expanded = expanded === c.id ? null : c.id)}
						/>
					</li>
				{/each}
			</ul>

			<p class="hint muted">{m.swipe_hint()}</p>
		</div>
	{/key}
</div>

<style>
	.swipe {
		touch-action: pan-y;
		min-height: 60dvh;
		overflow-x: hidden;
	}

	.progress {
		margin-bottom: 16px;
	}

	.bars {
		display: flex;
		gap: 4px;
		margin-bottom: 8px;
	}

	.bars span {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: var(--border);
		transition: background-color 250ms ease;
	}

	.bars span.filled {
		background: var(--accent);
	}

	.bars span.missed {
		background: var(--danger);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.hint {
		text-align: center;
		margin-top: 20px;
		font-size: 0.75rem;
	}
</style>
