import { self } from '$app/service-worker';
import { immutable, assets } from '$app/manifest';
import { version } from '$app/env';

const CACHE = `cache-${version}`;
const PRECACHE = [...immutable, ...assets].map((f) => f.path);

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) if (key !== CACHE) await caches.delete(key);
		})
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);

			// Build output + static files: cache first
			if (PRECACHE.some((p) => url.pathname.endsWith(p))) {
				const cached = await cache.match(event.request);
				if (cached) return cached;
			}

			// Pages and data: network first, fall back to cache when offline
			try {
				const response = await fetch(event.request);
				if (response.status === 200) cache.put(event.request, response.clone());
				return response;
			} catch {
				const cached = await cache.match(event.request);
				if (cached) return cached;
				throw new Error('Offline and not cached');
			}
		})()
	);
});
