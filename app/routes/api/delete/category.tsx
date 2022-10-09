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

	const body: { id?: string } = await request.json();

	if (!body.id) return null;

	await db.category.delete({ where: { id: body.id } });

	return null;
};
