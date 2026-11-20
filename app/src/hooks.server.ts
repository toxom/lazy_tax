import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';
import { createPb } from '#lib/server/pb.js';

/** Auth: PocketBase session lives in an http-only cookie (`pb_auth`). */
const handleAuth: Handle = async ({ event, resolve }) => {
	const pb = createPb();
	pb.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');

	try {
		// Refresh = validate token + get fresh user record
		if (pb.authStore.isValid) await pb.collection('users').authRefresh();
	} catch {
		pb.authStore.clear();
	}

	event.locals.pb = pb;
	event.locals.user = pb.authStore.record;

	const response = await resolve(event);

	response.headers.append(
		'set-cookie',
		pb.authStore.exportToCookie({
			httpOnly: true,
			secure: event.url.protocol === 'https:',
			sameSite: 'Lax',
			path: '/'
		})
	);

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve({ ...event, request }, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle = sequence(handleAuth, handleParaglide);
