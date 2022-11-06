import { Link, Outlet, useLocation, useParams } from '@remix-run/react';

export default function Page() {
	const params = useParams();
	const location = useLocation();

	const isTrackerView = location.pathname.endsWith('/tracker');

	const url = `https://tasks.chriskerr.dev/${params.pageId}`;

	const linkStyles = 'text-3xl hover:text-blue-500 transition-colors';
	const selectedStyles =
		'underline underline-offset-8 decoration-wavy text-blue-500';

	return (
		<div className="flex flex-col h-screen max-w-5xl p-6 mx-auto sm:p-8">
			<div>
				<Link
					to={`/${params.pageId}`}
					className={`${linkStyles} mr-6 ${
						!isTrackerView ? selectedStyles : ''
					}`}
				>
					Tasks
				</Link>
				<Link
					to={`/${params.pageId}/tracker`}
					className={`${linkStyles} ${
						isTrackerView ? selectedStyles : ''
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
