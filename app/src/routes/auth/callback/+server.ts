import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Google redirects here with ?code&state. Exchange code -> PocketBase session. */
export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	const saved = JSON.parse(cookies.get('oauth') ?? '{}') as { state?: string; verifier?: string };
	cookies.delete('oauth', { path: '/auth' });

	const code = url.searchParams.get('code');
	if (!code || !saved.verifier || saved.state !== url.searchParams.get('state')) {
		redirect(303, '/welcome?error=oauth');
	}

	try {
		await locals.pb
			.collection('users')
			.authWithOAuth2Code('google', code, saved.verifier, `${url.origin}/auth/callback`, {
				emailVisibility: false
			});
	} catch {
		redirect(303, '/welcome?error=oauth');
	}

	redirect(303, '/');
};
