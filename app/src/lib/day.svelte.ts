export function startOfDay(d: Date) {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
}

export function addDays(d: Date, n: number) {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return x;
}

export const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

/** Local yyyy-mm-dd, used as storage key */
export function dayKey(d: Date) {
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Currently viewed day on the Today page */
export const day = $state({ date: startOfDay(new Date()) });

export function shiftDay(n: number) {
	day.date = addDays(day.date, n);
}

export function setDay(d: Date) {
	day.date = startOfDay(d);
}

/** -1 past, 0 today, 1 future */
export function dayKind(d: Date) {
	const t = startOfDay(new Date()).getTime();
	const x = startOfDay(d).getTime();
	return x < t ? -1 : x > t ? 1 : 0;
}
