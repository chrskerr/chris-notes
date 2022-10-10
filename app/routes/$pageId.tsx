import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { useCallback, useEffect, useRef } from 'react';

import { Category } from '~/components/category';
import { Done } from '~/components/done';
import { db } from '~/utils/db.server';

type Note = {
	id: string;
	content: string;
	completedAt: Date | null;
};

type CategorisedNotes = {
	categories: Array<{
		id: string;
		title: string;
		isOpen: boolean;
		notes: Note[];
	}>;
	done: Array<{ label: string; notes: Note[] }>;
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
		orderBy: { completedAt: 'desc' },
	});

	const doneMap = new Map<string, { label: string; notes: Note[] }>();
	for (const note of completedNotes) {
		if (!note.completedAt) continue;
		const label = format(
			utcToZonedTime(note.completedAt, 'Australia/Brisbane'),
			'EEEE dd MMMM yyyy',
		);
		const existing = doneMap.get(label) ?? { label, notes: [] };
		doneMap.set(label, { ...existing, notes: existing.notes.concat(note) });
	}

	return json<CategorisedNotes>({
		categories: data,
		done: [...doneMap.values()],
	});
};

export default function Page() {
	const loaderData = useLoaderData<CategorisedNotes>();
	const fetcher = useFetcher<CategorisedNotes>();

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

			{categorisedNotes.categories &&
				categorisedNotes.categories.map(category => (
					<Category
						key={category.id}
						category={category}
						refetch={refetch}
					/>
				))}

			<Done data={categorisedNotes.done} refetch={refetch} />

			<div onClick={handleAdd} className="mt-12 cursor-pointer">
				<span className="mr-2">+</span>
				<span className="hover:underline">Add category</span>
			</div>

			<div className="pb-24 mt-16 text-sm">
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
