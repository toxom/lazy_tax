export type Mode = 'system' | 'light' | 'dark';
export type Accent = 'teal' | 'violet';
export type Font = 'serif' | 'sans';

type Settings = { mode: Mode; accent: Accent; font: Font };

const KEY = 'lt-settings';
const defaults: Settings = { mode: 'system', accent: 'teal', font: 'serif' };

export const settings = $state<Settings>({ ...defaults });

/** Load saved settings (call once on the client, from the root layout). */
export function initSettings() {
	try {
		Object.assign(settings, JSON.parse(localStorage.getItem(KEY) ?? '{}'));
	} catch {
		/* ignore bad JSON */
	}
}

/** Push settings to <html data-*> and persist. */
export function applySettings() {
	const root = document.documentElement;
	const dark =
		settings.mode === 'dark' ||
		(settings.mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);

	root.dataset.mode = dark ? 'dark' : 'light';
	root.dataset.accent = settings.accent;
	root.dataset.font = settings.font;

	const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
	document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));

	localStorage.setItem(KEY, JSON.stringify(settings));
}
