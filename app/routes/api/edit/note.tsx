import type { ActionFunction } from '@remix-run/node';

import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request }) => {
	const body: {
		id?: string;
		content?: string;
		isComplete?: boolean;
		categoryId?: string;
		priority?: number;
	} = await request.json();

	if (!body.id) return null;

	if (body.content) {
		await db.note.update({
			where: { id: body.id },
			data: { content: body.content },
		});
	}

	if (body.categoryId) {
		await db.note.update({
			where: { id: body.id },
			data: { categoryId: body.categoryId },
		});
	}

	if (typeof body.isComplete === 'boolean') {
		await db.note.update({
			where: { id: body.id },
			data: { completedAt: body.isComplete ? new Date() : null },
		});
	}

	if (body.priority && [1, 2, 3].includes(body.priority)) {
		console.log(body.priority);
		await db.note.update({
			where: { id: body.id },
			data: { priority: body.priority },
		});
	}

	return null;
};
