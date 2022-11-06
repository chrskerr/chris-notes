import type {
	DragEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
} from 'react';
import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

export type UINote = {
	id: string;
	content: string;
	completedAt: string | null;
	priority?: number;
};

interface Props {
	note: UINote;
	refetch: () => void;
}

function handleSave(id: string, newContent: string) {
	return fetch('/api/edit/note', {
		method: 'post',
		body: JSON.stringify({ id, content: newContent }),
	});
}

const debouncedHandleSave = debounce(handleSave, 5_000);

const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

export function Note({ note, refetch }: Props) {
	const { id, content, completedAt, priority } = note;
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

	const handleBlur: FocusEventHandler<HTMLSpanElement> = async e => {
		await debouncedHandleSave.flush();
		handleSave(id, e.currentTarget.innerText).then(refetch);
	};

	function handleDelete() {
		const shouldProceed = confirm(
			`Are you sure you want to delete "${textContent}"?`,
		);
		if (shouldProceed) {
			fetch('/api/delete/note', {
				method: 'post',
				body: JSON.stringify({ id }),
			}).then(refetch);
		}
	}

	function handleToggle(isComplete: boolean) {
		fetch('/api/edit/note', {
			method: 'post',
			body: JSON.stringify({ id, isComplete }),
		}).then(refetch);
	}

	function handleChangePriority(priority: string) {
		if (!isNaN(Number(priority)) && [1, 2, 3].includes(Number(priority))) {
			fetch('/api/edit/note', {
				method: 'post',
				body: JSON.stringify({ id, priority: Number(priority) }),
			}).then(refetch);
		}
	}

	const handleDrag: DragEventHandler<HTMLDivElement> = e => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('note', id);

		e.stopPropagation();
	};

	return (
		<div
			className={`flex items-center pl-[6px] pr-2 py-2 transition-colors rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100`}
			onDragStart={handleDrag}
			draggable={!completedAt}
		>
			<input
				type="checkbox"
				checked={!!completedAt}
				onChange={e => handleToggle(e.target.checked)}
			/>
			<span
				className="flex-1 mx-4 outline-none word-break"
				contentEditable
				suppressContentEditableWarning
				spellCheck
				onInput={e => setTextContent(e.currentTarget.innerText)}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
			>
				{content}
			</span>
			{priority && (
				<select
					value={[1, 2, 3].includes(priority) ? priority : 2}
					onChange={e => handleChangePriority(e.target.value)}
					className={`pl-2 pr-1 mx-2 text-center bg-blue-100 appearance-none cursor-pointer ${
						priority === 1 ? 'bg-pink-100' : ''
					} ${priority === 3 ? 'bg-green-100' : ''}`}
				>
					<option value={1}>↑</option>
					<option value={2}>·</option>
					<option value={3}>↓</option>
				</select>
			)}
			<span
				onClick={handleDelete}
				className="text-red-500 cursor-pointer"
			>
				x
			</span>
		</div>
	);
}
