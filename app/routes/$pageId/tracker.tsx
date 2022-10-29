import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';
import { differenceInDays } from 'date-fns';

import { useCallback, useEffect, useRef } from 'react';

import { Task } from '~/components/task';
import { useRefetch } from '~/components/useRefetch';
import { db } from '~/utils/db.server';

type Tasks = {
	tasks: {
		id: string;
		title: string;
		daysElapsed: number | null;
		completions: { id: string; createdAt: Date }[];
	}[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const pageId = params.pageId;
	if (!pageId) return redirect('/');

	const tasks = await db.trackedTask.findMany({
		select: {
			id: true,
			title: true,
			createdAt: true,
			completions: {
				select: { id: true, createdAt: true },
				orderBy: { createdAt: 'desc' },
			},
		},
		where: { pageId },
		orderBy: { createdAt: 'asc' },
	});

	return json<Tasks>({
		tasks: tasks.map(task => ({
			id: task.id,
			title: task.title,
			daysElapsed: task.completions[0]?.createdAt
				? differenceInDays(new Date(), task.completions[0]?.createdAt)
				: null,
			completions: task.completions.map(({ id, createdAt }) => ({
				id,
				createdAt,
			})),
		})),
	});
};

export default function Tracker() {
	const loaderData = useLoaderData<Tasks>();

	const params = useParams();
	const pageId = useRef(params.pageId);
	const fetcher = useRefetch<typeof loaderData>(`/${pageId.current}/tracker`);

	const data: typeof loaderData = fetcher.data || loaderData;

	const refetch = useCallback(() => {
		fetcher.load(`/${pageId.current}/tracker`);
	}, []);

	function handleAdd() {
		fetch('/api/create/task', {
			method: 'post',

			body: JSON.stringify({ pageId: params.pageId }),
		}).then(refetch);
	}

	useEffect(() => {
		pageId.current = params.pageId;
	}, [params.pageId]);

	return (
		<>
			{data.tasks.map(task => (
				<Task key={task.id} task={task} refetch={refetch} />
			))}
			<div onClick={handleAdd} className="mt-12 cursor-pointer">
				<span className="mr-2">+</span>
				<span className="hover:underline">Add task</span>
			</div>
		</>
	);
}
