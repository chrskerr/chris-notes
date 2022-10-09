import type { DragEventHandler, KeyboardEventHandler } from 'react';
import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

interface Props {
	note: {
		id: string;
		content: string;
		completedAt: Date | null;
	};
	refetch: () => void;
}

const debouncedHandleSave = debounce((id: string, newContent: string): void => {
	fetch('/api/edit/note', {
		method: 'post',
		body: JSON.stringify({ id, content: newContent }),
		credentials: 'include',
	});
}, 200);

const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

export function Note({ note, refetch }: Props) {
	const { id, content, completedAt } = note;
	const [textContent, setTextContent] = useState(content);

	useEffect(() => {
		setTextContent(content);
	}, [content]);

	useEffect(() => {
		if (textContent !== content) {
			debouncedHandleSave(id, textContent);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [textContent]);

	function handleDelete() {
		const shouldProceed = confirm(
			`Are you sure you want to delete "${textContent}"?`,
		);
		if (shouldProceed) {
			fetch('/api/delete/note', {
				method: 'post',
				body: JSON.stringify({ id }),
				credentials: 'include',
			}).then(refetch);
		}
	}

	function handleToggle(isComplete: boolean) {
		fetch('/api/edit/note', {
			method: 'post',
			body: JSON.stringify({ id, isComplete }),
			credentials: 'include',
		}).then(refetch);
	}

	const handleDrag: DragEventHandler<HTMLDivElement> = e => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', id);
	};

	return (
		<div
			className={`flex items-center px-4 py-2 transition-colors rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100`}
			onDragStart={handleDrag}
			draggable={!completedAt}
		>
			<input
				type="checkbox"
				checked={!!completedAt}
				onChange={e => handleToggle(e.target.checked)}
			/>
			<span
				className="flex-1 mx-4 outline-none"
				contentEditable
				suppressContentEditableWarning
				spellCheck
				onInput={e => setTextContent(e.currentTarget.innerText)}
				onKeyDown={handleKeyDown}
			>
				{content}
			</span>
			<span
				onClick={handleDelete}
				className="text-red-500 cursor-pointer"
			>
				x
			</span>
		</div>
	);
}
