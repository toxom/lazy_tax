/// <reference path="../pb_data/types.d.ts" />

// Initial schema: users auth config + commitments + proofs
migrate(
	(app) => {
		// ---- users: email code (OTP) + OAuth2, no passwords ----
		const users = app.findCollectionByNameOrId('users');
		users.passwordAuth.enabled = false;
		users.otp.enabled = true;
		users.otp.length = 6;
		users.otp.duration = 600; // 10 min
		users.oauth2.enabled = true; // Google client id/secret: set in admin UI, never commit
		users.fields.add(
			new SelectField({ name: 'locale', values: ['en', 'fi', 'ru'], maxSelect: 1 })
		);
		app.save(users);

		// ---- commitments ----
		const own = "user = @request.auth.id";
		const commitments = new Collection({
			type: 'base',
			name: 'commitments',
			listRule: own,
			viewRule: own,
			createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
			updateRule: own + ' && @request.body.user:isset = false',
			deleteRule: own,
			fields: [
				{ type: 'relation', name: 'user', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true },
				{ type: 'text', name: 'title', required: true, max: 120 },
				{ type: 'number', name: 'stake', required: true, min: 1, max: 1000, onlyInt: true },
				{
					type: 'select',
					name: 'methods',
					maxSelect: 5,
					values: ['photo', 'screenshot', 'screentime', 'health', 'manual']
				},
				{ type: 'bool', name: 'active' },
				{ type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
				{ type: 'autodate', name: 'updated', onCreate: true, onUpdate: true }
			],
			indexes: ['CREATE INDEX idx_commitments_user ON commitments (user)']
		});
		app.save(commitments);

		// ---- proofs: one per commitment per day ----
		// Users may only create 'pending' (photo/screenshot) or 'self' (honor) proofs.
		// 'verified' / 'rejected' are set by the server (AI worker / referee), never by the client.
		const proofs = new Collection({
			type: 'base',
			name: 'proofs',
			listRule: own,
			viewRule: own,
			// Commitment ownership is checked in pb_hooks/proofs.pb.js
			createRule:
				"@request.auth.id != '' && @request.body.user = @request.auth.id" +
				" && (@request.body.status = 'pending' || @request.body.status = 'self')",
			updateRule: null, // locked
			deleteRule: own + " && status != 'verified'",
			fields: [
				{ type: 'relation', name: 'user', required: true, collectionId: users.id, maxSelect: 1, cascadeDelete: true },
				{ type: 'relation', name: 'commitment', required: true, collectionId: commitments.id, maxSelect: 1, cascadeDelete: true },
				{ type: 'text', name: 'day', required: true, pattern: '^\\d{4}-\\d{2}-\\d{2}$' }, // local yyyy-mm-dd
				{
					type: 'select',
					name: 'method',
					required: true,
					maxSelect: 1,
					values: ['photo', 'screenshot', 'screentime', 'health', 'manual']
				},
				{
					type: 'select',
					name: 'status',
					required: true,
					maxSelect: 1,
					values: ['pending', 'verified', 'rejected', 'self']
				},
				{
					type: 'file',
					name: 'image',
					maxSelect: 1,
					maxSize: 10 * 1024 * 1024,
					mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
					protected: true
				},
				{ type: 'autodate', name: 'created', onCreate: true, onUpdate: false }
			],
			indexes: ['CREATE UNIQUE INDEX idx_proofs_commitment_day ON proofs (commitment, day)']
		});
		app.save(proofs);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId('proofs'));
		app.delete(app.findCollectionByNameOrId('commitments'));

		const users = app.findCollectionByNameOrId('users');
		users.passwordAuth.enabled = true;
		users.otp.enabled = false;
		users.fields.removeByName('locale');
		app.save(users);
	}
);
