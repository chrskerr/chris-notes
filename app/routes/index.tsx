import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';

import { Category } from '~/components/category';
import { getUserCookie } from '~/utils/cookies.server';
import { db } from '~/utils/db.server';

type CategorisedNotes = {
	id: string;
	title: string;
	notes: {
		id: string;
		content: string;
		completedAt: Date | null;
	}[];
};

export const loader: LoaderFunction = async ({ request }) => {
	const { isAuthenticated } = await getUserCookie(request);
	if (!isAuthenticated) return json<CategorisedNotes[]>([]);

	const data = await db.category.findMany({
		include: {
			notes: {
				where: { completedAt: null },
				select: { id: true, content: true, completedAt: true },
				orderBy: { createdAt: 'asc' },
			},
		},
		orderBy: { createdAt: 'asc' },
	});

	const completedNotes = await db.note.findMany({
		where: { completedAt: { not: null } },
		select: { id: true, content: true, completedAt: true },
	});

	return json<CategorisedNotes[]>([
		...data,
		{ id: 'done', title: 'Done', notes: completedNotes },
	]);
};

export default function Index() {
	const loaderData = useLoaderData<CategorisedNotes[]>();
	const fetcher = useFetcher<CategorisedNotes[]>();

	const categorisedNotes = fetcher.data || loaderData;

	function refetch() {
		fetcher.load('/?index');
	}

	function handleAdd() {
		fetch('/api/create/category', {
			method: 'post',
			credentials: 'include',
		}).then(refetch);
	}

	return (
		<div className="flex flex-col h-screen max-w-4xl p-8 mx-auto font-mono">
			<h1 className="pb-8 text-4xl">Notes:</h1>

			{categorisedNotes &&
				categorisedNotes.map(category => (
					<Category
						key={category.id}
						category={category}
						refetch={refetch}
					/>
				))}

			<div onClick={handleAdd} className="mt-2 cursor-pointer">
				<span className="mr-2">+</span>
				<span className="hover:underline">Add category</span>
			</div>
		</div>
	);
}
