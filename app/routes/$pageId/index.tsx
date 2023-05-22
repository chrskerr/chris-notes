import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';

import { useCallback, useEffect, useRef } from 'react';
import { Categories } from '~/components/categories';

import { useRefetch } from '~/components/useRefetch';
import { db } from '~/utils/db.server';

export type NoteType = {
	id: string;
	content: string;
	completedAt: Date | null;
};

type CategorisedNotes = {
	categories: Array<{
		id: string;
		title: string;
		isOpen: boolean;
		order: number | null;
		createdAt: Date;
		notes: NoteType[];
	}>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const pageId = params.pageId;
	if (!pageId) return redirect('/');

	const data = await db.category.findMany({
		select: {
			id: true,
			title: true,
			isOpen: true,
			order: true,
			createdAt: true,
			notes: {
				where: { completedAt: null },
				select: {
					id: true,
					content: true,
					completedAt: true,
					priority: true,
				},
				orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
			},
		},
		where: { pageId },
		orderBy: { createdAt: 'asc' },
	});

	return json<CategorisedNotes>({
		categories: data,
	});
};

export default function Tasks() {
	const loaderData = useLoaderData<CategorisedNotes>();

	const params = useParams();
	const pageId = useRef(params.pageId);
	const fetcher = useRefetch<typeof loaderData>(`/${pageId.current}/?index`);

	const data: typeof loaderData = fetcher.data || loaderData;

	const refetch = useCallback(() => {
		fetcher.load(`/${pageId.current}/?index`);
	}, []);

	function handleAdd() {
		fetch('/api/create/category', {
			method: 'post',

			body: JSON.stringify({ pageId: params.pageId }),
		}).then(refetch);
	}

	useEffect(() => {
		pageId.current = params.pageId;
	}, [params.pageId]);

	return (
		<>
			<Categories categories={data.categories} refetch={refetch} />

			<div onClick={handleAdd} className="mt-12 cursor-pointer">
				<span className="mr-2">+</span>
				<span className="hover:underline">Add category</span>
			</div>
		</>
	);
}
