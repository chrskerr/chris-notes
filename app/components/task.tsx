import type { KeyboardEventHandler } from 'react';
import { memo } from 'react';
import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import isEqual from 'fast-deep-equal';

interface Props {
	task: {
		id: string;
		title: string;
		daysElapsed: number | null;
		completions: { id: string; createdAt: string }[];
	};
	refetch: () => void;
}

function handleSave(id: string, newTitle: string) {
	return fetch('/api/edit/task', {
		method: 'post',
		body: JSON.stringify({ id, title: newTitle }),
	});
}

const debouncedHandleSave = debounce(handleSave, 5_000);

const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

const handleKeyUp: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (e.key === ' ') {
		e.preventDefault();
	}
};

export const Task = memo(
	function Task({ task, refetch }: Props) {
		const { id, title, daysElapsed } = task;
		const [updatedTitle, setUpdatedTitle] = useState(title);

		useEffect(() => {
			setUpdatedTitle(title);
		}, [title]);

		useEffect(() => {
			if (updatedTitle !== title) {
				debouncedHandleSave(id, updatedTitle);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [updatedTitle]);

		function handleDelete() {
			const shouldProceed = confirm(
				`Are you sure you want to delete "${updatedTitle}"?`,
			);
			if (shouldProceed) {
				fetch('/api/delete/task', {
					method: 'post',
					body: JSON.stringify({ id }),
				}).then(refetch);
			}
		}

		function handleComplete() {
			fetch('/api/complete/task', {
				method: 'post',
				body: JSON.stringify({ id }),
			}).then(refetch);
		}

		function handleDeleteCompletion(completionId: string) {
			fetch('/api/delete/completion', {
				method: 'post',
				body: JSON.stringify({ id: completionId }),
			}).then(refetch);
		}

		return (
			<details
				open
				className="p-1 pl-4 mt-[38px] border border-dashed rounded transition-color"
			>
				<summary className="flex pt-4 sm:items-center sm:pt-0">
					<div className="flex sm:items-center flex-col sm:flex-row flex-1 transition-color rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100">
						<span
							className="flex-1 px-4 py-2 -mt-4 text-xl outline-none sm:mt-0 word-break"
							contentEditable
							suppressContentEditableWarning
							spellCheck
							onInput={e =>
								setUpdatedTitle(e.currentTarget.innerText)
							}
							onKeyDown={handleKeyDown}
							onKeyUp={handleKeyUp}
							onClick={e => e.preventDefault()}
							onBlur={e =>
								handleSave(id, e.currentTarget.innerText).then(
									refetch,
								)
							}
						>
							{title}
						</span>
						<div className="flex justify-end mt-2 sm:mt-0">
							{typeof daysElapsed === 'number' && (
								<span>
									Last completed {daysElapsed} days ago
								</span>
							)}
							<span
								onClick={handleDelete}
								className="mx-4 text-red-500 cursor-pointer"
							>
								x
							</span>
						</div>
					</div>
				</summary>
				<div className="flex items-center p-4">
					<details className="flex-1">
						<summary>History</summary>
						<div className="p-4">
							{task.completions.length ? (
								<ul>
									{task.completions.map(completion => (
										<li key={completion.id}>
											<span>
												{new Date(
													completion.createdAt,
												).toLocaleString()}{' '}
											</span>
											<span
												onClick={() =>
													handleDeleteCompletion(
														completion.id,
													)
												}
												className="mx-4 text-red-500 cursor-pointer"
											>
												x
											</span>
										</li>
									))}
								</ul>
							) : (
								<p>Task not yet completed</p>
							)}
						</div>
					</details>
					<div>
						<button
							className="px-2 py-1 text-white transition-colors bg-blue-500 rounded shadow-md cursor-pointer hover:bg-blue-600"
							onClick={handleComplete}
						>
							Mark done
						</button>
					</div>
				</div>
			</details>
		);
	},
	(prev, next) => isEqual(prev.task, next.task),
);
