/// <reference path="../pb_data/types.d.ts" />

// A proof can only point to the user's own commitment.
onRecordCreateRequest((e) => {
	const commitment = e.app.findRecordById('commitments', e.record.getString('commitment'));
	if (!e.auth || commitment.getString('user') !== e.auth.id) {
		throw new ForbiddenError('Not your commitment.');
	}
	return e.next();
}, 'proofs');

// TODO: onRecordAfterCreateSuccess -> queue AI/YOLO check for 'pending' photo/screenshot proofs
