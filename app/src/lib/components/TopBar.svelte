<script lang="ts">
	import Logo from './Logo.svelte';
	import { CalendarDays } from '@lucide/svelte';

	interface Props {
		title: string;
		subtitle?: string;
		info?: string;
		onlogo?: () => void;
		ondate?: () => void;
	}

	let { title, subtitle, info, onlogo, ondate }: Props = $props();

	// Buttons inside the draggable bar must not start a drag
	const stop = (e: PointerEvent) => e.stopPropagation();

	let panelH = $state(0); // measured height of the info content
	let open = $state(false);
	let drag = $state<number | null>(null); // live offset while dragging, px
	let startY = 0;
	let startOffset = 0;
	let moved = false;
	let active = false; // a press started on the bar itself

	const offset = $derived(drag ?? (open ? panelH : 0));

	// Close when the page changes
	$effect(() => {
		void title;
		open = false;
	});

	function down(e: PointerEvent) {
		if (!info) return;
		active = true;
		startY = e.clientY;
		startOffset = offset;
		moved = false;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function move(e: PointerEvent) {
		if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
		const dy = e.clientY - startY;
		if (Math.abs(dy) > 4) moved = true;
		if (moved) drag = Math.min(panelH, Math.max(0, startOffset + dy));
	}

	function up() {
		if (!info || !active) return;
		active = false;
		open = moved ? (drag ?? 0) > panelH / 2 : !open; // drag: snap, tap: toggle
		drag = null;
	}
</script>

{#if offset > 0}
	<button class="backdrop" aria-label="Close" onclick={() => (open = false)} style:opacity={offset / (panelH || 1)}
	></button>
{/if}

<header class:dragging={drag !== null}>
	<div
		class="bar"
		role="button"
		tabindex="0"
		aria-expanded={open}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (open = !open)}
	>
		<div class="titles">
			<h1>{title}</h1>
			{#if subtitle}
				{#if ondate}
					<button class="date" onpointerdown={stop} onclick={ondate}>
						{subtitle}
						<CalendarDays size={14} />
					</button>
				{:else}
					<span class="muted">{subtitle}</span>
				{/if}
			{/if}
		</div>
		<button class="logo" onpointerdown={stop} onclick={onlogo} aria-label="About Lazy Tax">
			<Logo size={28} />
		</button>
	</div>

	<div class="panel" style:height="{offset}px">
		<div bind:clientHeight={panelH} class="panel-inner">
			<p>{info}</p>
		</div>
	</div>

	{#if info}<div class="grip" aria-hidden="true"></div>{/if}
</header>

<style>
	header {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 20;
		padding-top: env(safe-area-inset-top);
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.bar {
		height: var(--topbar-h);
		padding: 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		touch-action: none;
		user-select: none;
		cursor: grab;
	}

	.titles {
		display: flex;
		align-items: baseline;
		gap: 10px;
		min-width: 0;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logo {
		color: var(--accent);
		display: flex;
		padding: 4px;
		margin-right: -4px;
	}

	.date {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 999px;
		font-size: 0.875rem;
		color: var(--muted);
		border: 1px solid var(--border);
		white-space: nowrap;
	}

	.panel {
		overflow: hidden;
		transition: height 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.dragging .panel {
		transition: none;
	}

	.panel-inner {
		padding: 0 16px 14px;
	}

	.panel-inner p {
		margin: 0;
		color: var(--muted);
		line-height: 1.5;
	}

	.grip {
		position: absolute;
		left: 50%;
		bottom: 4px;
		width: 32px;
		height: 4px;
		margin-left: -16px;
		border-radius: 2px;
		background: var(--border);
		pointer-events: none;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 19;
		background: rgba(0, 0, 0, 0.35);
		transition: opacity 200ms;
	}
</style>
