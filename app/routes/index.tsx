import type { LoaderFunction } from '@vercel/remix';
import { redirect } from '@vercel/remix';
import { db } from '~/utils/db.server';

import { customAlphabet } from 'nanoid';
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

export const loader: LoaderFunction = async () => {
	let newId = nanoid();
	let alreadyExists = (await db.page.count({ where: { id: newId } })) > 0;

	while (alreadyExists) {
		newId = nanoid();
		alreadyExists = (await db.page.count({ where: { id: newId } })) > 0;
	}

	return redirect(`/${newId}`);
};

export default function Home() {
	return <div>Coming soon</div>;
}
