import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';
import { differenceInDays } from 'date-fns';

import { useCallback, useEffect, useRef } from 'react';

import { Task } from '~/components/task';
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

const recheckCount = 120;
const recheckWaitMs = 1_000;

export default function Tracker() {
	const loaderData = useLoaderData<Tasks>();
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

				fetcher.load(`/${pageId.current}/tracker`);
			}, recheckWaitMs);
		}
	}, []);

	const refetch = useCallback(() => {
		fetcher.load(`/${pageId.current}/tracker`);
		remainingRechecks.current = recheckCount;
		createRefetchTimeout();
	}, []);

	const cancelRefetch = useCallback(() => {
		timeoutRef.current && window.clearTimeout(timeoutRef.current);
		timeoutRef.current = null;
		remainingRechecks.current = 0;
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
