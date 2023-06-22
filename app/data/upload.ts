import data from './202306221319.json';
import { db } from '~/utils/db.server';

for (const page of data) {
	try {
		await db.page.upsert({
			create: {
				id: page.id,
			},
			where: {
				id: page.id,
			},
			update: {},
		});

		for (const { id, notes, ...category } of page.categories) {
			await db.category.upsert({
				create: { id, ...category },
				where: { id },
				update: category,
			});

			for (const { id, ...note } of notes) {
				await db.note.upsert({
					create: note,
					where: { id },
					update: note,
				});
			}
		}
	} catch (e) {
		console.error(e);
	}
}
