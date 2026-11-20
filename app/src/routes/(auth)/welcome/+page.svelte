<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Mail, ArrowLeft, Target, Coins, Camera } from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, setLocale, locales } from '#lib/paraglide/runtime.js';
	import Logo from '#lib/components/Logo.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let busy = $state(false);
	let backToEmail = $state(false);

	const step = $derived(form?.step === 'code' && !backToEmail ? 'code' : 'email');

	const errors: Record<string, () => string> = {
		invalid_email: m.err_invalid_email,
		send_failed: m.err_send_failed,
		bad_code: m.err_bad_code,
		oauth: m.err_oauth,
		google_off: m.err_google_off
	};
	const error = $derived(form?.error ?? data.error);

	const flags = { en: '🇬🇧', fi: '🇫🇮', ru: '🇷🇺' } as const;

	const submit = () => {
		busy = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			busy = false;
			backToEmail = false;
		};
	};
</script>

<svelte:head>
	<title>{m.app_name()}</title>
</svelte:head>

<div class="page">
	<header>
		<span class="logo"><Logo size={36} /></span>
		<div class="langs">
			{#each locales as l (l)}
				<button class:active={l === getLocale()} onclick={() => setLocale(l)} aria-label={l}>
					{flags[l]}
				</button>
			{/each}
		</div>
	</header>

	<section class="hero">
		<h1 class="display">
			{m.about_tagline_1()} <em class="accent">{m.about_tagline_2()}</em>
		</h1>
		<ul class="points">
			<li><Target size={18} /> {m.about_step1_desc()}</li>
			<li><Coins size={18} /> {m.about_step2_desc()}</li>
			<li><Camera size={18} /> {m.about_step3_desc()}</li>
		</ul>
	</section>

	<section class="auth">
		{#if step === 'email'}
			<div in:fly={{ x: -24, duration: 200, easing: cubicOut }}>
				<a class="btn google" href="/auth/google" data-sveltekit-reload>
					<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
						<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
						<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
						<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
						<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
					</svg>
					{m.auth_google()}
				</a>

				<div class="divider"><span>{m.auth_or()}</span></div>

				<form method="POST" action="?/email" use:enhance={submit}>
					<label class="field">
						<Mail size={18} />
						<input
							type="email"
							name="email"
							autocomplete="email"
							inputmode="email"
							placeholder="name@example.com"
							value={form?.email ?? ''}
							required
						/>
					</label>
					<button class="btn primary" disabled={busy}>{m.auth_send_code()}</button>
				</form>
			</div>
		{:else}
			<div in:fly={{ x: 24, duration: 200, easing: cubicOut }}>
				<p class="sent">{m.auth_code_sent({ email: form?.email ?? '' })}</p>
				<form method="POST" action="?/code" use:enhance={submit}>
					<input type="hidden" name="email" value={form?.email} />
					<input type="hidden" name="otpId" value={form?.otpId} />
					<input
						class="code"
						name="code"
						inputmode="numeric"
						autocomplete="one-time-code"
						pattern="[0-9 ]*"
						maxlength="8"
						placeholder="000000"
						required
					/>
					<button class="btn primary" disabled={busy}>{m.auth_verify()}</button>
				</form>
				<button class="link" onclick={() => (backToEmail = true)}>
					<ArrowLeft size={16} />
					{m.auth_change_email()}
				</button>
			</div>
		{/if}

		{#if error && errors[error]}
			<p class="error" role="alert">{errors[error]()}</p>
		{/if}

		<p class="terms muted">{m.auth_terms()}</p>
	</section>
</div>

<style>
	.page {
		max-width: 440px;
		min-height: 100dvh;
		margin: 0 auto;
		padding: calc(env(safe-area-inset-top) + 20px) 24px calc(env(safe-area-inset-bottom) + 24px);
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		color: var(--accent);
		display: flex;
	}

	.langs {
		display: flex;
		gap: 2px;
	}

	.langs button {
		padding: 6px;
		border-radius: 8px;
		font-size: 1.125rem;
		line-height: 1;
		opacity: 0.45;
	}

	.langs button.active {
		opacity: 1;
		background: var(--surface);
	}

	.hero {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 32px 0;
	}

	h1 {
		margin: 0 0 24px;
		font-size: clamp(2.5rem, 11vw, 3.25rem);
		line-height: 1.08;
	}

	.points {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		color: var(--muted);
		font-size: 0.9375rem;
	}

	.points li {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.points :global(svg) {
		flex-shrink: 0;
		margin-top: 2px;
		color: var(--accent);
	}

	.auth form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;
		height: 52px;
		border-radius: 14px;
		font-weight: 600;
	}

	.btn:disabled {
		opacity: 0.6;
	}

	.google {
		background: var(--surface);
		border: 1px solid var(--border);
	}

	.primary {
		background: var(--accent);
		color: var(--bg);
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 16px 0;
		color: var(--muted);
		font-size: 0.8125rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	.field {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 52px;
		padding: 0 16px;
		border-radius: 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.field:focus-within {
		border-color: var(--accent);
	}

	input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 1rem;
	}

	.code {
		height: 64px;
		text-align: center;
		font-size: 1.75rem;
		letter-spacing: 0.4em;
		font-variant-numeric: tabular-nums;
		border-radius: 14px;
		background: var(--surface);
		border: 1px solid var(--border);
	}

	.code:focus {
		border-color: var(--accent);
	}

	.sent {
		margin: 0 0 12px;
		color: var(--muted);
	}

	.link {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 12px;
		color: var(--muted);
		font-size: 0.875rem;
	}

	.error {
		margin: 12px 0 0;
		color: var(--danger);
		font-size: 0.875rem;
	}

	.terms {
		margin: 16px 0 0;
		text-align: center;
		font-size: 0.75rem;
	}
</style>
