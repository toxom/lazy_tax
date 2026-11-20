import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Every app page requires a signed-in user
export const load: LayoutServerLoad = ({ locals }) => {
	if (!locals.user) redirect(303, '/welcome');

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email as string,
			name: (locals.user.name as string) || ''
		}
	};
};
