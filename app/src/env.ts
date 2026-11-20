import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PB_URL: {
		description: 'PocketBase URL (server-side only)',
		schema: (value) => value || 'http://127.0.0.1:8090'
	}
});
