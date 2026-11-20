import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ locals }) => {
	locals.pb.authStore.clear(); // hooks.server.ts writes the cleared cookie
	redirect(303, '/welcome');
};
