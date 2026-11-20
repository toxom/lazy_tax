import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Start Google OAuth2: redirect to Google, remember state + PKCE verifier in a short-lived cookie. */
export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	const methods = await locals.pb.collection('users').listAuthMethods();
	const google = methods.oauth2?.providers.find((p) => p.name === 'google');

	if (!google) redirect(303, '/welcome?error=google_off');

	cookies.set('oauth', JSON.stringify({ state: google.state, verifier: google.codeVerifier }), {
		path: '/auth',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: 600
	});

	redirect(303, google.authURL + encodeURIComponent(`${url.origin}/auth/callback`), {
		external: ['https://accounts.google.com']
	});
};
