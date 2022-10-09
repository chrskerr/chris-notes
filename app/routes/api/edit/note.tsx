import type { ActionFunction } from '@remix-run/node';

import { getUserCookie } from '~/utils/cookies.server';
import { db } from '~/utils/db.server';

export interface IMarkBookRead {
	bookId: string;
	isRead: boolean;
}

export const action: ActionFunction = async ({ request }) => {
	const { isAuthenticated } = await getUserCookie(request);
	if (!isAuthenticated) return null;

	const body: {
		id?: string;
		content?: string;
		isComplete?: boolean;
		categoryId?: string;
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

	return null;
};
