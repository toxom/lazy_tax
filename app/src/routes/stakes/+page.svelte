<script lang="ts">
	import { commitments, proofFor } from '#lib/commitments.svelte.js';

	const today = new Date();
	const isDone = (id: string) => !!proofFor(today, id);
	import { m } from '#lib/paraglide/messages.js';

	const atRisk = $derived(
		commitments.filter((c) => !isDone(c.id)).reduce((sum, c) => sum + c.stake, 0)
	);
	const total = $derived(commitments.reduce((sum, c) => sum + c.stake, 0));
</script>

<section class="hero">
	<p class="label">{m.stakes_at_risk()}</p>
	<p class="amount display">€{atRisk}</p>
	<p class="muted">{m.stakes_total({ total })}</p>
</section>

<h2 class="display">{m.stakes_active()}</h2>
<ul>
	{#each commitments as c (c.id)}
		<li class="card">
			<div>
				<div>{c.title}</div>
				<div class="muted">{isDone(c.id) ? m.stakes_safe() : m.stakes_due()}</div>
			</div>
			<strong class:safe={isDone(c.id)}>€{c.stake}</strong>
		</li>
	{/each}
</ul>

<style>
	.hero {
		background: color-mix(in srgb, var(--danger) 12%, transparent);
		border-radius: var(--radius);
		padding: 20px;
		margin-bottom: 24px;
	}

	.label,
	.amount {
		margin: 0;
		color: var(--danger);
	}

	.label {
		font-size: 0.875rem;
	}

	.amount {
		font-size: 3.25rem;
		line-height: 1.1;
	}

	.hero .muted {
		margin: 4px 0 0;
	}

	h2 {
		font-size: 1.375rem;
		margin: 0 0 8px;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	strong {
		color: var(--danger);
	}

	strong.safe {
		color: var(--muted);
	}
</style>
