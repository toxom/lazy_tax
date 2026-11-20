import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, '/');
	return { error: url.searchParams.get('error') };
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
	/** Step 1: send a 6-digit code. Unknown emails get an account (see backend/pb_hooks/auth.pb.js). */
	email: async ({ request, locals }) => {
		const email = String((await request.formData()).get('email') ?? '')
			.trim()
			.toLowerCase();

		if (!EMAIL.test(email)) return fail(400, { step: 'email', email, error: 'invalid_email' });

		try {
			const { otpId } = await locals.pb.collection('users').requestOTP(email);
			return { step: 'code', email, otpId };
		} catch {
			return fail(500, { step: 'email', email, error: 'send_failed' });
		}
	},

	/** Step 2: verify the code -> session cookie is set in hooks.server.ts */
	code: async ({ request, locals }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const otpId = String(form.get('otpId') ?? '');
		const code = String(form.get('code') ?? '').replace(/\s/g, '');

		try {
			await locals.pb.collection('users').authWithOTP(otpId, code);
		} catch {
			return fail(400, { step: 'code', email, otpId, error: 'bad_code' });
		}

		redirect(303, '/');
	}
};
