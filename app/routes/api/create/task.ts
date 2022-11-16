import type { ActionFunction } from '@remix-run/node';

import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }) => {
	const body: { pageId?: string } = await request.json();
	if (!body.pageId) return null;

	const category = await db.trackedTask.create({
		data: {
			page: {
				connectOrCreate: {
					where: { id: body.pageId },
					create: { id: body.pageId },
				},
			},
		},
	});
	return category.id;
};
