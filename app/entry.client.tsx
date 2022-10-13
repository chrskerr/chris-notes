import { RemixBrowser } from '@remix-run/react';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';

requestIdleCallback(() => {
	React.startTransition(() => {
		hydrateRoot(
			document,
			<React.StrictMode>
				<RemixBrowser />
			</React.StrictMode>,
		);
	});
});
