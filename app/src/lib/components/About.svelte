<script lang="ts">
	import { Target, Coins, Camera, HeartHandshake } from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';

	const steps = [
		{ icon: Target, title: m.about_step1, desc: m.about_step1_desc },
		{ icon: Coins, title: m.about_step2, desc: m.about_step2_desc },
		{ icon: Camera, title: m.about_step3, desc: m.about_step3_desc },
		{ icon: HeartHandshake, title: m.about_step4, desc: m.about_step4_desc }
	];
</script>

<div class="hero">
	<p class="display tagline">
		{m.about_tagline_1()} <em class="accent">{m.about_tagline_2()}</em>
	</p>
</div>

<ol>
	{#each steps as s, i (i)}
		<li>
			<span class="ic"><s.icon size={20} /></span>
			<div>
				<strong>{s.title()}</strong>
				<p>{s.desc()}</p>
			</div>
		</li>
	{/each}
</ol>

<p class="muted foot">{m.about_roadmap()}</p>
<p class="muted foot">v0.1 · scaffold</p>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 20px;
	}

	.logo {
		color: var(--accent);
		display: flex;
	}

	.tagline {
		margin: 0;
		font-size: 2rem;
		line-height: 1.15;
	}

	ol {
		list-style: none;
		margin: 0 0 16px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	li {
		display: flex;
		gap: 12px;
	}

	.ic {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	li p {
		margin: 2px 0 0;
		color: var(--muted);
		font-size: 0.875rem;
		line-height: 1.45;
	}

	.foot {
		margin: 6px 0 0;
		font-size: 0.8125rem;
	}
</style>
