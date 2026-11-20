<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, setLocale, locales } from '#lib/paraglide/runtime.js';
	import { settings, type Mode, type Accent, type Font } from '#lib/settings.svelte.js';
	import Segmented from '#lib/components/Segmented.svelte';
	import { Monitor, Sun, Moon, LogOut } from '@lucide/svelte';
	import { page } from '$app/state';

	type Locale = (typeof locales)[number];

	const languages: Record<Locale, { flag: string; name: string }> = {
		en: { flag: '🇬🇧', name: 'English' },
		fi: { flag: '🇫🇮', name: 'Suomi' },
		ru: { flag: '🇷🇺', name: 'Русский' }
	};

	const modes = ['system', 'light', 'dark'] as const satisfies readonly Mode[];
	const modeIcons = { system: Monitor, light: Sun, dark: Moon };
	const modeLabels = { system: m.mode_system, light: m.mode_light, dark: m.mode_dark };

	const accents = ['teal', 'violet'] as const satisfies readonly Accent[];
	const accentLabels = { teal: m.color_teal, violet: m.color_violet };
	const accentSwatch = { teal: '#1fae8c', violet: '#9b87f5' };

	const fonts = ['serif', 'sans'] as const satisfies readonly Font[];
	const fontLabels = { serif: m.font_serif, sans: m.font_sans };
	const fontFamily = { serif: "'Playfair Display Variable', serif", sans: "'Inter Variable', sans-serif" };
</script>

<section>
	<h2>{m.me_account()}</h2>
	<div class="card account">
		<span class="avatar">{(page.data.user?.email ?? '?')[0].toUpperCase()}</span>
		<span class="email">{page.data.user?.email}</span>
		<form method="POST" action="/auth/logout">
			<button class="logout" aria-label={m.auth_logout()}><LogOut size={18} /></button>
		</form>
	</div>
</section>

<section>
	<h2>{m.me_appearance()}</h2>

	<p class="label">{m.me_mode()}</p>
	<Segmented options={modes} value={settings.mode} onchange={(v) => (settings.mode = v)}>
		{#snippet item(v)}
			{@const Icon = modeIcons[v]}
			<Icon size={16} />
			{modeLabels[v]()}
		{/snippet}
	</Segmented>

	<p class="label">{m.me_color()}</p>
	<Segmented options={accents} value={settings.accent} onchange={(v) => (settings.accent = v)}>
		{#snippet item(v)}
			<span class="swatch" style:background={accentSwatch[v]}></span>
			{accentLabels[v]()}
		{/snippet}
	</Segmented>

	<p class="label">{m.me_font()}</p>
	<Segmented options={fonts} value={settings.font} onchange={(v) => (settings.font = v)}>
		{#snippet item(v)}
			<span class="aa" style:font-family={fontFamily[v]}>Aa</span>
			{fontLabels[v]()}
		{/snippet}
	</Segmented>
</section>

<section>
	<h2>{m.me_language()}</h2>
	<Segmented options={locales} value={getLocale()} onchange={(v) => setLocale(v)}>
		{#snippet item(v)}
			<span class="flag">{languages[v].flag}</span>
			{languages[v].name}
		{/snippet}
	</Segmented>
</section>

<p class="muted">{m.me_placeholder()}</p>

<style>
	section {
		margin-bottom: 28px;
	}

	h2 {
		font-size: 1.375rem;
		margin: 0 0 4px;
	}

	.label {
		margin: 14px 0 6px;
		font-size: 0.8125rem;
		color: var(--muted);
	}

	.swatch {
		width: 14px;
		height: 14px;
		border-radius: 50%;
	}

	.aa {
		font-size: 1.125rem;
		font-weight: 500;
	}

	.account {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--accent);
		color: var(--bg);
		font-weight: 600;
	}

	.email {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout {
		display: flex;
		padding: 8px;
		color: var(--muted);
	}

	.flag {
		font-size: 1.125rem;
		line-height: 1;
	}
</style>
