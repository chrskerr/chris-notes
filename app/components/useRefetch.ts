import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';

export function useRefetch<T>(url: string) {
	const fetcher = useFetcher<T>();

	const urlRef = useRef(url);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		urlRef.current = url;
	}, [url]);

	useEffect(() => {
		function onFocus() {
			if (timerRef.current) return;
			fetcher.load(urlRef.current);
			timerRef.current = window.setInterval(() => {
				fetcher.load(urlRef.current);
			}, 15_000);
		}

		function onBlur() {
			if (!timerRef.current) return;
			window.clearInterval(timerRef.current);
			timerRef.current = null;
		}

		window.addEventListener('focus', onFocus, { passive: true });
		window.addEventListener('blur', onBlur, { passive: true });

		return () => {
			window.removeEventListener('focus', onFocus);
			window.removeEventListener('blur', onBlur);
		};
	});

	return fetcher;
}
