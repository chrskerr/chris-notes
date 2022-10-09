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
