<script lang="ts">
	import { slide, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import {
		CircleCheck,
		Circle,
		ChevronDown,
		Camera,
		Smartphone,
		Hourglass,
		HeartPulse,
		Hand,
		Sparkles,
		Lock,
		Undo2
	} from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { prove, undo, type Commitment, type Method, type Proof } from '#lib/commitments.svelte.js';

	interface Props {
		commitment: Commitment;
		date: Date;
		proof?: Proof;
		kind: -1 | 0 | 1; // past, today, future
		expanded: boolean;
		onexpand: () => void;
	}

	let { commitment: c, date, proof, kind, expanded, onexpand }: Props = $props();

	const done = $derived(!!proof);
	const editable = $derived(kind === 0);

	// Which methods work in the scaffold vs. are future integrations
	const soon: Method[] = ['screentime', 'health'];

	const methodInfo = {
		photo: { icon: Camera, label: m.verify_photo, desc: m.verify_photo_desc },
		screenshot: { icon: Smartphone, label: m.verify_screenshot, desc: m.verify_screenshot_desc },
		screentime: { icon: Hourglass, label: m.verify_screentime, desc: m.verify_screentime_desc },
		health: { icon: HeartPulse, label: m.verify_health, desc: m.verify_health_desc },
		manual: { icon: Hand, label: m.verify_manual, desc: m.verify_manual_desc }
	} satisfies Record<Method, unknown>;

	const statusLabel = { pending: m.proof_pending, verified: m.proof_verified, self: m.proof_self };

	let fileInput = $state<HTMLInputElement>();
	let pendingMethod: Method = 'photo';

	function pick(method: Method) {
		if (soon.includes(method)) return;
		if (method === 'manual') return prove(date, c.id, { method, status: 'self' });
		pendingMethod = method;
		if (fileInput) {
			// Photo: open camera on phones. Screenshot: open gallery.
			if (method === 'photo') fileInput.setAttribute('capture', 'environment');
			else fileInput.removeAttribute('capture');
			fileInput.click();
		}
	}

	function onFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		// TODO: upload + AI/YOLO verification. For now: local preview, status pending.
		prove(date, c.id, { method: pendingMethod, image: URL.createObjectURL(file), status: 'pending' });
		(e.currentTarget as HTMLInputElement).value = '';
	}
</script>

<div class="card wrap" class:done class:expanded>
	<button class="row" onclick={onexpand} aria-expanded={expanded}>
		<span class="icon">
			{#if done}
				<span in:scale={{ duration: 220, start: 0.4, easing: backOut }}>
					<CircleCheck size={22} color="var(--accent)" />
				</span>
			{:else if kind === -1}
				<span><Circle size={22} color="var(--danger)" /></span>
			{:else}
				<span in:scale={{ duration: 150, start: 0.7 }}><Circle size={22} /></span>
			{/if}
		</span>
		<span class="text">
			<span class="title">{c.title}</span>
			{#if proof}
				<span class="status {proof.status}">{statusLabel[proof.status]()}</span>
			{:else if kind === -1}
				<span class="status miss">{m.proof_missed({ stake: c.stake })}</span>
			{/if}
		</span>
		<span class="muted">
			{#if done && kind === 0}{m.today_streak({ days: c.streak + 1 })}{:else}€{c.stake}{/if}
		</span>
		<span class="chev"><ChevronDown size={18} /></span>
	</button>

	{#if expanded}
		<div class="body" transition:slide={{ duration: 220 }}>
			{#if proof}
				<div class="proof">
					{#if proof.image}
						<img src={proof.image} alt="" />
					{/if}
					<div class="proof-text">
						<span>{methodInfo[proof.method].label()}</span>
						{#if proof.status === 'pending'}
							<span class="chip"><Sparkles size={14} /> {m.ai_check_soon()}</span>
						{/if}
					</div>
					{#if editable}
						<button class="ghost" onclick={() => undo(date, c.id)}>
							<Undo2 size={16} />
							{m.undo()}
						</button>
					{/if}
				</div>
			{:else if editable}
				<p class="label">{m.verify_title()}</p>
				<div class="methods">
					{#each c.methods as method (method)}
						{@const info = methodInfo[method]}
						{@const isSoon = soon.includes(method)}
						<button class="method" class:soon={isSoon} onclick={() => pick(method)}>
							<info.icon size={22} />
							<span class="m-label">{info.label()}</span>
							<span class="m-desc">{info.desc()}</span>
							{#if isSoon}<span class="badge">{m.soon()}</span>{/if}
						</button>
					{/each}
				</div>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					hidden
					onchange={onFile}
				/>
			{:else}
				<p class="locked">
					<Lock size={14} />
					{kind === -1 ? m.day_locked_past() : m.day_locked_future()}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrap {
		padding: 0;
		overflow: hidden;
		transition: border-color 200ms;
	}

	.wrap.expanded {
		border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
	}

	.row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		text-align: left;
		min-height: 60px;
	}

	.row:active {
		transform: none;
	}

	.icon {
		display: grid;
		width: 22px;
		height: 22px;
		flex-shrink: 0;
	}

	.icon > span {
		grid-area: 1 / 1;
		display: flex;
	}

	.text {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.done .title {
		color: var(--muted);
		text-decoration: line-through;
	}

	.status {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.status.verified {
		color: var(--accent);
	}

	.status.pending {
		color: #c98a14;
	}

	.status.miss {
		color: var(--danger);
	}

	.chev {
		display: flex;
		color: var(--muted);
		transition: transform 220ms;
	}

	.expanded .chev {
		transform: rotate(180deg);
	}

	.body {
		padding: 0 16px 16px;
	}

	.label {
		margin: 0 0 8px;
		font-size: 0.8125rem;
		color: var(--muted);
	}

	.methods {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: 8px;
	}

	.method {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		padding: 12px;
		text-align: left;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 10px;
		color: var(--accent);
	}

	.method.soon {
		color: var(--muted);
		cursor: default;
	}

	.m-label {
		color: var(--text);
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.m-desc {
		color: var(--muted);
		font-size: 0.75rem;
		line-height: 1.35;
	}

	.badge {
		position: absolute;
		top: 8px;
		right: 8px;
		font-size: 0.6875rem;
		padding: 2px 6px;
		border-radius: 6px;
		background: var(--surface);
		color: var(--muted);
		border: 1px solid var(--border);
	}

	.proof {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.proof img {
		width: 56px;
		height: 56px;
		object-fit: cover;
		border-radius: 8px;
	}

	.proof-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		width: fit-content;
		font-size: 0.75rem;
		padding: 2px 8px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	.ghost {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid var(--border);
		font-size: 0.875rem;
	}

	.locked {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		color: var(--muted);
		font-size: 0.875rem;
	}
</style>
