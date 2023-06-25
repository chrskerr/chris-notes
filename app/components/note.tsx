import type {
	DragEventHandler,
	FocusEventHandler,
	KeyboardEventHandler,
	MouseEventHandler,
} from 'react';
import { useEffect, useState } from 'react';

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

const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = e => {
	if (['Enter', 'Escape'].includes(e.key)) {
		e.preventDefault();
		e.currentTarget.blur();
	}
};

export function Note({ note, refetch }: Props) {
	const { id, content } = note;
	const [textContent, setTextContent] = useState(content);

	const [isCompleted, setIsCompleted] = useState(!!note.completedAt);
	const [priority, setPriority] = useState(note.priority);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		setTextContent(content);
	}, [content]);

	useEffect(() => {
		setIsCompleted(!!note.completedAt);
	}, [note.completedAt]);

	useEffect(() => {
		setPriority(note.priority);
	}, [note.priority]);

	const handleBlur: FocusEventHandler<HTMLSpanElement> = async e => {
		handleSave(id, e.currentTarget.innerText).then(refetch);
	};

	const handleDelete: MouseEventHandler<HTMLSpanElement> = e => {
		e.stopPropagation();
		const shouldProceed = confirm(
			`Are you sure you want to delete "${textContent}"?`,
		);
		if (shouldProceed) {
			setIsDeleting(true);
			fetch('/api/delete/note', {
				method: 'post',
				body: JSON.stringify({ id }),
			}).then(refetch);
		}
	};

	function handleToggle(isComplete: boolean) {
		setIsCompleted(isComplete);
		fetch('/api/edit/note', {
			method: 'post',
			body: JSON.stringify({ id, isComplete }),
		}).then(refetch);
	}

	function handleChangePriority(priority: string) {
		if (!isNaN(Number(priority)) && [1, 2, 3].includes(Number(priority))) {
			setPriority(Number(priority));
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

	if (isDeleting) return null;

	return (
		<div
			className={`flex items-center pl-[6px] pr-2 py-2 transition-colors rounded hover:bg-slate-100 [&:has(*:focus)]:bg-slate-100 sm:pr-4`}
			onDragStart={handleDrag}
			draggable={!isCompleted}
		>
			<input
				type="checkbox"
				checked={isCompleted}
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
					className={`sm:mr-4 w-[25px] aspect-square align-last-center mx-2 text-center bg-blue-100 appearance-none cursor-pointer ${
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
