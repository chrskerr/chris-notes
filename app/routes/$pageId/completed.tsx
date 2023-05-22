import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';

import { useCallback, useEffect, useRef } from 'react';

import { Done } from '~/components/done';
import { useRefetch } from '~/components/useRefetch';
import { db } from '~/utils/db.server';
import { NoteType } from '.';

type CategorisedNotes = {
	data: NoteType[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const pageId = params.pageId;
	if (!pageId) return redirect('/');

	const data = await db.note.findMany({
		where: { completedAt: { not: null }, category: { pageId } },
		select: { id: true, content: true, completedAt: true },
		orderBy: { completedAt: 'desc' },
	});

	return json<CategorisedNotes>({
		data: data,
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

	useEffect(() => {
		pageId.current = params.pageId;
	}, [params.pageId]);

	return (
		<div className="mt-[38px]">
			<Done data={data.data} refetch={refetch} />
		</div>
	);
}
