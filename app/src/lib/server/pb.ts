import PocketBase from 'pocketbase';
import { PB_URL } from '$app/env/private';

/** One PocketBase client per request (never share auth state between users). */
export function createPb() {
	const pb = new PocketBase(PB_URL);
	pb.autoCancellation(false);
	return pb;
}
