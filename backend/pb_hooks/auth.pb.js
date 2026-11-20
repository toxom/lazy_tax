/// <reference path="../pb_data/types.d.ts" />

// Sign up with email code: if no user exists for the email, create one,
// so "request code" works for both new and returning users.
onRecordRequestOTPRequest((e) => {
	if (!e.record) {
		const email = String(e.requestInfo().body['email'] || '')
			.trim()
			.toLowerCase();

		if (email) {
			const record = new Record(e.collection);
			record.setEmail(email);
			record.setPassword($security.randomString(40)); // required internally, never used
			e.app.save(record);
			e.record = record;
		}
	}

	return e.next();
}, 'users');

// Dev only (PB_DEV=1): print the code to the terminal instead of sending an email.
onMailerRecordOTPSend((e) => {
	if ($os.getenv('PB_DEV') === '1') {
		console.log(`\n[dev] OTP for ${e.record.email()}: ${e.meta.password}\n`);
		return; // skip actual sending
	}

	return e.next();
}, 'users');
