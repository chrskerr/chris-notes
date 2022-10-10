import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';
import { useCallback, useEffect, useRef } from 'react';

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

export const doneId = 'done';

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
		orderBy: { completedAt: 'desc' },
	});

	return json<CategorisedNotes[]>([
		...data,
		{ id: doneId, title: 'Done', isOpen: false, notes: completedNotes },
	]);
};

export default function Page() {
	const loaderData = useLoaderData<CategorisedNotes[]>();
	const fetcher = useFetcher<CategorisedNotes[]>();

	const params = useParams();
	const pageId = useRef(params.pageId);

	const categorisedNotes = fetcher.data || loaderData;

	const refetch = useCallback(() => {
		fetcher.load(`/${pageId.current}`);
	}, []);

	function handleAdd() {
		fetch('/api/create/category', {
			method: 'post',
			credentials: 'include',
			body: JSON.stringify({ pageId: params.pageId }),
		}).then(refetch);
	}

	const url = `https://notes.chriskerr.dev/${params.pageId}`;

	useEffect(() => {
		pageId.current = params.pageId;
	}, [params.pageId]);

	useEffect(() => {
		window.addEventListener('focus', refetch, { passive: true });

		return () => {
			window.removeEventListener('focus', refetch);
		};
	}, []);

	return (
		<div className="flex flex-col h-screen max-w-4xl p-8 mx-auto">
			<h1 className="pb-8 text-4xl">Notes</h1>

			{categorisedNotes &&
				categorisedNotes.map(category =>
					category.id === doneId && category.notes.length === 0 ? (
						false
					) : (
						<Category
							key={category.id}
							category={category}
							refetch={refetch}
						/>
					),
				)}

			<div onClick={handleAdd} className="mt-2 cursor-pointer">
				<span className="mr-2">+</span>
				<span className="hover:underline">Add category</span>
			</div>

			<div className="pb-24 mt-12 text-sm">
				<span>Permanent url: </span>
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					className="text-green-500 underline transition-colors hover:text-green-700"
				>
					{url}
				</a>
			</div>
		</div>
	);
}
