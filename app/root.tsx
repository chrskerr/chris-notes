import type { MetaFunction } from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react';

import styles from './styles/app.css';

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: '· TASKS · ✏️',
	viewport: 'width=device-width,initial-scale=1',
});

export function links() {
	return [{ rel: 'stylesheet', href: styles }];
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Red+Hat+Mono&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="font-mono">
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	return (
		<div>
			<h1>Error</h1>
			<p>{error.message}</p>
			<p>The stack trace is:</p>
			<pre>{error.stack}</pre>
		</div>
	);
}
