import { json } from '@remix-run/node';
import { db } from '~/utils/db.server';

export const loader = async () => {
	const allData = await db.page.findMany({
		include: { categories: { include: { notes: true } } },
	});

	return json(allData);
};
