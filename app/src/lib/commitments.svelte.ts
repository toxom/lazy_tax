import { addDays, dayKey, startOfDay } from './day.svelte';

/** How a commitment can be proven. Integrations (screentime, health) are placeholders for now. */
export type Method = 'photo' | 'screenshot' | 'screentime' | 'health' | 'manual';

export type Proof = {
	method: Method;
	image?: string; // object URL for now, uploaded file later
	status: 'pending' | 'verified' | 'self'; // pending = waiting for AI/YOLO check
};

export type Commitment = {
	id: string;
	title: string;
	stake: number; // EUR per miss
	streak: number;
	methods: Method[]; // suggested proof methods, in order
};

// Mock data until we have a backend
export const commitments = $state<Commitment[]>([
	{ id: '1', title: 'Morning run', stake: 10, streak: 12, methods: ['photo', 'health', 'manual'] },
	{ id: '2', title: 'Read 20 min', stake: 5, streak: 4, methods: ['photo', 'manual'] },
	{ id: '3', title: 'Write 500 words', stake: 10, streak: 0, methods: ['screenshot', 'manual'] },
	{ id: '4', title: 'No phone after 23', stake: 15, streak: 2, methods: ['screentime', 'screenshot'] }
]);

/** proofs[yyyy-mm-dd][commitmentId] */
export const proofs = $state<Record<string, Record<string, Proof>>>(seed());

export const proofFor = (date: Date, id: string): Proof | undefined => proofs[dayKey(date)]?.[id];

export function prove(date: Date, id: string, proof: Proof) {
	(proofs[dayKey(date)] ??= {})[id] = proof;
}

export function undo(date: Date, id: string) {
	delete proofs[dayKey(date)]?.[id];
}

export function daySummary(date: Date) {
	const done = commitments.filter((c) => proofFor(date, c.id)).length;
	const open = commitments.filter((c) => !proofFor(date, c.id));
	return { done, total: commitments.length, atRisk: open.reduce((s, c) => s + c.stake, 0) };
}

// Fake history: last 45 days with occasional misses, plus two done today
function seed() {
	const out: Record<string, Record<string, Proof>> = {};
	const today = startOfDay(new Date());
	for (let i = 1; i <= 45; i++) {
		const k = dayKey(addDays(today, -i));
		out[k] = {};
		// Miss one commitment roughly every 4th day
		const missed = (i * 7) % 4 === 1 ? String(((i * 5) % 4) + 1) : null;
		for (const id of ['1', '2', '3', '4']) {
			if (id !== missed) out[k][id] = { method: 'manual', status: 'self' };
		}
	}
	out[dayKey(today)] = {
		'1': { method: 'health', status: 'verified' },
		'2': { method: 'manual', status: 'self' }
	};
	return out;
}
