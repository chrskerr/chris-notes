import type { ActionFunction } from '@remix-run/node';

import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }) => {
	const body: {
		categories: Array<{
			id: string;
			order: number;
		}>;
	} = await request.json();

	if (!Array.isArray(body.categories)) return null;

	await db.$transaction(
		body.categories.map(category =>
			db.category.update({
				where: { id: category.id },
				data: { order: category.order },
			}),
		),
	);

	return null;
};
