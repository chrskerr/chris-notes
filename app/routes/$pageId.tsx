import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';

import { useCallback, useEffect, useRef } from 'react';
import { Categories } from '~/components/categories';

import { Category } from '~/components/category';
import { Done } from '~/components/done';
import { db } from '~/utils/db.server';

type NoteType = {
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
	done: NoteType[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const pageId = params.pageId;
	if (!pageId) return redirect('/');

	const [data, completedNotes] = await Promise.all([
		db.category.findMany({
			select: {
				id: true,
				title: true,
				isOpen: true,
				order: true,
				createdAt: true,
				notes: {
					where: { completedAt: null },
					select: { id: true, content: true, completedAt: true },
					orderBy: { createdAt: 'asc' },
				},
			},
			where: { pageId },
			orderBy: { createdAt: 'asc' },
		}),

		db.note.findMany({
			where: { completedAt: { not: null }, category: { pageId } },
			select: { id: true, content: true, completedAt: true },
			orderBy: { completedAt: 'desc' },
		}),
	]);

	return json<CategorisedNotes>({
		categories: data,
		done: completedNotes,
	});
};

const recheckCount = 120;
const recheckWaitMs = 1_000;

export default function Page() {
	const loaderData = useLoaderData<CategorisedNotes>();
	const fetcher = useFetcher<typeof loaderData>();

	const params = useParams();
	const pageId = useRef(params.pageId);

	const data = fetcher.data || loaderData;

	let remainingRechecks = useRef(recheckCount);
	let timeoutRef = useRef<number | null>(null);

	const createRefetchTimeout = useCallback(() => {
		if (remainingRechecks.current > 0 && !timeoutRef.current) {
			timeoutRef.current = window.setTimeout(() => {
				timeoutRef.current = null;
				remainingRechecks.current--;
				createRefetchTimeout();

				fetcher.load(`/${pageId.current}`);
			}, recheckWaitMs);
		}
	}, []);

	const refetch = useCallback(() => {
		fetcher.load(`/${pageId.current}`);
		remainingRechecks.current = recheckCount;
		createRefetchTimeout();
	}, []);

	const cancelRefetch = useCallback(() => {
		timeoutRef.current && window.clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		remainingRechecks.current = 0;
	}, []);

	function handleAdd() {
		fetch('/api/create/category', {
			method: 'post',

			body: JSON.stringify({ pageId: params.pageId }),
		}).then(refetch);
	}

	const url = `https://tasks.chriskerr.dev/${params.pageId}`;

	useEffect(() => {
		pageId.current = params.pageId;
	}, [params.pageId]);

	useEffect(() => {
		window.addEventListener('focus', refetch, { passive: true });
		window.addEventListener('blur', cancelRefetch, { passive: true });
		createRefetchTimeout();

		return () => {
			cancelRefetch();
			window.removeEventListener('focus', refetch);
			window.removeEventListener('blur', cancelRefetch);
		};
	}, []);

	return (
		<div className="flex flex-col h-screen max-w-4xl p-8 mx-auto">
			<h1 className="pb-8 text-4xl">Tasks</h1>

			<Categories categories={data.categories} refetch={refetch} />
			<Done data={data.done} refetch={refetch} />

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
