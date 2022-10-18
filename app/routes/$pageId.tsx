import { Link, Outlet, useLocation, useParams } from '@remix-run/react';

export default function Page() {
	const params = useParams();
	const location = useLocation();

	const isTrackerView = location.pathname.endsWith('/tracker');

	const url = `https://tasks.chriskerr.dev/${params.pageId}`;

	return (
		<div className="flex flex-col h-screen max-w-4xl p-8 mx-auto">
			<div>
				<Link
					to={`/${params.pageId}`}
					className={`pb-8 text-4xl hover:text-blue-500 hover:underline transition-colors mr-6 ${
						!isTrackerView ? 'text-blue-500' : ''
					}`}
				>
					Tasks
				</Link>
				<Link
					to={`/${params.pageId}/tracker`}
					className={`pb-8 text-4xl hover:text-blue-500 hover:underline transition-colors ${
						isTrackerView ? 'text-blue-500' : ''
					}`}
				>
					Tracker
				</Link>
			</div>

			<Outlet />

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
