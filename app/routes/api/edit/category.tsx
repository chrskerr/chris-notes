import type { ActionFunction } from '@remix-run/node';

import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }) => {
	const body: { id?: string; title?: string } = await request.json();

	if (!body.id) return null;

	if (body.title) {
		await db.category.update({
			where: { id: body.id },
			data: { title: body.title },
		});
	}

	return null;
};
