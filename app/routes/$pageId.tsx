import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';

import { Category } from '~/components/category';
import { db } from '~/utils/db.server';

type CategorisedNotes = {
	id: string;
	title: string;
	isOpen: boolean;
	notes: {
		id: string;
		content: string;
		completedAt: Date | null;
	}[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const pageId = params.pageId;
	if (!pageId) return redirect('/');

	const data = await db.category.findMany({
		select: {
			id: true,
			title: true,
			isOpen: true,
			notes: {
				where: { completedAt: null },
				select: { id: true, content: true, completedAt: true },
				orderBy: { createdAt: 'asc' },
			},
		},
		where: { pageId },
		orderBy: { createdAt: 'asc' },
	});

	const completedNotes = await db.note.findMany({
		where: { completedAt: { not: null }, category: { pageId } },
		select: { id: true, content: true, completedAt: true },
	});

	return json<CategorisedNotes[]>([
		...data,
		{ id: 'done', title: 'Done', isOpen: false, notes: completedNotes },
	]);
};

export default function Page() {
	const loaderData = useLoaderData<CategorisedNotes[]>();
	const fetcher = useFetcher<CategorisedNotes[]>();
	const params = useParams();

	const categorisedNotes = fetcher.data || loaderData;

	function refetch() {
		fetcher.load(`/${params.pageId}`);
	}

	function handleAdd() {
		fetch('/api/create/category', {
			method: 'post',
			credentials: 'include',
			body: JSON.stringify({ pageId: params.pageId }),
		}).then(refetch);
	}

	return (
		<div className="flex flex-col h-screen max-w-4xl p-8 mx-auto">
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
