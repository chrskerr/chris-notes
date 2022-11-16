import type { ActionFunction } from '@remix-run/node';

import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }) => {
	const body: { id?: string } = await request.json();

	if (body.id) {
		await db.trackedTaskCompletion.create({
			data: {
				task: {
					connectOrCreate: {
						where: { id: body.id },
						create: { id: body.id },
					},
				},
			},
		});
	}

	return null;
};
