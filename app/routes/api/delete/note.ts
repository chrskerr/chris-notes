import type { ActionFunction } from '@vercel/remix';

import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }) => {
	const body: { id?: string } = await request.json();

	if (!body.id) return null;

	await db.note.delete({ where: { id: body.id } });

	return null;
};
